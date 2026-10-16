# LUVMEE — Developer Onboarding & Handover Guide

**Document Version:** 1.0  
**Target Audience:** New Software Engineers, Contractors, Lead Developers, and Technical Contributors  
**Last Updated:** October 16, 2026  

---

## 1. Welcome to the LUVMEE Engineering Team

This document is designed to get any qualified full-stack or mobile engineer completely onboarded and productive on LUVMEE within **under 30 minutes**, without needing prior tribal knowledge from the original development team.

### Quick Facts:
- **Architecture:** TypeScript Monorepo (npm workspaces).
- **Mobile Stack:** React Native 0.86, Expo SDK 57, Expo Router, Hermes.
- **Web Stack:** Next.js 15.1.0 App Router, React 19, Tailwind CSS.
- **Backend Stack:** Supabase (PostgreSQL 15, GoTrue Auth, Deno Edge Functions, pg_cron).
- **Core Library:** `@luvmee/shared` (Zod schemas, date math, card models).

---

## 2. Local Workstation Setup & Prerequisites

### Required Tooling:
1. **Node.js:** Node.js version **20.x or 22.x LTS** (`node -v`).
2. **Package Manager:** npm version 10.x+ (`npm -v`).
3. **Version Control:** Git (`git --version`).
4. **Mobile Tooling:** Expo CLI & EAS CLI:
   ```bash
   npm install -g eas-cli expo-cli
   ```

### Clone and Install Dependencies:
```bash
# 1. Clone the repository
git clone git@github.com:Officialkid/luvmee.git
cd luvmee

# 2. Install monorepo dependencies (automatically builds @luvmee/shared)
npm install
```

---

## 3. Environment Configuration

LUVMEE uses strict environment separation. Below are the required environment variable names across the applications:

### A. Mobile Application (`apps/mobile/.env`)
Create `apps/mobile/.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://zfcqbydqdmoyjgiebplo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>
EXPO_PUBLIC_RECIPIENT_BASE_URL=https://luvmee.eventsslot.com
EXPO_PUBLIC_AUTH_REDIRECT_URL=luvmee://auth/callback
```
*Note: Public `EXPO_PUBLIC_` keys are safe for mobile clients because all database tables are protected by Row-Level Security (RLS).*

### B. Recipient Web Application (`apps/recipient-web/.env.local`)
Create `apps/recipient-web/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfcqbydqdmoyjgiebplo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>
# Server-side only (never prefix with NEXT_PUBLIC_):
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
```

---

## 4. Daily Development Workflows & Running the Apps

The root `package.json` provides unified scripts to run all parts of the monorepo:

### 1. Rebuilding Shared Logic (`@luvmee/shared`)
Whenever you edit schemas, date calculations, or templates in `packages/shared/src/`, recompile the TypeScript output:
```bash
npm run build:shared
```

### 2. Running the Recipient Website Locally
Starts the Next.js local development server on `http://localhost:3000`:
```bash
npm run dev:web
```

### 3. Running the Mobile Application Locally
Starts the Expo Metro Bundler:
```bash
npm run dev:mobile
```
- Press `a` to open in an Android Emulator.
- Press `i` to open in an iOS Simulator.
- Scan the terminal QR code with the **Expo Go** app on your physical phone.

### 4. Running the Automated Test Suite
Executes all 52 unit tests in `packages/shared`:
```bash
npm test
```

### 5. Type Checking (Zero Errors Standard)
```bash
# Type check mobile
npm --prefix apps/mobile run check-types

# Type check web
npm --prefix apps/recipient-web run check-types
```

---

## 5. Architectural Invariants (The "Golden Rules")

Any developer working on LUVMEE must strictly respect these architectural invariants:

1. **Always Update `@luvmee/shared` First:** Never duplicate data validation logic or anniversary date math inside `apps/mobile` or `apps/recipient-web`. Place models in `packages/shared`, compile with `npm run build:shared`, and import from `@luvmee/shared`.
2. **Never Disable Row-Level Security:** Every single PostgreSQL table in Supabase must have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`. All queries rely on `auth.uid()` filtering.
3. **Preserve Passwordless OTP:** Do not implement traditional password login forms. Passwordless email OTP is the deliberate, friction-free architectural identity model for LUVMEE.
4. **Android Versioning Invariant:** Every Android production release requires an incremented integer `versionCode` in `apps/mobile/app.json`. Google Play strictly rejects builds with reused version codes.
5. **No Advertising SDKs:** LUVMEE's Data Safety declaration on Google Play explicitly guarantees zero advertising trackers and zero third-party data sharing. Do not introduce AdMob, Facebook SDK, or commercial tracking libraries.

---

## 6. Critical Files That Need Extra Care

| File Path | Why It Is Dangerous | What Must Be Checked Before Modifying |
| :--- | :--- | :--- |
| `apps/mobile/app.json` | Controls app ID, scheme (`luvmee`), version codes, and keystore bindings | Changing `android.package` or `scheme` breaks existing user installs and Google Play updates |
| `apps/mobile/eas.json` | Controls EAS cloud build profiles and keystore credentials | Ensure `appVersionSource: "local"` and production `app-bundle` type are preserved |
| `supabase/functions/delete-user-account/` | Executes permanent cascading database purges | Ensure transaction safety and never remove authentication signature validation |
| `packages/shared/src/utils/calendar.ts` | Calculates all anniversary days and leap year reminders | Run `npm test` to ensure all 52 unit tests pass before committing changes |
