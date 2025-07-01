import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import { loadJsonFile } from './utils/jsonLoader.js';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import chatbotRoutes from './routes/chatbot.route.js';
import notificationRoutes from './routes/notification.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { logger } from './utils/logger.js';

dotenv.config();

// Load the service account key from the utils folder
const serviceAccount = loadJsonFile();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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

// FIX 1: Enable trust proxy for Render (MUST be before rate limiting)
app.set('trust proxy', true);

// FIX 2: Configure helmet with proper CSP for Firebase Auth
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://apis.google.com",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://www.google.com",
                "https://www.googletagmanager.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://*.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://*.google.com",
                "https://*.googleusercontent.com"
            ],
            connectSrc: [
                "'self'",
                "https://*.googleapis.com",
                "https://*.google.com",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://*.firebaseio.com",
                "wss://*.firebaseio.com",
                "https://*.firebaseapp.com"
            ],
            frameSrc: [
                "'self'",
                "https://*.google.com",
                "https://*.firebaseapp.com"
            ],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false
}));

// FIX 3: Add Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

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
app.use('/notifications', notificationRoutes);
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