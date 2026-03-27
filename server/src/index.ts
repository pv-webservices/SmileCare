import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Startup Diagnostics ─────────────────────────────────────────────
console.log('[STARTUP] Starting server...');
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ [WARNING] GMAIL_USER or GMAIL_APP_PASSWORD is missing in .env. Emails will NOT be sent.');
} else {
    console.log('✅ [OK] Email configuration found.');
}

if (!process.env.GOOGLE_CALENDAR_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.warn('⚠️ [WARNING] GOOGLE_CALENDAR_ID or GOOGLE_SERVICE_ACCOUNT_JSON is missing in .env. Calendar events will NOT be created.');
} else {
    console.log('✅ [OK] Google Calendar configuration found.');
}
// ─────────────────────────────────────────────────────────────────────

function parseCsv(value?: string) {
    return (value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

const allowedOrigins = new Set<string>([
    "http://localhost:3000",
    ...parseCsv(process.env.CLIENT_URL),
    ...parseCsv(process.env.CLIENT_URLS),
]);

const originPatterns = [
    ...parseCsv(process.env.CLIENT_URL_PATTERNS),
    "^https://smile-care.*\\.vercel\\.app$",
].map((pattern) => new RegExp(pattern));

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.has(origin) || originPatterns.some((pattern) => pattern.test(origin))) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || process.env.NODE_ENV === "test",
    message: {
        success: false,
        error: "Too many requests.",
    },
});

app.use(globalLimiter);

import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./modules/booking/booking.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import patientRoutes from "./modules/patient/patient.routes";
import supportRoutes from "./modules/support/support.routes";
import treatmentRoutes from "./modules/treatment/treatment.routes";
import dentistRoutes from "./modules/dentist/dentist.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import reminderRoutes from "./modules/reminder/reminder.routes";
import adminRoutes from "./modules/admin/admin.routes";
import cmsRoutes from "./modules/cms/cms.routes";
import loyaltyRoutes from "./modules/loyalty/loyalty.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";

app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api", bookingRoutes);
app.use("/api", paymentRoutes);
app.use("/api", patientRoutes);
app.use("/api", supportRoutes);
app.use("/api", treatmentRoutes);
app.use("/api", dentistRoutes);
app.use("/api", notificationRoutes);
app.use("/api", reminderRoutes);
app.use("/api", adminRoutes);
app.use("/api", cmsRoutes);
app.use("/api", loyaltyRoutes);

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", message: "SmileCare API is running" });
});

import { startReminderJob } from "./modules/reminder/reminder.service";

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startReminderJob();
});

server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
        console.error(`\n[Server] Port ${PORT} is already in use.\nRun: netstat -ano | findstr :${PORT}  then  taskkill /PID <PID> /F\n`);
        process.exit(1);
    } else {
        throw err;
    }
});

export { app, prisma };
