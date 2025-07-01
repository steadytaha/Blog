import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

class ChatbotLogger {
    constructor() {
        this.sessionStats = new Map(); // Track stats per session
        this.userEngagement = new Map(); // Track user engagement metrics
        this.conversationFlows = new Map(); // Track conversation patterns
        this.performanceMetrics = {
            avgResponseTime: 0,
            totalRequests: 0,
            errorRate: 0,
            successfulResponses: 0
        };
    }

    // Format timestamp
    getTimestamp() {
        return new Date().toISOString();
    }

    // Write to log file
    writeToFile(filepath, data) {
        try {
            const logEntry = `${this.getTimestamp()} - ${JSON.stringify(data)}\n`;
            fs.appendFileSync(filepath, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    // Enhanced interaction logging with conversation flow tracking
    logInteraction(data) {
        const logData = {
            type: 'INTERACTION',
            timestamp: this.getTimestamp(),
            isGuest: data.userId?.startsWith('guest_') || false,
            userType: data.userId?.startsWith('guest_') ? 'guest' : 'authenticated',
            conversationTurn: this.getConversationTurn(data.userId),
            ...data
        };
        
        this.writeToFile(CHATBOT_LOG_FILE, logData);
        this.updateUserEngagement(data.userId, data);
        this.trackConversationFlow(data.userId, data.userMessage, data.botResponse);
        
        console.log('💬 Chatbot Interaction:', {
            userId: data.userId,
            userType: data.userId?.startsWith('guest_') ? 'guest' : 'authenticated',
            language: data.language,
            turn: this.getConversationTurn(data.userId),
            messageLength: data.userMessage?.length || 0,
            responseLength: data.botResponse?.length || 0,
            postsFound: data.postsFound || 0
        });
    }

    // Track conversation turns and depth
    getConversationTurn(userId) {
        if (!this.conversationFlows.has(userId)) {
            this.conversationFlows.set(userId, { turns: 0, topics: [], startTime: Date.now() });
        }
        const flow = this.conversationFlows.get(userId);
        flow.turns += 1;
        return flow.turns;
    }

    // Enhanced user engagement tracking
    updateUserEngagement(userId, data) {
        if (!this.userEngagement.has(userId)) {
            this.userEngagement.set(userId, {
                totalInteractions: 0,
                totalTime: 0,
                averageMessageLength: 0,
                topicsDiscussed: new Set(),
                languages: new Set(),
                sessionCount: 0,
                lastActivity: Date.now(),
                engagementScore: 0
            });
        }
        
        const engagement = this.userEngagement.get(userId);
        engagement.totalInteractions += 1;
        engagement.averageMessageLength = (engagement.averageMessageLength + (data.userMessage?.length || 0)) / 2;
        engagement.languages.add(data.language);
        engagement.lastActivity = Date.now();
        
        // Calculate engagement score based on interaction frequency and depth
        engagement.engagementScore = this.calculateEngagementScore(engagement);
    }

    // Calculate user engagement score
    calculateEngagementScore(engagement) {
        const interactionWeight = Math.min(engagement.totalInteractions / 10, 1) * 30;
        const languageWeight = Math.min(engagement.languages.size / 2, 1) * 20;
        const messageQualityWeight = Math.min(engagement.averageMessageLength / 50, 1) * 25;
        const topicWeight = Math.min(engagement.topicsDiscussed.size / 5, 1) * 25;
        
        return Math.round(interactionWeight + languageWeight + messageQualityWeight + topicWeight);
    }

    // Track conversation patterns and flows
    trackConversationFlow(userId, userMessage, botResponse) {
        const flow = this.conversationFlows.get(userId);
        if (flow) {
            // Detect topic transitions
            const topics = this.extractTopics(userMessage);
            topics.forEach(topic => flow.topics.push({
                topic,
                timestamp: Date.now(),
                turn: flow.turns
            }));
            
            // Log conversation pattern
            this.logConversationPattern(userId, {
                turn: flow.turns,
                userMessageLength: userMessage.length,
                botResponseLength: botResponse.length,
                topics: topics,
                duration: Date.now() - flow.startTime
            });
        }
    }

    // Extract topics from user messages (simple keyword matching)
    extractTopics(message) {
        const topicKeywords = {
            'technology': ['tech', 'programming', 'code', 'software', 'development', 'teknoloji', 'yazılım'],
            'education': ['learn', 'study', 'education', 'tutorial', 'eğitim', 'öğrenmek'],
            'projects': ['project', 'build', 'create', 'proje', 'yapı'],
            'blog': ['blog', 'post', 'article', 'write', 'yazı', 'makale'],
            'personal': ['about', 'who', 'author', 'taha', 'hakkında', 'kim'],
            'help': ['help', 'how', 'what', 'why', 'yardım', 'nasıl', 'ne', 'neden']
        };
        
        const topics = [];
        const lowerMessage = message.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics.length > 0 ? topics : ['general'];
    }

    // Log conversation patterns for analysis
    logConversationPattern(userId, patternData) {
        const logData = {
            type: 'CONVERSATION_PATTERN',
            timestamp: this.getTimestamp(),
            userId,
            isGuest: userId?.startsWith('guest_') || false,
            ...patternData
        };
        
        this.writeToFile(CONVERSATION_LOG_FILE, logData);
    }

    // Enhanced performance logging
    logPerformance(data) {
        const logData = {
            type: 'PERFORMANCE',
            timestamp: this.getTimestamp(),
            ...data
        };
        
        this.writeToFile(PERFORMANCE_LOG_FILE, logData);
        this.updatePerformanceMetrics(data);
    }

    // Update performance metrics
    updatePerformanceMetrics(data) {
        this.performanceMetrics.totalRequests += 1;
        
        if (data.responseTime) {
            this.performanceMetrics.avgResponseTime = 
                (this.performanceMetrics.avgResponseTime + data.responseTime) / 2;
        }
        
        if (data.success) {
            this.performanceMetrics.successfulResponses += 1;
        }
        
        this.performanceMetrics.errorRate = 
            1 - (this.performanceMetrics.successfulResponses / this.performanceMetrics.totalRequests);
    }

    // Log user journey events
    logUserJourney(userId, event, metadata = {}) {
        const logData = {
            type: 'USER_JOURNEY',
            timestamp: this.getTimestamp(),
            userId,
            isGuest: userId?.startsWith('guest_') || false,
            event,
            sessionTurn: this.getConversationTurn(userId),
            engagement: this.userEngagement.get(userId)?.engagementScore || 0,
            ...metadata
        };
        
        this.writeToFile(USER_JOURNEY_LOG_FILE, logData);
    }

    // Enhanced analytics logging
    logAnalytics(data) {
        const logData = {
            type: 'ANALYTICS',
            timestamp: this.getTimestamp(),
            ...data
        };
        
        this.writeToFile(ANALYTICS_LOG_FILE, logData);
    }

    // Log errors with enhanced context
    logError(error, context = {}) {
        const logData = {
            type: 'ERROR',
            timestamp: this.getTimestamp(),
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code,
                status: error.status
            },
            userEngagement: context.userId ? this.userEngagement.get(context.userId) : null,
            conversationContext: context.userId ? this.conversationFlows.get(context.userId) : null,
            context
        };
        
        this.writeToFile(ERROR_LOG_FILE, logData);
        console.error('🚨 Chatbot Error:', error.message, context);
    }

    // Enhanced session start logging
    logSessionStart(userId, language = 'unknown') {
        const sessionData = {
            userId,
            language,
            startTime: Date.now(),
            messageCount: 0,
            lastActivity: Date.now(),
            isGuest: userId?.startsWith('guest_') || false
        };
        
        this.sessionStats.set(userId, sessionData);
        
        // Initialize conversation flow
        this.conversationFlows.set(userId, { 
            turns: 0, 
            topics: [], 
            startTime: Date.now(),
            language 
        });
        
        // Update user engagement session count
        if (this.userEngagement.has(userId)) {
            this.userEngagement.get(userId).sessionCount += 1;
        }
        
        this.logAnalytics({
            event: 'SESSION_START',
            userId,
            language,
            isGuest: userId?.startsWith('guest_') || false,
            userType: userId?.startsWith('guest_') ? 'guest' : 'authenticated'
        });
        
        this.logUserJourney(userId, 'SESSION_START', { language });
    }

    // Enhanced session activity logging
    logSessionActivity(userId, activityData = {}) {
        const session = this.sessionStats.get(userId);
        if (session) {
            session.messageCount += 1;
            session.lastActivity = Date.now();
            
            if (activityData.language) {
                session.language = activityData.language;
            }
        }
        
        this.logUserJourney(userId, 'MESSAGE_SENT', activityData);
    }

    // Enhanced session end logging
    logSessionEnd(userId, reason = 'MANUAL_CLEAR') {
        const session = this.sessionStats.get(userId);
        const conversation = this.conversationFlows.get(userId);
        const engagement = this.userEngagement.get(userId);
        
        if (session) {
            const duration = Date.now() - session.startTime;
            
            this.logAnalytics({
                event: 'SESSION_END',
                userId,
                reason,
                duration,
                messageCount: session.messageCount,
                language: session.language,
                conversationTurns: conversation?.turns || 0,
                topicsDiscussed: conversation?.topics.length || 0,
                engagementScore: engagement?.engagementScore || 0
            });
            
            this.logUserJourney(userId, 'SESSION_END', { 
                reason, 
                duration, 
                messageCount: session.messageCount,
                engagementScore: engagement?.engagementScore || 0
            });
            
            this.sessionStats.delete(userId);
            this.conversationFlows.delete(userId);
        }
    }

    // Enhanced language detection logging
    logLanguageDetection(userId, userMessage, detectedLanguage, confidence = 'medium') {
        this.logAnalytics({
            event: 'LANGUAGE_DETECTION',
            userId,
            messageLength: userMessage.length,
            detectedLanguage,
            confidence,
            hasSpecialChars: /[çğıöşüÇĞIİÖŞÜ]/.test(userMessage),
            conversationTurn: this.getConversationTurn(userId)
        });
    }

    // Enhanced post retrieval logging
    logPostRetrieval(userId, query, postsFound, searchKeywords) {
        this.logAnalytics({
            event: 'POST_RETRIEVAL',
            userId,
            query: query.substring(0, 100),
            postsFound: postsFound.length,
            searchKeywords,
            postTitles: postsFound.map(post => post.title).slice(0, 3),
            searchEfficiency: postsFound.length / Math.max(searchKeywords.length, 1)
        });
        
        this.logUserJourney(userId, 'CONTENT_SEARCH', {
            query: query.substring(0, 50),
            resultsFound: postsFound.length
        });
    }

    // Enhanced OpenAI usage logging
    logOpenAIUsage(userId, tokenData, responseTime) {
        const performanceData = {
            userId,
            promptTokens: tokenData.prompt_tokens || 0,
            completionTokens: tokenData.completion_tokens || 0,
            totalTokens: tokenData.total_tokens || 0,
            responseTime,
            model: 'gpt-4o-mini',
            efficiency: (tokenData.completion_tokens || 0) / Math.max(tokenData.prompt_tokens || 1, 1),
            costEstimate: (tokenData.total_tokens || 0) * 0.00015 / 1000
        };
        
        this.logAnalytics({
            event: 'OPENAI_USAGE',
            ...performanceData
        });
        
        this.logPerformance({
            responseTime,
            tokensUsed: tokenData.total_tokens || 0,
            success: true
        });
    }

    // Enhanced rate limiting logging
    logRateLimit(userId, ip, reason = 'RATE_LIMIT_EXCEEDED') {
        this.logAnalytics({
            event: 'RATE_LIMIT',
            userId,
            ip,
            reason,
            userEngagement: this.userEngagement.get(userId)?.engagementScore || 0
        });
        
        this.logUserJourney(userId, 'RATE_LIMITED', { reason, ip });
        
        console.warn('⚠️ Rate limit triggered:', { userId, ip, reason });
    }

    // Get enhanced daily stats with new metrics
    getDailyStats(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        
        try {
            const analyticsData = fs.readFileSync(ANALYTICS_LOG_FILE, 'utf8');
            const lines = analyticsData.split('\n').filter(line => line.trim());
            
            const dayLogs = lines.filter(line => line.includes(dateStr));
            const stats = {
                totalInteractions: 0,
                uniqueUsers: new Set(),
                uniqueGuestUsers: new Set(),
                uniqueAuthenticatedUsers: new Set(),
                guestInteractions: 0,
                authenticatedInteractions: 0,
                languageBreakdown: { tr: 0, en: 0, other: 0 },
                topicBreakdown: {},
                sessionsStarted: 0,
                sessionsEnded: 0,
                guestSessions: 0,
                authenticatedSessions: 0,
                averageEngagementScore: 0,
                averageConversationTurns: 0,
                averageSessionDuration: 0,
                totalTokensUsed: 0,
                averageResponseTime: 0,
                rateLimitHits: 0,
                errorCount: 0,
                searchQueries: 0,
                contentRequests: 0
            };
            
            dayLogs.forEach(line => {
                try {
                    const logEntry = JSON.parse(line.split(' - ')[1]);
                    
                    if (logEntry.userId) {
                        stats.uniqueUsers.add(logEntry.userId);
                        if (logEntry.userId.startsWith('guest_')) {
                            stats.uniqueGuestUsers.add(logEntry.userId);
                        } else {
                            stats.uniqueAuthenticatedUsers.add(logEntry.userId);
                        }
                    }
                    
                    switch (logEntry.event) {
                        case 'SESSION_START':
                            stats.sessionsStarted++;
                            if (logEntry.isGuest || logEntry.userId?.startsWith('guest_')) {
                                stats.guestSessions++;
                            } else {
                                stats.authenticatedSessions++;
                            }
                            break;
                        case 'SESSION_END':
                            stats.sessionsEnded++;
                            if (logEntry.duration) {
                                stats.averageSessionDuration = (stats.averageSessionDuration + logEntry.duration) / 2;
                            }
                            if (logEntry.conversationTurns) {
                                stats.averageConversationTurns = (stats.averageConversationTurns + logEntry.conversationTurns) / 2;
                            }
                            break;
                        case 'LANGUAGE_DETECTION':
                            stats.languageBreakdown[logEntry.detectedLanguage] = 
                                (stats.languageBreakdown[logEntry.detectedLanguage] || 0) + 1;
                            break;
                        case 'OPENAI_USAGE':
                            stats.totalTokensUsed += logEntry.totalTokens || 0;
                            if (logEntry.responseTime) {
                                stats.averageResponseTime = (stats.averageResponseTime + logEntry.responseTime) / 2;
                            }
                            break;
                        case 'RATE_LIMIT':
                            stats.rateLimitHits++;
                            break;
                        case 'POST_RETRIEVAL':
                            stats.searchQueries++;
                            stats.contentRequests += logEntry.postsFound || 0;
                            break;
                    }
                } catch (parseError) {
                    // Skip malformed log entries
                }
            });
            
            // Process conversation patterns
            try {
                const conversationData = fs.readFileSync(CONVERSATION_LOG_FILE, 'utf8');
                const conversationLines = conversationData.split('\n').filter(line => 
                    line.trim() && line.includes(dateStr)
                );
                
                conversationLines.forEach(line => {
                    try {
                        const logEntry = JSON.parse(line.split(' - ')[1]);
                        if (logEntry.topics) {
                            logEntry.topics.forEach(topic => {
                                stats.topicBreakdown[topic] = (stats.topicBreakdown[topic] || 0) + 1;
                            });
                        }
                    } catch (parseError) {
                        // Skip malformed entries
                    }
                });
            } catch (error) {
                // Conversation log might not exist yet
            }
            
            // Count interactions from main log
            try {
                const interactionData = fs.readFileSync(CHATBOT_LOG_FILE, 'utf8');
                const interactionLines = interactionData.split('\n').filter(line => 
                    line.trim() && line.includes(dateStr)
                );
                stats.totalInteractions = interactionLines.length;
                
                // Count guest vs authenticated interactions
                interactionLines.forEach(line => {
                    try {
                        const logEntry = JSON.parse(line.split(' - ')[1]);
                        if (logEntry.userId?.startsWith('guest_') || logEntry.isGuest) {
                            stats.guestInteractions++;
                        } else {
                            stats.authenticatedInteractions++;
                        }
                    } catch (parseError) {
                        // Skip malformed entries
                    }
                });
            } catch (error) {
                // Interaction log might not exist yet
            }
            
            // Count errors
            try {
                const errorData = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
                const errorLines = errorData.split('\n').filter(line => 
                    line.trim() && line.includes(dateStr)
                );
                stats.errorCount = errorLines.length;
            } catch (error) {
                // Error log might not exist yet
            }
            
            stats.uniqueUsers = stats.uniqueUsers.size;
            stats.uniqueGuestUsers = stats.uniqueGuestUsers.size;
            stats.uniqueAuthenticatedUsers = stats.uniqueAuthenticatedUsers.size;
            
            return stats;
        } catch (error) {
            console.error('Failed to generate daily stats:', error);
            return null;
        }
    }

    // Get enhanced period stats with new metrics
    getPeriodStats(period = 'week', endDate = new Date()) {
        let startDate = new Date(endDate);
        
        // Calculate start date based on period
        switch (period.toLowerCase()) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'day':
                return this.getDailyStats(endDate);
            default:
                startDate.setDate(startDate.getDate() - 7); // Default to week
        }
        
        try {
            const analyticsData = fs.readFileSync(ANALYTICS_LOG_FILE, 'utf8');
            const lines = analyticsData.split('\n').filter(line => line.trim());
            
            const periodLogs = lines.filter(line => {
                try {
                    const timestamp = line.split(' - ')[0];
                    const logDate = new Date(timestamp);
                    return logDate >= startDate && logDate <= endDate;
                } catch {
                    return false;
                }
            });
            
            const stats = {
                period,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                totalInteractions: 0,
                uniqueUsers: new Set(),
                uniqueGuestUsers: new Set(),
                uniqueAuthenticatedUsers: new Set(),
                guestInteractions: 0,
                authenticatedInteractions: 0,
                languageBreakdown: { tr: 0, en: 0, other: 0 },
                topicBreakdown: {},
                sessionsStarted: 0,
                sessionsEnded: 0,
                guestSessions: 0,
                authenticatedSessions: 0,
                averageEngagementScore: 0,
                averageConversationTurns: 0,
                averageSessionDuration: 0,
                totalTokensUsed: 0,
                averageResponseTime: 0,
                rateLimitHits: 0,
                errorCount: 0,
                searchQueries: 0,
                contentRequests: 0,
                dailyBreakdown: {}
            };
            
            periodLogs.forEach(line => {
                try {
                    const logEntry = JSON.parse(line.split(' - ')[1]);
                    const logDate = line.split(' - ')[0].split('T')[0];
                    
                    // Initialize daily breakdown if needed
                    if (!stats.dailyBreakdown[logDate]) {
                        stats.dailyBreakdown[logDate] = {
                            interactions: 0,
                            users: new Set(),
                            tokensUsed: 0,
                            sessions: 0,
                            avgEngagement: 0
                        };
                    }
                    
                    if (logEntry.userId) {
                        stats.uniqueUsers.add(logEntry.userId);
                        stats.dailyBreakdown[logDate].users.add(logEntry.userId);
                        
                        if (logEntry.userId.startsWith('guest_')) {
                            stats.uniqueGuestUsers.add(logEntry.userId);
                        } else {
                            stats.uniqueAuthenticatedUsers.add(logEntry.userId);
                        }
                    }
                    
                    switch (logEntry.event) {
                        case 'SESSION_START':
                            stats.sessionsStarted++;
                            stats.dailyBreakdown[logDate].sessions++;
                            if (logEntry.isGuest || logEntry.userId?.startsWith('guest_')) {
                                stats.guestSessions++;
                            } else {
                                stats.authenticatedSessions++;
                            }
                            break;
                        case 'SESSION_END':
                            stats.sessionsEnded++;
                            if (logEntry.duration) {
                                stats.averageSessionDuration = (stats.averageSessionDuration + logEntry.duration) / 2;
                            }
                            if (logEntry.conversationTurns) {
                                stats.averageConversationTurns = (stats.averageConversationTurns + logEntry.conversationTurns) / 2;
                            }
                            if (logEntry.engagementScore) {
                                stats.averageEngagementScore = (stats.averageEngagementScore + logEntry.engagementScore) / 2;
                                stats.dailyBreakdown[logDate].avgEngagement = 
                                    (stats.dailyBreakdown[logDate].avgEngagement + logEntry.engagementScore) / 2;
                            }
                            break;
                        case 'LANGUAGE_DETECTION':
                            stats.languageBreakdown[logEntry.detectedLanguage] = 
                                (stats.languageBreakdown[logEntry.detectedLanguage] || 0) + 1;
                            break;
                        case 'OPENAI_USAGE':
                            const tokens = logEntry.totalTokens || 0;
                            stats.totalTokensUsed += tokens;
                            stats.dailyBreakdown[logDate].tokensUsed += tokens;
                            if (logEntry.responseTime) {
                                stats.averageResponseTime = (stats.averageResponseTime + logEntry.responseTime) / 2;
                            }
                            break;
                        case 'RATE_LIMIT':
                            stats.rateLimitHits++;
                            break;
                        case 'POST_RETRIEVAL':
                            stats.searchQueries++;
                            stats.contentRequests += logEntry.postsFound || 0;
                            break;
                    }
                } catch (parseError) {
                    // Skip malformed log entries
                }
            });
            
            // Count interactions from main log
            try {
                const interactionData = fs.readFileSync(CHATBOT_LOG_FILE, 'utf8');
                const interactionLines = interactionData.split('\n').filter(line => {
                    if (!line.trim()) return false;
                    try {
                        const timestamp = line.split(' - ')[0];
                        const logDate = new Date(timestamp);
                        return logDate >= startDate && logDate <= endDate;
                    } catch {
                        return false;
                    }
                });
                
                stats.totalInteractions = interactionLines.length;
                
                // Count guest vs authenticated interactions and group by day
                interactionLines.forEach(line => {
                    try {
                        const logEntry = JSON.parse(line.split(' - ')[1]);
                        const logDate = line.split(' - ')[0].split('T')[0];
                        
                        if (logEntry.userId?.startsWith('guest_') || logEntry.isGuest) {
                            stats.guestInteractions++;
                        } else {
                            stats.authenticatedInteractions++;
                        }
                        
                        if (stats.dailyBreakdown[logDate]) {
                            stats.dailyBreakdown[logDate].interactions++;
                        }
                    } catch {
                        // Skip malformed entries
                    }
                });
            } catch (error) {
                // Interaction log might not exist yet
            }
            
            // Convert sets to counts in daily breakdown
            Object.keys(stats.dailyBreakdown).forEach(date => {
                stats.dailyBreakdown[date].users = stats.dailyBreakdown[date].users.size;
            });
            
            stats.uniqueUsers = stats.uniqueUsers.size;
            stats.uniqueGuestUsers = stats.uniqueGuestUsers.size;
            stats.uniqueAuthenticatedUsers = stats.uniqueAuthenticatedUsers.size;
            
            return stats;
        } catch (error) {
            console.error('Failed to generate period stats:', error);
            return null;
        }
    }

    // Get real-time performance metrics
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            activeUsers: this.sessionStats.size,
            averageEngagement: Array.from(this.userEngagement.values())
                .reduce((sum, eng) => sum + eng.engagementScore, 0) / Math.max(this.userEngagement.size, 1),
            activeConversations: this.conversationFlows.size
        };
    }

    // Get user engagement insights
    getUserEngagementInsights() {
        const engagements = Array.from(this.userEngagement.values());
        return {
            totalUsers: engagements.length,
            highEngagementUsers: engagements.filter(e => e.engagementScore > 70).length,
            averageInteractionsPerUser: engagements.reduce((sum, e) => sum + e.totalInteractions, 0) / Math.max(engagements.length, 1),
            topLanguages: this.getTopLanguages(engagements),
            engagementDistribution: this.getEngagementDistribution(engagements)
        };
    }

    // Helper methods for engagement insights
    getTopLanguages(engagements) {
        const languageCount = {};
        engagements.forEach(eng => {
            Array.from(eng.languages).forEach(lang => {
                languageCount[lang] = (languageCount[lang] || 0) + 1;
            });
        });
        return Object.entries(languageCount).sort(([,a], [,b]) => b - a).slice(0, 3);
    }

    getEngagementDistribution(engagements) {
        const distribution = { low: 0, medium: 0, high: 0 };
        engagements.forEach(eng => {
            if (eng.engagementScore < 30) distribution.low++;
            else if (eng.engagementScore < 70) distribution.medium++;
            else distribution.high++;
        });
        return distribution;
    }

    // Clean old logs (enhanced to clean new log files too)
    cleanOldLogs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const logFiles = [
            CHATBOT_LOG_FILE, 
            ANALYTICS_LOG_FILE, 
            ERROR_LOG_FILE,
            PERFORMANCE_LOG_FILE,
            CONVERSATION_LOG_FILE,
            USER_JOURNEY_LOG_FILE
        ];
        
        logFiles.forEach(logFile => {
            try {
                if (fs.existsSync(logFile)) {
                    const data = fs.readFileSync(logFile, 'utf8');
                    const lines = data.split('\n');
                    
                    const filteredLines = lines.filter(line => {
                        if (!line.trim()) return false;
                        
                        try {
                            const timestamp = line.split(' - ')[0];
                            const logDate = new Date(timestamp);
                            return logDate >= thirtyDaysAgo;
                        } catch {
                            return false; // Remove malformed entries
                        }
                    });
                    
                    fs.writeFileSync(logFile, filteredLines.join('\n') + '\n');
                }
            } catch (error) {
                console.error(`Failed to clean log file ${logFile}:`, error);
            }
        });
        
        console.log('🧹 Enhanced chatbot logs cleaned');
    }
}

// Create singleton instance
const chatbotLogger = new ChatbotLogger();

// Clean logs daily
setInterval(() => {
    chatbotLogger.cleanOldLogs();
}, 24 * 60 * 60 * 1000); // 24 hours

export default chatbotLogger; 