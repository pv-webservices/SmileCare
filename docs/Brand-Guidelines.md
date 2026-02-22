# Brand Guidelines
## SmileCare — Visual Identity & Design System
> **Document Version:** 2.0  
> **Last Updated:** 2026-02-22  
> **Audience:** Designers, Developers, Content Writers, Marketing  
> **Related Docs:** [PRD](./01-PRD.md) · [Feature Logic](./05-Feature-Logic.md)
---
## 📋 Table of Contents
| # | Section |
|---|---------|
| 1 | [Brand Identity](#1-brand-identity) |
| 2 | [Color System](#2-color-system) |
| 3 | [Typography](#3-typography) |
| 4 | [Spacing & Layout](#4-spacing--layout) |
| 5 | [Component Design Tokens](#5-component-design-tokens) |
| 6 | [UI Components](#6-ui-components) |
| 7 | [Iconography](#7-iconography) |
| 8 | [Imagery & Media](#8-imagery--media) |
| 9 | [Voice & Tone](#9-voice--tone) |
| 10 | [Mobile-First UX Principles](#10-mobile-first-ux-principles) |
| 11 | [Email Template Design](#11-email-template-design) |
| 12 | [Dark Mode (Future)](#12-dark-mode-future-scope) |
| 13 | [Print Styles](#13-print-styles) |
---
## 1. Brand Identity
### Brand Essence
| Attribute | Value |
|---|---|
| **Brand Name** | SmileCare Dental Clinic |
| **Tagline** | *"Your Smile, Our Priority"* |
| **Brand Promise** | Modern, gentle dental care with a seamless digital experience |
| **Brand Personality** | Trustworthy · Caring · Professional · Modern · Approachable |
| **Target Audience** | Urban patients (25–55), tech-savvy, value convenience and quality |
### Brand Values
| Value | Expression |
|---|---|
| **Trust** | Blue color palette, verified credentials, transparent pricing, real testimonials |
| **Care** | Warm language, follow-up messages, patient-first design, accessibility compliance |
| **Excellence** | Premium design, smooth animations, fast performance, modern technology |
| **Convenience** | Online booking, WhatsApp support, chatbot assistance, mobile-first UX |
### Logo Usage
| Rule | Guideline |
|---|---|
| **Primary Logo** | Full logo (icon + wordmark). Use on headers, emails, print materials. |
| **Icon Only** | Favicon, app icon, small spaces (<40px height). |
| **Clear Space** | Minimum padding = height of icon on all sides. |
| **Minimum Size** | Full logo: 120px wide. Icon only: 24px. |
| **Backgrounds** | Use on white/light backgrounds. On dark → use white-reversed version. |
| **Don'ts** | ❌ Never stretch, rotate, recolor, add effects, or place on busy/patterned backgrounds. |
---
## 2. Color System
### Primary Palette
| Swatch | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| 🔵 | **Primary Blue** | `#0066CC` | `rgb(0, 102, 204)` | Headers, nav bar, primary buttons, links, focus rings |
| 🔵 | Primary Blue Dark | `#004C99` | `rgb(0, 76, 153)` | Hover states on primary buttons, active nav items |
| 🔵 | Primary Blue Light | `#E3F2FD` | `rgb(227, 242, 253)` | Info banners, selected states, light backgrounds |
### Secondary Palette
| Swatch | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| 🟢 | **Secondary Green** | `#2E7D32` | `rgb(46, 125, 50)` | Success states, health icons, badges, trust indicators |
| 🟢 | Secondary Green Dark | `#1B5E20` | `rgb(27, 94, 32)` | Hover on green elements |
| 🟢 | Secondary Green Light | `#E8F5E9` | `rgb(232, 245, 233)` | Success backgrounds, confirmation banners |
### Accent Palette
| Swatch | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| 🟠 | **Accent Orange** | `#F57C00` | `rgb(245, 124, 0)` | CTA buttons ("Book Appointment"), promo badges, urgent notices |
| 🟠 | Accent Orange Dark | `#E65100` | `rgb(230, 81, 0)` | Hover state on CTAs |
| 🟠 | Accent Orange Light | `#FFF3E0` | `rgb(255, 243, 224)` | Promo banners, offer card backgrounds |
### Semantic Colors
| Swatch | Name | Hex | Usage |
|---|---|---|---|
| 🟢 | Success | `#2E7D32` | Booking confirmed, payment verified, form success |
| 🔴 | Error | `#D32F2F` | Validation errors, payment failed, destructive alerts |
| 🟡 | Warning | `#F9A825` | Slot almost full, offer expiring, attention needed |
| 🔵 | Info | `#1976D2` | Tooltips, help text, informational banners |
### Neutral Palette
| Swatch | Name | Hex | Usage |
|---|---|---|---|
| ⬜ | White | `#FFFFFF` | Page backgrounds, card backgrounds, input fields |
| 🔲 | Grey 50 | `#FAFAFA` | Alternate section backgrounds |
| 🔲 | Grey 100 | `#F5F5F5` | Surface backgrounds, sidebar, inactive tabs |
| 🔲 | Grey 200 | `#EEEEEE` | Borders, dividers, card outlines |
| 🔲 | Grey 400 | `#BDBDBD` | Placeholder text, disabled states |
| 🔲 | Grey 600 | `#757575` | Secondary text, captions, labels |
| 🔲 | Grey 800 | `#424242` | Body text, icons |
| ⬛ | Grey 900 | `#212121` | Headings, high-emphasis text |
### CSS Color Tokens
```css
:root {
  /* Primary */
  --color-primary: #0066CC;
  --color-primary-dark: #004C99;
  --color-primary-light: #E3F2FD;
  /* Secondary */
  --color-secondary: #2E7D32;
  --color-secondary-dark: #1B5E20;
  --color-secondary-light: #E8F5E9;
  /* Accent */
  --color-accent: #F57C00;
  --color-accent-dark: #E65100;
  --color-accent-light: #FFF3E0;
  /* Semantic */
  --color-success: #2E7D32;
  --color-error: #D32F2F;
  --color-warning: #F9A825;
  --color-info: #1976D2;
  /* Neutrals */
  --color-white: #FFFFFF;
  --color-grey-50: #FAFAFA;
  --color-grey-100: #F5F5F5;
  --color-grey-200: #EEEEEE;
  --color-grey-400: #BDBDBD;
  --color-grey-600: #757575;
  --color-grey-800: #424242;
  --color-grey-900: #212121;
  /* Text */
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-text-disabled: #BDBDBD;
  --color-text-inverse: #FFFFFF;
  --color-text-link: #0066CC;
  --color-text-link-hover: #004C99;
}
```
### Accessibility — Contrast Ratios (WCAG 2.1)
| Combination | Ratio | WCAG Level |
|---|---|---|
| Grey 900 on White | 16.1:1 | ✅ AAA |
| Grey 800 on White | 9.7:1 | ✅ AAA |
| Primary Blue on White | 5.0:1 | ✅ AA |
| White on Secondary Green | 4.9:1 | ✅ AA |
| White on Primary Blue | 5.0:1 | ✅ AA |
| Accent Orange on White | 3.4:1 | ⚠️ AA Large text only (≥18px bold) |
| White on Accent Orange | 3.4:1 | ⚠️ Use bold/large text only |
> [!IMPORTANT]
> Body text must always meet **WCAG AA (≥4.5:1)**. Accent Orange is reserved for **large/bold CTA button text only**.
---
## 3. Typography
### Font Family
| Role | Font | Fallback Stack | Source |
|---|---|---|---|
| **Primary** | Inter | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Google Fonts (variable weight) |
| **Alternative** | Open Sans / Lato | Same fallback stack | If Inter unavailable |
| **Monospace** | JetBrains Mono | `'JetBrains Mono', 'Fira Code', 'Courier New', monospace` | Booking IDs, code snippets |
### Type Scale
| Element | Desktop | Mobile | Weight | Line Height | Color | Spacing |
|---|---|---|---|---|---|---|
| **Display** | 48px / 3rem | 32px / 2rem | 700 Bold | 1.2 | Grey 900 | -0.02em |
| **H1** | 36px / 2.25rem | 28px / 1.75rem | 700 Bold | 1.25 | Grey 900 | -0.01em |
| **H2** | 28px / 1.75rem | 24px / 1.5rem | 600 SemiBold | 1.3 | Grey 900 | -0.01em |
| **H3** | 22px / 1.375rem | 20px / 1.25rem | 600 SemiBold | 1.35 | Grey 900 | 0 |
| **H4** | 18px / 1.125rem | 16px / 1rem | 600 SemiBold | 1.4 | Grey 800 | 0 |
| **Body Large** | 18px | 16px | 400 Regular | 1.6 | Grey 800 | 0 |
| **Body** | 16px / 1rem | 16px / 1rem | 400 Regular | 1.6 | Grey 800 | 0 |
| **Body Small** | 14px | 14px | 400 Regular | 1.5 | Grey 600 | 0 |
| **Caption** | 12px | 12px | 400 Regular | 1.4 | Grey 600 | 0.02em |
| **Button** | 14–16px | 14px | 500 Medium | 1.0 | White (inverse) | 0.05em |
| **Overline** | 12px | 12px | 500 Medium | 1.4 | Grey 600 | 0.1em |
### CSS Typography Tokens
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.375rem;   /* 22px */
  --text-2xl: 1.75rem;   /* 28px */
  --text-3xl: 2.25rem;   /* 36px */
  --text-4xl: 3rem;      /* 48px */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
}
```
---
## 4. Spacing & Layout
### 8px Grid System
All spacing follows an **8px baseline grid** for visual rhythm and consistency.
```css
:root {
  --space-1: 4px;    /* 0.25rem — micro gaps */
  --space-2: 8px;    /* 0.5rem  — tight spacing */
  --space-3: 12px;   /* 0.75rem */
  --space-4: 16px;   /* 1rem   — default gap */
  --space-5: 20px;   /* 1.25rem */
  --space-6: 24px;   /* 1.5rem — form field gaps */
  --space-8: 32px;   /* 2rem   — section inner padding */
  --space-10: 40px;  /* 2.5rem */
  --space-12: 48px;  /* 3rem   — section spacing */
  --space-16: 64px;  /* 4rem   — section separation */
  --space-20: 80px;  /* 5rem   — hero/major separation */
  --space-24: 96px;  /* 6rem */
}
```
### Spacing Application
| Context | Desktop | Mobile |
|---|---|---|
| Page max-width | 1280px (centered) | 100% |
| Page side padding | 32px (`--space-8`) | 16px (`--space-4`) |
| Section vertical spacing | 80px (`--space-20`) | 48px (`--space-12`) |
| Section internal padding | 48px top/bottom | 32px top/bottom |
| Card padding | 24px | 16px |
| Form field gap | 24px | 16px |
| Heading margin-bottom | 16px | 12px |
| Paragraph margin-bottom | 16px | 12px |
| Button group gap | 12px | 8px |
### Responsive Breakpoints
| Breakpoint | Name | Columns | Gutter | Usage |
|---|---|---|---|---|
| < 480px | **XS** (Phone) | 1 | 16px | Single column — fully stacked |
| 480–768px | **SM** (Large Phone) | 1–2 | 16px | One or two column layouts |
| 768–1024px | **MD** (Tablet) | 2–3 | 24px | Treatment cards 2-col, forms centered |
| 1024–1280px | **LG** (Desktop) | 3–4 | 24px | Full multi-column layouts |
| > 1280px | **XL** (Wide Desktop) | 4 | 32px | Max-width container, centered |
```css
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
@media (min-width: 768px)  { /* tablet+ */ }
@media (min-width: 1024px) { /* desktop */ }
```
---
## 5. Component Design Tokens
### Border Radius
```css
:root {
  --radius-sm: 4px;       /* chips, tags, small badges */
  --radius-md: 8px;       /* cards, inputs, dropdowns */
  --radius-lg: 12px;      /* modals, large cards */
  --radius-xl: 16px;      /* hero sections, feature cards */
  --radius-full: 9999px;  /* pills, avatars, circular buttons */
}
```
### Shadows
```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-glow-blue: 0 0 0 3px rgba(0,102,204,0.3);    /* focus ring */
  --shadow-glow-orange: 0 0 0 3px rgba(245,124,0,0.3);  /* CTA focus ring */
}
```
### Transitions & Animations
```css
:root {
  --transition-fast: 150ms ease;    /* hover effects, toggles */
  --transition-base: 250ms ease;    /* general transitions */
  --transition-slow: 350ms ease;    /* modals, drawers */
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy */
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { max-height: 0; opacity: 0; } to { max-height: 500px; opacity: 1; } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
---
## 6. UI Components
### Buttons
| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| **Primary** | `--color-primary` | White | None | "Submit", "Save", "Login" |
| **CTA** | `--color-accent` | White | None | "Book Appointment", "Book Now" |
| **Secondary** | Transparent | `--color-primary` | 2px `--color-primary` | "Cancel", "Learn More" |
| **Ghost** | Transparent | `--color-grey-800` | None | "Skip", "Back" |
| **Danger** | `--color-error` | White | None | "Delete", "Remove" |
| **Disabled** | `--color-grey-200` | `--color-grey-400` | None | Any disabled state |
**Sizes:**
| Size | Height | Padding | Font | Radius |
|---|---|---|---|---|
| Small | 32px | 8px 16px | 13px | `--radius-md` |
| Medium | 40px | 10px 20px | 14px | `--radius-md` |
| Large | 48px | 12px 24px | 16px | `--radius-md` |
| XL (Hero) | 56px | 16px 32px | 16px | `--radius-full` |
**States:**
| State | Visual Change |
|---|---|
| Hover | Background darkens (`--color-*-dark`), subtle lift shadow |
| Focus | Glow ring (`--shadow-glow-*`), outline: none |
| Active | Scale 0.97, shadow removed |
| Loading | Spinner replaces text, pointer-events: none |
| Disabled | 50% opacity, cursor: not-allowed |
### Form Inputs
| Property | Value |
|---|---|
| Height | 44px (touch-target compliant) |
| Padding | 12px 16px |
| Border | 1px solid `--color-grey-200` |
| Border Radius | `--radius-md` |
| Font Size | 16px (prevents iOS auto-zoom) |
| Focus | Border: `--color-primary`, shadow: `--shadow-glow-blue` |
| Error | Border: `--color-error`, red helper text below |
| Label | Above input, 14px, `--font-medium`, `--color-grey-800` |
### Cards
| Property | Value |
|---|---|
| Background | White |
| Border | 1px solid `--color-grey-200` |
| Border Radius | `--radius-lg` |
| Shadow | `--shadow-md` |
| Padding | 24px (desktop), 16px (mobile) |
| Hover (clickable) | Shadow → `--shadow-lg`, translateY(-2px) |
### Badges & Tags
| Variant | Background | Text | Example |
|---|---|---|---|
| Blue | `--color-primary-light` | `--color-primary` | Treatment category |
| Green | `--color-secondary-light` | `--color-secondary` | "Confirmed", "Verified" |
| Orange | `--color-accent-light` | `--color-accent` | "Featured", "New" |
| Red | `#FFEBEE` | `--color-error` | "No-Show", "Urgent" |
| Grey | `--color-grey-100` | `--color-grey-600` | "Draft", "Expired" |
### Modals & Overlays
| Property | Value |
|---|---|
| Backdrop | `rgba(0, 0, 0, 0.5)`, `backdrop-filter: blur(4px)` |
| Container | White, max-width 520px, `--radius-lg`, `--shadow-xl` |
| Padding | 32px |
| Entry | fadeIn (backdrop) + fadeInUp (modal) |
| Close | Top-right × button, 32×32px |
### Toast Notifications
| Type | Icon | Background | Border-Left |
|---|---|---|---|
| Success | ✅ | `--color-secondary-light` | 4px solid `--color-secondary` |
| Error | ❌ | `#FFEBEE` | 4px solid `--color-error` |
| Warning | ⚠️ | `--color-accent-light` | 4px solid `--color-warning` |
| Info | ℹ️ | `--color-primary-light` | 4px solid `--color-info` |
**Behavior:** Top-right (desktop) / top-center (mobile), auto-dismiss after 4s, swipe-to-dismiss on mobile.
---
## 7. Iconography
| Property | Standard |
|---|---|
| **Library** | Lucide React (consistent line-style icons) |
| **Default Size** | 20px (inline), 24px (buttons/cards), 32px (features) |
| **Stroke Width** | 1.5px (consistent across all icons) |
| **Color** | Inherit from parent, or use semantic/brand colors |
| **Touch Target** | Icon buttons: min 44×44px clickable area |
### Icon Usage Map
| Context | Icons |
|---|---|
| Navigation | Menu, X, ChevronDown, User, Bell, Search |
| Treatments | Tooth variants, Smile, Shield, Sparkles |
| Booking | Calendar, Clock, CreditCard, CheckCircle |
| Portal | LayoutDashboard, FileText, Settings, LogOut |
| Chatbot | MessageCircle, Mic, Volume2, Send |
| Status | CheckCircle, XCircle, AlertTriangle, Info |
| Social | Phone, Mail, MapPin, Instagram, Facebook |
---
## 8. Imagery & Media
### Photography Style
| Guideline | Details |
|---|---|
| **Tone** | Warm, natural lighting. Genuine smiles, relaxed patients, modern clinic. |
| **Subjects** | Real/realistic diverse people. Mix of ages, genders, ethnicities. |
| **Avoid** | Overly sterile looks, stock clichés, anxiety-inducing close-ups. |
| **Format** | WebP (fallback JPEG). Max 200KB per image. Use `next/image` with `srcset`. |
### Before & After Gallery
| Rule | Guideline |
|---|---|
| Same angle & lighting | Both photos identical for accurate comparison |
| Patient consent | Written consent form on file for every image |
| UI treatment | Interactive drag slider (not just side-by-side) |
### Video Guidelines
| Property | Standard |
|---|---|
| Duration | Testimonials: 30–90s. Clinic tours: 60–180s. |
| Resolution | Min 720p, preferred 1080p |
| Format | MP4 (H.264), WebM as progressive enhancement |
| Autoplay | ❌ Never autoplay with sound. Thumbnail-first, click to play. |
| Captions | Always provide captions/subtitles |
---
## 9. Voice & Tone
### Brand Voice Attributes
| Attribute | Description | Example |
|---|---|---|
| **Friendly** | Warm, conversational | *"We're here to help you smile with confidence."* |
| **Caring** | Empathetic, reassuring | *"We understand dental visits can feel daunting. That's why we focus on gentle care."* |
| **Professional** | Knowledgeable, credible | *"Our experienced specialists use the latest digital technology."* |
| **Clear** | Simple, jargon-free | *"Schedule an appointment"* — not *"Submit a service request"* |
| **Encouraging** | Positive, action-oriented | *"Take the first step toward your dream smile today."* |
### Tone by Channel
| Channel | Adjustments |
|---|---|
| **Website** | Professional + warm. Benefit-focused headlines. Scannable layout. |
| **Chatbot** | Friendly + concise. Emojis sparingly (🦷📅✅). Quick responses. |
| **WhatsApp** | Conversational + helpful. Templates should feel human, not robotic. |
| **Email** | Professional + personal. Address by name. Clear subject lines. |
| **Error Messages** | Empathetic + helpful. Never blame the user. Offer next steps. |
| **Admin Dashboard** | Concise + functional. Status-focused, data-driven. |
### Writing Do's & Don'ts
| ✅ Do | ❌ Don't |
|---|---|
| Use clear, simple language | Use jargon without explanation |
| Be positive & empathetic (*"We'll take care of you"*) | Use scare tactics (*"Risk losing teeth"*) |
| Use active voice (*"We recommend..."*) | Use passive (*"It is recommended..."*) |
| Address patient directly ("you", "your") | Talk in third person |
| Keep content scannable (bullets, headings) | Write large unbroken paragraphs |
| End with a clear CTA (*"Book your consultation →"*) | Leave users without a next step |
| Write inclusive, gender-neutral language | Make demographic assumptions |
### Error Message Guidelines
| Context | ❌ Bad | ✅ Good |
|---|---|---|
| Validation | *"Invalid input"* | *"Please enter a valid 10-digit phone number"* |
| Not found | *"404 Error"* | *"We couldn't find that page. Try searching or go home."* |
| Payment | *"Transaction failed"* | *"Payment didn't go through. Please try again or use a different method."* |
| No slots | *"No availability"* | *"No slots on this date. Want to try [next available date]?"* |
| Server | *"Internal Server Error"* | *"Something went wrong on our end. Please try again shortly."* |
---
## 10. Mobile-First UX Principles
### Core Principles
| Principle | Implementation |
|---|---|
| **Touch-Friendly** | All tappable elements ≥ 44×44px. Min 16px spacing between targets. |
| **Thumb Zone** | Primary CTAs in bottom 60% of screen. Avoid top corners for actions. |
| **Speed** | Target LCP < 2.5s on 3G. Lazy load images. Minimize JS. Skeleton loaders. |
| **Readability** | Min 16px body text (prevents iOS zoom). High contrast (dark on light). |
| **One-Handed** | Key actions reachable without grip shift. |
### Navigation
| Element | Mobile | Desktop |
|---|---|---|
| **Header** | Sticky 56px. Hamburger + "Book Now" CTA. | Sticky full nav + CTA. |
| **Menu** | Full-screen overlay / slide-in drawer. | Horizontal nav with dropdowns. |
| **Footer** | Accordion sections. Phone + WhatsApp buttons. | Multi-column layout. |
### Communication Links
```html
<!-- Click-to-call -->
<a href="tel:+919876543210" aria-label="Call SmileCare">📞 Call Now</a>
<!-- Click-to-WhatsApp -->
<a href="https://wa.me/919876543210?text=Hi%20SmileCare" aria-label="Chat on WhatsApp">💬 WhatsApp</a>
```
### Mobile Form Optimization
| Practice | Implementation |
|---|---|
| Input types | `type="tel"` (numeric), `type="email"` (@ keyboard), `type="date"` (native picker) |
| Autofill | `autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"` |
| Minimal fields | Only required fields shown. Optional in expandable "More Details". |
| Inline validation | Validate on blur, show error below field immediately. |
| Submit button | Full-width on mobile, sticky at bottom during multi-step flows. |
### Gesture & Feedback
| Gesture | Component | Action |
|---|---|---|
| Swipe left/right | Carousels, galleries | Navigate items |
| Pull down | Patient portal | Refresh data |
| Tap | Buttons, cards, accordions | Primary interaction |
| Pinch zoom | Gallery lightbox | Zoom in/out |
| Interaction | Feedback |
|---|---|
| Button tap | Color change + subtle scale animation |
| Form submit | Spinner replaces button text ("Booking...") |
| Page load | Skeleton shimmer blocks matching layout |
| Success | Green toast + confetti (booking confirmed) |
| Error | Red toast + gentle shake on errored field |
---
## 11. Email Template Design
| Property | Value |
|---|---|
| Max Width | 600px (centered) |
| Background | `#F5F5F5` (outer), `#FFFFFF` (content) |
| Font | Arial, Helvetica, sans-serif (email-safe) |
| Body text | 16px, `#333333` |
| Headings | Bold, `#0066CC` |
| CTA Button | `#F57C00` bg, white text, 44px height, 8px radius |
| Footer | `#757575`, 12px, unsubscribe link |
| Logo | Top-center, max 150px wide |
```
┌──────────────────────────────┐
│  [Logo]                      │
│  SmileCare Dental Clinic     │
├──────────────────────────────┤
│  Hi [Patient Name],          │
│  [Email body content]        │
│  ┌──────────────────────┐    │
│  │  [CTA Button]        │    │
│  └──────────────────────┘    │
│  [Footer details]            │
├──────────────────────────────┤
│  📍 Address | 📞 Phone       │
│  © 2026 SmileCare            │
└──────────────────────────────┘
```
---
## 12. Dark Mode *(Future Scope)*
Planned for v2.0. Design tokens structured to support it:
```css
[data-theme="dark"] {
  --color-bg-primary: #121212;
  --color-bg-surface: #1E1E1E;
  --color-bg-card: #2D2D2D;
  --color-text-primary: #E0E0E0;
  --color-text-secondary: #A0A0A0;
  --color-grey-200: #3D3D3D;
}
@media (prefers-color-scheme: dark) {
  :root { /* Apply dark tokens */ }
}
```
---
## 13. Print Styles
```css
@media print {
  nav, footer, .chat-widget, .cookie-banner,
  .cta-buttons, .back-to-top { display: none !important; }
  body { font-size: 12pt; color: #000; background: #fff; }
  a { color: #000; text-decoration: underline; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 10pt; }
  h1, h2, h3 { page-break-after: avoid; }
  .card, .booking-summary { page-break-inside: avoid; }
}
```
**Print use cases:** Booking confirmation receipts, treatment detail pages, dental care tip articles.
---
## 📊 Quick Reference Card
| Token | Value |
|---|---|
| **Primary color** | `#0066CC` |
| **CTA color** | `#F57C00` |
| **Success color** | `#2E7D32` |
| **Error color** | `#D32F2F` |
| **Body font** | Inter, 16px, 1.6 line-height |
| **Heading font** | Inter Bold |
| **Spacing unit** | 8px grid |
| **Border radius** | 8px (default), 12px (cards), 9999px (pills) |
| **Transition** | 250ms ease |
| **Shadow (card)** | `0 4px 6px -1px rgba(0,0,0,0.08)` |
| **Min tap target** | 44×44px |
| **Max page width** | 1280px |
| **Mobile padding** | 16px |
| **Desktop padding** | 32px |
---
## 📝 Revision History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-10 | Initial brand guidelines (colors, typography, voice, mobile UX basics) | Admin |
| 2.0 | 2026-02-22 | Full design system with CSS tokens, component specs (buttons, forms, cards, modals, toasts, badges), iconography system, imagery/media/video standards, accessibility contrast ratios, responsive breakpoints, animation keyframes, email template design, dark mode prep, print styles, and quick reference card | Admin |
