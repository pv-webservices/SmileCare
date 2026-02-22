# Workflow Definitions
**Purpose:** Key user and system workflows with sequences, actors, triggers, decision points, and Mermaid diagrams.
---
## WF-01: Patient Appointment Booking (End-to-End)
**Trigger:** Patient visits the booking page.
**Actors:** Patient, Website Frontend, Booking Agent, Payment Agent, Notification Agent, Reminder Agent, Loyalty Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Patient opens Booking Page"] --> B["Fetch & display treatments"]
    B --> C["Patient selects treatment"]
    C --> D{"Select dentist?"}
    D -- Yes --> E["Show dentist profiles & availability"]
    D -- No --> F["Auto-assign or show all slots"]
    E --> G["Patient picks a date"]
    F --> G
    G --> H["GET /api/slots → show available slots"]
    H --> I{"Slots available?"}
    I -- No --> J["Show 'No slots' message + suggest alternate dates"]
    J --> G
    I -- Yes --> K["Patient selects time slot"]
    K --> L["Slot temporarily held (5-min hold timer)"]
    L --> M["Patient fills details: name, email, phone, notes"]
    M --> N{"Client-side validation passed?"}
    N -- No --> O["Show validation errors"]
    O --> M
    N -- Yes --> P{"Promo code entered?"}
    P -- Yes --> Q["Validate promo code → adjust amount"]
    P -- No --> R["Standard ₹50 booking fee"]
    Q --> S["Click 'Confirm & Pay'"]
    R --> S
    S --> T["POST /api/payments/create-order → Razorpay order"]
    T --> U["Razorpay payment modal opens"]
    U --> V{"Payment successful?"}
    V -- No --> W{"Retry or cancel?"}
    W -- Retry --> U
    W -- Cancel --> X["Release held slot, show failure message"]
    V -- Yes --> Y["POST /api/payments/verify → verify signature"]
    Y --> Z{"Signature valid?"}
    Z -- No --> AA["Flag for manual review, notify admin"]
    Z -- Yes --> AB["POST /api/bookings → status = confirmed"]
    AB --> AC["Release slot hold → mark slot as booked"]
    AC --> AD["Send email confirmation + .ics invite"]
    AD --> AE["Send WhatsApp confirmation"]
    AE --> AF["Create admin dashboard notification"]
    AF --> AG["Schedule 24h reminder"]
    AG --> AH["Schedule post-visit feedback (2h after appointment)"]
    AH --> AI{"Referral code used?"}
    AI -- Yes --> AJ["Record referral, pending bonus credit"]
    AI -- No --> AK["Booking complete"]
    AJ --> AK
    AK --> AL["Display confirmation screen with:\n- Booking summary & reference ID\n- Add to Calendar buttons\n- View in Portal link\n- Share on WhatsApp button"]
```
### Step-by-Step Reference
| Step | Action | System Component | Notes |
|---|---|---|---|
| 1 | Patient selects treatment | Frontend | Visual cards with icons, names, and starting prices |
| 2 | (Optional) Select dentist | Frontend | Show dentist cards with photo, specialization, next availability |
| 3 | Pick a date | Frontend → `GET /api/slots` | Calendar widget; past, blocked, and fully-booked dates disabled |
| 4 | Show available slots | Booking Agent | Queries DB for date/dentist; respects buffer time and emergency reserves |
| 5 | Patient selects time slot | Frontend | Slot grouped by Morning/Afternoon/Evening. 5-min hold timer starts |
| 6 | Fill details | Frontend | Name (≥2 chars), email (format), phone (10-digit), age, notes. Client-side validation |
| 7 | Apply promo code (optional) | Frontend → Loyalty Agent | Validate code, calculate discount. Show adjusted amount |
| 8 | Click "Confirm & Pay" | Frontend → `POST /api/payments/create-order` | Razorpay order created (₹50 or adjusted) |
| 9 | Payment via Razorpay | Razorpay SDK | Secure modal. User completes or cancels |
| 10 | Verify payment | Payment Agent (`POST /api/payments/verify`) | Verify signature using Razorpay secret key |
| 11 | Booking confirmed | Booking Agent | `status = confirmed`, slot permanently marked booked |
| 12 | Send notifications | Notification Agent | Email (with `.ics`) + WhatsApp confirmation |
| 13 | Admin alerted | Notification Agent | Dashboard real-time notification created |
| 14 | Schedule reminder | Reminder Agent | Cron job will send 24h reminder |
| 15 | Schedule feedback | Reminder Agent | Post-visit feedback request 2h after appointment |
| 16 | Referral check | Loyalty Agent | If referral code used, link referrer to this booking |
| 17 | Confirmation screen | Frontend | Summary, calendar buttons, portal link, WhatsApp share |
### Error Handling
| Failure Point | Recovery Action |
|---|---|
| Slot hold expires (5 min) | Release slot, prompt patient to re-select |
| Payment fails / user cancels | Release held slot, show retry option or manual booking link |
| Payment captured but verify fails | Flag booking for admin review, do not confirm automatically |
| Email/WhatsApp send fails | Retry up to 3 times, log failure, create admin notification for manual follow-up |
| Razorpay webhook timeout | Backend polls Razorpay API as fallback to confirm payment status |
---
## WF-02: Appointment Rescheduling
**Trigger:** Patient requests reschedule (via Patient Portal, WhatsApp chatbot, or phone call to receptionist).
**Actors:** Patient (or Receptionist on behalf), Booking Agent, Notification Agent, Reminder Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Patient requests reschedule"] --> B{"Channel?"}
    B -- Portal --> C["Patient logs in → clicks 'Reschedule' on booking"]
    B -- WhatsApp --> D["Chatbot asks for Booking ID"]
    B -- Phone --> E["Receptionist looks up booking in dashboard"]
    C --> F["Validate booking"]
    D --> F
    E --> F
    F --> G{"Booking exists, confirmed, future date?"}
    G -- No --> H["Error: Cannot reschedule"]
    G -- Yes --> I{"Reschedule count < 2?"}
    I -- No --> J["Error: Max reschedules reached (2). Contact clinic."]
    I -- Yes --> K{"≥ 2h before appointment?"}
    K -- No --> L["Error: Too close to appointment time"]
    K -- Yes --> M["Show available slots for desired date"]
    M --> N["Patient selects new date/time"]
    N --> O["Atomic transaction:\n1. Release old slot\n2. Reserve new slot\n3. Update booking record"]
    O --> P{"Transaction successful?"}
    P -- No --> Q["Rollback. Show error, suggest retry."]
    P -- Yes --> R["Booking status = 'confirmed (rescheduled)'\nIncrement reschedule_count"]
    R --> S["Cancel old 24h reminder"]
    S --> T["Schedule new 24h reminder"]
    T --> U["Schedule new post-visit feedback"]
    U --> V["Send updated confirmation:\n- Email with new .ics invite\n- WhatsApp with new details"]
    V --> W["Admin dashboard notification: 'Booking rescheduled'"]
```
### Business Rules
| Rule | Detail |
|---|---|
| Time limit | Must reschedule ≥2 hours before the original appointment |
| Max reschedules | 2 per booking. After that, patient must cancel and rebook. |
| Cost | No extra charge for rescheduling |
| Slot handling | Old slot freed immediately in the same DB transaction as new slot reservation |
| Notifications | All parties (patient, dentist, admin) receive updated details |
---
## WF-03: Appointment Cancellation & Refund
**Trigger:** Patient requests cancellation via portal, WhatsApp, phone, or admin initiates on behalf.
**Actors:** Patient/Receptionist, Booking Agent, Payment Agent, Notification Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Cancellation requested"] --> B["Look up booking by ID"]
    B --> C{"Booking exists & status = confirmed?"}
    C -- No --> D["Error: Booking not found or already cancelled"]
    C -- Yes --> E{"Appointment in the future?"}
    E -- No --> F["Error: Cannot cancel past appointments"]
    E -- Yes --> G["Select cancellation reason"]
    G --> H{"Time to appointment?"}
    H -- "≥ 24 hours" --> I["✅ Eligible for full refund (₹50)"]
    H -- "< 24 hours" --> J{"Admin override?"}
    J -- Yes --> I
    J -- No --> K["❌ No refund"]
    I --> L["Update booking status → 'cancelled'"]
    K --> L
    L --> M["Release slot → mark as available"]
    M --> N{"Refund eligible?"}
    N -- Yes --> O["Payment Agent → Razorpay Refund API"]
    O --> P["Track refund status:\nPending → Processing → Completed"]
    P --> Q["Notify patient: cancellation + refund confirmed"]
    N -- No --> R["Notify patient: cancellation confirmed, no refund"]
    Q --> S["Admin dashboard notification"]
    R --> S
    S --> T["Cancel scheduled reminder"]
    T --> U["Cancel scheduled feedback request"]
    U --> V["Log cancellation in audit trail"]
```
### Refund Policy Table
| Timing | Refund | Processing |
|---|---|---|
| ≥24h before appointment | ✅ Full refund (₹50) | Automatic via Razorpay. 5–7 business days. |
| <24h before appointment | ❌ No refund | Unless Admin manually overrides |
| No-show | ❌ No refund | Booking marked as no-show |
| System/clinic cancellation | ✅ Full refund | Admin initiates. Always refunded. |
---
## WF-04: Automated 24-Hour Reminder
**Trigger:** Scheduled cron job (runs every 30 minutes).
**Actors:** Reminder Agent, Notification Agent, WhatsApp Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["⏰ Cron fires every 30 minutes"] --> B["Query bookings:\nstatus = 'confirmed'\nAND reminder_sent = false\nAND appointment_time BETWEEN NOW()+23h AND NOW()+25h"]
    B --> C{"Matching bookings found?"}
    C -- No --> D["No action. Log 'no reminders due'. Exit."]
    C -- Yes --> E["For each booking:"]
    E --> F["Send email reminder:\nSubject: 'Reminder: Your appointment is tomorrow'\nBody: date, time, dentist, address, directions, prep instructions"]
    F --> G{"Email sent successfully?"}
    G -- Yes --> H["Send WhatsApp reminder:\nTemplate: 'appointment_reminder'\nParams: patient_name, date, time, dentist_name"]
    G -- No --> I["Retry email (up to 3 times)"]
    I --> J{"Retry succeeded?"}
    J -- Yes --> H
    J -- No --> K["Log email failure,\ncreate admin notification for manual follow-up"]
    K --> H
    H --> L{"WhatsApp sent?"}
    L -- Yes --> M["Set booking.reminder_sent = true"]
    L -- No --> N["Log WhatsApp failure,\ncreate admin notification"]
    N --> M
    M --> O["Log reminder event in communication_logs"]
    O --> P["Process next booking"]
```
### Reminder Content
| Channel | Content |
|---|---|
| **Email** | Subject: *"Reminder: Your appointment is tomorrow at [Time]"*. Body includes: date, time, dentist name, clinic address with Google Maps link, preparation tips (e.g., "Please arrive 10 minutes early"), cancellation/reschedule link, clinic contact number. |
| **WhatsApp** | Template message: *"🔔 Hi [Name], this is a reminder about your appointment tomorrow at [Time] with Dr. [Dentist] at SmileCare. 📍 [Address]. Need to reschedule? Reply 'reschedule' or call [Number]."* |
---
## WF-05: Post-Visit Feedback & Review Collection *(NEW)*
**Trigger:** Scheduled cron job (runs every 30 minutes) checks for completed appointments.
**Actors:** Reminder Agent, Notification Agent, Patient, Admin.
### Flow Diagram
```mermaid
flowchart TD
    A["⏰ Cron fires every 30 minutes"] --> B["Query bookings:\nstatus = 'completed' OR (status = 'confirmed' AND appointment_time < NOW()-1h)\nAND feedback_sent = false\nAND appointment_time BETWEEN NOW()-3h AND NOW()-1.5h"]
    B --> C{"Matching bookings?"}
    C -- No --> D["No action. Exit."]
    C -- Yes --> E["For each booking:"]
    E --> F["Auto-mark as 'completed' if still 'confirmed'"]
    F --> G["Send feedback request:\n- Email with rating form link\n- WhatsApp with quick rating"]
    G --> H["Set booking.feedback_sent = true"]
    H --> I["Log in communication_logs"]
    I --> J{"Patient submits feedback?"}
    J -- "Rating: 4-5 ⭐" --> K["Send thank-you message +\nGoogle Review link +\nVideo testimonial prompt"]
    J -- "Rating: 1-2 ⭐" --> L["🚨 Flag for immediate admin attention\nCreate high-priority notification"]
    J -- "Rating: 3 ⭐" --> M["Send thank-you message.\nLog for review."]
    J -- "No response (48h)" --> N["Optional: Receptionist manual follow-up call"]
    K --> O["Credit loyalty points (50 pts for feedback)"]
    L --> P["Admin/Receptionist contacts patient within 24h\nto address concerns"]
    M --> O
    O --> Q["If patient leaves Google Review:\nCredit additional 50 loyalty points"]
```
### Feedback Actions by Rating
| Rating | Automated Response | Staff Action |
|---|---|---|
| ⭐⭐⭐⭐⭐ (5) | Thank you + Google Review link + video testimonial invite | None (celebrate!) |
| ⭐⭐⭐⭐ (4) | Thank you + Google Review link | None |
| ⭐⭐⭐ (3) | Thank you message | Review feedback notes for improvement insights |
| ⭐⭐ (2) | Apology + "We'd like to make it right" | Receptionist calls within 24h |
| ⭐ (1) | Apology + escalation notice | Admin calls within 12h. High-priority. |
---
## WF-06: Website Chatbot Conversation
**Trigger:** Patient opens the chat widget on the website.
**Actors:** Patient, Web Chatbot Agent, Booking Agent, Notification Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Patient clicks chat widget"] --> B["Create chat_session\nShow welcome message + quick-reply buttons"]
    B --> C{"Input type?"}
    C -- Text --> D["Receive text message"]
    C -- Voice --> E["🎤 Web Speech API captures audio → STT → text"]
    E --> D
    D --> F["Intent classification (keyword matching + NLP)"]
    F --> G{"Detected intent?"}
    G -- book_appointment --> H["'I can help you book!\nHere's the link: [Booking Page]'\n+ Show available times preview"]
    G -- treatment_info --> I["'Here's info about [Treatment]:\n[Brief summary]'\n+ Link to detail page"]
    G -- clinic_hours --> J["'We're open Mon-Sat, 9 AM - 7 PM.\nClosed Sundays.'"]
    G -- location --> K["'We're at [Address].\nHere's the map: [Google Maps link]'"]
    G -- fees_pricing --> L["'Pricing varies by treatment.\n[Common price ranges]\nBook a free consultation for exact pricing.'"]
    G -- insurance --> M["'We accept Star Health, ICICI Lombard, and more.\nBring your insurance card to your visit.'"]
    G -- current_offers --> N["Fetch active offers → display promo details + codes"]
    G -- callback_request --> O["Collect name + phone →\nCreate admin notification →\n'Someone will call you shortly!'"]
    G -- complaint --> P["'I'm sorry to hear that.\nLet me connect you with our team.'\n→ Create escalation"]
    G -- unknown --> Q["'I'm not sure I understood.\nHere are some things I can help with:'\n→ Show quick-reply menu"]
    
    H --> R{"Voice mode ON?"}
    I --> R
    J --> R
    K --> R
    L --> R
    M --> R
    N --> R
    O --> R
    P --> R
    Q --> R
    R -- Yes --> S["ElevenLabs TTS → generate audio → play response"]
    R -- No --> T["Display text response"]
    S --> U["Log message in chat_messages"]
    T --> U
    U --> V["Wait for next input..."]
    V --> C
```
### Quick-Reply Buttons (Default)
| Button | Mapped Intent |
|---|---|
| 📅 Book Appointment | `book_appointment` |
| 🦷 Our Treatments | `treatment_info` (shows treatment categories) |
| ⏰ Clinic Hours | `clinic_hours` |
| 📍 Location | `location` |
| 🎉 Current Offers | `current_offers` |
| 📞 Contact Us | `callback_request` |
### Voice Pipeline
```mermaid
flowchart LR
    A["🎤 User speaks"] --> B["Web Speech API\n(Browser STT)"]
    B --> C["Text transcript"]
    C --> D["Intent classification\n+ response generation"]
    D --> E["Response text"]
    E --> F["ElevenLabs API\n(TTS)"]
    F --> G["🔊 Audio response\nplays in browser"]
```
---
## WF-07: WhatsApp Chatbot Flow
**Trigger:** Patient sends a WhatsApp message to the clinic's business number.
**Actors:** Patient, WhatsApp Agent (Meta Cloud API), Booking Agent, Payment Agent.
### Inbound Message Processing
```mermaid
flowchart TD
    A["📱 Patient sends WhatsApp message"] --> B["Meta webhook: POST /api/webhooks/whatsapp"]
    B --> C["Extract sender phone, message text, message type"]
    C --> D{"Session exists for this user?"}
    D -- No --> E["Create new session\nSend welcome message with menu"]
    D -- Yes --> F["Load session context\n(current conversation state)"]
    E --> G["Intent detection"]
    F --> G
    G --> H{"Detected intent?"}
    
    H -- greeting --> I["Welcome message:\n'👋 Hi! I'm SmileCare's assistant.\nHow can I help?\n\n1️⃣ Book Appointment\n2️⃣ Reschedule\n3️⃣ Cancel\n4️⃣ Clinic Hours\n5️⃣ Treatments\n6️⃣ Offers\n7️⃣ Location\n8️⃣ Talk to a person'"]
    
    H -- book_appointment --> J["Send booking link:\n'📅 Book your appointment here:\n[Booking Page Deep Link]\n\nOr tell me which treatment\nyou're interested in!'"]
    
    H -- reschedule --> K["'Please share your Booking ID\n(from your confirmation message)'"]
    K --> K1["Patient sends Booking ID"]
    K1 --> K2["Validate booking → show available slots"]
    K2 --> K3["Patient picks new slot"]
    K3 --> K4["Booking Agent: atomic reschedule"]
    K4 --> K5["Send updated confirmation template"]
    
    H -- cancel --> L["'Please share your Booking ID'"]
    L --> L1["Patient sends Booking ID"]
    L1 --> L2["Show booking details + refund policy"]
    L2 --> L3{"Patient confirms cancel?"}
    L3 -- Yes --> L4["Booking Agent: cancel\nPayment Agent: refund if eligible"]
    L4 --> L5["Send cancellation template"]
    L3 -- No --> L6["'No problem! Your booking is still active. ✅'"]
    
    H -- clinic_hours --> M["'🕐 Our hours:\nMon-Sat: 9:00 AM - 7:00 PM\nSunday: Closed\n\nNeed to book? Reply BOOK'"]
    
    H -- services --> N["'🦷 Our treatments:\n• Dental Implants\n• Root Canal\n• Teeth Whitening\n• Braces & Aligners\n• Smile Makeover\n• Kids Dentistry\n\nReply with a treatment name for details!'"]
    
    H -- fees --> O["'💰 Pricing ranges:\n• Check-up: ₹500-1,000\n• Cleaning: ₹1,000-2,000\n• Root Canal: ₹5,000-10,000\n• Implants: ₹25,000-45,000\n\nBook a free consultation for exact pricing!'"]
    
    H -- offers --> P["Fetch active offers → send formatted list with promo codes"]
    
    H -- location --> Q["Send Google Maps location pin +\n'📍 [Full Address]\nLandmark: [Landmark]'"]
    
    H -- speak_to_human --> R["'Connecting you with our team.\nSomeone will message you shortly! 🙏'\n→ Create admin notification + escalation"]
    
    H -- unknown --> S["'Sorry, I didn't understand that.\nPlease choose from:\n1-8 or type your question'"]
```
### Outbound System-Initiated Messages
```mermaid
flowchart LR
    A["System Event"] --> B{"Event Type?"}
    B -- "Booking Confirmed" --> C["Template: appointment_confirmation\nParams: name, treatment, date, time, dentist, booking_id"]
    B -- "Rescheduled" --> D["Template: appointment_rescheduled\nParams: name, old_date, new_date, new_time"]
    B -- "Reminder (24h)" --> E["Template: appointment_reminder\nParams: name, date, time, dentist, address"]
    B -- "Cancelled" --> F["Template: cancellation_notice\nParams: name, date, refund_status"]
    B -- "Feedback Request" --> G["Template: feedback_request\nParams: name, treatment, feedback_link"]
    B -- "Refund Processed" --> H["Template: refund_confirmation\nParams: name, amount, booking_id"]
    C & D & E & F & G & H --> I["Meta Send Message API\n→ Deliver to patient"]
```
---
## WF-08: Patient Registration & Login
**Trigger:** Patient clicks "Register" or "Login" on the website.
**Actors:** Patient, Auth Agent, Notification Agent.
### Registration Flow
```mermaid
flowchart TD
    A["Patient clicks 'Register'"] --> B["Display registration form"]
    B --> C["Patient fills:\nName, Email, Phone, Password, Confirm Password"]
    C --> D{"Frontend validation passed?"}
    D -- No --> E["Show field-level errors:\n- Email format\n- Phone: 10 digits\n- Password: min 8 chars, 1 uppercase, 1 number\n- Passwords must match"]
    E --> C
    D -- Yes --> F["POST /api/auth/register"]
    F --> G{"Backend checks?"}
    G -- "Email already exists" --> H["Error: 'Account with this email already exists. Login instead?'"]
    G -- "Phone already exists" --> I["Error: 'Phone number already registered.'"]
    G -- "Validation passed" --> J["Hash password (bcrypt, 12 rounds)\nCreate user (role='patient')\nCreate patient profile"]
    J --> K["Send verification email with 6-digit OTP\n(expires in 10 minutes)"]
    K --> L["Show OTP verification screen"]
    L --> M["Patient enters OTP"]
    M --> N{"OTP correct & not expired?"}
    N -- No --> O{"Attempts < 3?"}
    O -- Yes --> P["'Invalid OTP. Try again.' → Back to OTP input"]
    O -- No --> Q["'Too many attempts. Request a new OTP.'"]
    N -- Yes --> R["Mark email as verified\nIssue JWT access token (15 min) + refresh token (7 days)"]
    R --> S["Redirect to Patient Dashboard\nShow welcome message"]
```
### Login Flow
```mermaid
flowchart TD
    A["Patient clicks 'Login'"] --> B["Display login form:\nEmail + Password"]
    B --> C["Patient enters credentials"]
    C --> D["POST /api/auth/login"]
    D --> E{"User found by email?"}
    E -- No --> F["Error: 'Invalid email or password'"]
    E -- Yes --> G{"Password matches (bcrypt compare)?"}
    G -- No --> H["Increment failed_attempts"]
    H --> I{"failed_attempts ≥ 5?"}
    I -- Yes --> J["🔒 Account locked for 15 minutes.\n'Too many failed attempts. Try again later\nor reset your password.'"]
    I -- No --> F
    G -- Yes --> K{"Email verified?"}
    K -- No --> L["Resend verification OTP\nShow OTP screen"]
    K -- Yes --> M["Reset failed_attempts = 0\nIssue JWT access token (15 min)\n+ refresh token (7-day httpOnly cookie)"]
    M --> N["Return access token to frontend\nStore in auth context"]
    N --> O["Redirect to Patient Dashboard"]
```
### Password Reset Flow
```mermaid
flowchart TD
    A["Patient clicks 'Forgot Password?'"] --> B["Enter registered email"]
    B --> C["POST /api/auth/forgot-password"]
    C --> D{"Email exists?"}
    D -- No --> E["Show: 'If this email is registered, you'll receive a reset code.'\n(No reveal of account existence)"]
    D -- Yes --> F["Generate 6-digit OTP\n(expires 10 min)\nSend via email"]
    E --> G["Display OTP entry screen"]
    F --> G
    G --> H["Patient enters OTP + new password + confirm"]
    H --> I{"OTP valid & passwords match?"}
    I -- No --> J["Error message, retry"]
    I -- Yes --> K["Hash new password\nUpdate user record\nInvalidate all existing sessions"]
    K --> L["'Password reset successful! Please log in.'"]
    L --> M["Redirect to Login"]
```
### Token Refresh Flow
```mermaid
flowchart LR
    A["Access token expired"] --> B["POST /api/auth/refresh\n(send refresh token from httpOnly cookie)"]
    B --> C{"Refresh token valid & not expired?"}
    C -- Yes --> D["Issue new access token (15 min)"]
    C -- No --> E["Clear cookies\nRedirect to Login"]
```
---
## WF-09: Contact Form Submission
**Trigger:** Patient submits the contact page form.
**Actors:** Patient, Frontend, Notification Agent, Admin/Receptionist.
### Flow Diagram
```mermaid
flowchart TD
    A["Patient fills contact form:\nName, Email, Phone, Treatment Interest, Message"] --> B{"Frontend validation?"}
    B -- "Missing required fields\nor invalid format" --> C["Show field errors"]
    C --> A
    B -- "All valid" --> D{"CAPTCHA / honeypot check?"}
    D -- "Failed (spam)" --> E["Silently discard\n(don't reveal to spammer)"]
    D -- "Passed" --> F["POST /api/contact"]
    F --> G["Store in contact_submissions\nstatus = 'new'"]
    G --> H["Send auto-reply email to patient:\n'Thank you for contacting SmileCare!\nWe'll get back to you within 24 hours.'"]
    H --> I["Create admin dashboard notification:\n'📩 New contact inquiry from [Name]\nTreatment Interest: [Treatment]'"]
    I --> J["Send email notification to clinic inbox"]
    J --> K["Receptionist reviews in Dashboard\n→ Contact Submissions"]
    K --> L["Respond to patient via email or phone"]
    L --> M["Mark submission as 'Responded'"]
    M --> N{"Follow-up needed?"}
    N -- Yes --> O["Schedule follow-up task\nMark as 'Follow-up pending'"]
    N -- No --> P["Mark as 'Closed'"]
```
### Response Time Targets
| Priority | Criteria | Target Response Time |
|---|---|---|
| High | Treatment Interest = Emergency / Pain | Within 1 hour |
| Medium | Treatment Interest = specific treatment | Within 4 hours |
| Normal | General inquiry | Within 24 hours |
---
## WF-10: Admin Daily Operations
**Trigger:** Admin or Receptionist logs into the dashboard at start of day.
**Actors:** Admin/Receptionist, Admin Dashboard, all backend agents.
### Morning Opening Flow
```mermaid
flowchart TD
    A["Staff logs into Admin Dashboard"] --> B["Check Notification Center"]
    B --> C["Process overnight items:"]
    C --> D["New bookings → SOP-01"]
    C --> E["Cancellations → verify slots freed"]
    C --> F["Contact submissions → respond (SOP-05)"]
    C --> G["Chatbot escalations → handle (SOP-08)"]
    C --> H["Payment issues → investigate (SOP-06)"]
    D & E & F & G & H --> I["View Today's Schedule\n(Calendar → Day View)"]
    I --> J["Confirm dentist availability"]
    J --> K["Note treatments needing preparation"]
    K --> L["Review tomorrow's appointments:\nVerify reminder_sent = scheduled"]
    L --> M{"Any reminders failed to send?"}
    M -- Yes --> N["Manually send via WhatsApp/phone"]
    M -- No --> O["Check active offers:\nAny expiring today?"]
    O --> P{"Offers expiring?"}
    P -- Yes --> Q["Extend or deactivate per Admin direction"]
    P -- No --> R["✅ Morning prep complete"]
```
### During-the-Day Flow
```mermaid
flowchart TD
    A["Continuous monitoring"] --> B["Patient arrivals:\nMark appointments as 'Checked In'"]
    B --> C["After service:\nMark as 'Completed'"]
    C --> D["Walk-in emergencies → SOP-17"]
    D --> E["Monitor notifications every 30 min"]
    E --> F["Handle mid-day:\n- New bookings\n- Reschedule requests\n- Cancellations\n- Inquiries\n- Escalations"]
    F --> A
```
### Evening Closing Flow
```mermaid
flowchart TD
    A["After last appointment"] --> B["Mark all completed appointments as 'Completed'"]
    B --> C["Mark no-shows as 'No-Show'"]
    C --> D["Process walk-in bookings/payments not yet logged"]
    D --> E["Review tomorrow's appointment list"]
    E --> F["Flag treatments needing advance prep"]
    F --> G["Resolve remaining open notifications"]
    G --> H["Resolve chatbot escalations"]
    H --> I["Close open contact inquiries"]
    I --> J["Log out of all systems"]
    J --> K["Lock computer (Windows + L)"]
    K --> L["Secure physical patient records"]
    L --> M["✅ Day complete"]
```
---
## WF-11: Video Testimonial Collection & Publishing *(NEW)*
**Trigger:** Patient completes a successful treatment; or patient submits a video via the website form.
**Actors:** Receptionist, Patient, Admin, Content Agent.
### Flow Diagram
```mermaid
flowchart TD
    A{"Source?"} 
    A -- "In-clinic recording" --> B["Receptionist identifies happy patient\nafter successful treatment"]
    A -- "Patient submission\n(website form)" --> C["Video appears in Dashboard →\nVideo Testimonials → Pending Review"]
    
    B --> D["Ask patient for video testimonial"]
    D --> E{"Patient agrees?"}
    E -- No --> F["Thank patient, no further action"]
    E -- Yes --> G["Patient signs Video Release Form\n(physical or digital)"]
    G --> H["Record video:\n- 30-90 seconds\n- Landscape orientation\n- Well-lit, quiet area\n- Prompt questions"]
    H --> I["Upload to Dashboard →\nVideo Testimonial Manager → 'Add New'"]
    C --> I
    
    I --> J["Fill metadata:\n- Patient name\n- Treatment received\n- Star rating\n- Pull quote\n- Custom thumbnail"]
    J --> K["Assign to treatment page (optional)"]
    K --> L["Save as 'Draft'"]
    L --> M["Admin reviews video\nfor quality & appropriateness"]
    M --> N{"Approved?"}
    N -- No --> O["Add notes, request re-record\nor reject with reason"]
    N -- Yes --> P["Set status → 'Approved'"]
    P --> Q["Set display order (drag-and-drop)"]
    Q --> R{"Mark as Featured?\n(max 6 on homepage)"}
    R -- Yes --> S["Toggle 'Featured' ON"]
    R -- No --> T["Regular video (treatment page only)"]
    S --> U["Publish → Video goes live on:\n- Homepage Video Testimonials carousel\n- Assigned treatment detail page"]
    T --> U
    U --> V["Credit patient 100 loyalty points\n(if loyalty program active)"]
```
### Quality Checklist
| Check | Pass Criteria |
|---|---|
| Consent form signed | ✅ On file |
| Duration | 30–90 seconds |
| Resolution | ≥ 720p (1080p preferred) |
| Audio clarity | Clear speech, no background noise |
| Lighting | Well-lit face, no harsh shadows |
| Content | Positive, mentions treatment, no competitor names |
| Thumbnail | Custom thumbnail showing patient smiling |
---
## WF-12: Blog Post Publishing *(NEW)*
**Trigger:** Admin or dentist decides to publish educational content.
**Actors:** Admin, Dentist (author/reviewer), Content Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Admin creates new blog post\nin Dashboard → Blog Manager"] --> B["Fill in:\n- Title\n- Body (rich text editor)\n- Category\n- Author (dentist)\n- Featured image"]
    B --> C["Fill SEO fields:\n- Meta title (≤60 chars)\n- Meta description (≤155 chars)\n- URL slug\n- Open Graph image"]
    C --> D["Save as 'Draft'"]
    D --> E["Dentist-author reviews\nfor medical accuracy"]
    E --> F{"Approved by dentist?"}
    F -- No --> G["Revision notes → edit content"]
    G --> E
    F -- Yes --> H["Status → 'Ready to Publish'"]
    H --> I{"Publish now or schedule?"}
    I -- "Publish Now" --> J["Status = 'Published'\nPost goes live immediately"]
    I -- "Schedule" --> K["Set date/time\nCron auto-publishes at scheduled time"]
    K --> J
    J --> L["Post appears on:\n- Blog hub page\n- Homepage blog preview (if in latest 3)\n- Sitemap (auto-updated)"]
    L --> M["Promote:\n- Share on social media\n- Include in next newsletter\n- Chatbot can reference new article"]
```
### Content Guidelines
| Rule | Guideline |
|---|---|
| Word count | 600–1200 words |
| Language | Patient-friendly, minimal jargon |
| Images | ≥1 relevant image per post |
| Internal links | ≥1 link to a treatment page or booking page |
| CTA | End with: *"Have questions? Book a free consultation →"* |
| Medical advice | Never diagnose — always recommend in-person consultation |
| Frequency | Minimum 2 posts per month |
---
## WF-13: Offer & Promo Code Lifecycle *(NEW)*
**Trigger:** Admin decides to run a promotional campaign.
**Actors:** Admin, Content Agent, Booking Agent, Loyalty Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Admin creates offer in\nDashboard → Offer Manager"] --> B["Fill in:\n- Title & description\n- Discount type (% / ₹ / Free service)\n- Applicable treatments\n- Promo code (optional)\n- Validity period\n- Terms & conditions\n- Max redemptions"]
    B --> C["Save as 'Draft'"]
    C --> D["Preview on Offers page"]
    D --> E{"Looks good?"}
    E -- No --> F["Edit details"]
    F --> D
    E -- Yes --> G["Activate offer"]
    G --> H["Offer goes live on:\n- Offers & Promotions page\n- Homepage banner (optional)\n- Chatbot responses"]
    H --> I["Promote via:\n- Social media\n- Newsletter\n- WhatsApp broadcast (template)"]
    I --> J["Monitor redemptions in Dashboard\n→ Analytics → Offer Redemptions"]
    
    J --> K{"Max redemptions reached\nOR end date passed?"}
    K -- Yes --> L["Auto-deactivate\nMove to 'Expired' section"]
    K -- "Admin deactivates early" --> L
    K -- No --> M["Offer remains active"]
    M --> J
    
    L --> N["Review performance:\n- Total redemptions\n- Revenue generated\n- New patients acquired"]
```
### Promo Code Validation (During Booking)
```mermaid
flowchart TD
    A["Patient enters promo code\nat booking checkout"] --> B["Frontend sends code to\nPOST /api/loyalty/promo/validate"]
    B --> C{"Code exists?"}
    C -- No --> D["Error: 'Invalid promo code'"]
    C -- Yes --> E{"Code active & within validity?"}
    E -- No --> F["Error: 'This offer has expired'"]
    E -- Yes --> G{"Max redemptions reached?"}
    G -- Yes --> H["Error: 'This offer is fully redeemed'"]
    G -- No --> I{"Applicable to selected treatment?"}
    I -- No --> J["Error: 'Not valid for this treatment'"]
    I -- Yes --> K["✅ Apply discount\nShow adjusted amount"]
```
---
## WF-14: Loyalty Points & Referral Flow *(NEW)*
**Trigger:** Patient completes an appointment, submits a review, or refers a friend.
**Actors:** Patient, Loyalty Agent, Booking Agent, Notification Agent.
### Points Earning Flow
```mermaid
flowchart TD
    A["Appointment marked 'Completed'"] --> B["Booking Agent triggers\nLoyalty Agent → POST /api/loyalty/earn"]
    B --> C{"Treatment tier?"}
    C -- General consultation --> D["Credit 50 points"]
    C -- Standard treatment --> E["Credit 100 points"]
    C -- Premium treatment --> F["Credit 200 points"]
    D & E & F --> G["Update loyalty_points balance\nLog in loyalty_transactions"]
    G --> H["Send notification:\n'🎉 You earned [X] points!\nBalance: [Total] points'"]
    
    I["Patient submits video testimonial"] --> J["Credit 100 points"]
    J --> G
    
    K["Patient posts Google review"] --> L["Credit 50 points"]
    L --> G
```
### Referral Flow
```mermaid
flowchart TD
    A["Patient A shares referral code/link\nfrom Patient Portal"] --> B["Patient B opens booking page\nvia referral link"]
    B --> C["Referral code auto-filled\nor Patient B enters manually"]
    C --> D["Patient B completes booking\nwith payment"]
    D --> E["Record referral:\nreferrer = Patient A\nreferred = Patient B\nstatus = 'pending'"]
    E --> F["Patient B attends appointment"]
    F --> G["Appointment marked 'Completed'"]
    G --> H["Referral status → 'completed'"]
    H --> I["Credit Patient A: 200 bonus points"]
    H --> J["Credit Patient B: 200 bonus points"]
    I --> K["Notify Patient A:\n'🎉 Your friend visited us!\nYou earned 200 bonus points!'"]
    J --> L["Notify Patient B:\n'🎉 Welcome bonus!\nYou earned 200 referral points!'"]
```
### Points Redemption Flow
```mermaid
flowchart TD
    A["Patient checks points balance\nin Portal → Loyalty & Rewards"] --> B["Patient clicks 'Redeem Points'\nduring booking"]
    B --> C["Enter points to redeem\n(100 points = ₹100)"]
    C --> D{"Sufficient balance?"}
    D -- No --> E["Error: 'Insufficient points.\nBalance: [X] points'"]
    D -- Yes --> F["Calculate discount amount"]
    F --> G{"Discount > booking amount?"}
    G -- Yes --> H["Cap discount at booking amount\n(₹50 max for booking fee)"]
    G -- No --> I["Apply full discount"]
    H --> J["Adjusted payment amount\nshown at checkout"]
    I --> J
    J --> K["Payment completed\nPoints deducted from balance"]
    K --> L["Log redemption in\nloyalty_transactions"]
```
---
## WF-15: Emergency Walk-In Handling *(NEW)*
**Trigger:** Patient arrives at the clinic without an appointment, with an urgent dental issue.
**Actors:** Receptionist, Dentist, Booking Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Patient walks in with\ndental emergency"] --> B["Receptionist assesses urgency"]
    B --> C{"Life-threatening?\n(breathing difficulty,\nuncontrolled bleeding,\nfacial trauma)"}
    C -- Yes --> D["🚨 Call 112 (Emergency Services)\nDo NOT attempt dental treatment"]
    C -- No --> E["Check dashboard for\nemergency slots today"]
    E --> F{"Emergency slot available?"}
    F -- Yes --> G["Create booking via admin dashboard\nAssign to available dentist"]
    F -- No --> H{"Any regular slots open?"}
    H -- Yes --> G
    H -- No --> I["Inform patient:\n'Earliest available: [time]'\nOffer to wait or book next slot"]
    I --> J{"Patient agrees to wait/book?"}
    J -- Yes --> G
    J -- No --> K["Provide referral to nearby\nemergency dental clinic\nLog in dashboard"]
    
    G --> L{"Patient in system?"}
    L -- Yes --> M["Pull up existing record"]
    L -- No --> N["Quick registration:\nName, Phone only\n(full registration after treatment)"]
    M --> O["Collect ₹50 fee at counter\n(Cash / UPI scan)"]
    N --> O
    O --> P["Notify dentist immediately\n(in-person or dashboard alert)"]
    P --> Q["Patient receives treatment"]
    Q --> R["Complete full registration\nif new patient"]
    R --> S["Standard post-visit follow-up\napplies (WF-05)"]
```
---
## WF-16: Newsletter Campaign Flow *(NEW)*
**Trigger:** Admin decides to send a newsletter (recommended: 1–2 per month).
**Actors:** Admin, Mailchimp/SendGrid, Subscribers.
### Flow Diagram
```mermaid
flowchart TD
    A["Admin plans newsletter content"] --> B["Content ideas:\n- Latest blog posts\n- Current offers\n- Seasonal dental tips\n- Clinic news\n- New dentist/service announcement"]
    B --> C["Draft email in Mailchimp/SendGrid\nusing branded template"]
    C --> D["Include:\n- Clinic logo & branding\n- 2-3 content blocks\n- CTA: Book Appointment\n- Social media links\n- Unsubscribe link"]
    D --> E["Send test email to admin"]
    E --> F{"Test looks good?"}
    F -- No --> G["Edit content/design"]
    G --> E
    F -- Yes --> H{"Send now or schedule?"}
    H -- "Send Now" --> I["Send to all active subscribers"]
    H -- "Schedule" --> J["Set date/time\n(Recommended: Tue-Thu,\n10 AM - 12 PM)"]
    J --> I
    I --> K["Monitor delivery metrics:\n- Sent count\n- Open rate (target ≥ 25%)\n- Click rate (target ≥ 5%)\n- Bounce rate\n- Unsubscribe rate (< 1%)"]
    K --> L["Log campaign results\nin Dashboard → Newsletter → Reports"]
```
### Subscriber Management
```mermaid
flowchart TD
    A{"How subscriber was added?"} 
    A -- "Website signup form" --> B["Auto-added to Mailchimp/SendGrid list\n+ logged in Dashboard → Newsletter → Subscribers"]
    A -- "In-clinic request" --> C["Receptionist manually adds\nemail to subscriber list"]
    
    D{"Unsubscribe request?"}
    D -- "Via email unsubscribe link" --> E["Auto-removed by\nMailchimp/SendGrid"]
    D -- "Via phone/WhatsApp" --> F["Receptionist manually removes\nfrom list + confirms with patient"]
```
---
## WF-17: Content Management (CMS) Operations *(NEW)*
**Trigger:** Admin needs to update website content without developer help.
**Actors:** Admin/Receptionist, Content Agent, Admin Dashboard.
### Supported Content Operations
```mermaid
flowchart TD
    A["Admin Dashboard → CMS"] --> B{"Content type?"}
    B -- "Treatment Pages" --> C["Edit: name, description,\nprocedure steps, pricing,\nimages, FAQ, before/after photos"]
    B -- "Blog Posts" --> D["Create/edit/schedule/unpublish\n(see WF-12)"]
    B -- "Video Testimonials" --> E["Upload/edit/reorder/toggle\n(see WF-11)"]
    B -- "Text Testimonials" --> F["Add/edit/remove patient reviews\nfor the carousel"]
    B -- "FAQ Items" --> G["Add/edit/delete FAQ entries\nby category"]
    B -- "Offers" --> H["Create/activate/deactivate\n(see WF-13)"]
    B -- "Gallery" --> I["Upload/categorize/reorder\nimages and before/after pairs"]
    B -- "Career Listings" --> J["Add/edit/close job postings\nReview applications"]
    B -- "Homepage Banner" --> K["Edit banner text, CTA,\ntoggle visibility"]
    B -- "Clinic Info" --> L["Update hours, address,\nphone, email"]
    
    C & D & E & F & G & H & I & J & K & L --> M["Save changes"]
    M --> N["Changes reflect on\nlive website immediately\n(or via cache refresh ≤ 5 min)"]
```
### Content Audit Trail
All CMS changes are logged:
| Field | Logged Data |
|---|---|
| Who | Admin user ID and name |
| What | Content type, item ID, fields changed |
| When | Timestamp |
| Before/After | Previous and new values (for rollback if needed) |
---
## WF-18: Slot Management & Scheduling *(NEW)*
**Trigger:** Admin/Receptionist needs to configure dentist availability.
**Actors:** Receptionist/Admin, Admin Agent.
### Flow Diagram
```mermaid
flowchart TD
    A["Dashboard → Slot Management"] --> B["Select dentist from dropdown"]
    B --> C{"Action?"}
    
    C -- "Set daily availability" --> D["Select date\nClick time blocks to\ntoggle available/unavailable"]
    
    C -- "Apply weekly template" --> E["Configure template:\nMon-Fri: 9AM-1PM, 2PM-7PM\nSat: 9AM-2PM\nSun: Closed"]
    E --> F["Select date range to apply"]
    F --> G["Preview changes"]
    G --> H["Confirm → Apply template"]
    
    C -- "Block a full day" --> I["Select date\nClick 'Block Entire Day'\nAdd reason (e.g., 'Annual Leave - Dr. Sharma')"]
    
    C -- "Block for all dentists" --> J["Select date\n'Block All Dentists'\nAdd reason (e.g., 'Republic Day')"]
    
    C -- "Reserve emergency slots" --> K["Select time blocks\nToggle 'Emergency Only'\n(hidden from public booking,\nvisible to admin only)"]
    
    C -- "Configure buffer time" --> L["Settings → Slot Configuration\nSet buffer minutes between\nappointments (default: 10 min)"]
    
    D & H & I & J & K & L --> M["Save Changes"]
    M --> N["Public booking page\nupdates immediately"]
    N --> O["Verify: Preview booking page\nfor the edited dentist/date"]
```
---
## Cross-Workflow Dependencies
The following diagram shows how the major workflows interconnect:
```mermaid
flowchart TB
    subgraph "Patient-Facing"
        WF01["WF-01\nBooking"]
        WF02["WF-02\nReschedule"]
        WF03["WF-03\nCancel"]
        WF06["WF-06\nWeb Chatbot"]
        WF07["WF-07\nWhatsApp Bot"]
        WF08["WF-08\nRegistration"]
        WF09["WF-09\nContact Form"]
    end
    
    subgraph "Automated"
        WF04["WF-04\n24h Reminder"]
        WF05["WF-05\nPost-Visit Feedback"]
        WF14["WF-14\nLoyalty Points"]
    end
    
    subgraph "Admin-Managed"
        WF10["WF-10\nDaily Operations"]
        WF11["WF-11\nVideo Testimonials"]
        WF12["WF-12\nBlog Publishing"]
        WF13["WF-13\nOffers & Promos"]
        WF15["WF-15\nEmergency Walk-In"]
        WF16["WF-16\nNewsletter"]
        WF17["WF-17\nCMS Operations"]
        WF18["WF-18\nSlot Management"]
    end
    
    WF01 --> WF04
    WF01 --> WF05
    WF01 --> WF14
    WF01 --> WF02
    WF01 --> WF03
    WF02 --> WF04
    WF03 --> WF14
    WF05 --> WF11
    WF05 --> WF14
    WF06 --> WF01
    WF07 --> WF01
    WF07 --> WF02
    WF07 --> WF03
    WF08 --> WF01
    WF09 --> WF10
    WF13 --> WF01
    WF15 --> WF05
    WF16 --> WF12
    WF16 --> WF13
    WF18 --> WF01
```