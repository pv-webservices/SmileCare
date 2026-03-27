import dotenv from 'dotenv';
dotenv.config();

import { createCalendarEvent } from './src/modules/booking/calendar.service';
import { sendBookingConfirmationEmail } from './src/modules/booking/email.service';

async function testPostBookingActions() {
    console.log("Starting post-booking actions test...");
    
    // mock booking data
    const booking = {
        id: "test-id-1234",
        slot: {
            date: new Date(),
            startTime: "12:00",
            endTime: "13:00",
            dentist: {
                user: {
                    name: "John Doe"
                }
            }
        },
        treatment: {
            name: "Teeth Whitening"
        }
    };
    
    const patientName = "Demo Guest";
    const patientEmail = process.env.GMAIL_USER || "test@example.com";

    try {
        const y = booking.slot.date.getFullYear();
        const mo = String(booking.slot.date.getMonth() + 1).padStart(2, '0');
        const dy = String(booking.slot.date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${mo}-${dy}`;
        const formattedDate = booking.slot.date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        console.log("Date formats generated:", { dateStr, formattedDate });

        const results = await Promise.allSettled([
            // Create calendar event
            createCalendarEvent({
                patientName,
                patientEmail,
                treatmentName: booking.treatment.name,
                specialistName: booking.slot.dentist.user.name || 'Doctor',
                date: dateStr,
                startTime: booking.slot.startTime,
                endTime: booking.slot.endTime,
                bookingId: booking.id,
            }),
            // Send confirmation email
            sendBookingConfirmationEmail({
                patientName,
                patientEmail,
                treatmentName: booking.treatment.name,
                specialistName: booking.slot.dentist.user.name || 'Doctor',
                date: formattedDate,
                startTime: booking.slot.startTime,
                bookingId: booking.id,
            })
        ]);
        
        console.log("Promise.allSettled results:", JSON.stringify(results, null, 2));

    } catch (err) {
        console.error("FATAL ERROR in post-booking setup block:", err);
    }
}

testPostBookingActions();
