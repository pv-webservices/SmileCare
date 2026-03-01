import { prisma } from '../../lib/prisma';

// ── Dashboard stats ───────────────────────────────────────
export async function getDashboardStats() {
    const [
        totalPatients,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        revenueResult,
        todayBookings,
    ] = await Promise.all([
        prisma.patient.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'confirmed' } }),
        prisma.booking.count({ where: { status: 'cancelled' } }),
        prisma.booking.count({ where: { status: 'completed' } }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'captured' },
        }),
        prisma.booking.count({
            where: {
                slot: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                },
                status: { in: ['confirmed', 'completed'] },
            },
        }),
    ]);

    return {
        totalPatients,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: revenueResult._sum.amount || 0,
        todayBookings,
    };
}

// ── List all bookings (paginated) ─────────────────────────
export async function getAllBookings(page = 1, limit = 20, status?: string) {
    const where = status ? { status: status as any } : {};
    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                patient: { include: { user: { select: { name: true, email: true } } } },
                dentist: { include: { user: { select: { name: true } } } },
                treatment: { select: { name: true } },
                slot: { select: { date: true, startTime: true } },
                payment: { select: { amount: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.booking.count({ where }),
    ]);
    return { bookings, total, page, limit };
}

// ── Update booking status ─────────────────────────────────
export async function updateBookingStatus(
    bookingId: string,
    status: string,
    reason?: string
) {
    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: status as any,
            cancellationReason: reason,
        },
    });
}

// ── List all users ────────────────────────────────────────
export async function getAllUsers(page = 1, limit = 20, role?: string) {
    const where = role ? { role: role as any } : {};
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
}

// ── Toggle dentist active status ──────────────────────────
export async function toggleDentistStatus(
    dentistId: string,
    isActive: boolean
) {
    return prisma.dentist.update({
        where: { id: dentistId },
        data: { isActive },
    });
}
