import { Request, Response, NextFunction } from 'express';
import {
    getDashboardStats,
    getAllBookings,
    updateBookingStatus,
    getAllUsers,
    toggleDentistStatus,
    getAllDentists,
} from './admin.service';

// Middleware: admin-only guard
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Admin access required' });
        return;
    }
    next();
}

export async function getStats(req: Request, res: Response): Promise<void> {
    try {
        const stats = await getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function listBookings(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string | undefined;
        const data = await getAllBookings(page, limit, status);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function patchBookingStatus(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const booking = await updateBookingStatus(id, status, reason);
        res.json({ success: true, data: booking });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function listUsers(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const role = req.query.role as string | undefined;
        const data = await getAllUsers(page, limit, role);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function patchDentistStatus(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const dentist = await toggleDentistStatus(id, isActive);
        res.json({ success: true, data: dentist });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function listDentists(req: Request, res: Response): Promise<void> {
    try {
        const dentists = await getAllDentists();
        res.json({ success: true, data: dentists });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}
