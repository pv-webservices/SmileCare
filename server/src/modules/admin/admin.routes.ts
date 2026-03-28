import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import {
    adminOnly,
    getStats,
    listBookings,
    patchBookingStatus,
    listUsers,
    patchDentistStatus,
    listDentists,
    refreshSlots,
} from './admin.controller';

const router = Router();
router.use(authenticate, adminOnly); // all admin routes require auth + admin role

// GET  /api/admin/stats
router.get('/admin/stats', getStats);
// GET  /api/admin/bookings?page=1&status=confirmed
router.get('/admin/bookings', listBookings);
// PATCH /api/admin/bookings/:id/status
router.patch('/admin/bookings/:id/status', patchBookingStatus);
// GET  /api/admin/users?page=1&role=patient
router.get('/admin/users', listUsers);
// PATCH /api/admin/dentists/:id/status
router.patch('/admin/dentists/:id/status', patchDentistStatus);
// GET  /api/admin/dentists
router.get('/admin/dentists', listDentists);
// POST /api/admin/slots/refresh?days=90  — generate future slots for all dentists
router.post('/admin/slots/refresh', refreshSlots);

export default router;
