# LUVMEE — PRODUCT ROADMAP & ARCHITECTURAL FOUNDATION

**Last Updated:** October 13, 2026  
**Status:** Active Master Roadmap  
**Target:** Production Alpha/Beta Multi-Relationship Platform  

---

## 1. PRODUCT MISSION & PHILOSOPHY

LUVMEE is a relationship and celebration platform designed to bridge the gap between caring about someone and showing that care. 

Life is busy, fast-paced, and full of competing demands. People often genuinely love and care for their partners, parents, siblings, children, friends, and mentors—yet still let a birthday, anniversary, milestone, or special thought slip by.

### The Four Core Pillars

```
+-------------------------------------------------------------------------+
|                                LUVMEE                                   |
+-------------------------------------------------------------------------+
|   1. REMEMBER         2. CELEBRATE        3. CONNECT        4. PLAN     |
|   Directory of        Personalized        Private notes &   Activity    |
|   people & dates      greeting cards &    partner-only      ideas, gifts|
|   with recurrence     digital surprises   experiences       & places to |
|   & push reminders    (no login needed)   with loved ones   visit       |
+-------------------------------------------------------------------------+
```

### Core Product Principles
1. **The calendar and important dates are central:** Celebrating starts with remembering.
2. **Accounts are not required to be remembered:** A user can save a friend, grandmother, or coworker who does not have a LUVMEE account.
3. **Contacts are not automatically connected users:** Adding someone to your personal directory is private to you.
4. **Absolute privacy for private communications:** Private Love Notes and partner-exclusive surprises never leak.
5. **Frictionless recipient experience:** Publicly shared greeting cards open in any browser without requiring recipient registration.
6. **Real notification delivery:** Push notifications must be dispatched to real APNs/FCM endpoints, not just logged in database tables.
7. **Pragmatic, warm engineering:** Reuse proven foundations, avoid unnecessary social feeds or crypto/AI hype, and verify every phase rigorously.

---

## 2. PHASED DELIVERY MATRIX

| Phase | Title | Primary Objective | Key Deliverables | Verification Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Phase A** | **Stabilization & Remediation** | Fix Phase 4 security & integration audit findings | Order love notes chronologically; isolate local cache per user; branded web SSR handoff; real outbound push dispatcher | All 33+ tests pass, Web & Mobile compile, Edge Function dispatches |
| **Phase B** | **People Directory & Important Dates** | Allow saving people and recurring dates without requiring accounts | `people` & `important_dates` tables, RLS, mobile Directory UI, recurrence engine | Multi-account isolation tests, leap-year calculations pass |
| **Phase C** | **Personal Calendar & Occasions** | Interactive visual monthly calendar and upcoming dates | Calendar grid, upcoming date cards, quick action triggers | Date-boundary tests pass, UI rendering verified |
| **Phase D** | **Scheduled Reminders & Push Dispatch** | Automated 24h & same-day reminders | `scheduled_reminders` engine, queue processor, Push API dispatch | Due reminder processing tests, idempotent delivery |
| **Phase E** | **Greeting Cards & Sharing** | Expand surprises into occasion cards | Greeting card templates, web recipient viewer (zero login), sharing links | Public link opens without auth; private stays locked |
| **Phase F** | **Lightweight Personal Plans** | Simple date ideas, places, and gift wishlist | `personal_plans` table, linked to contacts/occasions | Privacy tests, UI CRUD verified |
| **Phase G** | **Integration & Beta Readiness** | End-to-end verification of complete platform | End-to-end journey tests, regression suite, beta readiness report | 100% checks pass, documentation complete |

---

## 3. EXISTING REUSABLE ARCHITECTURE

- **Mobile App (`apps/mobile`):**
  - Expo React Native with Expo Router navigation (`(tabs)`, `(auth)`, `editor`, `preview`).
  - Lucide icons, consistent rose/burgundy/cream romantic theme palette.
  - Supabase client with AsyncStorage session persistence.
- **Recipient Web App (`apps/recipient-web`):**
  - Next.js App Router with server-side rendering and mobile app deep-linking support (`luvmee://`).
  - Production build optimized for zero-auth recipient viewing of public links.
- **Shared Package (`packages/shared`):**
  - Zod schemas, TypeScript types, template catalogues, slug generation, and text sanitization.
  - Test harness with 33 passing automated tests.
- **Supabase Backend (`supabase/`):**
  - Migrations for accounts, profiles, experiences, partnerships, love notes, push tokens, and notification events.
  - Strict RLS policies and `SECURITY DEFINER` RPC functions with pinned `search_path`.

---

## 4. RISKS & MITIGATION STRATEGY

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Push Notification Dispatch Failure** | Notifications are logged in DB but never reach user's device lock screen. | Implement a Supabase Edge Function connecting directly to Expo's Push API (`https://exp.host/--/api/v2/push/send`) with retries, ticket receipts, and token cleanup. |
| **Private Surprise Leakage / 404** | Web visitors either see private data or hit an ugly 404. | Keep private surprises restricted via RLS; add safe public metadata check to render a warm "Open in LUVMEE App" handoff. |
| **Cross-Account Cache Pollution** | Shared mobile devices show previous user's love notes. | Partition offline storage key dynamically with `userId` and purge cache upon `signOut`. |
| **Recurring Date Drift** | Timezones or leap days cause birthdays to shift or fire on the wrong day. | Implement date-only semantics (`month: 1-12`, `day: 1-31`) independent of UTC timestamp offsets. |

---

## 5. EXIT & COMPLETION CRITERIA

Each phase must produce a dedicated report (`docs/PHASE_X_*.md`) documenting:
1. Files and migrations modified.
2. Exact tests executed and verifiable results.
3. Security and architectural checks.
4. Concrete pass/fail status against stated criteria before the next phase commences.
