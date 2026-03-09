import { prisma } from "../../lib/prisma";

export const getPatientProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            patient: {
                select: {
                    id: true,
                    dob: true,
                    medicalNotes: true,
                    loyalty: {
                        select: { points: true },
                    },
                },
            },
        },
    });

    if (!user || !user.patient) {
        throw new Error("Patient profile not found");
    }

    const totalLoyalty = user.patient.loyalty.reduce((sum, l) => sum + l.points, 0);

    return {
        id: user.id,
        patientId: user.patient.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.patient.dob,
        medicalNotes: user.patient.medicalNotes,
        loyaltyPoints: totalLoyalty,
        membership: totalLoyalty >= 500 ? "Platinum" : totalLoyalty >= 200 ? "Gold" : "Premium",
    };
};

export const updatePatientProfile = async (
    userId: string,
    data: { name?: string; phone?: string | null; dob?: string }
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error("Patient profile not found");
    }

    const normalizedPhone = data.phone?.trim() ? data.phone.trim() : null;

    if (data.name || data.phone !== undefined) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.phone !== undefined && { phone: normalizedPhone as any }),
            },
        });
    }

    if (data.dob) {
        await prisma.patient.update({
            where: { id: user.patient.id },
            data: { dob: new Date(data.dob) },
        });
    }

    return getPatientProfile(userId);
};

export const getUpcomingAppointments = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error("Patient profile not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
        where: {
            patientId: user.patient.id,
            status: { in: ["confirmed", "pending_payment"] },
            slot: { date: { gte: today } },
        },
        include: {
            treatment: { select: { name: true, slug: true, imageUrl: true } },
            dentist: {
                select: {
                    user: { select: { name: true } },
                    specialization: true,
                    photoUrl: true,
                },
            },
            slot: { select: { date: true, startTime: true, endTime: true } },
            payment: { select: { amount: true, status: true } },
        },
        orderBy: { slot: { date: "asc" } },
    });

    return bookings.map((b) => ({
        id: b.id,
        treatment: b.treatment.name,
        treatmentSlug: b.treatment.slug,
        treatmentImage: b.treatment.imageUrl,
        doctor: b.dentist.user.name,
        specialization: b.dentist.specialization,
        doctorPhoto: b.dentist.photoUrl,
        date: b.slot.date,
        startTime: b.slot.startTime,
        endTime: b.slot.endTime,
        status: b.status,
        notes: b.notes,
        paymentAmount: b.payment?.amount ?? null,
        paymentStatus: b.payment?.status ?? null,
    }));
};

export const getAppointmentHistory = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error("Patient profile not found");
    }

    const bookings = await prisma.booking.findMany({
        where: {
            patientId: user.patient.id,
            status: { in: ["completed", "cancelled", "no_show", "refunded", "refund_pending"] },
        },
        include: {
            treatment: { select: { name: true, slug: true } },
            dentist: {
                select: { user: { select: { name: true } } },
            },
            slot: { select: { date: true, startTime: true } },
            payment: { select: { amount: true, status: true } },
        },
        orderBy: { slot: { date: "desc" } },
    });

    return bookings.map((b) => ({
        id: b.id,
        treatment: b.treatment.name,
        treatmentSlug: b.treatment.slug,
        doctor: b.dentist.user.name,
        date: b.slot.date,
        startTime: b.slot.startTime,
        status: b.status,
        paymentAmount: b.payment?.amount ?? null,
        paymentStatus: b.payment?.status ?? null,
    }));
};

export const getDocuments = async (_userId: string) => {
    return [
        { id: "1", name: "Post-Op Guide.pdf", type: "Care Instructions", size: "1.2 MB", url: "#" },
        { id: "2", name: "Annual_Invoice_2023.pdf", type: "Billing Statement", size: "840 KB", url: "#" },
        { id: "3", name: "X-Ray_Results_Sep.zip", type: "Imaging Data", size: "15.4 MB", url: "#" },
    ];
};

