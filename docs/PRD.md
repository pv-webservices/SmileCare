# Product Requirements Document (PRD)
**Product:** SmileCare — A white-label Dental Clinic Management & Booking Platform (v1.0) designed for modern urban clinics. It provides a fully responsive patient-facing website, online appointment booking with Razorpay payment, voice-enabled chatbots (web and WhatsApp), and a real-time admin dashboard for managing operations.
**Stakeholders:** Clinic Owner/Admin, Dentists, Receptionists, Patients.
---
## Goals & Objectives
| Goal | Description | Success Metric |
|---|---|---|
| **Online Booking Adoption** | Enable online appointment booking with payment | ≥80% of bookings via website in 6 months |
| **Reduce No-Shows** | Send automated reminders (email + WhatsApp) | No-show rate ≤10% |
| **24/7 Support** | Provide chatbot assistance (text + voice) | ≥70% of patient FAQs resolved without human help |
| **Centralized Operations** | Unify patient records & bookings in a single admin dashboard | 100% of appointments tracked digitally |
| **Brand Visibility** | SEO-optimized, modern web design | Top 3 local search ranking for "dentist near me" within 6 months |
| **Patient Retention** | Loyalty programs, follow-up reminders, and personalized content | ≥60% return-visit rate within 12 months |
Each goal is tracked by specific metrics (e.g. booking channels, reminder open rates, retention funnels) to measure success.
---
## User Personas
### Patient
Visits the site to browse treatments, book appointments, and pay. Receives confirmation via email & WhatsApp, and can log in to a portal to view or change appointments. Uses the chatbot (web or WhatsApp) for quick answers or to initiate bookings. May watch video testimonials to build trust before booking.
### Receptionist (Admin Staff)
Manages patient profiles, appointment slots, and bookings via the admin panel. Receives real-time alerts for new/cancelled appointments. Responds to escalated chatbot or contact inquiries.
### Dentist
Views their personal schedule and patient details. Receives notifications of upcoming appointments to prepare for the day. Has a public profile page with credentials, specialties, and patient reviews.
### Prospective Patient (First-Time Visitor)
Lands on the website via Google search, social media, or referral. Needs to be quickly convinced of the clinic's credibility through social proof (video testimonials, stats, certifications) and a clear path to booking.
---
## Website Pages
### Home Page
The homepage is the primary conversion page. It must communicate trust, expertise, and convenience within the first 5 seconds.
#### 1. Hero Section
- **Full-width hero banner** with a high-quality dental image or subtle video background (optional loop of clinic interiors / smiling patients).
- Clinic tagline (e.g., *"Your Smile, Our Passion"*) and a sub-headline explaining the value proposition.
- Primary CTA: **"Book Appointment"** button (prominent, contrasting color).
- Secondary CTA: **"Watch Our Story"** button that scrolls to the video testimonials section or opens a modal with a clinic introduction video.
- Trust badges row below the CTA: *"500+ Happy Patients · 15+ Years · Painless Procedures · EMI Available"*.
#### 2. Quick Intro / Why Choose Us
- Brief overview of clinic philosophy (2–3 sentences).
- Icon-based value proposition cards (4–6 items):
  - ✅ Experienced Team (15+ years)
  - ✅ Advanced Technology (digital X-rays, laser)
  - ✅ Painless Procedures
  - ✅ Affordable EMI Options
  - ✅ Same-Day Emergency Care
  - ✅ Sterilized & Safe Environment
#### 3. Featured Treatments
- Grid/cards for each major service (e.g. Root Canal, Dental Implants, Teeth Whitening, Braces, Smile Makeover, Kids Dentistry).
- Each card includes: icon/image, treatment name, 1-line description, starting price (e.g., *"Starting ₹3,000"*), and a **"Learn More"** link to the detail page.
- Subtle hover animations (card lift, icon pulse).
#### 4. Video Testimonials Section *(NEW)*
- **Section title:** *"Hear From Our Happy Patients"* with a brief subtitle (*"Real stories from real smiles"*).
- **Video carousel/grid** displaying 3–6 patient video testimonials:
  - Each video card includes:
    - Embedded video player (YouTube/Vimeo embed or self-hosted via Cloudinary) with a custom thumbnail showing the patient smiling.
    - Patient name, treatment received (e.g., *"Dental Implants"*), and a star rating (⭐⭐⭐⭐⭐).
    - A 1-line pull quote displayed below the video (e.g., *"I was terrified of dentists, but SmileCare changed everything!"*).
  - Lazy-loaded video embeds for performance (load on scroll or on play-click).
- **Layout options:**
  - Desktop: 3-column grid or horizontal carousel with navigation arrows.
  - Tablet: 2-column grid.
  - Mobile: Single-column stacked or swipeable carousel.
- **"Share Your Story"** CTA at the bottom encouraging patients to submit their own video testimonial (links to a submission form or email).
- **Admin CMS integration:** Video testimonials are managed from the admin dashboard (add/remove/reorder videos, edit captions).
#### 5. Text Testimonials Carousel
- Rotating patient reviews slider (text-based) with patient name, photo (avatar), treatment type, and star rating.
- Auto-play with pause-on-hover; manual navigation dots/arrows.
- Pulls from a curated list managed via admin CMS.
#### 6. Clinic Stats / Trust Counters
- Animated counters that count up on scroll:
  - 🏆 15+ Years of Experience
  - 😊 10,000+ Happy Patients
  - 🦷 25,000+ Treatments Done
  - ⭐ 4.9 Google Rating
- Displayed in a visually distinct banner (gradient background or parallax image).
#### 7. Meet Our Doctors (Preview)
- Horizontal scroll or grid of 3–4 top dentist profiles:
  - Circular photo, name, specialization, years of experience.
  - **"View Profile"** link to the About page / individual dentist page.
- **"Meet the Full Team →"** link at the bottom.
#### 8. Before & After Gallery (Preview)
- A curated 3–4 item gallery of dramatic smile transformations.
- Each item: side-by-side slider (drag handle to reveal before/after), treatment type label.
- **"View Full Gallery →"** link leading to the dedicated gallery page or treatments hub.
#### 9. How It Works (Booking Flow)
- Simple 4-step visual process:
  1. 📋 **Choose Treatment** – Browse our services
  2. 📅 **Pick a Slot** – Select date & time
  3. 💳 **Confirm & Pay** – ₹50 booking fee
  4. 😊 **Visit & Smile** – We take care of the rest
- Each step has an icon, title, and 1-line description.
- CTA: **"Book Now"** at the end.
#### 10. Special Offers & Promotions Banner
- A highlighted banner/strip for current promotions:
  - E.g., *"🎉 Free Dental Check-up This Month! Book Now →"*
  - Or *"EMI starting ₹500/month on Implants"*.
- Managed via admin CMS (can be toggled on/off, content is editable).
- Links to the Offers page or directly to booking with a promo code pre-filled.
#### 11. Insurance & Payment Partners
- Logo strip showing accepted insurance providers and payment partners:
  - Insurance: Star Health, ICICI Lombard, etc.
  - Payment: Razorpay, UPI, credit/debit cards, EMI options.
- Brief text: *"We accept all major insurance plans. Hassle-free claims processing."*
#### 12. Blog / Dental Tips Preview
- 3 latest blog post cards from the Blog page:
  - Featured image, title, excerpt (2 lines), publish date, **"Read More →"** link.
- **"View All Articles →"** link to the Blog hub.
#### 13. Contact Strip / CTA Footer
- Phone number (click-to-call on mobile), email, WhatsApp quick chat button.
- Google Maps embed showing clinic location with a pin.
- Working hours summary.
- Final CTA: **"Ready to Transform Your Smile? Book Your Appointment Today!"** with a large button.
#### 14. Newsletter Subscription
- Inline form: *"Get dental tips & exclusive offers straight to your inbox"*.
- Fields: Email address + **"Subscribe"** button.
- Integration with email marketing (Mailchimp / SendGrid list).
- Privacy note: *"We respect your privacy. Unsubscribe anytime."*
---
### About Page
#### Clinic Story
- Mission statement & background (founding story, vision).
- Timeline of milestones (e.g., founded, first 1000 patients, technology upgrades).
#### Team Profiles
- Full dentist profiles: photo, name, degree/credentials, specialties, years of experience, a short bio, and social links (LinkedIn, etc.).
- Support staff section (receptionists, hygienists) with brief intros.
#### Clinic Tour (Virtual)
- Embedded video walkthrough of the clinic or an interactive image gallery (360° if available).
- Photos of clinic interiors, treatment rooms, waiting area, sterilization room.
#### Certifications & Affiliations
- List of awards, ISO certifications, professional body memberships (e.g., Indian Dental Association).
- Display as a logo grid with hover tooltips showing the full name.
#### Community Involvement *(NEW)*
- Description of any dental camps, free check-up drives, or community health programs.
- Photos from events.
---
### Treatments Page (Hub + Detail Pages)
#### Hub Page
- Category-based layout: Preventive, Restorative, Cosmetic, Orthodontic, Pediatric, Emergency.
- Each category is a collapsible section or tabbed view with treatment cards underneath.
- Search/filter bar to quickly find a treatment by keyword.
#### Individual Treatment Detail Pages
(E.g., Root Canal, Dental Implants, Teeth Whitening, Braces/Aligners, Smile Makeover, Kids Dentistry, Gum Treatment, Wisdom Tooth Extraction, Dentures, Dental Crowns & Bridges)
Each detail page includes:
- **Hero banner** with treatment-specific imagery and title.
- **Overview:** What the treatment is, who it's for.
- **Benefits:** Bullet list of key advantages.
- **Procedure Breakdown:** Numbered steps with icons/illustrations explaining the process.
- **Before & After Gallery:** Interactive slider showing real patient results (with consent).
- **Technology Used:** Mention specific tech (e.g., laser, digital impressions) that makes the procedure better at this clinic.
- **Recovery & Aftercare:** What to expect post-treatment, care tips.
- **Pricing & EMI:** Transparent pricing ranges and EMI options (e.g., *"Implants: ₹25,000–₹45,000 | EMI from ₹2,000/mo"*).
- **FAQ Accordion:** 5–8 common questions about the treatment, answered in patient-friendly language.
- **Related Treatments:** Cross-links to similar or complementary services.
- **Patient Video Testimonial (inline):** 1 embedded video testimonial specific to this treatment.
- **CTA:** **"Book Consultation for [Treatment]"** button (pre-fills treatment in booking form).
---
### Appointment Booking Page
A guided multi-step form with a progress indicator:
1. **Select Treatment** – Patient picks desired service from a visual card selector (with icons). Option to select "General Consultation" for undecided patients.
2. **Choose Dentist (optional)** – Filter by specialist. Shows dentist photo, name, specialization, and next available slot preview.
3. **Pick Date** – Calendar shows available dates (past and blocked dates disabled). Highlights "earliest available" date.
4. **Select Time Slot** – Grid of available 30-min slots; booked slots are hidden in real-time. Morning / Afternoon / Evening grouping for easy scanning.
5. **Enter Patient Details** – Name, phone, email, age, brief concern/notes field (with client-side validation: email format, 10-digit phone, required fields).
6. **Review & Payment** – Summary card showing all selections. ₹50 booking fee via embedded Razorpay checkout. Promo code input field.
7. **Confirmation** – Success screen with:
   - Booking summary (treatment, dentist, date, time, reference ID).
   - "Add to Google Calendar" / "Add to Apple Calendar" buttons.
   - "View in Patient Portal" link.
   - "Share on WhatsApp" button for easy reference.
   - Estimated wait time / preparation instructions.
**Post-Booking Actions:** On confirmation (payment captured), the system:
- Sends an email (with `.ics` calendar invite) and a WhatsApp message to the patient.
- Creates an entry on the admin dashboard with a new-booking notification.
- Schedules a 24-hour reminder (email + WhatsApp).
- Schedules a post-visit feedback request (sent 2 hours after appointment time).
---
### Contact Page
#### Contact Form
- Fields: Name, Email, Phone, Message, "Treatment Interest" dropdown.
- Client-side validation (required fields, email/phone format).
- CAPTCHA/honeypot for spam prevention.
- On submission: confirmation message on screen + email to clinic inbox + admin dashboard notification.
#### Clinic Info
- Full address with landmark reference.
- Working hours (table format: Mon–Sat, Sunday status).
- Google Map embed with driving directions link.
- Click-to-call phone button and WhatsApp quick-chat button.
#### Emergency Contact *(NEW)*
- Highlighted emergency number for after-hours dental emergencies.
- Brief guide: *"Knocked out a tooth? Broken filling? Here's what to do before you reach us."*
---
### Patient Portal (Authenticated Area)
#### Authentication
- Email/password login & registration.
- OTP-based login option (phone number).
- Google / social login (optional, future scope).
- Password reset via email.
#### Patient Dashboard
- **Upcoming Appointments:** Cards showing date, time, dentist, treatment, status (confirmed/pending). Quick actions: Reschedule, Cancel.
- **Booking History:** Past appointments with treatment details and payment receipts (downloadable PDF).
- **Treatment Progress:** Visual timeline for ongoing treatments (e.g., braces adjustments over 12 months).
#### Manage Appointments
- Patients can **Reschedule** (picks new date/time, subject to availability).
- Patients can **Cancel** (refund policy enforced: ≥24h = full refund, <24h = no refund unless admin approves).
- Cancellation reason dropdown for analytics.
#### Profile Management
- Edit personal details: name, phone, email, date of birth, address.
- Medical history form: allergies, current medications, past dental procedures, medical conditions.
- Upload documents: X-rays, insurance cards, previous records.
#### Notifications & Reminders
- In-app notification center: appointment reminders, promotional offers, follow-up care tips.
- Preference settings: toggle email/WhatsApp/SMS notifications.
#### Loyalty & Rewards *(NEW)*
- Points earned per visit / per treatment (e.g., 100 points = ₹100 discount).
- Referral program: share a unique referral link → earn bonus points when a friend books.
- Display current points balance and redemption options.
---
### Blog / Dental Tips Page *(NEW)*
A content hub for dental education, SEO value, and patient engagement.
#### Hub Page
- Grid/list of blog posts with featured image, title, excerpt, author, date, category tag.
- Category filter: Oral Hygiene, Treatment Guides, Kids Dental Care, Nutrition & Teeth, Clinic News.
- Search bar.
- Sidebar: Popular posts, recent posts, category list, newsletter signup.
#### Individual Blog Post Page
- Full article with rich formatting (headings, images, embedded videos, blockquotes).
- Author card (dentist profile mini-card with photo and credentials).
- Social sharing buttons (WhatsApp, Facebook, Twitter/X, LinkedIn, Copy Link).
- Related posts section at the bottom.
- CTA banner within/below the article: *"Have questions? Book a consultation →"*.
- Comments section (optional; can be toggled on/off by admin).
#### Admin CMS Integration
- Create/edit/publish/unpublish blog posts from the admin dashboard.
- Rich text editor with image upload.
- SEO fields: meta title, meta description, slug, Open Graph image.
- Schedule posts for future publishing.
---
### FAQ Page *(NEW)*
A comprehensive FAQ page to complement the chatbot and reduce support queries.
- **Categorized accordions:**
  - General (hours, location, parking, insurance)
  - Appointments & Booking (how to book, cancel, reschedule, payment)
  - Treatments (common treatment questions, pain, duration)
  - Pricing & Insurance (cost ranges, EMI, claim process)
  - COVID-19 Safety Protocols
- Each question expands to show a clear, concise answer.
- **"Still have questions?"** CTA linking to the chatbot or Contact page.
- FAQ content is editable via admin CMS.
- Schema markup (FAQPage) for Google rich snippets.
---
### Offers & Promotions Page *(NEW)*
A dedicated page for ongoing and seasonal promotions.
- **Active Offers:** Cards with offer details, validity period, terms & conditions, and a **"Book Now"** CTA (pre-fills promo code).
  - E.g., *"Free Dental Check-up + Cleaning — Valid till March 31"*
  - E.g., *"20% Off Teeth Whitening for First-Time Patients"*
  - E.g., *"Refer a Friend: You Both Get ₹500 Off"*
- **Expired Offers:** Greyed out section with past promotions (for transparency and SEO).
- **EMI Plans:** Detailed breakdown of EMI options for high-value treatments (Implants, Braces).
- Admin CMS: Create/edit/expire offers with scheduling.
---
### Gallery Page *(NEW)*
A visual showcase of clinic interiors, team, and smile transformations.
- **Tabs/Filters:** Clinic Tour | Smile Transformations | Events & Camps | Team
- **Clinic Tour:** High-quality photos or 360° virtual tour embed.
- **Smile Transformations:** Before/after slider pairs organized by treatment type.
- **Events & Camps:** Photos from community dental camps and events.
- **Team:** Candid team photos, celebrations, training events.
- Lightbox view for full-screen image viewing.
- Lazy loading for performance.
---
### Careers Page *(NEW)*
A page for clinic growth and talent acquisition.
- **Open Positions:** List of current job openings with title, type (full-time/part-time), brief description, and **"Apply Now"** button.
- **Why Work With Us:** Culture section with perks, growth opportunities, and team photos.
- **Application Form:** Name, email, phone, position applied for, resume upload (PDF), cover note text area.
- Admin CMS: Manage job listings (add/edit/close positions).
---
## Appointment Booking System
### Slot Management
- Admin configures each dentist's availability (per day) in the dashboard. Default slot length is 30 minutes (configurable per dentist/treatment).
- Slots show real-time availability: once booked, a slot is hidden/marked unavailable.
- Admin can block out whole days (e.g. holidays) so no slots appear on those dates.
- **Buffer time:** Configurable gap between appointments (e.g., 10 min) for cleanup/prep.
- **Emergency slots:** Reserve 1–2 slots per day for walk-in emergencies (visible only to admin).
### Payment Integration (Razorpay)
- Booking fee: ₹50 (5000 paise). Using Razorpay's Checkout.js, the frontend creates an order and opens the secure payment modal.
- The backend Payment Agent verifies payment using Razorpay's signature (webhook or API) and updates the booking to confirmed.
- **Promo codes:** Admin can create discount codes that waive or reduce the booking fee.
- Refund policy: Full refund if the patient cancels ≥24 hours before the appointment; otherwise no refund (unless admin manually approves). Refunds are processed via Razorpay and tracked by the system.
### Confirmations & Reminders
- **Email:** Immediately after booking, patient receives a confirmation email with details and a `.ics` calendar invite for easy calendar integration.
- **WhatsApp:** Simultaneously, an appointment summary is sent as a WhatsApp template message.
- **Admin Notification:** The admin dashboard notification center shows a new booking alert in real-time.
- **Reminders:** The system schedules a 24-hour reminder via both email and WhatsApp (sent when the appointment is ~24h away) to reduce no-shows.
- **Post-Visit Follow-Up:** 2 hours after appointment time, an automated message is sent asking the patient to rate their experience and leave a review (with link to Google Reviews and video testimonial submission).
All communications use templated messages populated with booking details. The admin dashboard logs all events for audit.
---
## Chatbot System
### Web (Site) Chatbot
An AI-powered chat interface on the website with text and voice I/O. It uses the Web Speech API for speech-to-text and ElevenLabs for text-to-speech, allowing patients to speak or type queries. Key capabilities:
- Answer FAQs (hours, location, fees, insurance).
- Assist in booking appointments (providing a direct link or initiating the flow inline).
- Guide users to treatment pages.
- Recommend treatments based on symptoms described by the patient.
- Share current offers/promotions.
- Collect feedback after visit.
The chat UI is a floating widget with quick-reply buttons (e.g. "Book Appointment", "Treatments", "Clinic Hours", "Current Offers", "Contact Us"). Voice mode can be toggled on/off. The chatbot maintains conversation context within a session.
### WhatsApp Chatbot (Meta Cloud API)
A conversational bot on WhatsApp Business. When a patient messages the clinic number, a webhook triggers the WhatsApp Agent which processes intents. Supported intents include:
- **Greeting** – Welcome message with menu options.
- **Book Appointment** – Sends booking link with deep link to treatment selection.
- **Reschedule** – Asks for booking ID, shows new slot options, confirms the change.
- **Cancel** – Handles cancellation with refund policy enforcement.
- **Clinic Hours** – Sends formatted hours.
- **Services List** – Sends treatment categories with brief descriptions.
- **Fees Info** – Sends pricing ranges for common treatments.
- **Location/Map** – Sends Google Maps link with clinic pin.
- **Current Offers** – Sends active promotions.
- **Speak to Human** – Triggers handoff to reception staff.
All outgoing messages (confirmation, reminder, cancellation notice) use pre-approved template messages via the Meta API.
---
## Admin Dashboard
### Key Features
| Feature | Description |
|---|---|
| **Patient List** | Searchable, filterable table of patient records (name, contact, visit history, treatment notes). Export to CSV. |
| **Booking Calendar** | Day/week/month views showing all appointments. Drag-and-drop to reschedule. Color-coded by status (confirmed, pending, cancelled, completed). |
| **Slot Management** | Interface to set each dentist's availability (time blocks on a calendar grid). Slots can be toggled on/off; bulk tools allow blocking full days or applying weekly templates. |
| **Notification Center** | Real-time alerts (bell icon) for new bookings, cancellations, payments, contact inquiries, and chatbot escalations. Mark notifications as read/archived. |
| **Analytics & Reports** | Charts and reports on booking trends, revenue, popular treatments, no-show rates, patient demographics, and referral sources. Exportable reports. Date range filters. |
| **Content Management (CMS)** | Edit treatment pages, blog posts, testimonials (text + video), offers, FAQ content, team profiles, and gallery — all without developer help. |
| **Video Testimonial Manager** | Upload/embed video testimonials, set thumbnails, write captions, assign to treatments, reorder display, and toggle visibility. |
| **Blog Manager** | Create/edit/schedule/publish blog posts with a rich text editor. SEO fields included. |
| **Offer Manager** | Create promotions with promo codes, validity dates, terms. Toggle active/expired status. |
| **Feedback & Reviews** | View patient feedback submitted via post-visit follow-ups. Flag reviews for public display. |
| **Communication Log** | Audit trail of all emails, WhatsApp messages, and chatbot conversations sent to patients. |
### Access Control
| Role | Permissions |
|---|---|
| **Super Admin** | Full access: manage users, settings, CMS, analytics, everything. |
| **Receptionist** | View/edit bookings, patients, slots, notifications. Manage CMS content. No access to system settings or analytics export. |
| **Dentist** | Read-only view of own schedule and patient info. Cannot edit bookings or manage others' data. |
Real-time updates (via WebSockets or polling) ensure that multiple admins see changes (new booking, reschedule) instantly. Audit logs record all admin actions for compliance.
---
## Technical Architecture
### Frontend
- **Framework:** Next.js (React) for a modern, SEO-friendly UI with SSR/SSG for content pages.
- **Styling:** Vanilla CSS with design tokens (color variables, spacing scale, typography scale) for consistency. Mobile-first responsive design (WCAG AA compliance).
- **State Management:** React Context and Hooks for global state (e.g. auth context for the portal).
- **Voice I/O:** Web Speech API (STT) in the browser and ElevenLabs SDK (TTS) for chat responses.
- **Payment UI:** Razorpay Checkout.js for the payment modal.
- **Video Embeds:** YouTube/Vimeo oEmbed or Cloudinary video player for testimonials (lazy-loaded).
- **Animations:** Intersection Observer API for scroll-triggered animations (counters, fade-ins). CSS transitions for micro-interactions.
- **Image Optimization:** Next.js Image component with WebP format, lazy loading, and responsive srcsets for before/after galleries and treatment images.
Frontend pages fetch data via REST APIs. Routes include dynamic `/treatments/[slug]`, `/blog/[slug]`, and protected `/portal/*` routes.
### Backend
- **Runtime:** Node.js with Express.js server handling API endpoints.
- **Database:** PostgreSQL (with Prisma ORM) as the primary relational database. Key tables:
  - `users`, `patients`, `dentists`, `treatments`, `treatment_categories`
  - `slots`, `bookings`, `payments`, `refunds`
  - `testimonials` (text), `video_testimonials` (video embeds with metadata)
  - `blog_posts`, `blog_categories`
  - `faq_items`, `faq_categories`
  - `offers`, `promo_codes`
  - `gallery_items`
  - `job_listings`, `job_applications`
  - `notifications`, `communication_logs`
  - `loyalty_points`, `referrals`
  - `feedback`, `reviews`
  - `site_settings`, `audit_logs`
- **Authentication:** JWT-based auth (bcrypt for password hashing). Roles and session management handled in auth-agent.
- **File Storage:** Images and videos on Cloudinary or AWS S3 with CDN delivery.
- **Task Scheduler:** node-cron jobs for sending reminders, post-visit follow-ups, scheduled blog publishes, and expired offer cleanup.
- **API Layer (Microservices/Agents):** The server routes requests to modular services (agents) like booking-agent, payment-agent, content-agent, notification-agent, etc.
### Integrations
| Integration | Purpose |
|---|---|
| **Razorpay** | Payment gateway for booking fees, refunds, and promo code discounts |
| **Meta Cloud (WhatsApp API)** | Bi-directional messaging with patients over WhatsApp |
| **ElevenLabs** | High-quality text-to-speech for voice chatbot responses |
| **Nodemailer (SMTP)** | Emails for confirmations, reminders, password resets, newsletters |
| **Google Calendar API** | Create `.ics` invites to attach to emails |
| **Google Maps Embed** | Display clinic location on contact and home pages |
| **Cloudinary / AWS S3** | Media storage and delivery (images, videos, documents) |
| **Mailchimp / SendGrid** | Newsletter subscription management and email marketing |
| **Google Analytics / Tag Manager** | Website traffic, conversion tracking, and user behavior analytics |
| **Google Search Console** | SEO monitoring, indexing status, and search performance |
| **Schema.org / JSON-LD** | Structured data for local business, FAQ, medical organization rich results |
### Infrastructure
| Component | Technology |
|---|---|
| **Frontend Hosting** | Vercel (or Netlify) |
| **Backend Hosting** | Railway / Render / Heroku |
| **Database** | Managed PostgreSQL (Supabase or AWS RDS) |
| **CI/CD** | GitHub Actions pipelines for testing and deployment |
| **Monitoring** | Sentry for error tracking; UptimeRobot for uptime checks |
| **CDN** | Cloudflare for static assets and DDoS protection |
| **Logging** | Centralized logging (e.g., LogDNA, Datadog) for API and server logs |
---
## SEO Strategy
### On-Page SEO
- Unique, keyword-rich `<title>` and `<meta description>` for every page.
- Single `<h1>` per page with proper heading hierarchy (`<h2>`, `<h3>`).
- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`).
- Alt text on all images (descriptive, keyword-aware).
- Internal linking between treatments, blog posts, and FAQ.
- Clean, descriptive URL slugs (e.g., `/treatments/dental-implants`).
### Technical SEO
- Server-side rendering (SSR) or static generation (SSG) via Next.js for fast, crawlable pages.
- XML sitemap auto-generated and submitted to Google Search Console.
- `robots.txt` properly configured.
- Canonical tags on all pages.
- Open Graph and Twitter Card meta tags for social sharing previews.
- Page speed optimized: Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1).
### Structured Data (Schema.org)
- `LocalBusiness` / `Dentist` schema on homepage.
- `MedicalOrganization` schema with details.
- `FAQPage` schema on FAQ page.
- `BlogPosting` schema on blog articles.
- `Review` / `AggregateRating` schema for testimonials.
- `BreadcrumbList` for navigation.
- `VideoObject` schema for video testimonials.
### Local SEO
- Google Business Profile optimization (synced hours, photos, reviews link).
- NAP (Name, Address, Phone) consistency across the site.
- Location-specific keywords in content.
---
## Non-Functional Requirements
| Requirement | Target |
|---|---|
| **Performance** | Page load times <2s (LCP target). Lazy loading for images/videos. CDN for static assets. |
| **Uptime** | 99.5% target availability |
| **Responsive Design** | Mobile-first; adapts for phones, tablets, and desktops |
| **Accessibility** | WCAG 2.1 AA compliant (semantic HTML, alt tags, keyboard nav, focus indicators, color contrast ≥4.5:1) |
| **Security** | HTTPS everywhere, input sanitization, rate limiting, CORS policies, CSP headers |
| **Data Privacy** | Patient data encrypted at rest/in transit; HIPAA-like access controls; audit logs; cookie consent banner |
| **Browser Support** | Modern evergreen browsers (Chrome, Firefox, Safari, Edge — last 2 versions) |
| **Internationalization** | Content in English (primary); Hindi support as future scope |
| **Scalability** | Architecture supports adding new clinic locations (multi-tenant) as future scope |
---
## Future Scope (v2.0+)
- **Tele-Dentistry:** Video consultation booking and in-browser video calls.
- **AI Treatment Recommender:** Symptom checker chatbot that recommends treatments.
- **Multi-Clinic Support:** White-label multi-tenant architecture for clinic chains.
- **Mobile App:** Native iOS/Android app with push notifications.
- **Automated Insurance Claims:** Direct claim submission integration with insurance providers.
- **Patient Health Records (EHR):** Digital charting and treatment records managed by dentists.
- **Hindi / Multi-Language Support:** Full site translation.
- **SMS Notifications:** Fallback channel for patients without WhatsApp.
- **Waitlist System:** Auto-fill cancelled slots from a waitlist queue.