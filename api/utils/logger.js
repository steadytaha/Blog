class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    info(message, meta = {}) {
        if (this.isDevelopment) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
        }
    }

    error(message, error = null, meta = {}) {
        const errorInfo = error ? { 
            message: error.message, 
            stack: error.stack,
            ...meta 
        } : meta;
        
        if (this.isDevelopment) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorInfo);
        }
        
        // In production, you would send this to a logging service
        // like Winston, or a cloud service like LogRocket, Sentry, etc.
    }

    warn(message, meta = {}) {
        if (this.isDevelopment) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
        }
    }

    debug(message, meta = {}) {
        if (this.isDevelopment && process.env.DEBUG === 'true') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
        }
    }
}

export const logger = new Logger(); 