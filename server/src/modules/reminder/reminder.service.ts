import { prisma } from '../../lib/prisma';
import { sendReminderEmail, createNotificationRecord } from '../notification/notification.service';

// Find bookings due for 24h reminder.
// Runs every hour, finds confirmed bookings where:
// - appointment is between 23h and 25h from now
// - reminderSent is false
export async function sendPendingReminders(): Promise<void> {
    try {
        const now = new Date();
        const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        const bookings = await prisma.booking.findMany({
            where: {
                status: 'confirmed',
                reminderSent: false,
                slot: {
                    date: {
                        gte: in23h,
                        lte: in25h,
                    },
                },
            },
            include: {
                patient: { include: { user: true } },
                dentist: { include: { user: true } },
                treatment: true,
                slot: true,
            },
        });

        for (const booking of bookings) {
            try {
                await sendReminderEmail({
                    toEmail: booking.patient.user.email,
                    toName: booking.patient.user.name,
                    treatment: booking.treatment.name,
                    doctor: `Dr. ${booking.dentist.user.name}`,
                    date: booking.slot.date.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    }),
                    time: booking.slot.startTime,
                    bookingId: booking.id,
                });

                await createNotificationRecord(
                    booking.patient.userId,
                    'reminder',
                    'Appointment Reminder',
                    `Your appointment for ${booking.treatment.name} is tomorrow at ${booking.slot.startTime}.`
                );

                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { reminderSent: true },
                });
            } catch (err) {
                console.error(`Reminder failed for booking ${booking.id}:`, err);
            }
        }
    } catch (err) {
        console.error('[ReminderJob] Unable to query pending reminders:', err);
    }
}

// Start cron-like reminder loop.
// Runs every 60 minutes. Call this from server/src/index.ts
export function startReminderJob(): void {
    console.log('Reminder job started - checking every 60 minutes');
    void sendPendingReminders();
    setInterval(() => {
        void sendPendingReminders();
    }, 60 * 60 * 1000);
}
