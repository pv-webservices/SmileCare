// ─── Booking Routes ──────────────────────────────────────────────────────────

import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import {
    getSlots,
    holdSlot,
    createBooking,
    createGuestBooking,
    rescheduleBooking,
    cancelBooking,
    getMyBookings,
} from './booking.controller';
import {
    getCalendarAvailability,
    getCalendarAvailableDates,
} from './calendar.controller';
import { testCalendarConnection } from './calendar.service';
import { testEmailConnection } from './email.service';

const router = Router();

// ─── Public Endpoints ────────────────────────────────────────────────────────

// Calendar availability (public, no auth)
router.get('/calendar/availability', getCalendarAvailability);
router.get('/calendar/available-dates', getCalendarAvailableDates);
// Test Google Calendar connection (debug endpoint)
router.get('/calendar/test', async (_req, res) => {
  const result = await testCalendarConnection();
  res.json(result);
});
// Test Gmail SMTP connection (debug endpoint)
router.get('/email/test', async (_req, res) => {
    const result = await testEmailConnection();
    res.json(result);
});

// Get available slots (filtered, sorted, with period hints)
router.get('/slots', getSlots);

// Hold a slot (requires sessionId in body, no JWT needed)
router.post('/slots/:id/hold', holdSlot);

// Guest booking (no auth required)
router.post('/bookings/guest', createGuestBooking);

// ─── Authenticated Endpoints ─────────────────────────────────────────────────

// Create a booking (requires JWT + patient role)
router.post('/bookings', authenticate, createBooking);

// Reschedule a booking (requires JWT)
router.put('/bookings/:id/reschedule', authenticate, rescheduleBooking);

// Cancel a booking (requires JWT)
router.delete('/bookings/:id/cancel', authenticate, cancelBooking);

// Get my bookings (convenience filtered route)
router.get('/bookings/my', authenticate, getMyBookings);

export default router;
