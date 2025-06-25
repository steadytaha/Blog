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

// Log file paths
const CHATBOT_LOG_FILE = path.join(logsDir, 'chatbot.log');
const ANALYTICS_LOG_FILE = path.join(logsDir, 'chatbot-analytics.log');
const ERROR_LOG_FILE = path.join(logsDir, 'chatbot-errors.log');

class ChatbotLogger {
    constructor() {
        this.sessionStats = new Map(); // Track stats per session
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

    // Log general chatbot interactions
    logInteraction(data) {
        const logData = {
            type: 'INTERACTION',
            timestamp: this.getTimestamp(),
            ...data
        };
        
        this.writeToFile(CHATBOT_LOG_FILE, logData);
        console.log('💬 Chatbot Interaction:', {
            userId: data.userId,
            language: data.language,
            messageLength: data.userMessage?.length || 0,
            responseLength: data.botResponse?.length || 0,
            postsFound: data.postsFound || 0
        });
    }

    // Log analytics data
    logAnalytics(data) {
        const logData = {
            type: 'ANALYTICS',
            timestamp: this.getTimestamp(),
            ...data
        };
        
        this.writeToFile(ANALYTICS_LOG_FILE, logData);
    }

    // Log errors
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
            context
        };
        
        this.writeToFile(ERROR_LOG_FILE, logData);
        console.error('🚨 Chatbot Error:', error.message, context);
    }

    // Log session start
    logSessionStart(userId, language = 'unknown') {
        const sessionData = {
            userId,
            language,
            startTime: Date.now(),
            messageCount: 0,
            lastActivity: Date.now()
        };
        
        this.sessionStats.set(userId, sessionData);
        
        this.logAnalytics({
            event: 'SESSION_START',
            userId,
            language
        });
    }

    // Log session activity
    logSessionActivity(userId, activityData = {}) {
        const session = this.sessionStats.get(userId);
        if (session) {
            session.messageCount += 1;
            session.lastActivity = Date.now();
            
            // Update language if detected
            if (activityData.language) {
                session.language = activityData.language;
            }
        }
    }

    // Log session end
    logSessionEnd(userId, reason = 'MANUAL_CLEAR') {
        const session = this.sessionStats.get(userId);
        if (session) {
            const duration = Date.now() - session.startTime;
            
            this.logAnalytics({
                event: 'SESSION_END',
                userId,
                reason,
                duration,
                messageCount: session.messageCount,
                language: session.language
            });
            
            this.sessionStats.delete(userId);
        }
    }

    // Log language detection
    logLanguageDetection(userId, userMessage, detectedLanguage, confidence = 'medium') {
        this.logAnalytics({
            event: 'LANGUAGE_DETECTION',
            userId,
            messageLength: userMessage.length,
            detectedLanguage,
            confidence,
            hasSpecialChars: /[çğıöşüÇĞIİÖŞÜ]/.test(userMessage)
        });
    }

    // Log post retrieval
    logPostRetrieval(userId, query, postsFound, searchKeywords) {
        this.logAnalytics({
            event: 'POST_RETRIEVAL',
            userId,
            query: query.substring(0, 100), // Limit query length in logs
            postsFound: postsFound.length,
            searchKeywords,
            postTitles: postsFound.map(post => post.title).slice(0, 3) // First 3 titles
        });
    }

    // Log OpenAI API usage
    logOpenAIUsage(userId, tokenData, responseTime) {
        this.logAnalytics({
            event: 'OPENAI_USAGE',
            userId,
            promptTokens: tokenData.prompt_tokens || 0,
            completionTokens: tokenData.completion_tokens || 0,
            totalTokens: tokenData.total_tokens || 0,
            responseTime,
            model: 'gpt-4o-mini'
        });
    }

    // Log rate limiting
    logRateLimit(userId, ip, reason = 'RATE_LIMIT_EXCEEDED') {
        this.logAnalytics({
            event: 'RATE_LIMIT',
            userId,
            ip,
            reason
        });
        
        console.warn('⚠️ Rate limit triggered:', { userId, ip, reason });
    }

    // Get daily stats
    getDailyStats(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        
        try {
            const analyticsData = fs.readFileSync(ANALYTICS_LOG_FILE, 'utf8');
            const lines = analyticsData.split('\n').filter(line => line.trim());
            
            const dayLogs = lines.filter(line => line.includes(dateStr));
            const stats = {
                totalInteractions: 0,
                uniqueUsers: new Set(),
                languageBreakdown: { tr: 0, en: 0, other: 0 },
                sessionsStarted: 0,
                sessionsEnded: 0,
                averageSessionLength: 0,
                totalTokensUsed: 0,
                rateLimitHits: 0
            };
            
            dayLogs.forEach(line => {
                try {
                    const logEntry = JSON.parse(line.split(' - ')[1]);
                    
                    if (logEntry.userId) {
                        stats.uniqueUsers.add(logEntry.userId);
                    }
                    
                    switch (logEntry.event) {
                        case 'SESSION_START':
                            stats.sessionsStarted++;
                            break;
                        case 'SESSION_END':
                            stats.sessionsEnded++;
                            break;
                        case 'LANGUAGE_DETECTION':
                            stats.languageBreakdown[logEntry.detectedLanguage] = 
                                (stats.languageBreakdown[logEntry.detectedLanguage] || 0) + 1;
                            break;
                        case 'OPENAI_USAGE':
                            stats.totalTokensUsed += logEntry.totalTokens || 0;
                            break;
                        case 'RATE_LIMIT':
                            stats.rateLimitHits++;
                            break;
                    }
                } catch (parseError) {
                    // Skip malformed log entries
                }
            });
            
            // Count interactions from main log
            try {
                const interactionData = fs.readFileSync(CHATBOT_LOG_FILE, 'utf8');
                const interactionLines = interactionData.split('\n').filter(line => 
                    line.trim() && line.includes(dateStr)
                );
                stats.totalInteractions = interactionLines.length;
            } catch (error) {
                // Interaction log might not exist yet
            }
            
            stats.uniqueUsers = stats.uniqueUsers.size;
            
            return stats;
        } catch (error) {
            console.error('Failed to generate daily stats:', error);
            return null;
        }
    }

    // Get stats for different periods (week, month, etc.)
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
                languageBreakdown: { tr: 0, en: 0, other: 0 },
                sessionsStarted: 0,
                sessionsEnded: 0,
                averageSessionLength: 0,
                totalTokensUsed: 0,
                rateLimitHits: 0,
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
                            tokensUsed: 0
                        };
                    }
                    
                    if (logEntry.userId) {
                        stats.uniqueUsers.add(logEntry.userId);
                        stats.dailyBreakdown[logDate].users.add(logEntry.userId);
                    }
                    
                    switch (logEntry.event) {
                        case 'SESSION_START':
                            stats.sessionsStarted++;
                            break;
                        case 'SESSION_END':
                            stats.sessionsEnded++;
                            break;
                        case 'LANGUAGE_DETECTION':
                            stats.languageBreakdown[logEntry.detectedLanguage] = 
                                (stats.languageBreakdown[logEntry.detectedLanguage] || 0) + 1;
                            break;
                        case 'OPENAI_USAGE':
                            const tokens = logEntry.totalTokens || 0;
                            stats.totalTokensUsed += tokens;
                            stats.dailyBreakdown[logDate].tokensUsed += tokens;
                            break;
                        case 'RATE_LIMIT':
                            stats.rateLimitHits++;
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
                
                // Group interactions by day
                interactionLines.forEach(line => {
                    try {
                        const logDate = line.split(' - ')[0].split('T')[0];
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
            
            return stats;
        } catch (error) {
            console.error('Failed to generate period stats:', error);
            return null;
        }
    }

    // Clean old logs (keep last 30 days)
    cleanOldLogs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const logFiles = [CHATBOT_LOG_FILE, ANALYTICS_LOG_FILE, ERROR_LOG_FILE];
        
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
        
        console.log('🧹 Old chatbot logs cleaned');
    }
}

// Create singleton instance
const chatbotLogger = new ChatbotLogger();

// Clean logs daily
setInterval(() => {
    chatbotLogger.cleanOldLogs();
}, 24 * 60 * 60 * 1000); // 24 hours

export default chatbotLogger; 