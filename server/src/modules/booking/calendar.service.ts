// ─── Google Calendar Service ──────────────────────────────────────────────────
import { google } from 'googleapis';

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
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  bookingId: string;
}

// Create a calendar event for a confirmed booking
export async function createCalendarEvent(booking: CalendarBooking): Promise<string | null> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID env var is missing');

    const calendar = getCalendarClient();

    const startDateTime = `${booking.date}T${booking.startTime}:00+05:30`;
    const endDateTime = `${booking.date}T${(booking.endTime || addOneHour(booking.startTime))}:00+05:30`;

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

// Fetch booked time slots from Google Calendar for a given date
export async function getBookedSlots(date: string): Promise<Array<{ startTime: string; endTime: string }>> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) return [];

    const calendar = getCalendarClient();

    const timeMin = `${date}T00:00:00+05:30`;
    const timeMax = `${date}T23:59:59+05:30`;

    const res = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items || [];
    return events
      .filter(e => e.start?.dateTime && e.end?.dateTime)
      .map(e => ({
        startTime: new Date(e.start!.dateTime!)
          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
        endTime: new Date(e.end!.dateTime!)
          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
      }));
  } catch (err) {
    console.error('[CALENDAR_FETCH_ERROR]', err);
    return [];
  }
}

function addOneHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '00')}`;
}
