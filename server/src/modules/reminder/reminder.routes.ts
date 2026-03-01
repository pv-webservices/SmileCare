// Admin-only endpoint to manually trigger reminder processing
import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { sendPendingReminders } from './reminder.service';

const router = Router();

// POST /api/admin/reminders/trigger — manually trigger (admin only)
router.post('/admin/reminders/trigger', authenticate, async (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return;
    }
    try {
        await sendPendingReminders();
        res.json({ success: true, message: 'Reminders processed' });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
