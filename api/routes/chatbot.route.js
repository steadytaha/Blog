import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyUser } from '../utils/verifyUser.js';
import { chatWithBot, clearChatHistory, getChatbotAnalytics } from '../controllers/chatbot.controller.js';
import chatbotLogger from '../utils/chatbotLogger.js';

const router = express.Router();

// Rate limiting specifically for chatbot (stricter than general API)
const chatbotRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute per IP
    message: {
        success: false,
        message: 'Too many requests to chatbot. Please wait before sending more messages.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use handler instead of onLimitReached for v7 compatibility
    handler: (req, res) => {
        const userId = req.user?.id || 'anonymous';
        const userIP = req.ip || req.connection.remoteAddress;
        chatbotLogger.logRateLimit(userId, userIP, 'API_RATE_LIMIT');
        
        // Send the rate limit response
        res.status(429).json({
            success: false,
            message: 'Too many requests to chatbot. Please wait before sending more messages.'
        });
    }
});

// Apply rate limiting and user verification
router.post('/', chatbotRateLimit, verifyUser, chatWithBot);
router.delete('/clear', verifyUser, clearChatHistory);
router.get('/analytics', verifyUser, getChatbotAnalytics);

export default router; 