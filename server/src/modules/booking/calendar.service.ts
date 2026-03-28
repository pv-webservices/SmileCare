// ─── Google Calendar Service ─────────────────────────────────────────────────
import { google } from 'googleapis';

// Convert "09:00 AM" or "02:30 PM" to "09:00" or "14:30" (24-hour HH:MM)
function to24Hour(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; // already 24h or unknown format, return as-is
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'AM') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

function addOneHour(time12: string): string {
  const t24 = to24Hour(time12);
  const [h, m] = t24.split(':').map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var is missing');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

export interface CalendarBooking {
  patientName: string;
  patientEmail: string;
  treatmentName: string;
  specialistName: string;
  date: string;         // YYYY-MM-DD
  startTime: string;   // e.g. "09:00 AM" or "09:00"
  endTime: string;     // e.g. "09:30 AM" or "09:30"
  bookingId: string;
}

// Create a calendar event for a confirmed booking
export async function createCalendarEvent(booking: CalendarBooking): Promise<string | null> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID env var is missing');

    const calendar = getCalendarClient();

    const start24 = to24Hour(booking.startTime);
    const end24 = booking.endTime ? to24Hour(booking.endTime) : addOneHour(booking.startTime);

    const startDateTime = `${booking.date}T${start24}:00+05:30`;
    const endDateTime   = `${booking.date}T${end24}:00+05:30`;

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `SmileCare: ${booking.treatmentName} - ${booking.patientName}`,
        description: [
          `Patient: ${booking.patientName}`,
          `Email: ${booking.patientEmail}`,
          `Treatment: ${booking.treatmentName}`,
          `Specialist: Dr. ${booking.specialistName}`,
          `Booking ID: ${booking.bookingId}`,
        ].join('\n'),
        start: { dateTime: startDateTime, timeZone: 'Asia/Kolkata' },
        end:   { dateTime: endDateTime,   timeZone: 'Asia/Kolkata' },
        colorId: '7', // Peacock blue
      },
    });

    console.log(`[CALENDAR_EVENT_CREATED] eventId=${event.data.id} bookingId=${booking.bookingId}`);
    return event.data.id || null;
  } catch (err) {
    console.error('[CALENDAR_EVENT_ERROR]', err);
    return null; // Non-fatal: don't fail the booking if calendar fails
  }
}

  // Test calendar connection (for debugging)
export async function testCalendarConnection(): Promise<{ success: boolean; error?: string; calendarId?: string }> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) return { success: false, error: 'GOOGLE_CALENDAR_ID env var is missing' };
    const calendar = getCalendarClient();
    const result = await calendar.calendars.get({ calendarId });
    return { success: true, calendarId: result.data.summary || calendarId };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}
