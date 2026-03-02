import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

import rateLimit from 'express-rate-limit';

// Global rate limit — catches all routes not covered by specific limiters
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' ||
        process.env.NODE_ENV === 'test',
    message: {
        success: false,
        error: 'Too many requests.',
    },
});

app.use(globalLimiter);

// Routes
import authRoutes from './routes/authRoutes';
import bookingRoutes from './modules/booking/booking.routes';
import paymentRoutes from './modules/payment/payment.routes';
import patientRoutes from './modules/patient/patient.routes';
import supportRoutes from './modules/support/support.routes';
import treatmentRoutes from './modules/treatment/treatment.routes';
import dentistRoutes from './modules/dentist/dentist.routes';
import notificationRoutes from './modules/notification/notification.routes';
import reminderRoutes from './modules/reminder/reminder.routes';
import adminRoutes from './modules/admin/admin.routes';
import cmsRoutes from './modules/cms/cms.routes';
import loyaltyRoutes from './modules/loyalty/loyalty.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);
app.use('/api', patientRoutes);
app.use('/api', supportRoutes);
app.use('/api', treatmentRoutes);
app.use('/api', dentistRoutes);
app.use('/api', notificationRoutes);
app.use('/api', reminderRoutes);
app.use('/api', adminRoutes);
app.use('/api', cmsRoutes);
app.use('/api', loyaltyRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'SmileCare API is running' });
});

import { startReminderJob } from './modules/reminder/reminder.service';

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startReminderJob();
});

export { app, prisma };
