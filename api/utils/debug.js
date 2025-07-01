import {
    createLogger,
    format,
    transports
} from 'winston';
import 'winston-daily-rotate-file';

const {
    combine,
    timestamp,
    printf,
    colorize,
    json
} = format;

const isProduction = process.env.NODE_ENV === 'production';
const debugMode = process.env.DEBUG_MODE === 'true';

const consoleFormat = combine(
    colorize(),
    timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const fileFormat = combine(
    timestamp(),
    json()
);

const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    format: fileFormat,
    transports: [
        new transports.DailyRotateFile({
            filename: 'logs/server-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        }),
        new transports.DailyRotateFile({
            filename: 'logs/server-error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error'
        })
    ],
    exitOnError: false
});

if (!isProduction) {
    logger.add(new transports.Console({
        format: consoleFormat
    }));
}

const sanitizeForLogging = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sanitized = { ...data
    };

    const sensitiveKeys = ['password', 'token', 'authorization', 'cookie'];

    for (const key in sanitized) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeForLogging(sanitized[key]);
        }
    }

    return sanitized;
};

const debugServer = {
    log: (message, data) => {
        if (debugMode) logger.info(message, data ? {
            data: sanitizeForLogging(data)
        } : undefined);
    },
    error: (message, error) => {
        logger.error(message, {
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    },
    apiRequest: (req) => {
        if (debugMode) {
            logger.info(`Request: ${req.method} ${req.originalUrl}`, {
                request: {
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    headers: sanitizeForLogging(req.headers),
                    body: sanitizeForLogging(req.body),
                },
            });
        }
    }
};

export {
    logger,
    debugServer,
    sanitizeForLogging
}; 