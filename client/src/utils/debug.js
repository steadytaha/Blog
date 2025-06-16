import { config } from '../config/env.js';

class Debug {
    constructor() {
        this.isDevelopment = config.IS_DEVELOPMENT;
        this.isDebugMode = config.DEBUG_MODE;
    }

    log(message, data = null) {
        if (this.isDevelopment && this.isDebugMode) {
            // console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    error(message, error = null) {
        if (this.isDevelopment) {
            const errorInfo = error ? {
                message: error.message,
                stack: error.stack,
                status: error.status || error.statusCode
            } : null;
            
            // console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorInfo);
        }
        
        // In production, send to error tracking service (Sentry, LogRocket, etc.)
        if (!this.isDevelopment && error) {
            // TODO: Send to error tracking service
            // Example: Sentry.captureException(error);
        }
    }

    warn(message, data = null) {
        if (this.isDevelopment) {
            // console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    info(message, data = null) {
        if (this.isDevelopment && this.isDebugMode) {
            // console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data);
        }
    }

    // Sanitize sensitive data before logging
    sanitize(data) {
        if (!data || typeof data !== 'object') return data;
        
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
        const sanitized = { ...data };
        
        Object.keys(sanitized).forEach(key => {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }
}

export const debug = new Debug();

// Helper function for API errors
export const logApiError = (endpoint, error) => {
    debug.error(`API Error at ${endpoint}`, {
        status: error.status || error.statusCode,
        message: error.message,
        endpoint
    });
};

// Helper function for component errors
export const logComponentError = (componentName, error, props = {}) => {
    debug.error(`Component Error in ${componentName}`, {
        component: componentName,
        error: error.message,
        props: debug.sanitize(props)
    });
}; 