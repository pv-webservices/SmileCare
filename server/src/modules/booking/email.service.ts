// ─── Email Notification Service (Gmail SMTP via Nodemailer) ────────────────
// Sends to ANY email address using Gmail + App Password.
// No custom domain required.
import * as nodemailer from 'nodemailer';

export interface BookingConfirmationData {
  patientName: string;
  patientEmail: string;
  treatmentName: string;
  specialistName: string;
  date: string;        // e.g. "27 Mar 2026"
  startTime: string;   // e.g. "10:00 AM"
  bookingId: string;
}

// Creates a reusable transporter using Gmail SMTP
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

export async function sendBookingConfirmationEmail(
  data: BookingConfirmationData
): Promise<void> {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      console.error('[EMAIL_SERVICE] CRITICAL: GMAIL_USER or GMAIL_APP_PASSWORD not set. Email NOT sent to:', data.patientEmail);
      return;
    }

    console.log(`[EMAIL_SERVICE] Attempting to send confirmation to: ${data.patientEmail}`);

    // Normalise specialist name: strip duplicate Dr. prefix if present
    const specialistDisplay = data.specialistName.replace(/^Dr\.\s*/i, 'Dr. ');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a6b4e, #2d9e72); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body h2 { color: #1a6b4e; font-size: 18px; margin: 0 0 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .detail-label { color: #888; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { color: #222; font-size: 14px; font-weight: 500; text-align: right; }
    .booking-id { background: #f0faf5; border: 1px solid #c3e6d8; border-radius: 8px; padding: 12px 16px; margin: 20px 0; text-align: center; }
    .booking-id span { font-size: 12px; color: #888; display: block; margin-bottom: 4px; }
    .booking-id code { font-size: 15px; color: #1a6b4e; font-weight: bold; letter-spacing: 1px; }
    .footer { background: #f9f9f9; padding: 20px 24px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #aaa; font-size: 12px; margin: 0; }
    .check-icon { font-size: 40px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="check-icon">&#x2705;</div>
      <h1>SmileCare</h1>
      <p>Booking Confirmed</p>
    </div>
    <div class="body">
      <h2>Hi ${data.patientName},</h2>
      <p>Your appointment has been successfully booked. Here are your details:</p>
      <div class="detail-row">
        <span class="detail-label">Treatment</span>
        <span class="detail-value">${data.treatmentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Specialist</span>
        <span class="detail-value">${specialistDisplay}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${data.date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${data.startTime}</span>
      </div>
      <div class="booking-id">
        <span>Your Booking Reference</span>
        <code>${data.bookingId.slice(0, 8).toUpperCase()}</code>
      </div>
      <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
    </div>
    <div class="footer">
      <p>SmileCare &mdash; Premium Dental Care &mdash; This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

    const transporter = createTransporter()!;

    const mailOptions = {
      from: `SmileCare <${gmailUser}>`,
      to: data.patientEmail,
      subject: `\u2705 Booking Confirmed \u2013 ${data.treatmentName} on ${data.date}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL_SENT] to=${data.patientEmail} bookingId=${data.bookingId} messageId=${info.messageId}`);

  } catch (err: any) {
    console.error('[EMAIL_SERVICE_ERROR]', err?.message || err);
    // Non-fatal: don't fail the booking if email fails
  }
}

// Test email connection (for debugging via /api/email/test)
export async function testEmailConnection(): Promise<{ success: boolean; error?: string; detail?: string }> {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      return {
        success: false,
        error: 'GMAIL_USER or GMAIL_APP_PASSWORD environment variable is not set.',
      };
    }

    const transporter = createTransporter()!;
    await transporter.verify();

    return {
      success: true,
      detail: `Gmail SMTP connected successfully as ${gmailUser}. Can send to any email address.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}
