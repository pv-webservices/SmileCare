// ─── Booking Routes ──────────────────────────────────────────────────────────

import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import {
    getSlots,
    holdSlot,
    createBooking,
    rescheduleBooking,
    cancelBooking,
} from './booking.controller';

const router = Router();

// ─── Public Endpoints ────────────────────────────────────────────────────────

// Get available slots (filtered, sorted, with period hints)
router.get('/slots', getSlots);

// Hold a slot (requires sessionId in body, no JWT needed)
router.post('/slots/:id/hold', holdSlot);

// ─── Authenticated Endpoints ─────────────────────────────────────────────────

// Create a booking (requires JWT + patient role)
router.post('/bookings', authenticate, createBooking);

// Reschedule a booking (requires JWT)
router.put('/bookings/:id/reschedule', authenticate, rescheduleBooking);

// Cancel a booking (requires JWT)
router.delete('/bookings/:id/cancel', authenticate, cancelBooking);

export default router;
