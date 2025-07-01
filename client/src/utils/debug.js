const debugMode = import.meta.env.DEV;

const sanitizeForLogging = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sanitized = { ...data };

    const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'idToken'];

    for (const key in sanitized) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeForLogging(sanitized[key]);
        }
    }

    return sanitized;
};

const debug = {
    log: (message, ...data) => {
        if (debugMode) {
            console.log(`[INFO] ${message}`, ...data.map(d => sanitizeForLogging(d)));
        }
    },
    error: (message, ...data) => {
        if (debugMode) {
            console.error(`[ERROR] ${message}`, ...data);
        }
    },
    warn: (message, ...data) => {
        if (debugMode) {
            console.warn(`[WARN] ${message}`, ...data.map(d => sanitizeForLogging(d)));
        }
    }
};

export { debug, sanitizeForLogging }; 