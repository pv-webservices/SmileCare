import { Request, Response } from 'express';
import {
    getUserNotifications,
    markNotificationRead,
} from './notification.service';

export async function getNotifications(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = (req as any).user.id;
        const notifications = await getUserNotifications(userId);
        res.json({ success: true, data: notifications });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function markAsRead(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        await markNotificationRead(id, userId);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}
