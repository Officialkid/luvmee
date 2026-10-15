# LUVMEE — Release Preparation Step 1: Deployment Readiness Inventory

**Date:** October 15, 2026  
**Auditor & Lead Architect:** Senior Software Architect, Security Engineer & Release Lead  
**Branch:** `feature/phase-4-core-relationship-experiences`  
**Overall Readiness Status:** **DEVELOPMENT COMPLETE — RELEASE DEPLOYMENT PENDING**

---

## 1. Recipient Website Deployment

- **Framework & Architecture:** Next.js 15.1.0 App Router, React 19, Tailwind CSS, TypeScript. Located in `apps/recipient-web`.
- **Intended Production Domain:** `https://luvmee.vercel.app` (or custom production domain, e.g., `https://luvmee.app`).
- **Required Environment Variables (by name only):**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-side runtime only)
- **Deployment Status:** **PENDING / UNVERIFIED**.
  - *Evidence:* Build and configuration files are present and verified (`next.config.mjs`, `package.json`). Type checking succeeds under constrained memory (`exit code 0`). Live Vercel production deployment has not yet been initiated or verified.
- **Exact Remaining Deployment Actions:**
  1. In the Vercel Dashboard, import/connect the project repository.
  2. Set **Root Directory** to `apps/recipient-web`.
  3. Ensure Framework Preset is **Next.js**.
  4. Configure production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  5. Trigger production deployment and verify HTTP 200 response on root (`/`) and dynamic recipient experience route (`/e/[slug]`).

---

## 2. Authentication Configuration

- **Required Production Redirect URLs:**
  - **Standalone Mobile Application:** `luvmee://auth/callback`
  - **Recipient Web Application:** `https://luvmee.vercel.app/auth/callback` (or custom domain equivalent)
  - **Development Mode Only (Expo Go):** `exp://<local-ip>:8081/--/auth/callback`
- **Where Each Redirect Must Be Configured:**
  - **Supabase Dashboard > Authentication > URL Configuration > Site URL:** Must be set to the live production web URL (`https://luvmee.vercel.app`).
  - **Supabase Dashboard > Authentication > URL Configuration > Redirect URLs:** Must explicitly contain:
    - `luvmee://auth/callback`
    - `https://luvmee.vercel.app/auth/callback`
  - **Google Cloud Console > Credentials > OAuth 2.0 Client IDs (Web Application):** Authorized redirect URIs must contain the Supabase auth callback:
    - `https://<supabase-project-id>.supabase.co/auth/v1/callback`
- **Inconsistency Audit:**
  - *Identified:* Prior documentation referenced `exp://192.168.1.100:8081/--/auth/callback`. This is an ephemeral developer workstation IP for Expo Go and must not be used as the primary production callback.
  - *Risk:* If Supabase **Site URL** remains set to `http://localhost:3000`, unlisted redirect requests fall back to localhost, causing mobile authentication callbacks to fail on physical devices.

---

## 3. Supabase and Backend Release Prerequisites

- **Live Schema Deployment:** **PENDING**.
  - *Evidence:* Consolidated schema migration `supabase/COMPLETE_LUVMEE_SCHEMA.sql` exists in repository, defining all tables (`profiles`, `experiences`, `partnerships`, `love_notes`, `people`, `important_dates`, `scheduled_reminders`, `personal_plans`, `user_push_tokens`, `notification_events`), RLS policies, and RPC functions (`delete_user_account`, `process_due_reminders`, `get_experience_access_state`, `update_my_username`, `record_authenticated_activity`).
  - *Requirement:* Must be executed against the active production Supabase project before acceptance testing begins.
- **Supabase Auth Email Template Configuration:** **PENDING**.
  - *Requirement:* In Supabase Dashboard > Authentication > Email Templates > Confirm signup, verify that the email body delivers `{{ .Token }}` so the mobile 6-digit OTP verification screen receives valid codes.
- **Edge Function Deployment:** **PENDING**.
  - *Evidence:* Push notification dispatcher function source exists at `supabase/functions/dispatch-push-notifications/index.ts`.
  - *Requirement:* Must be deployed to Supabase Edge Functions using Supabase CLI (`supabase functions deploy dispatch-push-notifications --no-verify-jwt`).
- **Automated Reminder Cron:** **PENDING**.
  - *Requirement:* Automated daily execution of `process_due_reminders()` requires enabling `pg_cron` in Supabase (`SELECT cron.schedule('process-due-reminders', '0 8 * * *', 'SELECT process_due_reminders();');`) or an external cron scheduler.

---

## 4. Notifications

- **In-App Reminder Processing:**
  - *Status:* **IMPLEMENTED (CODE & UNIT TESTS COMPLETE)**.
  - *Evidence:* `apps/mobile/services/notificationService.ts` contains `processDueReminders()` with 1-hour cooldown throttling; covered by unit tests in `packages/shared/test/scheduled-reminders.test.mjs`.
- **Outbound Push Notification Dispatcher:**
  - *Status:* **IMPLEMENTED (UNVERIFIED IN PRODUCTION)**.
  - *Evidence:* Edge function code exists to query `notification_events`, resolve device tokens, check user preferences, and forward requests to Expo Push API (`https://exp.host/--/api/v2/push/send`). Live delivery to real lock screens is unverified pending standalone build and credential setup.
- **Standalone App Store Push Credentials Required:**
  - **iOS:** Apple Push Notification service (APNs) Authentication Key (`.p8` file) with Key ID and Team ID configured in Expo Application Services (EAS).
  - **Android:** Firebase Cloud Messaging (FCM) V1 credentials or Server Key configured in EAS project settings.

---

## 5. Build and Release Environment

- **Automated Test Results:**
  - *Status:* **VERIFIED & PASSING (52 / 52 TESTS)** across 12 test suites in `packages/shared`.
- **Type Checking:**
  - *Recipient Web:* `node --max-old-space-size=512 tsc --noEmit` **PASSED (0 Errors)**.
  - *Mobile:* Type checking verified; `"exclude": ["node_modules"]` added to `tsconfig.json`.
- **Recipient Web Build Configuration:**
  - `apps/recipient-web/next.config.mjs` configured with `eslint: { ignoreDuringBuilds: true }` and `transpilePackages: ['@luvmee/shared']`.
- **Mobile Build Configuration:**
  - `apps/mobile/app.json` configured with scheme `luvmee`, bundle identifier `com.officialkid.luvmee`, and package name `com.officialkid.luvmee`.
  - `apps/mobile/eas.json` configured for `development`, `preview` (APK/Simulator), and `production` (AAB).
- **Host-Machine Virtual Memory Constraint:**
  - *Diagnostics:* The local Windows workstation operates with low available commit limit (~218 MB free virtual memory). Running unconstrained Node or parallel static workers triggers V8 zone allocation failures locally.
  - *Impact:* Workarounds are in place for local verification (`--max-old-space-size=512`). Hosted CI/CD platforms (Vercel, EAS, GitHub Actions) possess standard virtual memory envelopes and are unaffected by this workstation constraint.

---

## 6. Ordered Release Prerequisites

| Step # | Release Item | Status | Evidence | Exact Next Action | Required Credentials / Access (Names Only) | Dependencies | Responsible Party |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Supabase Production DDL** | Pending | `COMPLETE_LUVMEE_SCHEMA.sql` in repo | Execute schema DDL in live Supabase SQL Editor | Supabase Dashboard Admin Access | None | Founder |
| **2** | **Supabase Auth Redirects** | Pending | URLs documented in `authService.ts` | Add `luvmee://auth/callback` & web callback to Redirect URLs | Supabase Dashboard Admin Access | Step 1 | Founder |
| **3** | **Supabase Email Template** | Pending | `confirm-signup.html` in repo | Set Confirm Signup template to use `{{ .Token }}` | Supabase Dashboard Admin Access | Step 1 | Founder |
| **4** | **Deploy Recipient Web** | Pending | Next.js 15 app in `apps/recipient-web` | Import to Vercel, set root to `apps/recipient-web`, configure env vars, and deploy | Vercel Account, Supabase API Keys | Step 1 | Founder / Agent |
| **5** | **Set Mobile Recipient URL** | Pending | `.env.example` has base URL key | Configure `EXPO_PUBLIC_RECIPIENT_BASE_URL` to point to production domain | Expo / EAS Project Secrets | Step 4 | Founder / Agent |
| **6** | **Deploy Push Edge Function** | Pending | Edge function code in repo | Deploy `dispatch-push-notifications` via Supabase CLI | Supabase Access Token / CLI Login | Step 1 | Founder / Agent |
| **7** | **Configure Push Credentials** | Pending | `app.json` has bundle IDs | Add APNs Key and FCM credentials to EAS build profile | Apple Developer Key, Firebase FCM Key | Step 1 | Founder |
| **8** | **Schedule Reminder Cron** | Pending | `process_due_reminders` RPC in DDL | Enable `pg_cron` schedule or external cron webhook | Supabase SQL Editor / Dashboard | Step 1 | Founder |

---

## 7. Deferred Final Acceptance Testing

The following acceptance tests remain strictly deferred until the ordered release prerequisites above are completed:

1. **Live Email OTP Delivery:** Sign up with a new email address and confirm receipt of the 6-digit verification code in an actual inbox.
2. **Physical Multi-Device Partner Sync:** Pair two separate physical devices using mutual invite codes and verify real-time Love Notes delivery.
3. **Logged-Out Recipient Experience:** Open a generated public card link on desktop and mobile browsers in incognito mode without authentication.
4. **Partner-Exclusive Guarding:** Open a private partner link in a web browser to verify the branded `luvmee://` handoff and content secrecy.
5. **Real Push Notifications:** Trigger an occasion reminder or partner note and verify push banner arrival on physical device lock screens.
6. **Cross-Account Cache Isolation:** Sign out on a physical device, log into a second account, and verify zero data contamination from the prior account.
7. **Permanent Account Deletion:** Execute account deletion on a test account and verify database cascading deletions and session revocation.
8. **Standalone Mobile Binary Compilation:** Run `eas build` to produce clean Android preview APK and iOS build.
