import { prisma } from '../../lib/prisma';

// ── Award points for a booking ────────────────────────────
// Call this from payment.service.ts after payment captured
export async function awardBookingPoints(
    patientId: string,
    bookingId: string,
    amountPaid: number  // in paise/cents
): Promise<void> {
    // 1 point per ₹100 paid
    const points = Math.floor(amountPaid / 100 / 100);
    if (points <= 0) return;
    await prisma.loyaltyPoint.create({
        data: {
            patientId,
            points,
            transactionType: 'earned',
            reason: `Booking ${bookingId} — ₹${(amountPaid / 100).toFixed(0)} paid`,
        },
    });
}

// ── Get patient loyalty balance ───────────────────────────
export async function getLoyaltyBalance(patientId: string): Promise<number> {
    const result = await prisma.loyaltyPoint.aggregate({
        _sum: { points: true },
        where: { patientId },
    });
    return result._sum.points || 0;
}

// ── Get loyalty transaction history ──────────────────────
export async function getLoyaltyHistory(patientId: string) {
    return prisma.loyaltyPoint.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
    });
}

// ── Redeem points ─────────────────────────────────────────
export async function redeemPoints(
    patientId: string,
    points: number,
    reason: string
): Promise<{ success: boolean; message: string }> {
    const balance = await getLoyaltyBalance(patientId);
    if (balance < points) {
        return { success: false, message: 'Insufficient points' };
    }
    await prisma.loyaltyPoint.create({
        data: {
            patientId,
            points: -points,
            transactionType: 'redeemed',
            reason,
        },
    });
    return { success: true, message: `${points} points redeemed` };
}

// ── Create referral ───────────────────────────────────────
export async function createReferral(
    referrerId: string,  // Patient ID
    referredId: string   // Patient ID of the new patient
): Promise<void> {
    await prisma.referral.upsert({
        where: { referredId },
        update: {},
        create: {
            referrerId,
            referredId,
            status: 'pending',
        },
    });
}

// ── Complete referral (award bonus when referred books) ──
export async function completeReferral(referredId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
        where: { referredId },
    });
    if (!referral || referral.rewardClaimed || referral.status === 'completed') return;

    await prisma.$transaction([
        // Award 500 points to referrer
        prisma.loyaltyPoint.create({
            data: {
                patientId: referral.referrerId,
                points: 500,
                transactionType: 'earned',
                reason: 'Referral bonus',
            },
        }),
        // Award 200 points to new patient
        prisma.loyaltyPoint.create({
            data: {
                patientId: referral.referredId,
                points: 200,
                transactionType: 'earned',
                reason: 'Welcome referral bonus',
            },
        }),
        prisma.referral.update({
            where: { id: referral.id },
            data: { status: 'completed', rewardClaimed: true },
        }),
    ]);
}
