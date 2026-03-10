import { Router } from 'express';
import { register, login, logout, getMe, googleCallback } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many attempts. Please try again in 15 minutes.',
    },
    skip: () => process.env.NODE_ENV === 'test',
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please slow down.',
    },
    skip: () => process.env.NODE_ENV === 'test',
});

const googleAuthLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many sign-in attempts. Please try again shortly.',
    },
    skip: () => process.env.NODE_ENV === 'test',
});

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleAuthLimiter, googleCallback);
router.post('/google/callback', googleAuthLimiter, googleCallback);
router.post('/logout', logout);
router.get('/me', apiLimiter, authenticate, getMe);

export default router;
