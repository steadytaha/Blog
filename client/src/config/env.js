// Environment configuration
export const config = {
    // Debug mode - set to false in production
    DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
    
    // API configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : ''),
    
    // Development mode
    IS_DEVELOPMENT: import.meta.env.DEV,
    
    // Production mode
    IS_PRODUCTION: import.meta.env.PROD,
    
    // Firebase configuration (if needed)
    FIREBASE: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
};

// Environment validation
export const validateEnv = () => {
    const requiredVars = [];
    
    // Add required environment variables here
    // Example: if (!config.FIREBASE.apiKey) requiredVars.push('VITE_FIREBASE_API_KEY');
    
    if (requiredVars.length > 0) {
        // console.error('Missing required environment variables:', requiredVars);
        debug.error('Missing required environment variables:', requiredVars);
        return false;
    }
    
    return true;
}; 