import express from 'express';
import {
    getAllWords,
    getRandomTargetWord,
    validateWord,
    getWordStats,
    addWords,
    updateWord,
    deleteWord
} from '../controllers/wordleWords.controller.js';
import { verifyUser } from '../utils/verifyUser.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for word operations
const wordOperationsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    message: 'Too many word requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 admin requests per minute
    message: 'Too many admin requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes
router.get('/all', wordOperationsLimiter, getAllWords);
router.get('/random', wordOperationsLimiter, getRandomTargetWord);
router.get('/validate/:word', wordOperationsLimiter, validateWord);
router.get('/stats', wordOperationsLimiter, getWordStats);

// Admin routes
router.post('/bulk', adminLimiter, verifyUser, addWords);
router.put('/word/:word', adminLimiter, verifyUser, updateWord);
router.delete('/word/:word', adminLimiter, verifyUser, deleteWord);

export default router; 