import { debugServer, sanitizeForLogging } from './debug.js';

class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    info(message, meta = {}) {
        debugServer.log(message, meta);
    }

    error(message, error = null, meta = {}) {
        const errorInfo = error ? { 
            message: error.message, 
            stack: error.stack,
            ...meta 
        } : meta;
        
        debugServer.error(message, error || new Error(message));
    }

    warn(message, meta = {}) {
        if (this.isDevelopment) {
            debugServer.log(`[WARN] ${message}`, meta);
        }
    }

    debug(message, meta = {}) {
        if (this.isDevelopment && process.env.DEBUG_MODE === 'true') {
            debugServer.log(`[DEBUG] ${message}`, meta);
        }
    }
}

export const logger = new Logger(); 