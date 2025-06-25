import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import chatbotRoutes from './routes/chatbot.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { logger } from './utils/logger.js';

dotenv.config();

mongoose.connect(process.env.MONGO)
    .then(() => {
        logger.info('Connected to MongoDB successfully');
    })
    .catch((err) => {
        logger.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

const __dirname = path.resolve();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://littles-blog.onrender.com'] 
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {    
    logger.info(`Server is running on port ${PORT}`);
});

app.use('/user', userRoutes);
app.use('/auth', authLimiter, authRoutes);
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });  
});