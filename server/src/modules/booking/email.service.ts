// ─── Email Notification Service (Resend HTTP API) ──────────────────────────────
// Uses Resend (https://resend.com) - HTTPS-based, no SMTP port blocking

export interface BookingConfirmationData {
  patientName: string;
  patientEmail: string;
  treatmentName: string;
  specialistName: string;
  date: string;        // e.g. "27 Mar 2026"
  startTime: string;  // e.g. "10:00 AM"
  bookingId: string;
}

export async function sendBookingConfirmationEmail(
  data: BookingConfirmationData
): Promise<void> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'SmileCare <onboarding@resend.dev>';

    if (!resendApiKey) {
      console.error('[EMAIL_SERVICE] CRITICAL: RESEND_API_KEY not set. Email NOT sent to:', data.patientEmail);
      return;
    }

    console.log(`[EMAIL_SERVICE] Attempting to send confirmation to: ${data.patientEmail}`);

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
      <div class="check-icon">✅</div>
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
        <span class="detail-value">Dr. ${data.specialistName}</span>
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [data.patientEmail],
        subject: `✅ Booking Confirmed – ${data.treatmentName} on ${data.date}`,
        html,
      }),
    });

    const result = await response.json() as any;

    if (!response.ok) {
      console.error('[EMAIL_SERVICE_ERROR] Resend API error:', result);
      return;
    }

    console.log(`[EMAIL_SENT] to=${data.patientEmail} bookingId=${data.bookingId} resendId=${result.id}`);
  } catch (err) {
    console.error('[EMAIL_SERVICE_ERROR]', err);
    // Non-fatal: don't fail the booking if email fails
  }
}

// Test email connection (for debugging)
export async function testEmailConnection(): Promise<{ success: boolean; error?: string; detail?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return { success: false, error: 'RESEND_API_KEY not set' };
    }
    // Test by calling the Resend API domains endpoint
    const response = await fetch('https://api.resend.com/domains', {
      headers: { 'Authorization': `Bearer ${resendApiKey}` },
    });
    const result = await response.json() as any;
    if (!response.ok) {
      return { success: false, error: `Resend API returned ${response.status}: ${JSON.stringify(result)}` };
    }
    return { success: true, detail: `Resend API key valid. RESEND_FROM_EMAIL=${process.env.RESEND_FROM_EMAIL || 'using default onboarding@resend.dev'}` };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}
