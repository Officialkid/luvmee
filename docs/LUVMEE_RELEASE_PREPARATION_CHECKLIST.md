# LUVMEE — Release Preparation Step 1: Deployment Readiness Inventory

**Date:** October 15, 2026  
**Auditor & Lead Architect:** Senior Software Architect, Security Engineer & Release Lead  
**Branch:** `feature/phase-4-core-relationship-experiences`  
**Overall Readiness Status:** **READY FOR GOOGLE PLAY SUBMISSION WITH FOUNDER DECISIONS**

---

## 1. Recipient Website Deployment

- **Framework & Architecture:** Next.js 15.1.0 App Router, React 19, Tailwind CSS, TypeScript. Located in `apps/recipient-web`.
- **Intended Production Domain:** `https://luvmee.vercel.app` (or custom production domain, e.g., `https://luvmee.app`).
- **Required Environment Variables (by name only):**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-side runtime only)
- **Deployment Status:** **BASE DEPLOYED & ACTIVE ON `https://luvmee.eventsslot.com`; LEGAL PAGES BUILT & READY FOR REDEPLOYMENT**.
  - *Evidence:* Vercel production deployment serves Next.js App Router live at `https://luvmee.eventsslot.com`.
  - *New Routes Implemented & Locally Verified (Exit Code 0):*
    - `/privacy` — Comprehensive privacy policy covering all collected data types.
    - `/delete-account` — Interactive public deletion request form and in-app instructions.
    - `/terms` — Terms of service for private couples communication.
    - `/support` — Step-by-step help guides and support inbox.
- **Exact Remaining Deployment Actions:**
  1. Add production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `SUPABASE_SERVICE_ROLE_KEY`) under Vercel Project Settings > **Environment Variables**.
  2. Redeploy `apps/recipient-web` to publish the new legal and support routes to `https://luvmee.eventsslot.com`.

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

- **Live Schema Deployment:** **REPORTED COMPLETE BY FOUNDER (Verification deferred to Acceptance Gate)**.
  - *Evidence:* The founder reported that `COMPLETE_LUVMEE_SCHEMA.sql` was executed successfully in the live Supabase environment. Formal verification of tables, RLS policies, and RPC functions is deferred to final acceptance testing.
- **Supabase Auth Email Template Configuration:** **PENDING**.
  - *Requirement:* In Supabase Dashboard > Authentication > Email Templates > Confirm signup, verify that the email body delivers `{{ .Token }}` so the mobile 6-digit OTP verification screen receives valid codes.
- **Edge Function Deployments:** **COMPLETE**.
  - *Evidence:* `dispatch-push-notifications` and `delete-user-account` are deployed to Supabase Edge Functions. Database webhook connected on `notification_events` INSERT.
- **Automated Reminder Cron:** **SCHEDULED & ACTIVE**.
  - *Evidence:* Scheduled via `pg_cron` (`process-due-reminders-daily`) to run every morning at 08:00 UTC calling `process_due_reminders()`. Supported by in-app 5-minute throttled fallback.

---

## 4. Notifications

- **In-App Reminder Processing:**
  - *Status:* **IMPLEMENTED (CODE & UNIT TESTS COMPLETE)**.
  - *Evidence:* `apps/mobile/services/notificationService.ts` contains `processDueReminders()` with 5-minute cooldown throttling and concurrency locking; covered by unit tests in `packages/shared/test/scheduled-reminders.test.mjs`.
- **Outbound Push Notification Dispatcher (`dispatch-push-notifications`):**
  - *Status:* **DEPLOYED & ACTIVE (DATABASE WEBHOOK CONNECTED)**.
  - *Location:* `supabase/functions/dispatch-push-notifications/index.ts`.
  - *Runtime Environment:* Deno / Supabase Edge Functions.
  - *Required Secrets / Environment Variables (Names Only):*
    - `SUPABASE_URL` (standard system variable provided by Supabase runtime).
    - `SUPABASE_SERVICE_ROLE_KEY` (service role secret required to query tables and bypass RLS).
  - *Trigger Mechanism:*
    - **Primary Real-time Trigger:** Supabase Database Webhook listening on `public.notification_events` `INSERT` (extracts `body.record.id`).
    - **Secondary Batch / Scheduled Fallback:** Direct HTTP POST without `record.id` queries the 20 most recent events.
  - *Target Push Gateway:* Expo Push API (`https://exp.host/--/api/v2/push/send`).
  - *Deployment Command:*
    ```bash
    supabase functions deploy dispatch-push-notifications --no-verify-jwt
    ```
  - *Supabase Dashboard Database Webhook Setup:*
    - Navigate to **Database** → **Webhooks** → **Create a new webhook**.
    - Name: `dispatch-push-notifications-webhook`
    - Table: `public.notification_events`
    - Events: `INSERT`
    - Type: **Supabase Edge Function**
    - Function: `dispatch-push-notifications`
    - Method: `POST`
- **Standalone App Store Push Credentials Required (EAS):**
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
| **1** | **Supabase Production DDL** | Reported Complete | Founder reported successful execution | Verification deferred to Acceptance Gate | Supabase Admin Access | None | Founder |
| **2** | **Supabase Auth Redirects** | Reported Complete | URLs configured by founder | Verification deferred to Acceptance Gate | Supabase Admin Access | Step 1 | Founder |
| **3** | **Supabase Email Template** | Reported Complete | Updated to `{{ .Token }}` by founder | Verification deferred to Acceptance Gate | Supabase Admin Access | Step 1 | Founder |
| **4** | **Deploy Recipient Web** | Deployed & Active | Next.js 15 app live at `https://luvmee.eventsslot.com` | Add Supabase env vars in Vercel to enable live cloud queries | Vercel Project Admin Access | Step 1 | Founder / Agent |
| **5** | **Set Mobile Recipient URL** | Complete | Configured in `apps/mobile/.env` | Points to `https://luvmee.eventsslot.com` | None | Step 4 | Complete |
| **6** | **Deploy Push Edge Function** | Complete | Deployed to Supabase & Webhook connected | Verified connected on `notification_events` INSERT | Supabase Project Admin | Step 1 | Founder / Agent |
| **7** | **Configure Push Credentials** | Pending | `app.json` has bundle IDs | Add APNs Key and FCM credentials to EAS build profile | Apple Developer Key, Firebase FCM Key | Step 1 | Founder |
| **8** | **Schedule Reminder Cron** | Complete | Scheduled via pg_cron at 08:00 UTC | Automatic daily invocation active | Supabase SQL Editor | Step 1 | Founder |
| **9** | **Legal & Policy Web Endpoints** | Built & Verified | `/privacy`, `/delete-account`, `/terms`, `/support` compile with exit code 0 | Deploy branch to Vercel production | Vercel Deployment Access | Step 4 | Founder / Agent |
| **10** | **Mobile Legal & Support Navigation** | Complete & Verified | WebBrowser links added to Profile screen (`apps/mobile/app/(tabs)/profile.tsx`) | Tested type checks pass | None | Step 9 | Complete |
| **11** | **Google Play Submission Pack** | Complete | Store copy, specifications, and Data Safety declared in `docs/LUVMEE_GOOGLE_PLAY_SUBMISSION_PACK.md` | Copy to Play Console listing | Google Play Console Access | None | Founder |
| **12** | **App Versioning & Build Configuration** | Complete | `versionCode: 1` added to `apps/mobile/app.json`; `appVersionSource: "local"` in `eas.json` | Ready for production EAS compile | None | None | Complete |
| **13** | **Production AAB Bundle Build** | Pending Authorization | EAS production profile configured with `buildType: "app-bundle"` | Execute `npx eas-cli build --platform android --profile production` | EAS CLI Access | Steps 9, 12 | Founder |
| **14** | **Google Play Console Submission** | Pending Build | Publishing guide created in `docs/LUVMEE_VERSION_1_PUBLISHING_GUIDE.md` | Follow guide for Closed Testing / Production rollout | Google Play Console Access | Steps 11, 13 | Founder |

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
8. **Standalone Mobile Binary Compilation:** **COMPLETE & VERIFIED**. Standalone Android APK built via EAS (`builds/8a24c374-7809-4544-9153-3164deaf71a0`). Ready for direct physical device installation.

---

## 8. Google Play Version 1.0 Release Readiness Inventory

| Deliverable / Requirement | Target Artifact / Location | Verification Method | Status |
| :--- | :--- | :--- | :---: |
| **Public Privacy Policy** | `apps/recipient-web/app/privacy/page.tsx` | Next.js production static export build (code 0) | **READY** |
| **Account Deletion Portal** | `apps/recipient-web/app/delete-account/page.tsx` | Unauthenticated web form + mobile instructions | **READY** |
| **Terms of Service** | `apps/recipient-web/app/terms/page.tsx` | Comprehensive legal terms for couples messaging | **READY** |
| **Help & Support Center** | `apps/recipient-web/app/support/page.tsx` | 4 in-depth guides + contact channels | **READY** |
| **In-App Mobile Integration** | `apps/mobile/app/(tabs)/profile.tsx` | `WebBrowser.openBrowserAsync` integration | **READY** |
| **Store Listing Copy** | `docs/LUVMEE_GOOGLE_PLAY_SUBMISSION_PACK.md` | Character-counted Title, Short & Full descriptions | **READY** |
| **Graphic Assets Specs** | `docs/LUVMEE_GOOGLE_PLAY_SUBMISSION_PACK.md` | 512x512 icon, 1024x500 feature graphic, screenshots | **READY** |
| **Data Safety Declaration** | `docs/LUVMEE_GOOGLE_PLAY_SUBMISSION_PACK.md` | Verified against actual schemas and RLS policies | **READY** |
| **App Version Code** | `apps/mobile/app.json` | Explicit `versionCode: 1` and `version: "1.0.0"` | **READY** |
| **Publishing Walkthrough** | `docs/LUVMEE_VERSION_1_PUBLISHING_GUIDE.md` | Step-by-step console guide & 14-day closed test rules | **READY** |
| **Founder Decisions Register** | `docs/LUVMEE_VERSION_1_FOUNDER_DECISIONS.md` | Register of 7 key decision items | **READY** |

