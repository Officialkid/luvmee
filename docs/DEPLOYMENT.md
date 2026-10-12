# LUVMEE V1 — Production Deployment & Build Guide

This guide covers deploying the LUVMEE monorepo:
1. **Recipient Web Application** (`apps/recipient-web`) on **Vercel**
2. **Mobile Creator Application** (`apps/mobile`) via **Expo / EAS**
3. **Backend Database & Storage** on **Supabase**
4. **Preservation of the Legacy Project ALIKAH Deployment**

---

## Architecture Overview

```
luvmee/
├── apps/
│   ├── mobile/             # React Native + Expo Router + TypeScript
│   └── recipient-web/      # Next.js 14 App Router + Tailwind CSS + TypeScript
├── packages/
│   └── shared/             # Zod schemas, 6 starter templates, shared utilities
├── supabase/
│   ├── migrations/         # PostgreSQL schema & Row-Level Security (RLS)
│   └── seed.sql            # Seed data for starter templates
├── legacy/
│   └── alika-experience/   # Standalone Project ALIKAH (HTML/CSS/JS)
└── docs/                   # Setup and deployment documentation
```

---

## 1. Recipient Web Application (Vercel)

The recipient web experience is built with Next.js 14. Recipients open dynamic URLs (`/e/[slug]`) directly on their mobile browsers without signing up or installing an app.

### A. Deploy via Vercel CLI
```bash
cd "apps/recipient-web"
vercel --prod
```

### B. Deploy via Vercel Dashboard
1. Connect your GitHub repository: `Officialkid/luvmee`.
2. Set **Root Directory** to `apps/recipient-web`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-supabase-anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<your-supabase-service-role-key>` (Server-only)
5. Deploy.

### C. Live Fallback & Demo Mode
If Supabase environment variables are omitted or pending configuration, `apps/recipient-web` automatically falls back to curated offline starter experiences (including Alikah's personal experience at `/e/for-alikah-love` and playful questions), ensuring zero downtime or broken links.

---

## 2. Mobile Creator App (Expo & EAS)

The creator application runs on iOS and Android, allowing users to pick templates, customize romantic copy, preview live animations, and manage published links.

### A. Local Development Run
```bash
# Start Expo development server
npm run dev:mobile

# Or from inside apps/mobile:
cd apps/mobile
npx expo start
```
Scan the displayed QR code with the **Expo Go** app on your iOS or Android phone.

### B. Building Production Binaries with EAS (Expo Application Services)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize EAS in `apps/mobile`:
   ```bash
   cd apps/mobile
   eas build:configure
   ```
4. Build APK / AAB for Android:
   ```bash
   eas build --platform android --profile preview
   ```
5. Build IPA for iOS:
   ```bash
   eas build --platform ios --profile preview
   ```

### C. Environment Configuration in Mobile
Set in `apps/mobile/.env` or Expo Secrets:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## 3. Supabase Backend Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the schema migration from:
   [`supabase/migrations/20261012000000_init_schema.sql`](../supabase/migrations/20261012000000_init_schema.sql)
4. Run the starter templates seed from:
   [`supabase/seed.sql`](../supabase/seed.sql)
5. Under **Project Settings > API**, copy the Project URL and Anon Public Key into your `.env` files.

---

## 4. Preservation of Legacy Project ALIKAH

The standalone romantic surprise created in Phase 1 for Alikah has been permanently preserved:
- Standalone HTML/CSS/JS files reside in `legacy/alika-experience/`.
- Root fallback `index.html` remains fully operational for existing static servers or direct visits.
- Any existing production domain pointing to the standalone static site will remain 100% operational.
