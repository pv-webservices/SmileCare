// ─── Calendar Availability Controller (Public, No Auth) ──────────────────────

import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { errorResponse } from "./booking.types";

/**
 * GET /api/calendar/availability?specialistId=<id>&date=<YYYY-MM-DD>
 * Returns all slots for a specialist on a given date, split into available and booked.
 */
export async function getCalendarAvailability(req: Request, res: Response) {
    try {
        const { specialistId, date } = req.query as {
            specialistId?: string;
            date?: string;
        };

        if (!specialistId || !date) {
            return res.status(400).json(
                errorResponse(
                    "VALIDATION_ERROR",
                    "specialistId and date query params are required"
                )
            );
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "date must be in YYYY-MM-DD format")
            );
        }

        const now = new Date();

        // Release expired holds first
        await prisma.slot.updateMany({
            where: {
                holdExpiresAt: { lt: now },
                heldBySessionId: { not: null },
            },
            data: {
                holdExpiresAt: null,
                heldBySessionId: null,
                isAvailable: true,
            },
        });

        // Fetch all slots for this specialist on this date
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const allSlots = await prisma.slot.findMany({
            where: {
                dentistId: specialistId,
                date: { gte: startOfDay, lte: endOfDay },
                isEmergency: false,
            },
            orderBy: { startTime: "asc" },
        });

        const availableSlots = allSlots
            .filter((s) => {
                // Available if: isAvailable=true AND (no hold OR hold expired)
                if (!s.isAvailable) return false;
                if (s.holdExpiresAt && s.holdExpiresAt > now) return false;
                return true;
            })
            .map((s) => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
                isAvailable: true,
            }));

        const bookedSlots = allSlots
            .filter((s) => {
                // Booked if: not available, or has active hold by someone
                if (!s.isAvailable) return true;
                if (s.holdExpiresAt && s.holdExpiresAt > now) return true;
                return false;
            })
            .map((s) => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
                isAvailable: false,
            }));

        return res.status(200).json({ availableSlots, bookedSlots });
    } catch (error) {
        console.error("[CALENDAR_AVAILABILITY_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to fetch availability")
        );
    }
}

/**
 * GET /api/calendar/available-dates?specialistId=<id>&month=<YYYY-MM>
 * Returns a list of dates in the given month that have at least 1 open slot.
 */
export async function getCalendarAvailableDates(req: Request, res: Response) {
    try {
        const { specialistId, month } = req.query as {
            specialistId?: string;
            month?: string;
        };

        if (!specialistId || !month) {
            return res.status(400).json(
                errorResponse(
                    "VALIDATION_ERROR",
                    "specialistId and month query params are required"
                )
            );
        }

        // Validate month format
        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "month must be in YYYY-MM format")
            );
        }

        const [yearStr, monthStr] = month.split("-");
        const year = parseInt(yearStr, 10);
        const monthNum = parseInt(monthStr, 10); // 1-based

        const now = new Date();

        // Release expired holds first
        await prisma.slot.updateMany({
            where: {
                holdExpiresAt: { lt: now },
                heldBySessionId: { not: null },
            },
            data: {
                holdExpiresAt: null,
                heldBySessionId: null,
                isAvailable: true,
            },
        });

        // Build date range for the month
        const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

        // Don't return dates before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const effectiveStart = startOfMonth < today
            ? new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
            : startOfMonth;

        // Get all available slots in this range
        const availableSlots = await prisma.slot.findMany({
            where: {
                dentistId: specialistId,
                date: { gte: effectiveStart, lte: endOfMonth },
                isAvailable: true,
                isEmergency: false,
                OR: [
                    { holdExpiresAt: null },
                    { holdExpiresAt: { lt: now } },
                ],
            },
            select: { date: true },
        });

        // Extract unique dates
        const dateSet = new Set<string>();
        for (const slot of availableSlots) {
            const d = slot.date;
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
            const day = String(d.getUTCDate()).padStart(2, "0");
            dateSet.add(`${y}-${m}-${day}`);
        }

        return res.status(200).json({
            availableDates: Array.from(dateSet).sort(),
        });
    } catch (error) {
        console.error("[CALENDAR_AVAILABLE_DATES_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to fetch available dates")
        );
    }
}
