import { errorHandler } from './error.js';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Username validation regex (alphanumeric and underscore only)
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

// Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 digit)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export const validateSignup = (req, res, next) => {
    const { username, email, password } = req.body;

    // Check for required fields
    if (!username || !email || !password) {
        return next(errorHandler(400, 'Username, email, and password are required'));
    }

    // Trim whitespace
    req.body.username = username.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();

    // Validate username
    if (!usernameRegex.test(req.body.username)) {
        return next(errorHandler(400, 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'));
    }

    // Validate email
    if (!emailRegex.test(req.body.email)) {
        return next(errorHandler(400, 'Please provide a valid email address'));
    }

    // Validate password
    if (!passwordRegex.test(req.body.password)) {
        return next(errorHandler(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit'));
    }

    next();
};

export const validateSignin = (req, res, next) => {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
        return next(errorHandler(400, 'Email and password are required'));
    }

    // Trim and sanitize
    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();

    // Validate email format
    if (!emailRegex.test(req.body.email)) {
        return next(errorHandler(400, 'Please provide a valid email address'));
    }

    next();
};

export const validateGoogleAuth = (req, res, next) => {
    const { name, email, photo } = req.body;

    // Check for required fields
    if (!name || !email) {
        return next(errorHandler(400, 'Name and email are required for Google authentication'));
    }

    // Sanitize inputs
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    if (photo) {
        req.body.photo = photo.trim();
    }

    // Validate email
    if (!emailRegex.test(req.body.email)) {
        return next(errorHandler(400, 'Please provide a valid email address'));
    }

    next();
};

export const validatePostCreation = (req, res, next) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return next(errorHandler(400, 'Title and content are required'));
    }

    // Trim and sanitize
    req.body.title = title.trim();
    req.body.content = content.trim();

    // Validate length
    if (req.body.title.length < 3 || req.body.title.length > 200) {
        return next(errorHandler(400, 'Title must be between 3 and 200 characters'));
    }

    if (req.body.content.length < 10) {
        return next(errorHandler(400, 'Content must be at least 10 characters long'));
    }

    next();
};

export const validateComment = (req, res, next) => {
    const { content } = req.body;

    if (!content) {
        return next(errorHandler(400, 'Comment content is required'));
    }

    req.body.content = content.trim();

    if (req.body.content.length < 1 || req.body.content.length > 1000) {
        return next(errorHandler(400, 'Comment must be between 1 and 1000 characters'));
    }

    next();
}; 