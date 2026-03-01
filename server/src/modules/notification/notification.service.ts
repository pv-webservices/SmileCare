import nodemailer from 'nodemailer';
import { prisma } from '../../lib/prisma';

// ── Transporter ───────────────────────────────────────────
// Reads from env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Falls back to Ethereal (test) if env vars are missing.
const transporter = nodemailer.createTransport(
    process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        }
        : {
            // Ethereal test account for development
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal_user',
                pass: 'ethereal_pass',
            },
        }
);

interface BookingEmailData {
    toEmail: string;
    toName: string;
    treatment: string;
    doctor: string;
    date: string;        // formatted date string e.g. "Mon, 2 Mar 2026"
    time: string;        // e.g. "10:00 AM"
    bookingId: string;
    amount?: number;
}

// ── Send booking confirmation email ──────────────────────
export async function sendBookingConfirmation(
    data: BookingEmailData
): Promise<void> {
    const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <h2 style="color:#1a3a5c">Booking Confirmed ✅</h2>
            <p>Hi ${data.toName},</p>
            <p>Your appointment at <strong>SmileCare</strong> has been confirmed.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr><td style="padding:8px 0;color:#666">Treatment</td>
                    <td style="padding:8px 0;font-weight:bold">${data.treatment}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Doctor</td>
                    <td style="padding:8px 0">${data.doctor}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Date</td>
                    <td style="padding:8px 0">${data.date}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Time</td>
                    <td style="padding:8px 0">${data.time}</td></tr>
                ${data.amount != null ? `<tr><td style="padding:8px 0;color:#666">Amount Paid</td>
                    <td style="padding:8px 0">₹${(data.amount / 100).toLocaleString()}</td></tr>` : ''}
                <tr><td style="padding:8px 0;color:#666">Booking ID</td>
                    <td style="padding:8px 0;font-family:monospace;font-size:12px">${data.bookingId}</td></tr>
            </table>
            <p style="color:#666;font-size:13px">
                Please arrive 10 minutes before your appointment.
                To cancel or reschedule, log in to your SmileCare account.
            </p>
            <p style="color:#999;font-size:12px">SmileCare Dental Clinic</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"SmileCare" <${process.env.SMTP_USER || 'noreply@smilecare.com'}>`,
        to: data.toEmail,
        subject: `Booking Confirmed — ${data.treatment} on ${data.date}`,
        html,
    });
}

// ── Send 24h reminder email ───────────────────────────────
export async function sendReminderEmail(
    data: BookingEmailData
): Promise<void> {
    const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <h2 style="color:#1a3a5c">Reminder: Appointment Tomorrow 🗓️</h2>
            <p>Hi ${data.toName},</p>
            <p>This is a reminder for your appointment <strong>tomorrow</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr><td style="padding:8px 0;color:#666">Treatment</td>
                    <td style="padding:8px 0;font-weight:bold">${data.treatment}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Doctor</td>
                    <td style="padding:8px 0">${data.doctor}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Time</td>
                    <td style="padding:8px 0">${data.time}</td></tr>
            </table>
            <p style="color:#999;font-size:12px">SmileCare Dental Clinic</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"SmileCare" <${process.env.SMTP_USER || 'noreply@smilecare.com'}>`,
        to: data.toEmail,
        subject: `Reminder: Your appointment tomorrow at ${data.time}`,
        html,
    });
}

// ── Send cancellation email ───────────────────────────────
export async function sendCancellationEmail(
    data: BookingEmailData & { reason?: string }
): Promise<void> {
    await transporter.sendMail({
        from: `"SmileCare" <${process.env.SMTP_USER || 'noreply@smilecare.com'}>`,
        to: data.toEmail,
        subject: `Appointment Cancelled — ${data.treatment}`,
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto">
                <h2 style="color:#1a3a5c">Appointment Cancelled</h2>
                <p>Hi ${data.toName}, your appointment for 
                   <strong>${data.treatment}</strong> on ${data.date} has been cancelled.</p>
                ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
                <p>Book a new appointment anytime at SmileCare.</p>
            </div>
        `,
    });
}

// ── Save notification record in DB ───────────────────────
export async function createNotificationRecord(
    userId: string,
    type: 'booking_confirmation' | 'reminder' | 'payment_receipt' | 'cancellation' | 'announcement',
    title: string,
    message: string
): Promise<void> {
    await prisma.notification.create({
        data: { userId, type, title, message },
    });
}

// ── Get user notifications ────────────────────────────────
export async function getUserNotifications(userId: string) {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}

// ── Mark notification as read ─────────────────────────────
export async function markNotificationRead(
    notificationId: string,
    userId: string
): Promise<void> {
    await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
    });
}
