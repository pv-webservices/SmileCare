import { Request, Response, NextFunction } from 'express';
import {
    getDashboardStats,
    getAllBookings,
    updateBookingStatus,
    getAllUsers,
    toggleDentistStatus,
    getAllDentists,
} from './admin.service';
import { prisma } from '../../lib/prisma';

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

// ─── Slot Refresh ──────────────────────────────────────────────────
const REFRESH_TIME_SLOTS = [
    { startTime: '09:00 AM', endTime: '09:30 AM' },
    { startTime: '09:30 AM', endTime: '10:00 AM' },
    { startTime: '10:00 AM', endTime: '10:30 AM' },
    { startTime: '10:30 AM', endTime: '11:00 AM' },
    { startTime: '11:00 AM', endTime: '11:30 AM' },
    { startTime: '02:00 PM', endTime: '02:30 PM' },
    { startTime: '02:30 PM', endTime: '03:00 PM' },
    { startTime: '03:00 PM', endTime: '03:30 PM' },
    { startTime: '03:30 PM', endTime: '04:00 PM' },
    { startTime: '04:00 PM', endTime: '04:30 PM' },
];

export async function refreshSlots(req: Request, res: Response): Promise<void> {
    try {
        const daysAhead = parseInt(req.query.days as string) || 90;
        const dentists = await prisma.dentist.findMany({ select: { id: true } });
        if (dentists.length === 0) {
            res.status(404).json({ success: false, error: 'No dentists found in database.' });
            return;
        }

        const nowUtc = new Date();
        const baseYear = nowUtc.getUTCFullYear();
        const baseMonth = nowUtc.getUTCMonth();
        const baseDay = nowUtc.getUTCDate();
        let created = 0;
        let skipped = 0;

        for (const dentist of dentists) {
            for (let i = 1; i <= daysAhead; i++) {
                const slotDate = new Date(Date.UTC(baseYear, baseMonth, baseDay + i));
                if (slotDate.getUTCDay() === 0) continue; // skip Sundays

                const existing = await prisma.slot.findFirst({
                    where: { dentistId: dentist.id, date: slotDate },
                });
                if (existing) { skipped++; continue; }

                for (const time of REFRESH_TIME_SLOTS) {
                    await prisma.slot.create({
                        data: {
                            dentistId: dentist.id,
                            date: slotDate,
                            startTime: time.startTime,
                            endTime: time.endTime,
                            isAvailable: true,
                            isEmergency: false,
                        },
                    });
                    created++;
                }
            }
        }

        console.log(`[ADMIN_SLOT_REFRESH] Created ${created} new slots. Skipped ${skipped} dates.`);
        res.json({
            success: true,
            message: `Slot refresh complete. Created ${created} new slots across ${dentists.length} dentists for the next ${daysAhead} days.`,
            data: { created, skipped, dentists: dentists.length, daysAhead },
        });
    } catch (err: any) {
        console.error('[ADMIN_SLOT_REFRESH_ERROR]', err);
        res.status(500).json({ success: false, error: err.message });
    }
}
