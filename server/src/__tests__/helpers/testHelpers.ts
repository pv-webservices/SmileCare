import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

let prisma: PrismaClient;

/**
 * Get or create a singleton test Prisma client.
 */
export function getTestPrisma(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

/**
 * Disconnect the test Prisma client.
 */
export async function disconnectTestPrisma(): Promise<void> {
    if (prisma) {
        await prisma.$disconnect();
    }
}

/**
 * Seed minimal data required for booking tests.
 * Returns IDs needed by all test suites.
 */
export async function seedTestData() {
    const p = getTestPrisma();

    // Create a user (patient role)
    const patientUser = await p.user.create({
        data: {
            name: 'Test Patient',
            email: `patient-${Date.now()}@test.com`,
            phone: `+1${Date.now().toString().slice(-10)}`,
            passwordHash: '$2b$12$placeholder', // not used in tests
            role: 'patient',
        },
    });

    const patient = await p.patient.create({
        data: { userId: patientUser.id },
    });

    // Create a user (dentist role)
    const dentistUser = await p.user.create({
        data: {
            name: 'Test Dentist',
            email: `dentist-${Date.now()}@test.com`,
            phone: `+2${Date.now().toString().slice(-10)}`,
            passwordHash: '$2b$12$placeholder',
            role: 'dentist',
        },
    });

    const dentist = await p.dentist.create({
        data: { userId: dentistUser.id, specialization: 'General' },
    });

    // Create treatment category + treatment
    const category = await p.treatmentCategory.create({
        data: { name: 'Test Category' },
    });

    const treatment = await p.treatment.create({
        data: {
            categoryId: category.id,
            name: 'Test Cleaning',
            slug: `test-cleaning-${Date.now()}`,
            description: 'Test treatment',
        },
    });

    // Create a future date slot
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const slot = await p.slot.create({
        data: {
            dentistId: dentist.id,
            date: futureDate,
            startTime: '10:00',
            endTime: '10:30',
            isAvailable: true,
        },
    });

    // Create a second slot for reschedule tests
    const slot2 = await p.slot.create({
        data: {
            dentistId: dentist.id,
            date: futureDate,
            startTime: '11:00',
            endTime: '11:30',
            isAvailable: true,
        },
    });

    return {
        patientUser,
        patient,
        dentistUser,
        dentist,
        category,
        treatment,
        slot,
        slot2,
        futureDate,
    };
}

/**
 * Create multiple available slots for concurrency tests.
 */
export async function createSlot(dentistId: string, date: Date, startTime: string, endTime: string) {
    const p = getTestPrisma();
    return p.slot.create({
        data: { dentistId, date, startTime, endTime, isAvailable: true },
    });
}

/**
 * Clean up all test data. Order matters for FK constraints.
 */
export async function cleanupTestData(): Promise<void> {
    const p = getTestPrisma();
    await p.refund.deleteMany();
    await p.payment.deleteMany();
    await p.booking.deleteMany();
    await p.slot.deleteMany();
    await p.treatment.deleteMany();
    await p.treatmentCategory.deleteMany();
    await p.loyaltyPoint.deleteMany();
    await p.referral.deleteMany();
    await p.notification.deleteMany();
    await p.session.deleteMany();
    await p.patient.deleteMany();
    await p.dentist.deleteMany();
    await p.user.deleteMany();
}

/**
 * Generate a JWT for Supertest requests.
 */
export function createAuthToken(userId: string, role: string = 'patient'): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}
