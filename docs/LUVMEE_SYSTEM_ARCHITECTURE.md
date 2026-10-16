# LUVMEE — System Architecture & Codebase Map

**Document Version:** 1.0  
**Target Audience:** Founder, Lead Architects, Senior Engineers, and Technical Onboarding  
**Last Updated:** October 16, 2026  

---

## 1. Architectural Philosophy & Technology Stack

LUVMEE is architected as a **modern, modular monorepo** designed for speed, security, and low operational overhead. 

Rather than maintaining separate fragmented repositories for the mobile app, web app, and shared logic, the entire codebase lives in a unified repository managed by npm workspaces.

```mermaid
graph TD
    Repo["📁 LUVMEE Monorepo"]
    Repo --> AppMobile["📱 apps/mobile<br>(Expo SDK 57 / React Native 0.86)"]
    Repo --> AppWeb["💻 apps/recipient-web<br>(Next.js 15.1.0 / Tailwind CSS)"]
    Repo --> PkgShared["📦 packages/shared<br>(TypeScript Validation & Math)"]
    Repo --> SBN["☁️ supabase/<br>(PostgreSQL, Edge Functions, Cron)"]
    Repo --> Docs["📚 docs/<br>(Product, Operational & API Guides)"]
```

### Technology Matrix

| Layer | Technology | Version | Key Responsibility |
| :--- | :--- | :--- | :--- |
| **Mobile Client** | React Native / Expo | Expo SDK 57 / RN 0.86 | Native iOS & Android couples app with offline caching |
| **Mobile Routing** | Expo Router | Modern file-based | Declarative tab-based navigation with deep linking (`luvmee://`) |
| **Web Client** | Next.js App Router | 15.1.0 (React 19) | Zero-install recipient cards, legal pages, and deletion portal |
| **Styling** | Tailwind CSS / StyleSheet | 3.4.1 | Unified romantic design system (`#FCE7ED`, `#E11D48`, `#4C0519`) |
| **Shared Core** | TypeScript / Zod | 5.3.3 | Data validation schemas, anniversary math, and card models |
| **Database** | PostgreSQL | 15.x (Supabase) | Relational storage with strict Row-Level Security (RLS) |
| **Authentication** | Supabase Auth | GoTrue Engine | Passwordless 6-digit Email OTP & JWT session tokens |
| **File Storage** | Supabase Storage | S3-compatible | Storage for memory photos and card visual assets |
| **Scheduled Tasks** | PostgreSQL pg_cron | v1.4 | Automated daily 08:00 UTC anniversary reminder evaluation |
| **Edge Compute** | Deno / Supabase Functions | v1.x | Push notification dispatcher & cascading account deletion |
| **Push Gateway** | Expo Push Notification API | v2 API | Cross-platform push delivery to Apple APNs and Android FCM |
| **Cloud Hosting** | Vercel & Supabase Cloud | Production | 24/7 high-availability hosted infrastructure |

---

## 2. Six Core Architecture Diagrams

---

### Diagram 1: Overall Platform Architecture

```mermaid
flowchart TD
    subgraph Clients["User Devices"]
        MobileApp["📱 LUVMEE Mobile App<br>(React Native / Expo Router)"]
        Browser["💻 Recipient Web Browser<br>(Desktop / Mobile Chrome / Safari)"]
    end

    subgraph CDN["Edge & Web Infrastructure (Vercel)"]
        NextServer["Next.js 15 App Router Server<br>(luvmee.eventsslot.com)"]
        LegalPages["Static Legal & Support Pages<br>(/privacy, /terms, /delete-account)"]
        CardEngine["Dynamic Surprise Card Renderer<br>(/e/[slug])"]
    end

    subgraph Shared["Internal Shared Library"]
        CoreLib["📦 @luvmee/shared<br>(Zod Schemas, Date Utilities, Templates)"]
    end

    subgraph CloudBackend["Supabase Cloud Infrastructure"]
        PostgresDB[("🐘 PostgreSQL Database<br>(Row-Level Security Active)")]
        AuthService["🔐 Supabase Auth<br>(Email OTP & JWT Validation)"]
        StorageBuckets["🗄️ Storage Buckets<br>(timeline_photos, card_assets)"]
        CronJob["⏰ pg_cron Scheduler<br>(Daily 08:00 UTC Reminder Check)"]
        EdgePush["⚡ Edge Function: dispatch-push<br>(Deno Runtime)"]
        EdgeDelete["⚡ Edge Function: delete-account<br>(Cascading Purge)"]
    end

    subgraph PushService["External Gateways"]
        ExpoGateway["🔔 Expo Push Notification API"]
        AppleAPNs["🍎 Apple APNs"]
        GoogleFCM["🤖 Google FCM"]
    end

    MobileApp -->|"TypeScript imports"| CoreLib
    NextServer -->|"TypeScript imports"| CoreLib

    MobileApp -->|"Direct HTTPS REST / Real-time"| PostgresDB
    MobileApp -->|"Login / Signup with OTP"| AuthService
    MobileApp -->|"Upload memory photos"| StorageBuckets
    MobileApp -->|"Trigger account deletion"| EdgeDelete

    Browser -->|"Requests Card / Legal Page"| NextServer
    NextServer --> LegalPages
    NextServer --> CardEngine
    CardEngine -->|"Read-only card query"| PostgresDB

    CronJob -->|"Calls process_due_reminders()"| PostgresDB
    PostgresDB -->|"Database Webhook on INSERT"| EdgePush
    EdgePush -->|"Dispatches payload"| ExpoGateway
    ExpoGateway --> AppleAPNs
    ExpoGateway --> GoogleFCM
    AppleAPNs --> MobileApp
    GoogleFCM --> MobileApp
```

#### Plain-English Explanation:
The mobile app and the website are two windows into the same central cloud brain (Supabase). The mobile app allows couples to create memories, send love notes, and schedule occasions. The website allows anyone with a link to view a digital card without needing an app. In the background, automated clockwork checks for upcoming anniversaries and dispatches push banners to user phones.

---

### Diagram 2: Authentication & Session Persistence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant App as Mobile App
    participant Storage as Device Storage (AsyncStorage)
    participant Auth as Supabase Auth (GoTrue)
    participant DB as PostgreSQL DB
    participant Mail as SMTP Email Server

    User->>App: Enters email (e.g. user@example.com)
    App->>Auth: signInWithOtp({ email })
    Auth->>Mail: Sends 6-digit numeric OTP
    Mail-->>User: Delivers email with OTP (e.g. 849201)
    User->>App: Types 6-digit code
    App->>Auth: verifyOtp({ email, token: '849201', type: 'email' })
    Auth->>DB: Validates token against auth.users
    DB-->>Auth: Token valid, issues JWT & Refresh Token
    Auth-->>App: Returns User Session Object (JWT)
    App->>Storage: Securely persists JWT tokens locally
    App->>DB: Fetches profile row from public.profiles
    DB-->>App: Returns profile (name, partner_id, anniversary)
    App-->>User: Displays customized Home Dashboard
```

#### Plain-English Explanation:
When a user signs in, they never type a password. They receive a 6-digit code in their email. When entered, Supabase issues an encrypted electronic passport (a JWT token) that the phone saves securely. Every time the app makes a request to fetch notes or anniversaries, it presents this passport so the database knows exactly who is asking.

---

### Diagram 3: Saving and Retrieving Important Dates

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant UI as Calendar Screen
    participant Shared as @luvmee/shared
    participant DB as public.occasions

    User->>UI: Selects Oct 24, enters "Sarah's Birthday", checks "Year Unknown"
    UI->>Shared: Validates occasion schema (Zod)
    Shared-->>UI: Schema valid (normalized date: 1900-10-24)
    UI->>DB: INSERT into public.occasions (user_id, title, date, is_recurring)
    DB-->>UI: Confirmed (Row Created)
    UI-->>User: Places pink heart marker on Oct 24 in Calendar
    Note over UI,Shared: When user scrolls months, @luvmee/shared calculates<br>next occurrence & days remaining without miscalculating age
```

#### Plain-English Explanation:
When an anniversary or birthday is added, the app first checks that the date is valid using shared rules. If the user doesn't know the birth year, the system stores a special placeholder so it can still sound the alarm every October 24th without accidentally telling you that your friend is 2,000 years old!

---

### Diagram 4: Creating and Opening a Shared Card

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Card Sender (Mobile)
    participant Mobile as Mobile Creator Studio
    participant DB as public.experiences
    participant Web as Recipient Web (Next.js)
    actor Recipient as Card Recipient (Browser)

    Creator->>Mobile: Selects "Anniversary Rose" theme, types love letter
    Mobile->>DB: INSERT into public.experiences (slug: 'love-abc', content_json, is_published: true)
    DB-->>Mobile: Created
    Mobile-->>Creator: Native Share Sheet opens with URL: https://luvmee.eventsslot.com/e/love-abc
    Creator-->>Recipient: Sends link via WhatsApp
    Recipient->>Web: Opens https://luvmee.eventsslot.com/e/love-abc
    Web->>DB: SELECT * FROM experiences WHERE slug = 'love-abc' AND is_published = true
    DB-->>Web: Returns card JSON
    Web-->>Recipient: Plays unboxing animation, confetti, and sender's letter
```

#### Plain-English Explanation:
A user designs a greeting card in the mobile app. The app saves the design in the database and generates a short, unique web link. When the partner clicks that link in WhatsApp, our web server immediately fetches the design and plays a beautiful animated card on their screen without requiring any login.

---

### Diagram 5: Automated Reminder Generation & Delivery

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Supabase pg_cron (08:00 UTC)
    participant SQL as RPC: process_due_reminders()
    participant Table as public.notification_events
    participant Webhook as Database Webhook
    participant Edge as Edge Function (dispatch-push)
    participant Expo as Expo Push Gateway
    actor User as User Phone (Lock Screen)

    Cron->>SQL: Triggers daily check at 08:00 UTC
    SQL->>SQL: Finds occasions where date = TODAY or date = TOMORROW
    SQL->>Table: INSERT INTO notification_events (user_id, title, body, payload)
    Table->>Webhook: Detects new row INSERT
    Webhook->>Edge: HTTP POST /dispatch-push-notifications
    Edge->>Expo: POST https://exp.host/--/api/v2/push/send with device push token
    Expo-->>User: Delivers lock screen banner: "Tomorrow is your Anniversary! 💕"
```

#### Plain-English Explanation:
Every morning at 8:00 AM UTC, an automatic alarm clock inside the database wakes up, looks through all couples' calendars, and finds who has a birthday or anniversary coming up in the next 24 hours. It automatically generates a push notification and delivers it straight to the user's phone lock screen.

---

### Diagram 6: Permanent Account Deletion Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant App as Mobile App / Web Portal
    participant Edge as Edge Function: delete-user-account
    participant DB as PostgreSQL Tables
    participant Storage as Supabase Storage
    participant Auth as Supabase Auth (admin.deleteUser)

    User->>App: Types "DELETE" and clicks confirm
    App->>Edge: POST /delete-user-account (with User JWT)
    Edge->>Edge: Verifies JWT signature and extracts user_id
    Edge->>DB: BEGIN TRANSACTION
    Edge->>DB: DELETE FROM love_notes WHERE sender_id = uid OR receiver_id = uid
    Edge->>DB: DELETE FROM timeline_memories WHERE user_id = uid
    Edge->>DB: DELETE FROM occasions WHERE user_id = uid
    Edge->>DB: DELETE FROM partner_connections WHERE user_a = uid OR user_b = uid
    Edge->>DB: DELETE FROM profiles WHERE id = uid
    Edge->>DB: COMMIT TRANSACTION
    Edge->>Storage: Purges user's uploaded images from timeline bucket
    Edge->>Auth: supabase.auth.admin.deleteUser(uid)
    Edge-->>App: Success (200 OK)
    App->>App: Purges all local tokens, storage, and cached memories
    App-->>User: Displays "Account Permanently Erased" & logs out
```

#### Plain-English Explanation:
When a user asks to delete their account, we don't just hide their profile. An authorized cloud worker systematically scrubs their love notes, photos, calendar events, partner links, and login records across every table, deletes their image files, cancels their login passport, and purges all local storage on the phone.

---

## 3. Codebase File Map & Navigation Guide

This section is an authoritative directory of important files across the monorepo:

### Mobile Application (`apps/mobile`)
| File / Directory Path | Architectural Responsibility | Key Dependencies | When to Modify |
| :--- | :--- | :--- | :--- |
| `app/_layout.tsx` | Root application layout, font loading, theme provider, and global error boundaries | Expo Router, `@luvmee/shared` | When adding global providers, notification listeners, or app-wide styles |
| `app/(tabs)/_layout.tsx` | Bottom tab navigation bar configuring Home, Calendar, Celebrate, Messages, Profile | Expo Router, Lucide Icons | When adding/removing bottom navigation tabs |
| `app/(tabs)/index.tsx` | Home relationship dashboard featuring live day counter and upcoming alerts | `authService.ts`, `@luvmee/shared` | When updating home widgets, day counter presentation, or quick actions |
| `app/(tabs)/calendar.tsx` | Monthly calendar grid, date selection, and occasion cards | `@luvmee/shared`, `calendar.ts` | When modifying occasion scheduling, date pickers, or recurring logic |
| `app/(tabs)/messages.tsx` | Private Love Notes composer and timeline with reveal lock controls | Supabase Client, RLS | When enhancing note formatting, moods, or timed reveal animations |
| `app/(tabs)/profile.tsx` | Profile screen, partner pairing status, legal links, sign-out, deletion | WebBrowser, `authService.ts` | When updating user settings, partner status displays, or support links |
| `components/PartnerConnectModal.tsx` | Modal handling 8-character invite code display, sharing, and partner connection | Supabase RPC `connect_partners` | When modifying the partner pairing user flow or invite text |
| `services/authService.ts` | Handles OTP login, guest mode state, session persistence, and logout | `@supabase/supabase-js`, AsyncStorage | When altering authentication mechanisms or token persistence |
| `services/notificationService.ts` | In-app reminder evaluation and fallback synchronization | `@luvmee/shared`, AsyncStorage | When updating local notification scheduling or reminder cooldowns |
| `app.json` | Expo configuration: app name, bundle ID, version (`1.0.0`), `versionCode: 2` | Expo CLI, EAS Build | When updating app store versions, permissions, or splash configurations |
| `eas.json` | EAS Build profiles (`development`, `preview` APK, `production` AAB) | EAS CLI | When changing build outputs, keystore profiles, or cloud env variables |

### Recipient Web Application (`apps/recipient-web`)
| File / Directory Path | Architectural Responsibility | Key Dependencies | When to Modify |
| :--- | :--- | :--- | :--- |
| `app/layout.tsx` | Root HTML shell, fonts, metadata, and viewport configuration | Next.js App Router | When modifying SEO tags, root layouts, or global CSS imports |
| `app/page.tsx` | Public landing page introducing LUVMEE with direct app download links | `LegalNav.tsx`, `LegalFooter.tsx` | When updating homepage copy, marketing graphics, or store badges |
| `app/e/[slug]/page.tsx` | Dynamic server-rendered recipient card viewer | Supabase Client, `@luvmee/shared` | When enhancing digital greeting card animations or recipient features |
| `app/privacy/page.tsx` | Official Google Play compliant Privacy Policy | `LegalNav.tsx`, `LegalFooter.tsx` | When updating legal privacy disclosures or collected data categories |
| `app/terms/page.tsx` | Official Terms of Service for relationship messaging | `LegalNav.tsx`, `LegalFooter.tsx` | When updating terms of use, age limits, or dispute clauses |
| `app/support/page.tsx` | Help & Support portal with feature guides and support contact form | `LegalNav.tsx`, `LegalFooter.tsx` | When adding new help guides, FAQs, or updating customer service emails |
| `app/delete-account/page.tsx` | Public self-service account deletion portal required by Google Play | `DeleteAccountForm.tsx` | When modifying public account deletion flows or verification emails |

### Shared Business Logic (`packages/shared`)
| File / Directory Path | Architectural Responsibility | Key Dependencies | When to Modify |
| :--- | :--- | :--- | :--- |
| `src/schemas/` | Zod validation schemas for occasions, profiles, love notes, cards | Zod | When adding or altering data models to ensure mobile/web parity |
| `src/utils/calendar.ts` | Date arithmetic, leap year calculations, unknown-year logic, day deltas | Pure TypeScript | When modifying anniversary math or reminder date calculations |
| `src/templates/` | Pre-designed greeting card themes, color palettes, and animation configs | Pure TypeScript | When introducing new card templates or visual themes |
