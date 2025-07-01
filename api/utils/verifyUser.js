import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import crypto from 'crypto';

export const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(401, 'Unauthorized'));
        }
        req.user = user;
        next();
    });
}

// Optional authentication - allows both authenticated and guest users
export const verifyUserOptional = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        // Generate a guest session ID based on IP and user agent
        const userAgent = req.get('User-Agent') || 'unknown';
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const guestId = crypto.createHash('sha256')
            .update(`guest_${ip}_${userAgent}`)
            .digest('hex')
            .substring(0, 16);
        
        req.user = {
            id: `guest_${guestId}`,
            isGuest: true,
            isAdmin: false
        };
        return next();
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // If token is invalid, treat as guest
            const userAgent = req.get('User-Agent') || 'unknown';
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const guestId = crypto.createHash('sha256')
                .update(`guest_${ip}_${userAgent}`)
                .digest('hex')
                .substring(0, 16);
            
            req.user = {
                id: `guest_${guestId}`,
                isGuest: true,
                isAdmin: false
            };
        } else {
            req.user = {
                ...user,
                isGuest: false
            };
        }
        next();
    });
}