import { debug } from './debug.js';

// Error types
export const ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    SERVER: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

// Determine error type based on status code
const getErrorType = (status) => {
    if (!status) return ERROR_TYPES.NETWORK;
    if (status === 400) return ERROR_TYPES.VALIDATION;
    if (status === 401) return ERROR_TYPES.AUTHENTICATION;
    if (status === 403) return ERROR_TYPES.AUTHORIZATION;
    if (status >= 500) return ERROR_TYPES.SERVER;
    return ERROR_TYPES.UNKNOWN;
};

// User-friendly error messages
const getErrorMessage = (error, type) => {
    const defaultMessages = {
        [ERROR_TYPES.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
        [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
        [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
        [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
        [ERROR_TYPES.SERVER]: 'Server is experiencing issues. Please try again later.',
        [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    // Use server message if available and user-friendly
    if (error.message && error.message.length < 100 && !error.message.includes('fetch')) {
        return error.message;
    }

    return defaultMessages[type] || defaultMessages[ERROR_TYPES.UNKNOWN];
};

// Main error handler
export const handleError = (error, context = '') => {
    const status = error.status || error.statusCode || (error.response?.status);
    const type = getErrorType(status);
    const userMessage = getErrorMessage(error, type);
    
    // Log error for debugging
    debug.error(`Error in ${context}`, {
        type,
        status,
        message: error.message,
        stack: error.stack
    });

    return {
        type,
        status,
        message: userMessage,
        originalError: error
    };
};

// API-specific error handler
export const handleApiError = async (response, endpoint = '') => {
    let error;
    
    try {
        // Try to parse error response
        const errorData = await response.json();
        error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
    } catch (parseError) {
        // If response is not JSON, create generic error
        error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
    }

    return handleError(error, `API ${endpoint}`);
};

// Promise rejection handler
export const handlePromiseError = (error, context = '') => {
    // Handle fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network request failed');
        return handleError(networkError, context);
    }

    return handleError(error, context);
};

// React component error boundary helper
export const createErrorBoundaryHandler = (componentName) => {
    return (error, errorInfo) => {
        debug.error(`React Error Boundary in ${componentName}`, {
            error: error.message,
            componentStack: errorInfo.componentStack,
            errorBoundary: componentName
        });

        // In production, you might want to send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    };
};

// Validation error helper
export const createValidationError = (field, message) => {
    const error = new Error(message);
    error.field = field;
    error.status = 400;
    return handleError(error, 'Validation');
}; 