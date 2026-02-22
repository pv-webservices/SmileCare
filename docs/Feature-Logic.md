# Feature Logic
**Purpose:** Frontend/backend interaction logic for each major feature — state management, API endpoints, validation rules, and data flows.
---
## FL-01: Home Page
### Frontend (React/Next.js)
**Data Fetching:** On page load, fetch multiple data sources in parallel:
```js
// app/page.tsx — Server-side or useEffect
const [treatments, setTreatments] = useState([]);
const [videoTestimonials, setVideoTestimonials] = useState([]);
const [textTestimonials, setTextTestimonials] = useState([]);
const [teamPreview, setTeamPreview] = useState([]);
const [activeOffer, setActiveOffer] = useState(null);
const [blogPosts, setBlogPosts] = useState([]);
const [stats, setStats] = useState({ years: 0, patients: 0, treatments: 0, rating: 0 });
useEffect(() => {
  Promise.all([
    fetch('/api/treatments').then(r => r.json()),
    fetch('/api/content/video-testimonials?featured=true&limit=6').then(r => r.json()),
    fetch('/api/content/testimonials?limit=8').then(r => r.json()),
    fetch('/api/dentists?limit=4').then(r => r.json()),
    fetch('/api/content/offers?active=true&limit=1').then(r => r.json()),
    fetch('/api/content/blog?limit=3&sort=latest').then(r => r.json()),
    fetch('/api/content/stats').then(r => r.json()),
  ]).then(([t, vt, tt, team, offer, blog, s]) => {
    setTreatments(t);
    setVideoTestimonials(vt);
    setTextTestimonials(tt);
    setTeamPreview(team);
    setActiveOffer(offer[0] || null);
    setBlogPosts(blog);
    setStats(s);
  });
}, []);
```
### Section Rendering
| Section | Data Source | Interaction |
|---|---|---|
| Hero Banner | Static + `activeOffer` | CTA → `/booking`, "Watch Story" → scroll/modal |
| Trust Badges | Static | None |
| Why Choose Us | Static (6 icon cards) | None |
| Featured Treatments | `GET /api/treatments` | Card click → `/treatments/[slug]`, "Learn More" links |
| **Video Testimonials** | `GET /api/content/video-testimonials?featured=true` | Carousel nav, lazy-load video on play, "Share Your Story" → submission form |
| Text Testimonials | `GET /api/content/testimonials` | Auto-play carousel, pause on hover |
| Clinic Stats | `GET /api/content/stats` | Animated counters on scroll (Intersection Observer) |
| Meet Our Doctors | `GET /api/dentists?limit=4` | "View Profile" → `/about#team`, "Full Team →" link |
| Before & After | `GET /api/content/gallery?category=transformations&limit=4` | Drag slider for before/after reveal |
| How It Works | Static (4 steps) | "Book Now" → `/booking` |
| Special Offers | `GET /api/content/offers?active=true&limit=1` | CTA → `/booking?promo=[code]` or `/offers` |
| Insurance Partners | Static (logo images) | None |
| Blog Preview | `GET /api/content/blog?limit=3` | Card click → `/blog/[slug]`, "View All →" → `/blog` |
| Contact Strip | Static + Google Maps embed | Click-to-call, WhatsApp link, map interaction |
| Newsletter | Local form state | Submit → `POST /api/newsletter/subscribe` |
### Video Testimonials — Frontend Detail
```js
// VideoTestimonialCard component
const [isPlaying, setIsPlaying] = useState(false);
// Lazy load: show thumbnail until user clicks play
const handlePlay = () => {
  setIsPlaying(true); // Swap thumbnail for iframe/video player
};
// Render:
// - Custom thumbnail (patient smiling)
// - Play button overlay
// - Patient name, treatment badge, star rating
// - Pull quote text below
```
**Layout responsiveness:**
- Desktop: 3-column grid or carousel with arrows
- Tablet: 2-column grid
- Mobile: Single-column swipeable carousel
### Animated Stats Counter
```js
// useCountUp hook with Intersection Observer
const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
};
```
### Newsletter Subscription
```js
const [email, setEmail] = useState('');
const [subscribed, setSubscribed] = useState(false);
const handleSubscribe = async (e) => {
  e.preventDefault();
  if (!/\S+@\S+\.\S+/.test(email)) return; // validate
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (res.ok) setSubscribed(true);
};
```
### API Contracts
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/treatments` | GET | List treatments (name, slug, image, tagline, startingPrice) | Public |
| `/api/dentists?limit=N` | GET | List dentists (preview) | Public |
| `/api/content/video-testimonials?featured=true&limit=6` | GET | Featured video testimonials | Public |
| `/api/content/testimonials?limit=8` | GET | Text testimonials for carousel | Public |
| `/api/content/stats` | GET | Clinic stats (years, patients, treatments, rating) | Public |
| `/api/content/offers?active=true&limit=1` | GET | Active homepage offer | Public |
| `/api/content/blog?limit=3&sort=latest` | GET | Latest blog posts | Public |
| `/api/content/gallery?category=transformations&limit=4` | GET | Before/after gallery items | Public |
| `/api/newsletter/subscribe` | POST | Subscribe email to newsletter | Public |
---
## FL-02: About Page
### Frontend
Static content sections for clinic story and timeline. Dynamic data for team profiles.
```js
const [dentists, setDentists] = useState([]);
const [galleryImages, setGalleryImages] = useState([]);
useEffect(() => {
  fetch('/api/dentists').then(r => r.json()).then(setDentists);
  fetch('/api/content/gallery?category=clinic-tour').then(r => r.json()).then(setGalleryImages);
}, []);
```
### Sections
| Section | Data | Notes |
|---|---|---|
| Clinic Story | Static | Mission, founding story, timeline of milestones |
| Team Profiles | `GET /api/dentists` | Full cards: photo, name, degree, specialties, bio, social links |
| Virtual Tour | `GET /api/content/gallery?category=clinic-tour` | Lightbox gallery or 360° embed |
| Certifications | Static (logo grid) | Hover tooltips with full names |
| Community | Static + images | Dental camps, free check-up drives |
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/dentists` | GET | All dentist profiles (full detail) | Public |
| `/api/content/gallery?category=clinic-tour` | GET | Clinic interior/exterior photos | Public |
---
## FL-03: Treatment Pages (Dynamic)
### Frontend — Route: `/treatments/[slug]`
```js
// Fetch full treatment data by slug
const [treatment, setTreatment] = useState(null);
const [relatedVideo, setRelatedVideo] = useState(null);
useEffect(() => {
  fetch(`/api/treatments/${slug}`).then(r => r.json()).then(setTreatment);
  fetch(`/api/content/video-testimonials?treatment=${slug}&limit=1`)
    .then(r => r.json()).then(v => setRelatedVideo(v[0] || null));
}, [slug]);
```
### Page Sections
| Section | Data Field | UI Component |
|---|---|---|
| Hero Banner | `treatment.heroImage`, `treatment.name` | Full-width image + title overlay |
| Overview | `treatment.overview` | Rich text block |
| Benefits | `treatment.benefits[]` | Icon + text bullet list |
| Procedure Steps | `treatment.procedureSteps[]` | Numbered stepper with icons |
| Technology Used | `treatment.technology` | Icon cards (e.g., laser, digital X-ray) |
| Before & After | `treatment.beforeAfterImages[]` | Interactive drag slider |
| Recovery & Aftercare | `treatment.aftercare` | Accordion or card |
| Pricing & EMI | `treatment.priceRange`, `treatment.emiOptions` | Pricing card with EMI calculator |
| FAQ Accordion | `treatment.faqs[]` | Expandable Q&A (schema markup for SEO) |
| Video Testimonial | `/api/content/video-testimonials?treatment=slug` | Inline embedded video player |
| Related Treatments | `treatment.relatedTreatments[]` | Horizontal card row with links |
| CTA | — | "Book Consultation for [Treatment]" → `/booking?treatment=[slug]` |
### Sample API Response
```json
{
  "name": "Dental Implants",
  "slug": "dental-implants",
  "heroImage": "https://cdn.example.com/implants-hero.webp",
  "overview": "Dental implants are permanent replacements...",
  "benefits": ["Natural look & feel", "Long-lasting (20+ years)", "Preserves jawbone"],
  "procedureSteps": [
    { "step": 1, "title": "Consultation & X-Ray", "description": "...", "icon": "scan" },
    { "step": 2, "title": "Implant Placement", "description": "...", "icon": "implant" }
  ],
  "technology": [{ "name": "3D CT Scan", "icon": "ct-scan" }],
  "beforeAfterImages": [{ "before": "url", "after": "url", "caption": "Patient A" }],
  "aftercare": "Avoid hard foods for 2 weeks...",
  "priceRange": { "min": 25000, "max": 45000, "currency": "INR" },
  "emiOptions": { "startingAt": 2000, "months": [6, 12, 18] },
  "faqs": [{ "question": "Is it painful?", "answer": "We use local anesthesia..." }],
  "relatedTreatments": [{ "name": "Dental Crowns", "slug": "dental-crowns" }],
  "category": "Restorative"
}
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/treatments/:slug` | GET | Full treatment detail by slug | Public |
| `/api/content/video-testimonials?treatment=slug&limit=1` | GET | Treatment-specific video testimonial | Public |
---
## FL-04: Appointment Booking Page (Multi-Step Form)
### State Management
```js
const [step, setStep] = useState(1);
const [treatment, setTreatment] = useState(null);
const [dentist, setDentist] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
const [availableSlots, setAvailableSlots] = useState([]);
const [selectedSlot, setSelectedSlot] = useState(null);
const [slotHoldTimer, setSlotHoldTimer] = useState(null);
const [details, setDetails] = useState({ name: '', email: '', phone: '', age: '', notes: '' });
const [promoCode, setPromoCode] = useState('');
const [promoDiscount, setPromoDiscount] = useState(0);
const [bookingResult, setBookingResult] = useState(null);
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
// Pre-fill from URL params (e.g., /booking?treatment=dental-implants&promo=SMILE20)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('treatment')) { /* auto-select treatment */ }
  if (params.get('promo')) setPromoCode(params.get('promo'));
}, []);
```
### Step 1: Treatment Selection
```js
// Fetch treatments on mount
useEffect(() => { fetch('/api/treatments').then(r => r.json()).then(setTreatmentList); }, []);
// UI: Visual cards with icon, name, 1-line description, starting price
// Includes "General Consultation" option for undecided patients
// On select → setTreatment(selected), setStep(2)
```
### Step 2: Dentist Selection (Optional)
```js
useEffect(() => {
  if (treatment) {
    fetch(`/api/dentists?treatment=${treatment.id}`)
      .then(r => r.json()).then(setDentists);
  }
}, [treatment]);
// UI: Dentist cards (photo, name, specialization, next available)
// Plus "Any Available" option. On select → setStep(3)
```
### Step 3: Date Selection
```js
// Calendar widget (react-day-picker or similar)
// Disable: past dates, Sundays, blocked dates
// Highlight "earliest available" with a badge
// On date pick:
const handleDateSelect = async (date) => {
  setSelectedDate(date);
  const dentistParam = dentist?.id ? `&dentist=${dentist.id}` : '';
  const res = await fetch(`/api/slots?date=${formatDate(date)}${dentistParam}`);
  const data = await res.json();
  setAvailableSlots(data.slots);
  if (data.slots.length > 0) setStep(4);
  else setErrors({ date: 'No slots available. Please try another date.' });
};
```
### Step 4: Time Slot Selection
```js
// Group slots: Morning (9-12), Afternoon (12-4), Evening (4-7)
const grouped = {
  morning: availableSlots.filter(s => parseInt(s.startTime) < 12),
  afternoon: availableSlots.filter(s => parseInt(s.startTime) >= 12 && parseInt(s.startTime) < 16),
  evening: availableSlots.filter(s => parseInt(s.startTime) >= 16),
};
// On select: hold slot for 5 minutes
const handleSlotSelect = async (slot) => {
  setSelectedSlot(slot);
  const res = await fetch(`/api/slots/${slot.id}/hold`, {
    method: 'POST', body: JSON.stringify({ sessionId: getSessionId() })
  });
  if (res.ok) {
    const { expiresAt } = await res.json();
    setSlotHoldTimer(setTimeout(() => {
      alert('Your slot hold has expired. Please select again.');
      setSelectedSlot(null); setStep(4);
    }, 5 * 60 * 1000));
    setStep(5);
  }
};
```
### Step 5: Patient Details
```js
const validateForm = (d) => {
  const errs = {};
  if (!d.name || d.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!/\S+@\S+\.\S+/.test(d.email)) errs.email = 'Invalid email format';
  if (!/^[6-9]\d{9}$/.test(d.phone)) errs.phone = 'Enter valid 10-digit Indian phone number';
  if (d.age && (isNaN(d.age) || d.age < 1 || d.age > 120)) errs.age = 'Invalid age';
  return errs;
};
// If user is logged in, pre-fill from auth context:
useEffect(() => {
  if (user) setDetails(prev => ({ ...prev, name: user.name, email: user.email, phone: user.phone }));
}, [user]);
```
### Step 6: Review & Payment
```js
// Promo code validation
const applyPromo = async () => {
  const res = await fetch('/api/loyalty/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: promoCode, treatmentId: treatment.id })
  });
  if (res.ok) {
    const { discount } = await res.json();
    setPromoDiscount(discount);
  } else {
    setErrors({ promo: 'Invalid or expired promo code' });
  }
};
// Razorpay payment
const handlePayment = async () => {
  const amount = Math.max(0, 5000 - promoDiscount * 100); // in paise
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, treatmentId: treatment.id, slotId: selectedSlot.id, promoCode })
  });
  const orderData = await res.json();
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: 'INR',
    order_id: orderData.orderId,
    name: 'SmileCare Dental Clinic',
    description: `Booking Fee${promoDiscount ? ' (Promo Applied)' : ''}`,
    prefill: { name: details.name, email: details.email, contact: details.phone },
    handler: async (response) => {
      // Verify payment
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });
      if (verifyRes.ok) {
        // Create booking
        const bookRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientDetails: details, treatmentId: treatment.id,
            dentistId: dentist?.id, slotId: selectedSlot.id,
            paymentId: orderData.orderId, promoCode,
            referralCode: new URLSearchParams(window.location.search).get('ref')
          })
        });
        const booking = await bookRes.json();
        setBookingResult(booking);
        clearTimeout(slotHoldTimer);
        setStep(7);
      }
    },
    modal: { ondismiss: () => { /* Release slot hold */ } }
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```
### Step 7: Confirmation
```js
// Display: booking ID, treatment, dentist, date/time, payment receipt
// Buttons:
// - "Add to Google Calendar" (generates .ics download link)
// - "Add to Apple Calendar" (same .ics)
// - "View in Portal" → /portal
// - "Share on WhatsApp" (pre-formatted message with booking summary)
// Background (server-side, triggered by POST /api/bookings):
// 1. Email confirmation with .ics attachment
// 2. WhatsApp confirmation template
// 3. Admin dashboard notification
// 4. Schedule 24h reminder
// 5. Schedule post-visit feedback (2h after)
// 6. Process referral code if present
```
### Booking Status Flow
```
pending_payment → confirmed → completed
                           → no_show
              → cancelled → refunded
```
### API Contracts
| Endpoint | Method | Request | Response | Auth |
|---|---|---|---|---|
| `/api/slots?dentist=&date=` | GET | Query params | `{ slots: [{id, startTime, endTime, isAvailable}] }` | Public |
| `/api/slots/:id/hold` | POST | `{ sessionId }` | `{ held: true, expiresAt }` | Public |
| `/api/loyalty/promo/validate` | POST | `{ code, treatmentId }` | `{ valid, discount, description }` | Public |
| `/api/payments/create-order` | POST | `{ amount, treatmentId, slotId, promoCode }` | `{ orderId, amount, currency }` | Public |
| `/api/payments/verify` | POST | `{ razorpay_order_id, payment_id, signature }` | `{ verified: true }` | Public |
| `/api/bookings` | POST | `{ patientDetails, treatmentId, dentistId, slotId, paymentId, promoCode, referralCode }` | `{ bookingId, status, details }` | Public |
---
## FL-05: Patient Portal
### Auth Context
```js
// AuthContext.js
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // On mount, try to refresh token
    fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) { setUser(data.user); setIsAuthenticated(true); }
        setLoading(false);
      });
  }, []);
  const login = async (email, password) => { /* POST /api/auth/login */ };
  const register = async (data) => { /* POST /api/auth/register */ };
  const logout = async () => { /* POST /api/auth/logout */ };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```
### Dashboard — `/portal`
```js
const [upcoming, setUpcoming] = useState([]);
const [history, setHistory] = useState([]);
const [loyaltyPoints, setLoyaltyPoints] = useState(0);
const [notifications, setNotifications] = useState([]);
useEffect(() => {
  // All calls include JWT in Authorization header
  Promise.all([
    authFetch('/api/bookings/my?status=upcoming'),
    authFetch('/api/bookings/my?status=past'),
    authFetch('/api/loyalty/balance'),
    authFetch('/api/notifications/my'),
  ]).then(([up, hist, lp, notif]) => {
    setUpcoming(up);
    setHistory(hist);
    setLoyaltyPoints(lp.balance);
    setNotifications(notif);
  });
}, []);
```
**Dashboard UI sections:**
- **Upcoming Appointments:** Cards with treatment, dentist, date/time, status. Actions: `[Reschedule]` `[Cancel]`
- **Past Appointments:** Table with status, receipt download (PDF)
- **Loyalty Points:** Balance display, "Redeem" button, referral link/code, transaction history
- **Notifications:** Reminders, offer alerts, reward credits
### Reschedule from Portal
```js
const handleReschedule = async (bookingId, newSlotId, newDate) => {
  const res = await authFetch(`/api/bookings/${bookingId}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify({ slotId: newSlotId, date: newDate })
  });
  if (res.ok) { /* refresh bookings, show success toast */ }
  else { /* show error: max reschedules, too close to appointment, etc. */ }
};
```
### Cancel from Portal
```js
const handleCancel = async (bookingId, reason) => {
  const res = await authFetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'DELETE',
    body: JSON.stringify({ reason })
  });
  if (res.ok) {
    const data = await res.json();
    // data.refundStatus: 'eligible' | 'not_eligible'
    // Show appropriate message
  }
};
```
### Profile — `/portal/profile`
```js
// GET /api/patients/profile → pre-fill form
// Fields: name (editable), email (read-only), phone, DOB, address, medical history
// Medical history: allergies, medications, past procedures, conditions
// Document uploads: X-rays, insurance cards → POST /api/patients/documents (multipart)
// Submit changes: PUT /api/patients/profile
```
### API Contracts
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/bookings/my` | GET | Patient's bookings (filter: status) | JWT (patient) |
| `/api/bookings/:id/reschedule` | PUT | Reschedule (by patient) | JWT (patient) |
| `/api/bookings/:id/cancel` | DELETE | Cancel (by patient) | JWT (patient) |
| `/api/patients/profile` | GET/PUT | Get or update profile | JWT (patient) |
| `/api/patients/documents` | POST | Upload documents | JWT (patient) |
| `/api/loyalty/balance` | GET | Points balance | JWT (patient) |
| `/api/loyalty/history` | GET | Points transaction history | JWT (patient) |
| `/api/loyalty/referral/generate` | POST | Generate referral code | JWT (patient) |
| `/api/notifications/my` | GET | Patient notifications | JWT (patient) |
---
## FL-06: Contact Page
### Frontend
```js
const [form, setForm] = useState({
  name: '', email: '', phone: '', treatmentInterest: '', message: ''
});
const [submitted, setSubmitted] = useState(false);
const [errors, setErrors] = useState({});
const validate = () => {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Name is required';
  if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
  if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Valid 10-digit phone required';
  if (!form.message.trim()) errs.message = 'Message is required';
  if (form.message.length > 500) errs.message = 'Max 500 characters';
  return errs;
};
const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) { setErrors(errs); return; }
  // Honeypot check (hidden field must be empty)
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  });
  if (res.ok) { setSubmitted(true); setForm({ name:'', email:'', phone:'', treatmentInterest:'', message:'' }); }
};
```
**Emergency Contact section:** Highlighted banner with after-hours emergency number and brief first-aid guide.
### Backend Logic
1. Receive `{ name, email, phone, treatmentInterest, message }` → validate server-side
2. Insert into `contact_submissions` (status = `new`, priority based on treatmentInterest)
3. Send auto-reply email: *"Thank you! Reference #[ID]. We'll contact you within 24 hours."*
4. Create admin dashboard notification (priority: High if treatmentInterest = "Emergency")
5. Send email to clinic inbox
| Endpoint | Method | Request | Auth |
|---|---|---|---|
| `/api/contact` | POST | `{ name, email, phone, treatmentInterest, message }` | Public |
---
## FL-07: Website Chatbot
### Frontend — Floating Widget
```js
const [messages, setMessages] = useState([]);
const [isOpen, setIsOpen] = useState(false);
const [isListening, setIsListening] = useState(false);
const [voiceEnabled, setVoiceEnabled] = useState(false);
const [isTyping, setIsTyping] = useState(false);
const [sessionId] = useState(() => crypto.randomUUID());
const sendMessage = async (text) => {
  setMessages(prev => [...prev, { role: 'user', text }]);
  setIsTyping(true);
  const res = await fetch('/api/chatbot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, sessionId })
  });
  const { reply, intent, quickReplies } = await res.json();
  setMessages(prev => [...prev, { role: 'bot', text: reply, quickReplies }]);
  setIsTyping(false);
  // Voice output
  if (voiceEnabled) {
    const audioRes = await fetch('/api/chatbot/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reply })
    });
    const blob = await audioRes.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
};
// Voice input via Web Speech API
const startListening = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';
  recognition.onresult = (e) => sendMessage(e.results[0][0].transcript);
  recognition.start();
  setIsListening(true);
  recognition.onend = () => setIsListening(false);
};
```
### Quick Reply Buttons
Default: `["📅 Book Appointment", "🦷 Treatments", "⏰ Clinic Hours", "🎉 Offers", "📞 Contact Us"]`
Clicking sends the button text as a message → intent classification on backend.
### Backend Intent Classification
| Intent | Keywords | Response |
|---|---|---|
| `book_appointment` | book, appointment, schedule | Booking page link + available times preview |
| `treatment_info` | root canal, implant, whitening, braces, etc. | Brief summary + link to detail page |
| `clinic_hours` | hours, open, close, timing | Formatted working hours |
| `location` | where, address, location, directions | Address + Google Maps link |
| `fees_pricing` | cost, price, fee, charge, expensive | Price ranges + consultation link |
| `insurance` | insurance, claim | Accepted providers list |
| `current_offers` | offer, discount, promo, deal | Active offers from `/api/content/offers` |
| `callback_request` | call me, callback, speak, human | Collect name/phone → admin notification |
| `complaint` | complaint, unhappy, bad, problem | Apology → escalation to human |
| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/api/chatbot/message` | POST | `{ message, sessionId }` | `{ reply, intent, quickReplies[] }` |
| `/api/chatbot/voice` | POST | `{ text }` | MP3 audio blob |
---
## FL-08: Admin Dashboard
### Layout & Navigation
Sidebar: Patients | Calendar | Slots | Contacts | Chats | Blog | Testimonials | Offers | Gallery | Careers | Analytics | Settings
Top bar: Notification bell (with badge count) + user menu (profile, logout)
### Key Pages
**Patient List — `/admin/patients`**
```js
// Paginated, searchable, filterable
const [patients, setPatients] = useState([]);
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);
useEffect(() => {
  adminFetch(`/api/admin/patients?search=${search}&page=${page}&limit=20`)
    .then(setPatients);
}, [search, page]);
// Table: Name | Phone | Email | Last Visit | Total Visits | Actions
// [View Details] → side panel with full history
// [Export CSV] → GET /api/admin/patients/export
```
**Booking Calendar — `/admin/calendar`**
```js
// Day/Week/Month views with color-coded appointments
// Colors: confirmed=green, pending=yellow, cancelled=red, completed=blue, no-show=grey
// Drag-and-drop to reschedule: PUT /api/admin/bookings/:id/reschedule
// Click appointment → detail panel with all info + actions
```
**Notification Center**
```js
// Real-time via WebSocket or polling every 30s
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
useEffect(() => {
  const ws = new WebSocket(`wss://${host}/ws/notifications`);
  ws.onmessage = (e) => {
    const notif = JSON.parse(e.data);
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
    // Play notification sound
  };
  return () => ws.close();
}, []);
// Mark read: PUT /api/admin/notifications/:id/read
```
**Analytics — `/admin/analytics`**
```js
// Charts (use Chart.js or Recharts)
// GET /api/admin/analytics?period=week|month|year&metric=bookings|revenue|no-shows|treatments
// Dashboard cards: Today's bookings, Today's revenue, New patients this week, No-show rate
// Charts: Booking trend (line), Revenue (bar), Treatment popularity (pie/donut)
// Filters: date range, dentist, treatment
// Export: GET /api/admin/analytics/export?format=csv|pdf
```
### CMS Pages (Content Management)
**Video Testimonials Manager — `/admin/testimonials/video`**
```js
// CRUD: GET/POST /api/content/video-testimonials
// Table: Thumbnail | Patient Name | Treatment | Rating | Status | Featured | Actions
// Add New: Upload video (or paste YouTube/Vimeo URL), set thumbnail, fill metadata
// Drag-and-drop reorder for display priority
// Toggle "Featured" (max 6 for homepage carousel)
// Status: Draft → Approved → Published / Removed
```
**Blog Manager — `/admin/blog`**
```js
// Rich text editor (e.g., TipTap or React-Quill)
// Fields: title, body, category, author (dentist dropdown), featured image
// SEO: meta title, meta description, slug (auto-gen from title), OG image
// Status: Draft → Ready → Published | Scheduled (with date/time picker)
// POST /api/content/blog (create), PUT /api/content/blog/:slug (edit)
```
**Offer Manager — `/admin/offers`**
```js
// Create: title, description, discount type (% / ₹ / free), applicable treatments,
//         promo code, validity dates, T&C, max redemptions
// Status: Draft → Active → Expired/Deactivated
// Dashboard: redemption count vs max, revenue impact
// POST /api/content/offers, PUT /api/content/offers/:id
```
**Gallery Manager — `/admin/gallery`**
```js
// Upload images to Cloudinary/S3 → receive CDN URLs
// Categories: Clinic Tour | Smile Transformations | Events | Team
// Before/After pairs: upload 2 images + treatment label
// Drag-and-drop reorder, toggle visibility
// POST /api/content/gallery, DELETE /api/content/gallery/:id
```
### Admin API Contracts
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/admin/patients` | GET | List patients (paginated, searchable) | JWT (admin/receptionist) |
| `/api/admin/patients/export` | GET | Export patient list CSV | JWT (admin) |
| `/api/admin/bookings` | GET/POST | List or create bookings | JWT (admin/receptionist) |
| `/api/admin/bookings/:id` | PUT/DELETE | Edit or cancel booking | JWT (admin/receptionist) |
| `/api/admin/slots/bulk` | PUT | Bulk update slot availability | JWT (admin) |
| `/api/admin/notifications` | GET | List notifications | JWT (admin/receptionist) |
| `/api/admin/analytics` | GET | Dashboard analytics data | JWT (admin) |
| `/api/admin/analytics/export` | GET | Export reports (CSV/PDF) | JWT (admin) |
| `/api/admin/escalations` | GET/PUT | List & resolve chatbot escalations | JWT (admin/receptionist) |
| `/api/content/video-testimonials` | GET/POST/PUT/DELETE | Manage video testimonials | JWT (admin) |
| `/api/content/blog` | GET/POST | List/create blog posts | JWT (admin) |
| `/api/content/blog/:slug` | PUT/DELETE | Edit/delete blog post | JWT (admin) |
| `/api/content/offers` | GET/POST/PUT | Manage offers | JWT (admin) |
| `/api/content/gallery` | GET/POST/DELETE | Manage gallery items | JWT (admin) |
| `/api/content/faqs` | GET/POST/PUT/DELETE | Manage FAQ items | JWT (admin) |
| `/api/content/careers` | GET/POST/PUT | Manage job listings | JWT (admin) |
| `/api/content/settings` | GET/PUT | Site settings (hours, banner, etc.) | JWT (admin) |
---
## FL-09: Email Notifications
### Templates (Handlebars)
| Template | Trigger | Key Data | Attachment |
|---|---|---|---|
| `booking_confirmed.hbs` | New booking confirmed | name, treatment, dentist, date, time, bookingId | `.ics` invite |
| `booking_rescheduled.hbs` | Booking rescheduled | name, oldDate, newDate, newTime, bookingId | Updated `.ics` |
| `booking_cancelled.hbs` | Booking cancelled | name, date, refundStatus, bookingId | — |
| `appointment_reminder.hbs` | 24h before | name, treatment, date, time, address, mapLink | — |
| `payment_receipt.hbs` | Payment captured | name, amount, transactionId, bookingId | — |
| `refund_confirmation.hbs` | Refund processed | name, amount, refundId, timeline | — |
| `contact_auto_reply.hbs` | Contact form submitted | name, referenceId | — |
| `password_reset.hbs` | Password reset requested | name, otpCode, expiresIn | — |
| `feedback_request.hbs` | 2h post-appointment | name, treatment, feedbackLink, googleReviewLink | — |
| `welcome.hbs` | Registration complete | name, portalLink | — |
| `referral_bonus.hbs` | Referral reward credited | name, points, friendName | — |
| `newsletter.hbs` | Newsletter campaign | dynamic content blocks | — |
### .ics Calendar Generation
```js
const generateICS = (booking) => {
  const dtStart = formatICSDate(booking.appointmentDate);
  const dtEnd = formatICSDate(addMinutes(booking.appointmentDate, 30));
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmileCare//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@smilecare
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Dental Appointment - ${booking.treatment.name}
DESCRIPTION:Appointment with Dr. ${booking.dentist.name}\\nBooking ID: ${booking.id}\\nTreatment: ${booking.treatment.name}
LOCATION:SmileCare Dental Clinic, [Clinic Address]
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Dental appointment in 1 hour
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
};
```
### Email Sending Logic
```js
const sendEmail = async (to, templateName, data, attachments = []) => {
  const template = loadTemplate(templateName); // compile HBS
  const html = template(data);
  const subject = emailSubjects[templateName](data);
  await transporter.sendMail({
    from: '"SmileCare Dental" <noreply@smilecare.com>',
    to,
    subject,
    html,
    attachments // [{ filename: 'appointment.ics', content: icsContent }]
  });
  // Log in communication_logs
  await db.communicationLog.create({
    data: { type: 'email', recipient: to, template: templateName, status: 'sent', sentAt: new Date() }
  });
};
```
---
## FL-10: WhatsApp Integration
### Webhook Handler
```js
// GET — Verify webhook subscription
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else res.sendStatus(403);
});
// POST — Handle incoming messages
app.post('/api/webhooks/whatsapp', async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately
  const message = extractMessage(req.body);
  if (!message) return;
  const { from, text } = message;
  const session = await getOrCreateSession(from);
  const intent = classifyIntent(text, session.context);
  const response = await generateResponse(intent, session);
  await sendWhatsAppMessage(from, response);
  await logMessage(from, text, response, intent);
});
```
### Message Sending
```js
// Text message
async function sendWhatsAppMessage(to, body) {
  await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, text: { body } })
  });
}
// Template message (for confirmations, reminders, etc.)
async function sendWhatsAppTemplate(to, templateName, params) {
  await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: p })) }]
      }
    })
  });
}
```
---
## FL-11: Razorpay Payment Logic
### Frontend Integration
```js
// Load Razorpay script dynamically
const loadRazorpay = () => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = resolve;
  document.body.appendChild(script);
});
```
### Backend — Create Order
```js
const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
app.post('/api/payments/create-order', async (req, res) => {
  const { amount, treatmentId, slotId, promoCode } = req.body;
  let finalAmount = amount || 5000; // default ₹50
  // Apply promo discount
  if (promoCode) {
    const promo = await db.promoCode.findUnique({ where: { code: promoCode } });
    if (promo?.isActive) finalAmount = Math.max(0, finalAmount - promo.discountPaise);
  }
  const order = await rzp.orders.create({
    amount: finalAmount, currency: 'INR', receipt: `booking_${Date.now()}`
  });
  await db.payment.create({
    data: { orderId: order.id, amount: finalAmount, status: 'created', treatmentId, slotId }
  });
  res.json({ orderId: order.id, amount: finalAmount, currency: 'INR' });
});
```
### Backend — Verify Payment
```js
const crypto = require('crypto');
app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ verified: false, error: 'Invalid signature' });
  }
  await db.payment.update({
    where: { orderId: razorpay_order_id },
    data: { paymentId: razorpay_payment_id, status: 'captured', capturedAt: new Date() }
  });
  res.json({ verified: true });
});
```
### Backend — Refund
```js
app.post('/api/payments/refund/:bookingId', async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.bookingId }, include: { payment: true } });
  if (!booking || booking.payment.status !== 'captured') {
    return res.status(400).json({ error: 'No capturable payment found' });
  }
  // Check eligibility (≥24h policy)
  const hoursUntil = (new Date(booking.appointmentDate) - new Date()) / 3600000;
  if (hoursUntil < 24 && !req.body.adminOverride) {
    return res.status(400).json({ error: 'Cancellation within 24h — no refund unless admin override' });
  }
  const refund = await rzp.payments.refund(booking.payment.paymentId, { amount: booking.payment.amount });
  await db.refund.create({
    data: { bookingId: booking.id, paymentId: booking.payment.id, razorpayRefundId: refund.id,
            amount: refund.amount, status: 'processing' }
  });
  res.json({ refundId: refund.id, status: 'processing', amount: refund.amount });
});
```
### Webhook for async status updates
```js
app.post('/api/webhooks/razorpay', async (req, res) => {
  const { event, payload } = req.body;
  // Verify webhook signature from headers
  switch (event) {
    case 'payment.captured':
      await db.payment.update({ where: { paymentId: payload.payment.entity.id }, data: { status: 'captured' } });
      break;
    case 'payment.failed':
      await db.payment.update({ where: { orderId: payload.payment.entity.order_id }, data: { status: 'failed' } });
      break;
    case 'refund.processed':
      await db.refund.update({ where: { razorpayRefundId: payload.refund.entity.id }, data: { status: 'completed' } });
      break;
  }
  res.sendStatus(200);
});
```
---
## FL-12: Blog Page *(NEW)*
### Frontend — Hub `/blog`
```js
const [posts, setPosts] = useState([]);
const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [page, setPage] = useState(1);
useEffect(() => {
  const params = new URLSearchParams({ page, limit: 9 });
  if (selectedCategory !== 'all') params.append('category', selectedCategory);
  if (searchQuery) params.append('search', searchQuery);
  fetch(`/api/content/blog?${params}`).then(r => r.json()).then(setPosts);
}, [page, selectedCategory, searchQuery]);
// UI: Grid of post cards (image, title, excerpt, author, date, category tag)
// Sidebar: Popular posts, categories, newsletter signup
```
### Frontend — Detail `/blog/[slug]`
```js
const [post, setPost] = useState(null);
const [relatedPosts, setRelatedPosts] = useState([]);
useEffect(() => {
  fetch(`/api/content/blog/${slug}`).then(r => r.json()).then(setPost);
  fetch(`/api/content/blog?related=${slug}&limit=3`).then(r => r.json()).then(setRelatedPosts);
}, [slug]);
// SEO: Dynamic <title>, <meta description>, Open Graph tags, JSON-LD BlogPosting schema
// Social share buttons: WhatsApp, Facebook, Twitter/X, LinkedIn, Copy Link
// Author card: dentist mini-profile
// CTA banner: "Book a consultation →"
// Related posts at bottom
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/content/blog` | GET | List posts (paginated, filterable) | Public |
| `/api/content/blog/:slug` | GET | Full post detail | Public |
---
## FL-13: FAQ Page *(NEW)*
### Frontend — `/faq`
```js
const [faqCategories, setFaqCategories] = useState([]);
const [openIndex, setOpenIndex] = useState(null);
useEffect(() => {
  fetch('/api/content/faqs').then(r => r.json()).then(setFaqCategories);
}, []);
// Categories: General, Appointments, Treatments, Pricing, COVID-19
// Accordion: click question to expand/collapse answer
// Schema.org FAQPage markup for Google rich snippets
// Bottom CTA: "Still have questions? Chat with us →" (opens chatbot)
```
### Schema Markup (Auto-generated)
```js
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": allFaqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
  }))
};
// Injected as <script type="application/ld+json"> in <head>
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/content/faqs` | GET | All FAQ items grouped by category | Public |
---
## FL-14: Offers Page *(NEW)*
### Frontend — `/offers`
```js
const [activeOffers, setActiveOffers] = useState([]);
const [expiredOffers, setExpiredOffers] = useState([]);
useEffect(() => {
  fetch('/api/content/offers?status=active').then(r => r.json()).then(setActiveOffers);
  fetch('/api/content/offers?status=expired&limit=5').then(r => r.json()).then(setExpiredOffers);
}, []);
// Active: Cards with title, description, promo code (copy button), validity, T&C, "Book Now" CTA
// "Book Now" → /booking?promo=[code]&treatment=[id]
// Expired: Greyed out cards (for transparency/SEO)
// EMI Plans section: treatment-wise EMI breakdown table
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/content/offers` | GET | List offers (filter: active/expired) | Public |
---
## FL-15: Gallery Page *(NEW)*
### Frontend — `/gallery`
```js
const [activeTab, setActiveTab] = useState('clinic-tour');
const [items, setItems] = useState([]);
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxIndex, setLightboxIndex] = useState(0);
useEffect(() => {
  fetch(`/api/content/gallery?category=${activeTab}`).then(r => r.json()).then(setItems);
}, [activeTab]);
// Tabs: Clinic Tour | Smile Transformations | Events & Camps | Team
// Grid layout with lazy loading
// Click image → lightbox (full-screen view with prev/next)
// Before/After: interactive drag slider component
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/content/gallery` | GET | Gallery items by category | Public |
---
## FL-16: Careers Page *(NEW)*
### Frontend — `/careers`
```js
const [jobs, setJobs] = useState([]);
const [applicationForm, setApplicationForm] = useState({ name:'', email:'', phone:'', position:'', coverNote:'' });
const [resume, setResume] = useState(null);
useEffect(() => {
  fetch('/api/content/careers?status=active').then(r => r.json()).then(setJobs);
}, []);
// List: Job cards (title, type, description) with "Apply Now" button
// Apply: Modal form with name, email, phone, position dropdown, resume upload (PDF, max 5MB), cover note
const handleApply = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  Object.entries(applicationForm).forEach(([k, v]) => formData.append(k, v));
  formData.append('resume', resume);
  await fetch('/api/content/careers/apply', { method: 'POST', body: formData });
};
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/content/careers` | GET | Active job listings | Public |
| `/api/content/careers/apply` | POST | Submit application (multipart) | Public |
---
## FL-17: Loyalty & Referral System *(NEW)*
### Points Display (Patient Portal)
```js
// Portal Dashboard component
const LoyaltyWidget = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  useEffect(() => {
    authFetch('/api/loyalty/balance').then(d => setBalance(d.balance));
    authFetch('/api/loyalty/history').then(setHistory);
    authFetch('/api/loyalty/referral/generate').then(d => setReferralCode(d.code));
  }, []);
  // UI: Points balance card, transaction history table,
  //     referral link (copy button + WhatsApp share),
  //     "Redeem" button (during next booking)
};
```
### Backend — Points Earning (Auto-triggered)
```js
// Called by Booking Agent when appointment marked 'completed'
const creditPoints = async (patientId, treatmentTier) => {
  const pointsMap = { general: 50, standard: 100, premium: 200 };
  const points = pointsMap[treatmentTier] || 50;
  await db.loyaltyTransaction.create({
    data: { patientId, points, type: 'earned', reason: `Completed ${treatmentTier} treatment` }
  });
  await db.patient.update({
    where: { id: patientId },
    data: { loyaltyPoints: { increment: points } }
  });
  // Notify patient
  await notifyAgent.send(patientId, 'referral_bonus', { points });
};
```
### Referral Validation
```js
app.post('/api/loyalty/referral/validate', async (req, res) => {
  const { code } = req.body;
  const referrer = await db.patient.findFirst({ where: { referralCode: code } });
  if (!referrer) return res.status(400).json({ valid: false });
  res.json({ valid: true, referrerName: referrer.name.split(' ')[0] });
});
// After referred patient completes first appointment:
// Credit 200 points to referrer + 200 points to new patient
```
| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/loyalty/balance` | GET | Current points | JWT (patient) |
| `/api/loyalty/history` | GET | Transaction log | JWT (patient) |
| `/api/loyalty/referral/generate` | POST | Get/create referral code | JWT (patient) |
| `/api/loyalty/referral/validate` | POST | Check referral code | Public |
| `/api/loyalty/redeem` | POST | Redeem points for discount | JWT (patient) |
| `/api/loyalty/promo/validate` | POST | Validate promo code | Public |
