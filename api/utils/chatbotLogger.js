import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { debugServer, sanitizeForLogging } from './debug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced log file paths
const CHATBOT_LOG_FILE = path.join(logsDir, 'chatbot.log');
const ANALYTICS_LOG_FILE = path.join(logsDir, 'chatbot-analytics.log');
const ERROR_LOG_FILE = path.join(logsDir, 'chatbot-errors.log');
const PERFORMANCE_LOG_FILE = path.join(logsDir, 'chatbot-performance.log');
const CONVERSATION_LOG_FILE = path.join(logsDir, 'chatbot-conversations.log');
const USER_JOURNEY_LOG_FILE = path.join(logsDir, 'chatbot-user-journey.log');

/**
 * Chatbot Analytics and Logging System
 * Tracks user interactions, token usage, and provides analytics
 */

// In-memory storage for analytics (in production, use Redis or database)
const chatbotAnalytics = {
    totalChats: 0,
    uniqueUsers: new Set(),
    sessions: new Map(), // userId -> session data
    languageStats: {
        turkish: 0,
        english: 0,
        unknown: 0
    },
    rateLimits: 0,
    errors: [],
    tokenUsage: {
        prompt: 0,
        completion: 0,
        total: 0
    },
    dailyStats: new Map(), // date -> stats
    userInteractions: new Map() // userId -> interactions array
};

/**
 * Log a chatbot interaction
 */
export const logChatbotInteraction = (userId, message, response, tokenUsage = null) => {
    try {
        // Increment total chats
        chatbotAnalytics.totalChats++;
        
        // Track unique users
        chatbotAnalytics.uniqueUsers.add(userId);
        
        // Detect language
        const language = detectLanguage(message);
        chatbotAnalytics.languageStats[language]++;
        
        // Track token usage
        if (tokenUsage) {
            chatbotAnalytics.tokenUsage.prompt += tokenUsage.prompt_tokens || 0;
            chatbotAnalytics.tokenUsage.completion += tokenUsage.completion_tokens || 0;
            chatbotAnalytics.tokenUsage.total += tokenUsage.total_tokens || 0;
        }
        
        // Store user interaction
        if (!chatbotAnalytics.userInteractions.has(userId)) {
            chatbotAnalytics.userInteractions.set(userId, []);
        }
        
        const interaction = {
            timestamp: new Date(),
            message: sanitizeForLogging(message),
            response: sanitizeForLogging(response),
            language,
            tokenUsage: tokenUsage ? sanitizeForLogging(tokenUsage) : null
        };
        
        chatbotAnalytics.userInteractions.get(userId).push(interaction);
        
        // Log to debug system
        debugServer.log('💬 Chatbot Interaction:', {
            userId: sanitizeForLogging(userId),
            language,
            messageLength: message.length,
            responseLength: response.length,
            tokenUsage: tokenUsage ? sanitizeForLogging(tokenUsage) : null
        });
        
        // Update daily stats
        updateDailyStats(language, tokenUsage);
        
    } catch (error) {
        debugServer.error('Error logging chatbot interaction:', error);
    }
};

/**
 * Log a rate limit hit
 */
export const logRateLimit = (userId, ip) => {
    chatbotAnalytics.rateLimits++;
    
    debugServer.log('Rate limit triggered:', {
        userId: sanitizeForLogging(userId),
        ip: sanitizeForLogging(ip),
        timestamp: new Date()
    });
};

/**
 * Log an error
 */
export const logChatbotError = (userId, error, context = {}) => {
    const errorLog = {
        timestamp: new Date(),
        userId: sanitizeForLogging(userId),
        error: {
            message: error.message,
            stack: error.stack
        },
        context: sanitizeForLogging(context)
    };
    
    chatbotAnalytics.errors.push(errorLog);
    
    // Keep only last 100 errors
    if (chatbotAnalytics.errors.length > 100) {
        chatbotAnalytics.errors = chatbotAnalytics.errors.slice(-100);
    }
    
    debugServer.error('Chatbot error:', error);
};

/**
 * Start a new chat session
 */
export const startChatSession = (userId) => {
    const sessionData = {
        startTime: new Date(),
        messageCount: 0,
        totalTokens: 0
    };
    
    chatbotAnalytics.sessions.set(userId, sessionData);
    
    debugServer.log('Chat session started:', {
        userId: sanitizeForLogging(userId),
        timestamp: new Date()
    });
};

/**
 * End a chat session
 */
export const endChatSession = (userId) => {
    const session = chatbotAnalytics.sessions.get(userId);
    if (session) {
        const duration = new Date() - session.startTime;
        
        debugServer.log('Chat session ended:', {
            userId: sanitizeForLogging(userId),
            duration: duration,
            messageCount: session.messageCount,
            totalTokens: session.totalTokens
        });
        
        chatbotAnalytics.sessions.delete(userId);
    }
};

/**
 * Update session with new message
 */
export const updateSession = (userId, tokenUsage = null) => {
    const session = chatbotAnalytics.sessions.get(userId);
    if (session) {
        session.messageCount++;
        if (tokenUsage) {
            session.totalTokens += tokenUsage.total_tokens || 0;
        }
    }
};

/**
 * Get analytics data
 */
export const getChatbotAnalytics = (period = 'all') => {
    const now = new Date();
    let filteredStats = chatbotAnalytics;
    
    // Filter by period if specified
    if (period !== 'all') {
        // For now, return all data. In production, implement date filtering
        // based on period (week, month, year)
    }
    
    return {
        overview: {
            totalChats: filteredStats.totalChats,
            uniqueUsers: filteredStats.uniqueUsers.size,
            activeSessions: filteredStats.sessions.size,
            rateLimits: filteredStats.rateLimits
        },
        language: filteredStats.languageStats,
        tokenUsage: filteredStats.tokenUsage,
        errors: filteredStats.errors.slice(-10), // Last 10 errors
        period: period,
        generatedAt: now
    };
};

/**
 * Get user-specific analytics
 */
export const getUserAnalytics = (userId) => {
    const interactions = chatbotAnalytics.userInteractions.get(userId) || [];
    const session = chatbotAnalytics.sessions.get(userId);
    
    return {
        totalInteractions: interactions.length,
        recentInteractions: interactions.slice(-5),
        currentSession: session,
        isActive: !!session
    };
};

/**
 * Clean up old data (call periodically)
 */
export const cleanupAnalytics = () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up old user interactions
    for (const [userId, interactions] of chatbotAnalytics.userInteractions) {
        const recentInteractions = interactions.filter(
            interaction => interaction.timestamp > oneWeekAgo
        );
        
        if (recentInteractions.length === 0) {
            chatbotAnalytics.userInteractions.delete(userId);
        } else {
            chatbotAnalytics.userInteractions.set(userId, recentInteractions);
        }
    }
    
    // Clean up old daily stats
    for (const [date, stats] of chatbotAnalytics.dailyStats) {
        if (new Date(date) < oneWeekAgo) {
            chatbotAnalytics.dailyStats.delete(date);
        }
    }
    
    // Clean up old errors
    chatbotAnalytics.errors = chatbotAnalytics.errors.filter(
        error => error.timestamp > oneWeekAgo
    );
    
    debugServer.log('🧹 Enhanced chatbot logs cleaned');
};

/**
 * Detect message language
 */
const detectLanguage = (message) => {
    // Simple Turkish detection
    const turkishWords = ['ben', 'sen', 'o', 'biz', 'siz', 'onlar', 've', 'ile', 'için', 'var', 'yok', 'bu', 'şu', 'merhaba', 'selam', 'nasıl', 'nedir', 'nerede', 'ne', 'kim', 'hangi'];
    const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
    
    const lowerMessage = message.toLowerCase();
    
    // Check for Turkish characters
    if (turkishChars.test(message)) {
        return 'turkish';
    }
    
    // Check for Turkish words
    const turkishWordCount = turkishWords.filter(word => 
        lowerMessage.includes(word)
    ).length;
    
    if (turkishWordCount >= 1) {
        return 'turkish';
    }
    
    // Check for common English words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'hello', 'hi', 'how', 'what', 'where', 'when', 'why', 'who'];
    const englishWordCount = englishWords.filter(word => 
        lowerMessage.includes(word)
    ).length;
    
    if (englishWordCount >= 1) {
        return 'english';
    }
    
    return 'unknown';
};

/**
 * Update daily statistics
 */
const updateDailyStats = (language, tokenUsage) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!chatbotAnalytics.dailyStats.has(today)) {
        chatbotAnalytics.dailyStats.set(today, {
            chats: 0,
            languages: { turkish: 0, english: 0, unknown: 0 },
            tokens: { prompt: 0, completion: 0, total: 0 }
        });
    }
    
    const dailyStats = chatbotAnalytics.dailyStats.get(today);
    dailyStats.chats++;
    dailyStats.languages[language]++;
    
    if (tokenUsage) {
        dailyStats.tokens.prompt += tokenUsage.prompt_tokens || 0;
        dailyStats.tokens.completion += tokenUsage.completion_tokens || 0;
        dailyStats.tokens.total += tokenUsage.total_tokens || 0;
    }
};

// Cleanup interval (run every hour)
setInterval(cleanupAnalytics, 60 * 60 * 1000);

export default {
    logChatbotInteraction,
    logRateLimit,
    logChatbotError,
    startChatSession,
    endChatSession,
    updateSession,
    getChatbotAnalytics,
    getUserAnalytics,
    cleanupAnalytics
}; 