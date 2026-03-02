/**
 * SmileCare Chatbot Service
 * Primary model:  nvidia/llama-3.3-nemotron-super-49b-v1.5
 * Fallback model: sarvamai/sarvam-m  (Hindi/Hinglish)
 * API base:       https://integrate.api.nvidia.com/v1
 */

import OpenAI from 'openai';
import { prisma } from '../../lib/prisma';
import {
    ChatbotRequest,
    ChatbotResponse,
    ChatMessage,
    ChatIntent,
    ChatCTA,
    ChatbotError,
} from './chatbot.types';

// ── NVIDIA NIM client (OpenAI-compatible) ─────────────────
const nvidia = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const PRIMARY_MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const HINDI_MODEL = 'sarvamai/sarvam-m';
const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === 'true';

if (!CHATBOT_ENABLED) {
    console.log('[Chatbot] CHATBOT_ENABLED=false — stub mode');
} else if (!process.env.NVIDIA_API_KEY) {
    console.warn('[Chatbot] NVIDIA_API_KEY missing — falling back to stubs');
} else {
    console.log('[Chatbot] NVIDIA NIM ready');
    console.log(`  Primary: ${PRIMARY_MODEL}`);
    console.log(`  Hindi:   ${HINDI_MODEL}`);
}

// ── Language detection ────────────────────────────────────
function detectLanguage(text: string): 'hi' | 'en' {
    // Devanagari unicode range: \u0900-\u097F
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    // Hinglish keywords
    const hinglishWords = [
        'kya', 'hai', 'kaise', 'mujhe', 'mera', 'meri', 'aur',
        'nahi', 'haan', 'theek', 'chahiye', 'batao', 'kitna',
        'kab', 'kahan', 'doctor', 'appointment', 'booking',
    ];
    const lower = text.toLowerCase();
    const hinglishCount = hinglishWords.filter(w =>
        lower.includes(w)
    ).length;

    if (hindiChars > 2 || hinglishCount >= 2) return 'hi';
    return 'en';
}

// ── Emergency keyword detection ───────────────────────────
const EMERGENCY_KEYWORDS = [
    'swelling', 'swell', 'abscess', 'abcess', 'knocked out',
    'knocked-out', 'severe pain', 'unbearable', 'bleeding',
    'blood', 'broken tooth', 'accident', 'emergency',
    'facial swelling', 'face swollen', 'infection',
    // Hindi
    'dard', 'bahut dard', 'sujan', 'khoon', 'toot gaya',
    'emergency', 'urgent',
];

function isEmergencyMessage(text: string): boolean {
    const lower = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Fetch live context from DB ────────────────────────────
async function buildClinicContext(): Promise<string> {
    const [treatments, dentists] = await Promise.all([
        prisma.treatment.findMany({
            where: { isActive: true },
            select: {
                name: true,
                slug: true,
                description: true,
                priceRange: true,
                price: true,
                duration: true,
                faqs: true,
            },
            orderBy: { name: 'asc' },
        }),
        prisma.dentist.findMany({
            where: { isActive: true },
            select: {
                specialization: true,
                bio: true,
                rating: true,
                user: { select: { name: true } },
            },
        }),
    ]);

    const treatmentList = treatments
        .map(t => {
            const price = t.price
                ? `₹${t.price.toLocaleString('en-IN')}`
                : (t.priceRange ? t.priceRange.replace(/\$/g, '₹') : 'Price on consultation');
            const dur = t.duration ? `${t.duration} min` : 'varies';
            return `• ${t.name} — ${price}, ~${dur}. ${t.description.slice(0, 120)}`;
        })
        .join('\n');

    const dentistList = dentists
        .map(d =>
            `• Dr. ${d.user.name} — ${d.specialization} ` +
            `(Rating: ${d.rating}/5)` +
            (d.bio ? `. ${d.bio.slice(0, 100)}` : '')
        )
        .join('\n');

    return `
TREATMENTS AVAILABLE:
${treatmentList}

OUR SPECIALISTS:
${dentistList}

CLINIC INFO:
- Name: SmileCare Premium Dental Clinic
- Hours: ${process.env.CLINIC_HOURS || 'Monday–Saturday, 9 AM – 6 PM IST'}
- Emergency line: ${process.env.CLINIC_PHONE || '+91-XXXX-XXXXXX'}
- Location: ${process.env.CLINIC_ADDRESS || 'Contact us for address'}
- Booking: Patients can book online at /booking
- Cancellation: Minimum 24 hours notice required
- Payment: UPI, Cards, Net Banking, Wallets accepted
`.trim();
}

// ── Fetch authenticated patient's recent bookings ─────────
async function getPatientContext(patientId: string): Promise<string> {
    const bookings = await prisma.booking.findMany({
        where: {
            patient: { userId: patientId },
            status: { in: ['confirmed', 'pending_payment'] },
        },
        include: {
            treatment: { select: { name: true } },
            dentist: { include: { user: { select: { name: true } } } },
            slot: { select: { date: true, startTime: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
    });

    if (bookings.length === 0) {
        return 'PATIENT BOOKINGS: No upcoming confirmed bookings.';
    }

    const lines = bookings.map(b => {
        const date = new Date(b.slot.date).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short',
        });
        return `• ${b.treatment.name} with Dr. ${b.dentist.user.name} ` +
            `on ${date} at ${b.slot.startTime} [${b.status}]`;
    });

    return `PATIENT'S UPCOMING BOOKINGS:\n${lines.join('\n')}`;
}

// ── Intent detection ──────────────────────────────────────
function detectIntent(message: string): ChatIntent {
    const m = message.toLowerCase();

    if (isEmergencyMessage(m)) return 'emergency_triage';

    if (/book|appointment|schedule|slot|available|appoint/i.test(m))
        return 'booking_assist';
    if (/price|cost|fee|charge|how much|kitna|rate/i.test(m))
        return 'pricing';
    if (/cancel|reschedule|postpone|change.*appoint/i.test(m))
        return 'account_action';
    if (/my booking|my appointment|upcoming|next visit|mera appoint/i.test(m))
        return 'account_action';
    if (/after.*treatment|after.*procedure|care.*after|post.*treatment|aftercare/i.test(m))
        return 'aftercare';
    if (/open|hours|timing|location|address|where|kahan|kab/i.test(m))
        return 'hours_location';
    if (/human|agent|speak to|call me|talk to someone|person|real person|doctor se baat|baat karna|baat krna|baat kr|kisi se baat|call karo|call karna|mujhe call|specialist se|insaan se/i.test(m))
        return 'human_handoff';
    if (/what is|what are|tell me about|explain|describe|treatment|invisalign|implant|whitening|root canal/i.test(m))
        return 'treatment_faq';
    if (/hi|hello|hey|namaste|good morning|good evening|greet/i.test(m))
        return 'greeting';

    return 'general_faq';
}

// ── CTA builder ───────────────────────────────────────────
function buildCTA(intent: ChatIntent, reply: string): ChatCTA | undefined {
    switch (intent) {
        case 'booking_assist':
        case 'emergency_triage':
            return {
                label: 'Book Appointment',
                href: '/booking',
                variant: 'primary',
            };
        case 'pricing':
        case 'treatment_faq':
            return {
                label: 'View All Treatments',
                href: '/treatments',
                variant: 'outline',
            };
        case 'account_action':
            return {
                label: 'My Bookings',
                href: '/dashboard',
                variant: 'outline',
            };
        default:
            return undefined;
    }
}

// ── Build system prompt ───────────────────────────────────
function buildSystemPrompt(
    clinicContext: string,
    patientContext: string,
    lang: 'en' | 'hi'
): string {
    const langInstruction =
        lang === 'hi'
            ? 'The user is writing in Hindi or Hinglish. ' +
            'Respond naturally in Hinglish (mix of Hindi and English) ' +
            'using Roman script (not Devanagari). ' +
            'Keep dental/medical terms in English. ' +
            'IMPORTANT: Output your reply DIRECTLY. Do NOT write any reasoning, ' +
            'thinking steps, or internal notes before your answer. ' +
            'Start your response immediately with the actual reply to the user.'
            : 'Respond in clear, warm, professional English.';

    return `You are SmileCare's patient assistant — a warm, empathetic AI for a premium dental clinic in India.

${langInstruction}

YOUR ROLE:
- Help patients understand treatments and pricing
- Guide patients to book the right appointment
- Answer questions about the clinic, specialists, and procedures
- Provide post-treatment care guidance
- Handle account queries for logged-in patients
- Detect dental emergencies and escalate immediately

${clinicContext}

${patientContext}

STRICT RULES:
1. EMERGENCY FIRST: If the patient mentions swelling, severe pain, bleeding,
   knocked-out tooth, or facial infection — IMMEDIATELY give the emergency
   phone number and advise them to visit urgently. Do not make them wait.
2. Never diagnose. Always say "I recommend consulting our dentist for a proper evaluation."
3. Keep all responses under 120 words unless the patient explicitly asks for detail.
4. Never make up prices or treatment details — use only the clinic data above.
5. If you don't know something, say "Let me connect you with our team" — never guess.
6. Always end booking-related responses with a clear next step.
7. Be warm and reassuring — dental anxiety is real. Acknowledge it when detected.
8. For pricing questions, give the range from clinic data using ₹ (Indian Rupees) ONLY. Never use $, USD, or any other currency symbol. Add "Final price confirmed at consultation." at the end.
9. Do NOT mention that you are an AI model or built on any specific technology.
   You are "SmileCare's Patient Assistant" only.
10. Loyalty points: patients earn points on every booking — mention this when relevant.

RESPONSE FORMAT:
- Use light markdown: **bold** for treatment names and prices, line breaks between paragraphs.
- No headers (##), no horizontal rules, no tables.
- Short paragraphs. Conversational tone. Keep under 120 words unless detail is requested.
- End with a natural follow-up question or next step when appropriate.`;
}

// ── Stub responses (when AI disabled) ────────────────────
const STUBS: Record<string, string> = {
    greeting:
        "Hi there! 👋 I'm the SmileCare assistant. How can I help you today? " +
        "I can help with appointments, treatments, pricing, or any dental questions.",
    booking_assist:
        "I'd be happy to help you book an appointment! " +
        "Click 'Book Appointment' below to choose your treatment, specialist, and time slot.",
    emergency_triage:
        "⚠️ This sounds like a dental emergency. Please call us immediately " +
        `or visit the clinic right away. Our emergency line is ${process.env.CLINIC_PHONE || '+91-XXXX-XXXXXX'}.`,
    pricing:
        "Treatment prices vary based on complexity. " +
        "You can view our full pricing on the Treatments page. " +
        "We also offer new patient discounts!",
    treatment_faq:
        "We offer a wide range of dental treatments including teeth whitening, " +
        "Invisalign, dental implants, root canals, and more. " +
        "Visit our Treatments page for full details.",
    account_action:
        "To view or manage your bookings, please log in to your dashboard. " +
        "You can cancel or reschedule with at least 24 hours notice.",
    hours_location:
        "SmileCare is open Monday–Saturday, 9 AM to 6 PM IST. " +
        "You can book online anytime, even outside clinic hours!",
    human_handoff:
        "Of course! Our team is available Monday–Saturday, 9 AM–6 PM. " +
        `Call us at ${process.env.CLINIC_PHONE || '+91-XXXX-XXXXXX'} or we'll reach out to you shortly.`,
    general_faq:
        "I'm here to help! Could you tell me more about what you need? " +
        "I can assist with appointments, treatments, pricing, or general queries.",
};

function stripThinkingTags(text: string): string {
    // Case 1: Properly wrapped <think>...</think> blocks
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Case 2: Model outputs reasoning without opening tag — text before orphan </think>
    // e.g. "Okay, let me think about this... </think>\nActual reply here"
    cleaned = cleaned.replace(/^[\s\S]*?<\/think>/i, '');

    // Case 3: Opening tag with no closing tag — strip everything after <think>
    // (model started thinking but didn't close — take nothing, return stub signal)
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, '');

    return cleaned.trim();
}

// ── Main exported function ────────────────────────────────
export async function getChatbotResponse(
    req: ChatbotRequest
): Promise<ChatbotResponse> {
    const { message, history, patientId } = req;

    // Detect language
    const lang = detectLanguage(message);

    // Detect intent (local, fast)
    const intent = detectIntent(message);

    // Emergency — respond immediately without LLM for speed
    const emergency = isEmergencyMessage(message);
    if (emergency && (!CHATBOT_ENABLED || !process.env.NVIDIA_API_KEY)) {
        return {
            reply: STUBS.emergency_triage,
            intent: 'emergency_triage',
            language: lang,
            cta: { label: 'Book Emergency Slot', href: '/booking', variant: 'primary' },
            isEmergency: true,
        };
    }

    // Stub mode fallback
    if (!CHATBOT_ENABLED || !process.env.NVIDIA_API_KEY) {
        const stubKey = intent in STUBS ? intent : 'general_faq';
        return {
            reply: STUBS[stubKey],
            intent,
            language: 'en',
            cta: buildCTA(intent, STUBS[stubKey]),
            isEmergency: false,
        };
    }

    // ── Live AI mode ──────────────────────────────────────
    try {
        // Build context in parallel
        const [clinicContext, patientContext] = await Promise.all([
            buildClinicContext(),
            patientId ? getPatientContext(patientId) : Promise.resolve(''),
        ]);

        const systemPrompt = buildSystemPrompt(
            clinicContext,
            patientContext,
            lang
        );

        // Choose model based on language
        const model = lang === 'hi' ? HINDI_MODEL : PRIMARY_MODEL;

        // Build message array
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            // Include last 6 turns of history for context window
            ...history.slice(-6).map(h => ({
                role: h.role as 'user' | 'assistant',
                content: h.content,
            })),
            { role: 'user', content: message },
        ];

        const completion = await nvidia.chat.completions.create({
            model,
            messages,
            temperature: 0.35,        // consistent, on-brand responses
            max_tokens: 1024,         // padding for reasoning buffer
            top_p: 0.9,
        });

        const rawReply = completion.choices[0]?.message?.content || '';
        const reply = stripThinkingTags(rawReply) || STUBS.general_faq;

        return {
            reply,
            intent,
            language: lang,
            cta: buildCTA(intent, reply),
            isEmergency: emergency,
        };

    } catch (err: any) {
        console.error('[Chatbot] NVIDIA API error:', err?.message || err);

        // Graceful degradation — return stub, never crash
        const stubKey = intent in STUBS ? intent : 'general_faq';
        return {
            reply: STUBS[stubKey],
            intent,
            language: 'en',
            cta: buildCTA(intent, STUBS[stubKey]),
            isEmergency: emergency,
        };
    }
}

// ── Legacy export (for backward compat with old stub callers) ──
export async function getChatbotResponseLegacy(
    userMessage: string,
    history?: Array<{ role: string; content: string }>
): Promise<string> {
    const result = await getChatbotResponse({
        message: userMessage,
        history: (history || []) as ChatMessage[],
    });
    return result.reply;
}
