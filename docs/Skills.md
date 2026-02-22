# Technical Skills & Competency Matrix
## SmileCare — Development Team Requirements
> **Document Version:** 2.0  
> **Last Updated:** 2026-02-22  
> **Related Docs:** [PRD](./01-PRD.md) · [Agents](./03-Agents.md) · [Workflows](./04-Workflows.md) · [Feature Logic](./05-Feature-Logic.md)
---
## Overview
This document defines the technical and soft skills required to build, deploy, and maintain the SmileCare dental clinic platform. Skills are organized by domain, mapped to the system agent(s) they support, and rated by proficiency level.
### Proficiency Legend
| Level | Icon | Meaning |
|-------|------|---------|
| **Expert** | 🔴 | Deep knowledge; can architect solutions, debug complex issues, mentor others |
| **Proficient** | 🟠 | Can work independently; knows best practices and handles edge cases |
| **Working** | 🟡 | Understands fundamentals; can implement features with reference docs |
| **Awareness** | 🟢 | Knows the concept; can read/modify existing code but not design from scratch |
---
## 📋 Skills at a Glance
| # | Skill Domain | Min. Level | Agents Involved |
|---|-------------|------------|-----------------|
| 1 | [JavaScript & TypeScript](#1-javascript--typescript) | 🟠 Proficient | All |
| 2 | [Frontend Development](#2-frontend-development) | 🟠 Proficient | Website, Portal, Dashboard, Chatbot UI |
| 3 | [State Management](#3-state-management) | 🟡 Working | Portal, Booking, Dashboard |
| 4 | [Backend Development](#4-backend-development) | 🟠 Proficient | All backend agents |
| 5 | [Database Management](#5-database-management) | 🟠 Proficient | All agents (shared DB) |
| 6 | [Authentication & Authorization](#6-authentication--authorization) | 🟠 Proficient | Auth Agent |
| 7 | [Payment Integration](#7-payment-integration) | 🟠 Proficient | Payment Agent |
| 8 | [Messaging & Communication APIs](#8-messaging--communication-apis) | 🟡 Working | Notification, WhatsApp Agent |
| 9 | [Chatbot & Voice AI](#9-chatbot--voice-ai) | 🟡 Working | Web Chatbot, WhatsApp Agent |
| 10 | [Background Jobs & Scheduling](#10-background-jobs--scheduling) | 🟡 Working | Reminder Agent |
| 11 | [DevOps & Cloud Infrastructure](#11-devops--cloud-infrastructure) | 🟡 Working | Deployment & Ops |
| 12 | [Testing & Quality Assurance](#12-testing--quality-assurance) | 🟡 Working | All |
| 13 | [Security & Privacy](#13-security--privacy) | 🟠 Proficient | All agents |
| 14 | [Version Control & Collaboration](#14-version-control--collaboration) | 🟠 Proficient | All |
| 15 | [Soft Skills & Communication](#15-soft-skills--communication) | 🟡 Working | Cross-team |
---
## 1. JavaScript & TypeScript
**Min. Level:** 🟠 Proficient  
**Agents:** All components  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| ES6+ syntax | Arrow functions, destructuring, template literals, spread/rest, optional chaining | Everywhere |
| Async programming | `async/await`, Promises, `Promise.all`, error handling with `try/catch` | API calls, DB queries, webhook handlers |
| Modules | ES Modules (`import/export`), CommonJS (`require`) | Frontend & backend |
| Array/Object methods | `map`, `filter`, `reduce`, `find`, `Object.entries`, `Object.keys` | Data transformation |
| TypeScript (preferred) | Interfaces, type guards, generics, enums, utility types | Type-safe API contracts, component props |
| Error handling | Custom error classes, global error middleware, graceful degradation | Backend agents, frontend error boundaries |
### Tools & Runtime
| Tool | Purpose |
|------|---------|
| Node.js (v18+) | Backend runtime |
| npm / pnpm | Package management |
| ESLint + Prettier | Code quality & formatting |
| tsx / ts-node | TypeScript execution |
---
## 2. Frontend Development
**Min. Level:** 🟠 Proficient  
**Agents:** Website pages, Patient Portal, Admin Dashboard, Chatbot UI  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| React (v18+) | Functional components, Hooks, Context, JSX, component lifecycle | All frontend |
| Next.js | File-based routing, SSR/SSG, API routes, `next/image`, middleware | Website, Portal |
| HTML5 semantics | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` | SEO, accessibility |
| CSS3 | Flexbox, Grid, `clamp()`, custom properties (CSS vars), media queries | Responsive design |
| Mobile-first responsive | Design for 320px first, enhance upward; breakpoints at 480/768/1024/1280px | All pages |
| Accessibility (WCAG 2.1 AA) | aria labels, keyboard navigation, focus management, contrast ratios, screen reader testing | All interactive elements |
| Design tokens | CSS custom properties system (`--color-*`, `--space-*`, `--radius-*`) | Entire design system |
| Animation | CSS transitions, keyframe animations, `prefers-reduced-motion` respect | Hover effects, page transitions, chatbot |
### Key Libraries
| Library | Purpose | Where Used |
|---------|---------|------------|
| `react-day-picker` | Calendar/date picker | Booking page (Step 3) |
| `react-hook-form` | Form management | Booking, Contact, Portal |
| `lucide-react` | Icon library | All UI |
| `framer-motion` (optional) | Animation library | Page transitions, modals |
| `swiper` | Carousel/slider | Testimonials, Before/After |
---
## 3. State Management
**Min. Level:** 🟡 Working  
**Agents:** Patient Portal, Booking Flow, Admin Dashboard, Chatbot  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| React Context + useReducer | Global state (auth, user, theme) without external libraries | AuthContext, ChatContext |
| `useState` / `useEffect` | Component-level state, side effects, data fetching | All components |
| Custom hooks | Reusable logic (`useAuth`, `useBooking`, `useChat`, `useSlots`) | Shared across pages |
| Form state & validation | Controlled inputs, regex validation (email, phone), error messages | Booking form, Contact, Registration |
| Token management | Access token in memory, refresh token in `httpOnly` cookie, auto-refresh on 401 | Auth flow |
| Optimistic updates | UI updates before server confirmation for responsiveness | Slot selection, notification read status |
### Validation Rules Reference
| Field | Regex / Rule | Used In |
|-------|-------------|---------|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Register, Booking, Contact |
| Phone | `/^[6-9]\d{9}$/` (Indian 10-digit) | Register, Booking, Contact |
| Password | Min 8 chars, 1 uppercase, 1 number | Register, Password reset |
| Name | Min 2 characters, letters/spaces only | Register, Booking |
| Booking ID | `/^BK-[A-Z0-9]{5}$/` | Reschedule, Cancel |
---
## 4. Backend Development
**Min. Level:** 🟠 Proficient  
**Agents:** All 8 backend agents  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Node.js + Express.js | Server setup, routing, middleware chain, error handling | All API endpoints |
| RESTful API design | Resource-based URLs, proper HTTP methods/status codes, pagination, filtering | All agents |
| Middleware patterns | Auth middleware (JWT verify), rate limiting, CORS, body parsing, request logging | API gateway |
| Input validation | Sanitize all inputs, use `express-validator` or `zod`, prevent injection | Every endpoint |
| Error handling | Centralized error middleware, custom `AppError` class, proper HTTP codes | All agents |
| Webhook handling | Signature verification, idempotency, async processing, 200 quick response | Razorpay, WhatsApp |
| File uploads | Multer or similar, image optimization, Cloudinary upload | Treatment images, gallery |
### API conventions
| Convention | Standard |
|------------|----------|
| Base URL | `/api/v1/*` |
| Success response | `{ success: true, data: {...} }` |
| Error response | `{ success: false, error: { code, message } }` |
| Pagination | `?page=1&limit=20` → `{ data, meta: { page, limit, total, totalPages } }` |
| Date format | ISO 8601 (`2026-02-22T09:30:00+05:30`) |
| Auth header | `Authorization: Bearer <token>` |
---
## 5. Database Management
**Min. Level:** 🟠 Proficient  
**Agents:** All agents (shared PostgreSQL database)  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| PostgreSQL | Relational schema design, indexes, constraints (UNIQUE, FK, CHECK) | All tables |
| Prisma ORM | Schema definition, migrations, queries, relations, transactions | All data access |
| Schema design | Normalization, 1:N and M:N relationships, status enums | users, bookings, payments, slots |
| Migrations | Version-controlled schema changes via `prisma migrate` | Database evolution |
| Transactions | Atomic operations (e.g., release old slot + reserve new slot on reschedule) | Booking Agent |
| Indexing | Index frequently queried columns (email, phone, date, status) for performance | Query optimization |
| Seed data | Initial treatment data, admin accounts, demo slots | Development/staging |
### Key Tables
```
users · patients · dentists · treatments · slots · bookings
payments · refunds · notifications · chat_sessions · chat_messages
contact_submissions · sessions · whatsapp_sessions · whatsapp_messages
```
> See [Agents.md — Database Schema](./03-Agents.md) for full table definitions.
---
## 6. Authentication & Authorization
**Min. Level:** 🟠 Proficient  
**Agent:** Auth Agent  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| JWT (JSON Web Tokens) | Access token (15 min) + refresh token (7 days), signing, verification | Login, API auth |
| bcrypt | Password hashing with 12 salt rounds, `bcrypt.compare()` | Registration, login |
| RBAC | Role-based access control: `patient`, `receptionist`, `dentist`, `admin` | All protected endpoints |
| Token storage | Access token in React state (memory), refresh token in `httpOnly` secure cookie | Frontend auth state |
| Auto-refresh | Axios/fetch interceptor retries on 401 using refresh token | Seamless UX |
| Rate limiting | Max 5 login attempts per 15 min per IP (`express-rate-limit`) | Brute force prevention |
| OTP flow | 6-digit numeric OTP, 10 min expiry, sent via email for password reset | Password recovery |
---
## 7. Payment Integration
**Min. Level:** 🟠 Proficient  
**Agent:** Payment Agent  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Razorpay API | Order creation, Checkout.js integration, server-side verification | Booking payment flow |
| Signature verification | HMAC-SHA256 verification of `razorpay_signature` using server secret | Payment confirmation |
| Webhook processing | Handle `payment.captured`, `payment.failed`, `refund.processed` events | Async payment updates |
| Refund management | Programmatic refund initiation via Razorpay API, status tracking | Cancellation flow |
| PCI compliance | Never store card details; rely on Razorpay's tokenized checkout | Security |
| Error recovery | Handle timeouts, duplicate webhooks (idempotency keys), stale order cleanup | Payment reliability |
### Payment Flow Reference
```
Frontend → create-order → Razorpay Checkout → verify → confirm booking
                                                    ↘ webhook (async backup)
```
---
## 8. Messaging & Communication APIs
**Min. Level:** 🟡 Working  
**Agents:** Notification Agent, WhatsApp Agent  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Nodemailer + SMTP | Sending HTML emails, attachments (.ics), Gmail/custom SMTP setup | All email notifications |
| Handlebars templates | Dynamic HTML email rendering (booking details, patient name, dates) | Email templates |
| .ics generation | Calendar invite file creation and email attachment | Booking confirmation |
| Meta Cloud API | WhatsApp Business messaging: send/receive text and template messages | WhatsApp chatbot |
| Webhook setup | Meta webhook verification (GET) + message receiving (POST) | WhatsApp Agent |
| Template messages | Pre-approved WhatsApp templates with dynamic parameters | Confirmations, reminders |
| Retry logic | Exponential backoff (1s → 5s → 30s) for failed email delivery, max 3 retries | Notification reliability |
### Required API Credentials
| Service | Keys Needed |
|---------|------------|
| SMTP | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` |
| WhatsApp | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN` |
---
## 9. Chatbot & Voice AI
**Min. Level:** 🟡 Working  
**Agents:** Web Chatbot Agent, WhatsApp Agent  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Intent classification | Keyword/pattern-based matching for 8+ intents (greeting, book, hours, etc.) | Both chatbots |
| Conversation flow | Session management, context tracking, multi-turn dialogs | WhatsApp reschedule/cancel |
| Quick replies | Suggested button responses to guide users | Web chatbot UI |
| Fallback handling | Graceful "I don't understand" with menu options; escalation after 2 failures | Both chatbots |
| Web Speech API | `SpeechRecognition` for speech-to-text input (browser-native) | Website chatbot |
| ElevenLabs TTS | Text-to-Speech API integration, audio streaming, voice model selection | Website chatbot voice |
| Escalation logic | Auto-escalate to human when bot fails; create admin notification | Chat Escalations |
### Intent Map
| Intent | Web Chatbot | WhatsApp Bot |
|--------|:-----------:|:------------:|
| Greeting | ✅ | ✅ |
| Book appointment | ✅ | ✅ |
| Treatment info | ✅ | ✅ |
| Clinic hours | ✅ | ✅ |
| Location | ✅ | ✅ |
| Pricing | ✅ | ✅ |
| Reschedule | ❌ (link only) | ✅ (full flow) |
| Cancel | ❌ (link only) | ✅ (full flow) |
| Callback request | ✅ | ❌ |
| Human handoff | ✅ | ✅ |
---
## 10. Background Jobs & Scheduling
**Min. Level:** 🟡 Working  
**Agent:** Reminder Agent, Booking cleanup  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| node-cron | Cron expression syntax, scheduled task registration | Reminder cron (hourly) |
| Cron expressions | `0 * * * *` (every hour), `*/15 * * * *` (every 15 min) | Reminders, stale booking cleanup |
| Idempotent jobs | Ensure re-runs don't send duplicate reminders (`reminder_sent` flag) | Reminder Agent |
| Error resilience | Log failures, retry strategy, don't crash on individual item failure | Processing loops |
| Monitoring | Log job execution: "Processed X reminders at [timestamp]" | Operational observability |
### Scheduled Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| 24h appointment reminder | Every hour (`:00`) | Send email + WhatsApp reminders |
| Stale booking cleanup | Every 15 min | Cancel `pending_payment` bookings older than 15 min |
| Slot hold expiry | Every 5 min | Release unheld slot reservations |
---
## 11. DevOps & Cloud Infrastructure
**Min. Level:** 🟡 Working  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Vercel | Frontend deployment, environment variables, preview deployments, edge functions | Next.js hosting |
| Railway / Render | Backend Node.js deployment, managed PostgreSQL, auto-scaling | Backend hosting |
| Docker (awareness) | Containerization basics, Dockerfile, docker-compose for local dev | Development environment |
| Environment variables | `.env` files, platform-specific config, secret management — never commit secrets | All services |
| CI/CD (GitHub Actions) | Automated linting, testing, and deployment on push/PR | Release pipeline |
| DNS & SSL | Custom domain setup, HTTPS enforcement, SSL certificate management | Production |
| Monitoring | Sentry (error tracking), Uptime Robot (availability), server logs | Production reliability |
| Logging | Structured logs (JSON), log levels (info, warn, error), request ID tracing | Debugging |
### Environment Variables Inventory
> See [Agents.md — Environment Variables](./03-Agents.md) for the full list of 15+ env vars by agent.
---
## 12. Testing & Quality Assurance
**Min. Level:** 🟡 Working  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| Unit testing | Jest / Vitest for testing individual functions, utilities, helpers | Backend logic, validators |
| Integration testing | Test API endpoints with Supertest, verify DB interactions | Agent endpoints |
| Component testing | React Testing Library for component behavior testing | Frontend components |
| E2E testing (awareness) | Cypress or Playwright for full user flow testing | Booking flow, login |
| API testing | Postman / Thunder Client collections for manual endpoint testing | Development |
| Manual QA | Browser testing (Chrome, Firefox, Safari, Edge), mobile device testing | Pre-release |
### Testing Priorities
| Priority | What to Test | Why |
|----------|-------------|-----|
| 🔴 Critical | Payment flow (create order → verify → confirm) | Money involved |
| 🔴 Critical | Auth flow (register → login → token refresh) | Security |
| 🟠 High | Booking lifecycle (create → reschedule → cancel → refund) | Core business logic |
| 🟠 High | Webhook handlers (Razorpay, WhatsApp) | External integrations |
| 🟡 Medium | Email/WhatsApp notification delivery | Patient communication |
| 🟡 Medium | Chatbot intent classification accuracy | User experience |
| 🟢 Low | Static pages rendering, SEO meta tags | Content correctness |
---
## 13. Security & Privacy
**Min. Level:** 🟠 Proficient  
**Agents:** All agents  
### Core Competencies
| Skill | Details | Used In |
|-------|---------|---------|
| HTTPS | TLS encryption for all traffic, HSTS headers | Production |
| Input sanitization | Prevent XSS (`DOMPurify`), SQL injection (parameterized queries via Prisma) | All inputs |
| CORS | Restrict origins to frontend domain only | Express middleware |
| Rate limiting | Protect against DDoS and brute force (`express-rate-limit`) | Login, public APIs |
| Helmet.js | Secure HTTP headers (CSP, X-Frame-Options, etc.) | Express middleware |
| Data encryption | Encrypt sensitive data at rest (passwords via bcrypt, PII considerations) | Database |
| OWASP Top 10 | Awareness of injection, broken auth, sensitive data exposure, etc. | Architecture |
| Healthcare privacy | HIPAA/GDPR principles: data minimization, consent, access controls, audit logs | Patient data handling |
| Webhook security | Signature verification for Razorpay and Meta webhooks | Payment, WhatsApp |
| Secret management | Never commit secrets to Git; use `.env` + platform env vars | All services |
### Security Checklist
- [ ] All API endpoints validate and sanitize inputs
- [ ] Authentication required on all non-public routes
- [ ] Rate limiting enabled on login and public endpoints
- [ ] CORS restricted to allowed origins only
- [ ] Webhook signatures verified before processing
- [ ] No secrets in source code or Git history
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Access tokens short-lived (15 min)
- [ ] Patient data access logged for audit trail
- [ ] Regular dependency vulnerability scans (`npm audit`)
---
## 14. Version Control & Collaboration
**Min. Level:** 🟠 Proficient  
### Core Competencies
| Skill | Details |
|-------|---------|
| Git fundamentals | Clone, commit, push, pull, merge, rebase, stash, cherry-pick |
| Branching strategy | `main` (production), `develop` (staging), `feature/*`, `fix/*`, `hotfix/*` |
| Pull requests | Descriptive titles, linked issues, reviewer assignment, approval workflows |
| Code reviews | Review for logic, security, performance, readability; leave constructive comments |
| Commit messages | Conventional Commits format: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` |
| Conflict resolution | Merge conflict resolution, interactive rebase, force-push etiquette |
| `.gitignore` | Exclude `node_modules`, `.env`, build artifacts, IDE files |
### Branch Naming Convention
```
feature/booking-calendar-view
fix/payment-webhook-timeout
hotfix/auth-token-expiry
docs/update-api-contracts
chore/upgrade-prisma-5
```
---
## 15. Soft Skills & Communication
**Min. Level:** 🟡 Working  
| Skill | Why It Matters for SmileCare |
|-------|------------------------------|
| **Documentation** | Writing clear API docs, SOP instructions, inline code comments |
| **Cross-team communication** | Explaining technical concepts to non-technical clinic staff |
| **Attention to detail** | Payment accuracy, patient data correctness, UI polish |
| **Empathy** | Writing patient-facing copy, error messages, chatbot responses |
| **Time management** | Juggling multiple agent development tracks in parallel |
| **Problem-solving** | Debugging payment failures, webhook issues, third-party API changes |
| **Stakeholder communication** | Translating clinic owner requirements into technical specifications |
---
## 📊 Skills-to-Agent Mapping Matrix
| Skill | Auth | Booking | Payment | Notify | Web Chat | WhatsApp | Reminder | Admin |
|-------|:----:|:-------:|:-------:|:------:|:--------:|:--------:|:--------:|:-----:|
| JavaScript/TS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| React/Next.js | — | — | — | — | ✅ | — | — | ✅ |
| Node.js/Express | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PostgreSQL/Prisma | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| JWT/Auth | ✅ | — | — | — | — | — | — | ✅ |
| Razorpay API | — | — | ✅ | — | — | — | — | — |
| Meta/WhatsApp API | — | — | — | — | — | ✅ | — | — |
| Nodemailer/SMTP | — | — | — | ✅ | — | — | — | — |
| ElevenLabs/Speech | — | — | — | — | ✅ | — | — | — |
| Cron/Scheduling | — | — | — | — | — | — | ✅ | — |
| DevOps/CI/CD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
---
## 📚 Recommended Learning Resources
| Topic | Resource | Type |
|-------|----------|------|
| Next.js | [nextjs.org/learn](https://nextjs.org/learn) | Official tutorial |
| Prisma | [prisma.io/docs](https://www.prisma.io/docs) | Docs |
| Razorpay | [razorpay.com/docs](https://razorpay.com/docs/) | API reference |
| WhatsApp Cloud API | [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp) | Docs |
| ElevenLabs | [docs.elevenlabs.io](https://docs.elevenlabs.io) | API reference |
| Web Speech API | [MDN — Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Docs |
| WCAG 2.1 | [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/) | Guidelines |
| OWASP Top 10 | [owasp.org/Top10](https://owasp.org/www-project-top-ten/) | Security reference |
---
## 📝 Revision History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-10 | Initial skills list (13 bullet points) | Admin |
| 2.0 | 2026-02-22 | Restructured as 15-section competency matrix with proficiency levels, per-skill tables, agent mappings, validation rules, testing priorities, security checklist, tools/libraries inventory, learning resources, and cross-references to project docs | Admin |