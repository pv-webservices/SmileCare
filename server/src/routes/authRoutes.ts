import { Router } from 'express';
import { register, login, logout, getMe, googleCallback } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

// Strict limiter: login / register — brute-force protection
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15-minute window
    max: 10,                      // max 10 attempts per IP per window
    standardHeaders: true,        // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many attempts. Please try again in 15 minutes.',
    },
    skip: (req) => process.env.NODE_ENV === 'test', // don't rate-limit tests
});

// Loose limiter: general API — DDoS protection
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1-minute window
    max: 60,                 // 60 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please slow down.',
    },
    skip: (req) => process.env.NODE_ENV === 'test',
});

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google/callback', authLimiter, googleCallback);
router.post('/logout', logout);
router.get('/me', apiLimiter, authenticate, getMe);

export default router;
