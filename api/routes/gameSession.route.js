import express from 'express';
import {
    createGameSession,
    getUserStats,
    getLeaderboard,
    getUserGameHistory,
    deleteGameSession,
    getGameStats
} from '../controllers/gameSession.controller.js';
import { verifyUser, verifyUserOptional } from '../utils/verifyUser.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for game sessions
const gameSessionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 game sessions per minute
    message: 'Too many game sessions, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const leaderboardLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 leaderboard requests per minute
    message: 'Too many leaderboard requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes (no authentication required)
router.get('/leaderboard', leaderboardLimiter, getLeaderboard);

// Optional authentication routes (work for both authenticated and guest users)
router.post('/session', gameSessionLimiter, verifyUserOptional, createGameSession);

// Authenticated routes (require login)
router.get('/stats', verifyUser, getUserStats);
router.get('/history', verifyUser, getUserGameHistory);

// Admin routes
router.delete('/session/:sessionId', verifyUser, deleteGameSession);
router.get('/admin/stats', verifyUser, getGameStats);

export default router; 