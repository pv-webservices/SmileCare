import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { handleChatMessage } from './chatbot.controller';

const router = Router();

// Chatbot-specific rate limit:
// 30 messages per minute per IP — prevents abuse while
// allowing a normal conversation (avg message every 2s)
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
        success: false,
        error: 'Too many messages. Please wait a moment.',
    },
});

// POST /api/chatbot/message
// Auth is OPTIONAL — works for both guests and logged-in patients
router.post(
    '/message',
    chatLimiter,
    handleChatMessage
);

export default router;
