import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { getNotifications, markAsRead } from './notification.controller';

const router = Router();

// GET /api/notifications — get current user's notifications
router.get('/notifications', authenticate, getNotifications);

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/notifications/:id/read', authenticate, markAsRead);

export default router;
