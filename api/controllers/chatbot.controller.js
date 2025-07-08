import OpenAI from 'openai';
import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import chatbotLogger from '../utils/chatbotLogger.js';
import { debugServer } from '../utils/debug.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// In-memory session storage (in production, use Redis or database)
const chatSessions = new Map();

// Session cleanup - remove sessions older than 1 hour
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [sessionId, session] of chatSessions.entries()) {
        if (session.lastActivity < oneHourAgo) {
            // Log session end due to timeout
            chatbotLogger.logSessionEnd(sessionId, 'TIMEOUT');
            chatSessions.delete(sessionId);
        }
    }
}, 30 * 60 * 1000); // Clean every 30 minutes

// Blog categories available
const BLOG_CATEGORIES = [
    'Art', 'Books', 'Business', 'Education', 'Entertainment', 'Fashion', 
    'Food', 'Gaming', 'General', 'Health', 'Lifestyle', 'Movies', 
    'Music', 'Politics', 'Science', 'Sports', 'Technology', 'Travel', 'Other'
];

// Author and site information for the chatbot
const AUTHOR_INFO = `
Author Information:
- Name: Taha Efe Gümüş
- Role: Passionate developer and tech enthusiast
- Blog: Little's Blog - A platform for sharing thoughts, ideas, and knowledge
- Focus: Technology, web development, software engineering, learning, tutorials, lifestyle, and sports
- Mission: Creating a learning platform and community hub for developers and tech enthusiasts
- Background: Computer science student with expertise in full-stack development

Projects:
1. ChatWithPDF - RAG with Mixtral 8x7B and ColBERT. Advanced AI-powered document analysis system for intelligent PDF interactions using Python.
2. Little's Blog - Full-stack modern blog platform with user authentication, admin dashboard, and responsive design built with JavaScript, React, Node.js, MongoDB, and Tailwind CSS.
3. ClimateCrisis - Climate Crisis report analyzing gas emissions and temperature data for Turkey, Europe and USA using Python data science.
4. LaptopVersus - Product Comparison System built with Java for comparing laptop specifications and features.
5. MIUUL ML Summer Camp - Machine Learning exercises and solutions from Miuul Machine Learning Summer Camp '23 program using Python.
6. Notes-on-Web - Web-based note-taking application built with Python for organizing and managing personal notes.

Blog Categories: ${BLOG_CATEGORIES.join(', ')}

Blog Features:
- Community-driven platform with comments and discussions
- Modern and responsive design
- User authentication and admin dashboard
- Search functionality across ${BLOG_CATEGORIES.length} categories
- 100+ articles published with 1K+ community members
- 24/7 learning support
`;

const SYSTEM_PROMPT = `You are Little's Blog AI assistant. 

CRITICAL LANGUAGE RULE: ALWAYS use the session language provided. Never switch languages mid-conversation.

RESPONSE GUIDELINES:
- Keep responses SHORT and FOCUSED (max 2-3 sentences)
- Be helpful and conversational
- Use blog posts data when provided
- For off-topic questions, politely redirect to blog topics

POST SEARCH TOOL:
When users ask about blog content, you have access to relevant posts. The tool searches:
- Post titles, content, and categories
- Available categories: ${BLOG_CATEGORIES.join(', ')}

CATEGORY TRANSLATIONS:
When users mention categories in different languages, understand them as:
Turkish: sanat→Art, kitap/kitaplar→Books, iş/işletme→Business, eğitim→Education, eğlence→Entertainment, moda/stil→Fashion, yemek/tarif/mutfak→Food, oyun/oyunlar→Gaming, genel→General, sağlık/tıp→Health, yaşam/hayat→Lifestyle, film/sinema→Movies, müzik/şarkı→Music, politika/siyaset→Politics, bilim/fen→Science, spor/futbol→Sports, teknoloji/yazılım/programlama→Technology, seyahat/gezi→Travel, diğer→Other

Always interpret category requests in context and recommend posts from the correct English category name.

TOPICS: Blog posts, author info (Taha Efe Gümüş), projects, tech discussions.

Author: ${AUTHOR_INFO}`;

// Helper function to get or create session
const getSession = (userId) => {
    const isNewSession = !chatSessions.has(userId);
    
    if (isNewSession) {
        chatSessions.set(userId, {
            messages: [],
            lastActivity: Date.now(),
            language: 'en' // default language
        });
        // Log new session start
        chatbotLogger.logSessionStart(userId);
    }
    
    return chatSessions.get(userId);
};

// Helper function to detect language (improved detection)
const detectLanguage = (text) => {
    const turkishPatterns = [
        /\b(merhaba|selam|nasılsın|naber|teşekkür|sağol|iyi|kötü|evet|hayır|ne|neden|nasıl|kim|ne zaman|nerede|hakkında|için|ile|var|yok|bu|şu|o|ben|sen|biz|siz|onlar)\b/i,
        /[çğıöşüÇĞIİÖŞÜ]/,
        /\b(blog|yazı|makale|proje|hakkında|öğrenmek|anlat|söyle)\b/i
    ];
    
    const englishPatterns = [
        /\b(hello|hi|hey|thanks|thank you|yes|no|what|when|where|how|why|about|for|with|this|that|the|a|an|i|you|we|they)\b/i
    ];
    
    const turkishScore = turkishPatterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
    const englishScore = englishPatterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
    
    return turkishScore > englishScore ? 'tr' : 'en';
};

// Helper function to get relevant posts (improved search like main search function)
const getRelevantPosts = async (query, limit = 2) => {
    try {
        // Extract keywords and clean them
        const keywords = query.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'can', 'could', 'should', 'would', 'will', 'shall', 'may', 'might', 'must'].includes(word));

        // Build search query similar to the main search function
        const searchQuery = {
            $or: [
                // Exact phrase search in title (highest priority)
                { title: { $regex: query, $options: 'i' } },
                // Keywords in title
                { title: { $regex: keywords.join('|'), $options: 'i' } },
                // Category exact match
                { category: { $regex: keywords.join('|'), $options: 'i' } },
                // Keywords in content
                { content: { $regex: keywords.join('|'), $options: 'i' } }
            ]
        };

        // Check if query mentions specific category
        const mentionedCategory = BLOG_CATEGORIES.find(cat => 
            query.toLowerCase().includes(cat.toLowerCase())
        );
        
        if (mentionedCategory) {
            // If specific category mentioned, prioritize that category
            searchQuery.$or.unshift({ category: mentionedCategory });
        }

        const posts = await Post.find(searchQuery)
            .select('title content category slug author createdAt')
            .sort({ 
                // Prioritize recent posts but also consider relevance
                createdAt: -1 
            })
            .limit(limit);
        
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};

// Helper function to format posts for AI context (simplified)
const formatPostsForContext = (posts) => {
    if (!posts || posts.length === 0) return "";
    
    return posts.map(post => 
        `"${post.title}" (${post.category}) - ${post.content.substring(0, 400)}...`
    ).join('\n');
};

// Helper function to format chat history
const formatChatHistory = (messages, limit = 10) => {
    const recentMessages = messages.slice(-limit);
    return recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
};

export const chatWithBot = async (req, res, next) => {
    const { message } = req.body;
    const userId = req.user.id; // Get user ID from verified token
    const userIP = req.ip || req.connection.remoteAddress;
    const startTime = Date.now();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        chatbotLogger.logError(new Error('Invalid message format'), { userId, userIP });
        return next(errorHandler(400, "Message is required and must be a non-empty string"));
    }

    if (message.length > 500) {
        chatbotLogger.logError(new Error('Message too long'), { userId, messageLength: message.length });
        return next(errorHandler(400, "Message is too long. Please keep it under 500 characters."));
    }

    try {
        // Get or create user session
        const session = getSession(userId);
        
        // Set session language only for new sessions or if language changes significantly
        const detectedLanguage = detectLanguage(message);
        if (session.messages.length === 0 || Math.abs(session.messages.length) % 10 === 0) {
            // Re-evaluate language every 10 messages or for new sessions
            session.language = detectedLanguage;
        }
        session.lastActivity = Date.now();

        // Log language detection only if changed
        if (session.language !== detectedLanguage) {
            chatbotLogger.logLanguageDetection(userId, message, detectedLanguage);
        }

        // Add user message to session
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        // Smart post retrieval - check if message is asking about content or categories
        const contentKeywords = ['blog', 'post', 'article', 'write', 'yazı', 'makale', 'proje', 'project', 'about', 'hakkında', 'topic', 'konu', 'category', 'kategori', 'sanat', 'kitap', 'moda', 'teknoloji', 'spor', 'yemek', 'sağlık', 'eğitim', 'seyahat', 'oyun', 'film', 'müzik'];
        const categoryMentioned = BLOG_CATEGORIES.some(cat => message.toLowerCase().includes(cat.toLowerCase()));
        
        const needsPostSearch = contentKeywords.some(keyword => message.toLowerCase().includes(keyword)) || 
                               categoryMentioned ||
                               message.includes('?') || 
                               message.length > 20;
        
        let postsContext = '';
        let relevantPosts = [];
        
        if (needsPostSearch) {
            relevantPosts = await getRelevantPosts(message, 2);
            postsContext = formatPostsForContext(relevantPosts);
            
            // Log post retrieval with more detailed info
            const searchKeywords = message.toLowerCase().split(/\s+/).filter(word => word.length > 2);
            const detectedCategory = BLOG_CATEGORIES.find(cat => message.toLowerCase().includes(cat.toLowerCase()));
            
            chatbotLogger.logPostRetrieval(userId, message, relevantPosts, searchKeywords);
            
            // Log if specific category was detected
            if (detectedCategory) {
                chatbotLogger.logAnalytics({
                    event: 'CATEGORY_SEARCH',
                    userId,
                    category: detectedCategory,
                    language: session.language,
                    postsFound: relevantPosts.length,
                    timestamp: Date.now()
                });
            }
        }

        // Simplified chat history (last 4 messages only)
        const recentHistory = session.messages.slice(-5, -1); // Last 4 messages, excluding current
        const chatHistory = recentHistory.length > 0 ? 
            recentHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content.substring(0, 100)}`).join('\n') : 
            '';

        // Simplified contextual prompt
        const contextualPrompt = `User: ${message}

${chatHistory ? `Recent chat:\n${chatHistory}\n` : ''}${postsContext ? `\nBlog posts:\n${postsContext}` : ''}

Respond in ${session.language === 'tr' ? 'Turkish' : 'English'}. Keep it short and helpful.`;

        // Call OpenAI API with optimized settings
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: contextualPrompt }
            ],
            temperature: 0.3, // Slightly more creative for better conversation
            max_tokens: 200, // Reduced for shorter responses
            presence_penalty: 0.2,
            frequency_penalty: 0.3 // Higher to avoid repetition
        });

        const reply = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
        const responseTime = Date.now() - startTime;

        // Log OpenAI usage
        chatbotLogger.logOpenAIUsage(userId, completion.usage, responseTime);

        // Add bot response to session
        session.messages.push({
            role: 'assistant',
            content: reply,
            timestamp: Date.now()
        });

        // Keep only last 20 messages to prevent memory overflow
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }

        // Enhanced interaction logging
        chatbotLogger.logInteraction({
            userId,
            userIP,
            userMessage: message.substring(0, 100), // Limit in logs
            botResponse: reply.substring(0, 100), // Limit in logs
            language: session.language, // Use session language instead of detected
            postsFound: relevantPosts.length,
            responseTime,
            sessionLength: session.messages.length,
            isGuest: req.user.isGuest,
            userType: req.user.isGuest ? 'guest' : 'authenticated',
            messageLength: message.length,
            responseLength: reply.length,
            searchContext: needsPostSearch,
            detectedTopics: needsPostSearch ? message.toLowerCase().split(/\s+/).filter(word => word.length > 3) : []
        });

        // Log session activity
        chatbotLogger.logSessionActivity(userId, {
            messageLength: message.length,
            language: session.language,
            hasPostSearch: needsPostSearch,
            postsFound: relevantPosts.length
        });

        res.status(200).json({
            success: true,
            reply: reply.trim(),
            sessionId: userId,
            language: session.language,
            userType: req.user.isGuest ? 'guest' : 'authenticated'
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        // Log the error with context
        chatbotLogger.logError(error, {
            userId,
            userIP,
            userMessage: message.substring(0, 100),
            responseTime,
            openAIError: error.code || error.status
        });
        
        if (error.code === 'insufficient_quota') {
            return next(errorHandler(503, "AI service is temporarily unavailable. Please try again later."));
        }
        
        if (error.code === 'rate_limit_exceeded') {
            chatbotLogger.logRateLimit(userId, userIP, 'OPENAI_RATE_LIMIT');
            return next(errorHandler(429, "Too many requests. Please wait a moment before trying again."));
        }
        
        if (error.status === 401) {
            return next(errorHandler(401, "Invalid API key. Please check the OpenAI configuration."));
        }
        
        next(errorHandler(500, "An error occurred while processing your message."));
    }
};

// Optional: Add endpoint to clear chat history
export const clearChatHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Only allow clearing if user has a session (authenticated or guest)
        if (!userId) {
            return next(errorHandler(400, "No session found to clear"));
        }
        
        // Log session end
        chatbotLogger.logSessionEnd(userId, 'MANUAL_CLEAR');
        
        chatSessions.delete(userId);

        res.status(200).json({
            success: true,
            message: "Chat history cleared successfully",
            userType: req.user.isGuest ? 'guest' : 'authenticated'
        });
    } catch (error) {
        chatbotLogger.logError(error, { userId: req.user?.id, action: 'CLEAR_CHAT' });
        next(errorHandler(500, "Failed to clear chat history"));
    }
};

// Get comprehensive chatbot analytics (admin only)
export const getChatbotAnalytics = async (req, res, next) => {
    try {
        // Log access attempt
        const userIP = req.ip || req.connection.remoteAddress;
        debugServer.log(`Analytics access attempt by user ${req.user?.id} from IP ${userIP}`);
        
        // Check if user is admin
        if (!req.user.isAdmin) {
            // Log unauthorized access attempt
            debugServer.log(`⚠️ Unauthorized analytics access attempt by user ${req.user.id} (${req.user.email}) from IP ${userIP}`);
            chatbotLogger.logError(new Error('Unauthorized analytics access'), { 
                userId: req.user.id, 
                userEmail: req.user.email,
                userIP,
                attemptedRoute: '/api/chatbot/analytics'
            });
            return next(errorHandler(403, "Access denied. Admin privileges required."));
        }

        // Log successful admin access
        debugServer.log(`✅ Admin analytics access granted to user ${req.user.id} from IP ${userIP}`);
        chatbotLogger.logAnalytics({
            event: 'ADMIN_ANALYTICS_ACCESS',
            userId: req.user.id,
            userIP,
            timestamp: Date.now()
        });

        const { period, detailed } = req.query;
        const validPeriods = ['week', 'month', 'year', 'all'];
        const selectedPeriod = validPeriods.includes(period) ? period : 'week';
        
        // Get enhanced analytics data
        const stats = chatbotLogger.getPeriodStats(selectedPeriod);
        const performanceMetrics = chatbotLogger.getPerformanceMetrics();
        const engagementInsights = chatbotLogger.getUserEngagementInsights();
        
        if (!stats) {
            return res.status(200).json({
                success: true,
                message: `No analytics data available for ${selectedPeriod}`,
                stats: null,
                period: selectedPeriod
            });
        }

        // Prepare response data
        const responseData = {
            success: true,
            period: selectedPeriod,
            stats: {
                ...stats,
                // Add real-time performance metrics
                currentPerformance: performanceMetrics,
                // Add engagement insights
                userEngagement: engagementInsights,
                // Add calculated metrics
                averageMessagesPerSession: stats.totalInteractions / Math.max(stats.sessionsStarted, 1),
                userRetentionRate: stats.sessionsEnded > 0 ? (stats.sessionsStarted / stats.sessionsEnded) * 100 : 0,
                guestToAuthRatio: stats.uniqueGuestUsers / Math.max(stats.uniqueAuthenticatedUsers, 1),
                responseEfficiency: stats.averageResponseTime > 0 ? 1000 / stats.averageResponseTime : 100,
                contentSearchRate: stats.searchQueries / Math.max(stats.totalInteractions, 1) * 100,
                // Add system health indicators
                systemHealth: {
                    uptime: 99.9, // This would be calculated from actual uptime data
                    errorRate: stats.errorCount / Math.max(stats.totalInteractions, 1) * 100,
                    apiResponseTime: stats.averageResponseTime,
                    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                    cpuUsage: process.cpuUsage().user / 1000000 // Convert to seconds
                }
            }
        };

        // Add detailed breakdown if requested
        if (detailed === 'true') {
            responseData.stats.detailedBreakdown = {
                hourlyDistribution: generateHourlyDistribution(stats.dailyBreakdown),
                topicTrends: stats.topicBreakdown,
                userJourneyPaths: generateUserJourneyInsights(),
                conversationFlowAnalysis: generateConversationFlowAnalysis(),
                performanceTrends: generatePerformanceTrends()
            };
        }

        res.status(200).json(responseData);

    } catch (error) {
        chatbotLogger.logError(error, { userId: req.user?.id, action: 'GET_ANALYTICS', period: req.query.period });
        next(errorHandler(500, "Failed to retrieve analytics"));
    }
};

// Helper functions for detailed analytics
const generateHourlyDistribution = (dailyBreakdown) => {
    // Generate mock hourly distribution - in real implementation, this would come from logs
    const hours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        interactions: Math.floor(Math.random() * 50) + 10,
        users: Math.floor(Math.random() * 20) + 5
    }));
    return hours;
};

const generateUserJourneyInsights = () => {
    // Generate mock user journey data - in real implementation, this would come from user journey logs
    return {
        commonPaths: [
            { path: 'START → MESSAGE → SEARCH → END', count: 45 },
            { path: 'START → MESSAGE → MESSAGE → END', count: 32 },
            { path: 'START → MESSAGE → CLEAR → END', count: 18 }
        ],
        averageJourneyLength: 3.2,
        dropoffPoints: {
            'After first message': 15,
            'After search': 8,
            'After 5 messages': 5
        }
    };
};

const generateConversationFlowAnalysis = () => {
    // Generate mock conversation flow data
    return {
        averageConversationDepth: 4.2,
        topicTransitions: {
            'technology → projects': 25,
            'help → education': 18,
            'general → blog': 15
        },
        conversationPatterns: {
            'question-answer': 60,
            'exploration': 25,
            'troubleshooting': 15
        }
    };
};

const generatePerformanceTrends = () => {
    // Generate mock performance trend data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
            date: date.toISOString().split('T')[0],
            avgResponseTime: Math.random() * 1000 + 500,
            successRate: 95 + Math.random() * 5,
            tokensPerRequest: Math.random() * 100 + 50
        };
    }).reverse();
    
    return last7Days;
}; 