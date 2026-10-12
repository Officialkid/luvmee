# LUVMEE V1 — MASTER ARCHITECTURE & UX AUDIT REPORT
**Phase 1: Inspection, Testing, Documentation & Recommendations**
*Generated: October 12, 2026*

---

## A. Executive Summary

| Metric | Status | Assessment |
| :--- | :--- | :--- |
| **Overall V1 Readiness** | **Alpha / Prototype Stage** | Mobile UI and romantic interactions are well-crafted and visually engaging, but core cloud backend flows (authenticated publishing, real partner sync, live audio) rely on local simulation or fixtures. |
| **What Is Complete** | **Core UI & Studio Experience** | 5-tab mobile navigation, dynamic editor-to-preview data flow, 6 rich starter templates, evasion physics for the NO button, confetti triggers, gift box reveal, and shared Zod validation. |
| **Biggest Blockers** | **3 Critical Blockers** | 1. Editor publishes with hardcoded `userId: 'user-demo'` instead of the active Supabase user session.<br>2. Recipient Web (`apps/recipient-web`) fails TypeScript compilation due to React 18/19 type conflict, blocking Vercel builds.<br>3. No backend database model for Partner Connections or Love Notes (everything is stored in device `AsyncStorage`). |
| **Limited Beta Readiness** | **Not Ready For Public Beta** | Ready for internal dogfooding as a standalone local demo on Expo Go; not ready for couples to use across separate devices until partner cloud pairing and recipient link resolution are wired to Supabase. |

---

## B. Architecture Inventory

### 1. Technology Stack & Frameworks
* **Mobile Creator App** (`apps/mobile`):
  * **Framework**: React Native `0.86.0`, Expo `57.0.0`, Expo Router `~57.0.2` (File-based navigation with typed routes).
  * **Language**: TypeScript `^5.5.4`, React `19.2.3`.
  * **UI & Animation**: React Native core Animated, `lucide-react-native` `^1.55.0`, `react-native-safe-area-context` `~5.7.0`, `react-native-svg` `^15.15.4`, `expo-haptics` `~57.0.0`.
  * **State & Persistence**: Component state (`useState`, `useEffect`), persisted via `@react-native-async-storage/async-storage` `2.2.0`.
  * **Backend Client**: `@supabase/supabase-js` `^2.45.4` configured in `services/supabase.ts`.
* **Recipient Web App** (`apps/recipient-web`):
  * **Framework**: Next.js `^14.2.14` (App Router), React `^18.3.1`, Tailwind CSS `^3.4.12`.
  * **Special FX**: `canvas-confetti` `^1.9.3`, Web Audio API oscillator synthesis.
* **Shared Monorepo Package** (`packages/shared`):
  * TypeScript ESM library exporting Zod schemas (`ExperienceConfigSchema`, `SceneConfigSchema`), 6 starter templates (`STARTER_TEMPLATES`), and slug/placeholder utilities.
* **Backend Database & Authentication**:
  * PostgreSQL managed by Supabase (`https://zfcqbydqdmoyjgiebplo.supabase.co`).
  * Supabase Auth (Email & Password), Row Level Security (RLS) policies.
* **Legacy Artifacts**:
  * Standalone static website preserved in `legacy/alika-experience/` and root `index.html`.

### 2. File & Directory Inventory
* **Mobile Entry Point**: `apps/mobile/app/_layout.tsx` (Root Stack Provider)
* **Tab Navigation**: `apps/mobile/app/(tabs)/_layout.tsx`
  * Tab 1: `index.tsx` (Home Dashboard)
  * Tab 2: `messages.tsx` (Love Notes & Daily Sparks)
  * Tab 3: `templates.tsx` (Template Gallery)
  * Tab 4: `my-experiences.tsx` (Surprise Management)
  * Tab 5: `profile.tsx` (Account & Partner Profile)
* **Experience Studio**: `apps/mobile/app/editor/[id].tsx`
* **Live Preview**: `apps/mobile/app/preview/[id].tsx`
* **Recipient Route**: `apps/recipient-web/app/e/[slug]/page.tsx` -> `ExperienceRenderer.tsx`
* **Services**:
  * `apps/mobile/services/experienceService.ts` (Hybrid local/remote persistence)
  * `apps/mobile/services/supabase.ts` (Supabase client with AsyncStorage session adapter)
  * `apps/recipient-web/lib/supabase.ts` (Public experience retrieval)
* **Database Definitions**:
  * `supabase/migrations/20261012000000_init_schema.sql` (Tables: `profiles`, `templates`, `experiences`, `recipient_responses`)
  * `supabase/seed.sql` (Starter template definitions)

### 3. Environment Variables
* **Mobile** (`apps/mobile/.env`):
  * `EXPO_PUBLIC_SUPABASE_URL` (Present)
  * `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Present)
  * `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Present)
* **Recipient Web** (`apps/recipient-web/.env.local`):
  * `NEXT_PUBLIC_SUPABASE_URL` (Present)
  * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Present)
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Present)

---

## C. Screen-by-Screen Audit

| Screen or Feature | Current Implementation | Evidence / File Path | Status | Identified Problem | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home Dashboard** | Partner status, Surprise Studio banner, Featured template, quick tips | `apps/mobile/app/(tabs)/index.tsx` | **Partially Implemented** | Days in love (342), Cynthia connection status, and note preview are static UI values; not linked to actual partner data. | Connect banner to dynamic partner state or prompt to invite partner if unpaired. |
| **Love Notes & Chat** | Partner vitals, Daily Spark #42, note exchange feed, quick nudges | `apps/mobile/app/(tabs)/messages.tsx` | **UI Only (Mock Data)** | All notes and simulated replies are stored solely in local `AsyncStorage`. There is no Supabase backend table for real partner chat. | Create `partner_notes` table in Supabase with RLS and realtime subscriptions. |
| **Template Gallery** | Category pill filter (7 categories), template cards, preview & use actions | `apps/mobile/app/(tabs)/templates.tsx` | **Fully Implemented** | Works cleanly; passes template ID to editor and preview. | Add search bar and dynamic preview thumbnails. |
| **My Surprises** | Filter by All/Published/Draft, copy link, share, duplicate, delete | `apps/mobile/app/(tabs)/my-experiences.tsx` | **Partially Implemented** | In Guest mode, experiences saved to local storage generate a link (`https://luvmee.vercel.app/e/[slug]`) that does not exist on Supabase, leading to 404 for recipients. | Require sign-in or upload to Supabase prior to publishing public links. |
| **Profile & Settings** | User email/mode, created/published stats, partner summary, reset data, sign out | `apps/mobile/app/(tabs)/profile.tsx` | **Partially Implemented** | 1. No Account Deletion option (violates App Store guidelines).<br>2. Partner name & phone are hardcoded demo values. | Add `Delete Account` action calling `supabase.rpc` or auth admin, and make partner info editable. |
| **Experience Studio** | 2-step builder: creator/recipient names, theme selector, headline/letter inputs | `apps/mobile/app/editor/[id].tsx` | **Partially Implemented** | 1. Hardcodes `userId: 'user-demo'` when saving.<br>2. Lacks a "Save as Draft" button (only "Publish Surprise" exists). | Read active session user ID from Supabase and add a distinct "Save Draft" action. |
| **Live Recipient Preview** | Modal preview with theme palette, evasive NO button physics, gift unwrap | `apps/mobile/app/preview/[id].tsx` | **Partially Implemented** | Audio toggle only changes the icon state; no actual sound plays because `expo-av` or `expo-audio` is not implemented on mobile. | Integrate lightweight audio synthesis or bundled ambient mp3 via Expo audio. |
| **Recipient Web Page** | Public web view for recipient (`/e/[slug]`) with confetti, sound, compliments | `apps/recipient-web/app/e/[slug]/page.tsx` | **Broken Build** | 1. `npx tsc` fails on Next.js build due to React 18/19 type conflict with `lucide-react`.<br>2. Slug fallback mocks any `for-*` path with generic dummy data. | Fix `@types/react` resolution in `apps/recipient-web` and enforce strict database lookups. |

---

## D. Prioritized Issue Register

### P0: Critical Security & Core Data Flow Blockers
1. **[P0-01] Hardcoded `user-demo` in Editor Publishing**
   * **Location**: `apps/mobile/app/editor/[id].tsx` (Line 85)
   * **Impact**: Published experiences are saved with `userId: 'user-demo'` instead of `session.user.id`. When RLS checks `auth.uid() = user_id`, authenticated queries will fail to sync or retrieve these records from Supabase.
   * **Fix**: Fetch `const { data: { session } } = await supabase.auth.getSession()` and inject `session.user.id`.
2. **[P0-02] Recipient Web Next.js Build Failure (Vercel Blocker)**
   * **Location**: `apps/recipient-web/tsconfig.json` & `package.json`
   * **Impact**: `npx tsc --noEmit` fails with TS2786 (`Volume2`, `Heart`, etc. cannot be used as JSX components) because root hoisted `@types/react@19` while `recipient-web` uses `react@18`. This prevents Vercel production deployment.
   * **Fix**: Add TypeScript path mapping or align React versions across monorepo workspaces.
3. **[P0-03] "Published" Guest Surprises Missing from Cloud**
   * **Location**: `apps/mobile/services/experienceService.ts`
   * **Impact**: Unauthenticated users generate shareable links (`https://luvmee.vercel.app/e/...`) that only exist on their phone's `AsyncStorage`. A recipient opening the link will get a 404 or generic fallback.
   * **Fix**: Prompt for account creation before publishing public web links, or create an anonymous Supabase session.

### P1: Release Blockers & Core Journey Failures
1. **[P1-01] Absence of Real Partner Connection & Notes Backend**
   * **Location**: `supabase/migrations/20261012000000_init_schema.sql` & `apps/mobile/app/(tabs)/messages.tsx`
   * **Impact**: All "Love Notes", "Daily Sparks", and partner connection status are local hardcoded fixtures. Couples cannot actually exchange messages or answers across two devices.
   * **Fix**: Implement `partnerships` and `love_notes` database tables with invite code linking and Supabase Realtime subscriptions.
2. **[P1-02] Missing "Save Draft" in Studio Editor**
   * **Location**: `apps/mobile/app/editor/[id].tsx`
   * **Impact**: Creators cannot save a work-in-progress without publishing it immediately.
   * **Fix**: Add a secondary "Save Draft" button setting `status: 'draft'`.
3. **[P1-03] Missing Account Deletion Functionality**
   * **Location**: `apps/mobile/app/(tabs)/profile.tsx`
   * **Impact**: App Store Review Guideline 5.1.1(v) requires apps supporting account creation to allow users to delete their account and associated data.
   * **Fix**: Implement an authenticated account deletion flow invoking Supabase RPC to delete user records.

### P2: Important Usability & Functional Improvements
1. **[P2-01] Inaudible "Romantic Background Music" on Mobile**
   * **Location**: `apps/mobile/app/preview/[id].tsx`
   * **Impact**: Users tap the music toggle expecting ambient sound, but only the visual icon changes.
   * **Fix**: Implement audio playback using `expo-audio` / `expo-av` with bundled ambient lofi chimes.
2. **[P2-02] Hardcoded Demo Names (John & Cynthia) Fallbacks**
   * **Location**: `apps/mobile/app/editor/[id].tsx`, `profile.tsx`, `index.tsx`
   * **Impact**: If a user creates their own surprise without editing the name fields, John and Cynthia remain as default values.
   * **Fix**: Initialize fields from the authenticated user's profile display name, and prompt for recipient name.
3. **[P2-03] Missing Push Notifications for Sent Notes & Surprises**
   * **Location**: `apps/mobile/app.json`
   * **Impact**: When a partner sends a love note or publishes a surprise, the partner has no way to know without opening the app.
   * **Fix**: Integrate Expo Notifications (`expo-notifications`) for note delivery alerts.

### P3: Cosmetic & Polish Enhancements
1. **[P3-01] Unconfigured ESLint in Recipient Web**
   * **Location**: `apps/recipient-web/package.json`
   * **Impact**: Running `npm --workspace=recipient-web run lint` triggers an interactive prompt asking how to configure ESLint.
   * **Fix**: Create `.eslintrc.json` in `apps/recipient-web`.
2. **[P3-02] Static Relationship Duration & Anniversary**
   * **Location**: `apps/mobile/app/(tabs)/messages.tsx` & `profile.tsx`
   * **Impact**: "342 days in love" and "Oct 24" do not update dynamically.
   * **Fix**: Store an optional `anniversary_date` in the couple's relationship record and compute days elapsed dynamically.

---

## E. Test Execution Report

| Command Executed | Working Directory | Result | Notes / Details |
| :--- | :--- | :--- | :--- |
| `npm test` (`npm --workspace=@luvmee/shared test`) | Root | **PASS (5/5 tests)** | Slug generator, text sanitizer, placeholder interpolation, starter catalogue (6 templates), and Zod schema validations all passed. |
| `npx tsc --noEmit` | `apps/mobile` | **PASS (0 errors)** | Mobile TypeScript compiles with 0 errors on Expo SDK 57 / React 19. |
| `npx tsc --noEmit` | `apps/recipient-web` | **FAIL (Code 1)** | 7 TS2786 errors due to `@types/react` type mismatch with `lucide-react` JSX components. |
| `npm --workspace=recipient-web run lint` | Root | **FAIL (Code 1)** | Unconfigured ESLint prompted for interactive setup and exited. |
| `git status` | Root | **CLEAN / UNTRACKED** | Working tree clean. Changes preserved. |
| **End-to-End / Integration Tests** | — | **ABSENT** | No Detox, Playwright, or Maestro integration tests exist for mobile screen transitions or cloud auth sync. |

---

## F. Data Integrity & Security Report

### 1. Confirmed Security Strengths
* **Row-Level Security (RLS)**: The database migration (`20261012000000_init_schema.sql`) implements strict RLS:
  * `profiles`: Users can only read and update their own record (`auth.uid() = id`).
  * `experiences`: Creators can only read, update, and delete experiences matching `auth.uid() = user_id`.
  * `recipients`: Can only view experiences where `status = 'published'`. Unpublished drafts cannot be viewed by other users.
  * `recipient_responses`: Responses can only be inserted for existing published experiences.
* **Unguessable URL Slugs**: Slugs use random entropy (`generateSlug(name)` -> `for-cynthia-a7x9q2`).
* **Input Sanitization**: Client & shared utilities sanitize HTML and enforce Zod validation limits.

### 2. Confirmed Risks & Vulnerabilities
* **Guest Publishing Data Orphanage**: In guest mode, `userId` is set to `'user-demo'`. If written to Supabase, this will either violate foreign key constraints (as `'user-demo'` is not a valid UUID in `auth.users`) or fail RLS checks.
* **Fake Online Status**: In `messages.tsx`, an active green dot and "Online now" label are displayed statically, giving a false sense of real-time presence.
* **Recipient Web Permissive Mock**: In `apps/recipient-web/lib/supabase.ts`, any slug starting with `for-` falls back to dummy content if the database is unreachable, masking backend 404 errors during testing.

---

## G. Partner Connection Readiness Assessment

### Current State
* The Partner Connection visible in **Home**, **Love Notes**, and **Profile** is currently a **front-end presentation layer**.
* There is no backend mechanism for:
  1. Generating a unique Partner Invite Code or Deep Link (e.g., `luvmee://pair?code=ABC-123`).
  2. Mutually pairing two authenticated user accounts.
  3. Relaying messages from User A to User B across different phones.

### Required Backend Additions to Make Partner Connections Real:
1. **`partnerships` Table**:
   * `id UUID PRIMARY KEY`, `user_1_id UUID REFERENCES auth.users`, `user_2_id UUID REFERENCES auth.users`, `anniversary_date DATE`, `status TEXT ('pending', 'connected')`, `invite_code TEXT UNIQUE`.
2. **`love_notes` Table**:
   * `id UUID PRIMARY KEY`, `partnership_id UUID REFERENCES partnerships`, `sender_id UUID REFERENCES auth.users`, `message_text TEXT`, `tag TEXT`, `created_at TIMESTAMPTZ`.
3. **`daily_sparks` & Responses**:
   * A table storing couple answers to daily questions so that John and Cynthia each see the other's answer once both have answered.

---

## H. Recommended Implementation Phases

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: AUDIT & SPECIFICATION (CURRENT — COMPLETE)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 2: FOUNDATIONAL CORE FIXES (P0 Blockers)         │
│ • Fix Recipient Web Next.js TypeScript build error     │
│ • Link Studio Editor userId to active Supabase session │
│ • Add "Save Draft" in Studio Editor                    │
│ • Ensure guest publishing prompts auth before sharing  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 3: REAL PARTNER CONNECTION & MESSAGING (P1)      │
│ • Create Supabase tables: partnerships, love_notes     │
│ • Add 6-character Partner Pairing Invite code flow     │
│ • Connect Love Notes feed to Supabase Realtime         │
│ • Calculate dynamic "Days in Love" from real date      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 4: POLISH & BETA PREPARATION (P2/P3)             │
│ • Implement audio synthesis/sound playback on mobile   │
│ • Add Account Deletion in Profile settings             │
│ • Configure ESLint & CI/CD build verification          │
└────────────────────────────────────────────────────────┘
```

---

## I. Definition of Done (Beta Milestone)

1. [ ] **TypeScript Builds Pass Cleanly**: Both `apps/mobile` and `apps/recipient-web` compile with 0 errors via `npx tsc --noEmit`.
2. [ ] **Vercel Web Recipient Deployed**: Recipient can open `https://<domain>/e/<slug>` on mobile Safari/Chrome and interact with any published surprise.
3. [ ] **Authenticated Creator Flow**: A logged-in creator creates a surprise, sees their active `userId` attached, saves drafts, and publishes to Supabase.
4. [ ] **Real Two-Way Partner Pairing**: John can generate an invite link/code, Cynthia enters it on her phone, and their profiles become mutually linked.
5. [ ] **Functional Love Notes**: Notes sent by one partner appear on the other partner's device in real time via Supabase.
6. [ ] **Compliance Complete**: Account deletion is accessible in Profile settings.
