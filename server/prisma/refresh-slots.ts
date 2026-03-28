import { prisma } from '../src/lib/prisma';

/**
 * refresh-slots.ts
 * Generates fresh available slots for all dentists for the next 90 days.
 * Safe to run multiple times — skips dates that already have slots.
 * Does NOT delete any existing bookings or user data.
 * Run with: npx ts-node prisma/refresh-slots.ts
 */

const TIME_SLOTS = [
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

async function refreshSlots(daysAhead = 90) {
  console.log(`Refreshing slots for the next ${daysAhead} days...`);

  // Get all dentist IDs
  const dentists = await prisma.dentist.findMany({ select: { id: true } });
  if (dentists.length === 0) {
    console.error('No dentists found in database. Please run seed.ts first.');
    process.exit(1);
  }
  console.log(`Found ${dentists.length} dentists.`);

  const nowUtc = new Date();
  const baseYear = nowUtc.getUTCFullYear();
  const baseMonth = nowUtc.getUTCMonth();
  const baseDay = nowUtc.getUTCDate();

  let created = 0;
  let skipped = 0;

  for (const dentist of dentists) {
    for (let i = 1; i <= daysAhead; i++) {
      const slotDate = new Date(Date.UTC(baseYear, baseMonth, baseDay + i));

      // Skip Sundays
      if (slotDate.getUTCDay() === 0) continue;

      // Check if slots already exist for this dentist on this date
      const existing = await prisma.slot.findFirst({
        where: {
          dentistId: dentist.id,
          date: slotDate,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create all time slots for this date
      for (const time of TIME_SLOTS) {
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

  console.log(`Done! Created ${created} new slots. Skipped ${skipped} dates that already had slots.`);
}

refreshSlots(90)
  .catch((e) => {
    console.error('Slot refresh failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
