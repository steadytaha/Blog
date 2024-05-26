import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log('Connected to MongoDB!!');
    })
    .catch((err) => {
        console.log(err)
});

const app = express();
app.use(cookieParser());

app.use(express.json());

app.listen(3000, () => {    
    console.log('Server is running on port 3000!!');
});

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/post', postRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });  
});