# LUVMEE — Comprehensive Product & Technical Glossary

**Document Version:** 1.0  
**Target Audience:** Founder, Non-Technical Partners, Investors, and Team Members  
**Last Updated:** October 16, 2026  

---

## How to Use This Glossary

Every specialized word, acronym, and concept used across LUVMEE's documentation is defined below in alphabetical order. 

Each entry provides:
1. **Plain Definition:** What it means in everyday language.
2. **Why It Matters to LUVMEE:** How it directly impacts the product.
3. **Practical Example:** A real-world scenario.

---

## Alphabetical Index

[A](#a) • [B](#b) • [C](#c) • [D](#d) • [E](#e) • [G](#g) • [H](#h) • [J](#j) • [K](#k) • [L](#l) • [M](#m) • [N](#n) • [O](#o) • [P](#p) • [R](#r) • [S](#s) • [T](#t) • [U](#u) • [V](#v) • [Z](#z)

---

### A

#### AAB (Android App Bundle)
- **Definition:** The modern packaging format required by Google Play to publish Android applications.
- **Why it matters to LUVMEE:** Since August 2021, Google Play bans standalone `.apk` files for new apps. LUVMEE must be compiled into an `.aab` bundle to be distributed through the Play Store.
- **Example:** Running `npx eas-cli build --profile production` outputs `application-xyz.aab`, which is uploaded to Google Play Console.

#### API (Application Programming Interface)
- **Definition:** A secure electronic bridge that lets two different software applications talk to each other.
- **Why it matters to LUVMEE:** When the mobile app wants to fetch a partner's love note, it calls the Supabase API to retrieve it.
- **Example:** Like a waiter carrying an order from your table to the kitchen and bringing back your meal.

#### AsyncStorage
- **Definition:** A private storage compartment located directly on a user's physical phone.
- **Why it matters to LUVMEE:** Stores login tokens, guest mode preferences, and offline reminder caches so the user stays logged in without touching the internet.
- **Example:** When you reopen LUVMEE after days away, `AsyncStorage` remembers who you are and skips the login screen.

#### Authentication
- **Definition:** The digital verification system that checks a user's identity before letting them in.
- **Why it matters to LUVMEE:** Protects intimate relationship data so strangers cannot read a couple's private love notes.
- **Example:** Typing a 6-digit code sent to your email to prove you own the account.

---

### B

#### Backend
- **Definition:** The behind-the-scenes engine, database, and cloud servers that handle data storage, reminders, and security out of user sight.
- **Why it matters to LUVMEE:** LUVMEE’s backend is powered by **Supabase**, hosting all database tables, automated alarm clocks, and edge functions.
- **Example:** While the user sees a pretty pink button, the backend actually stores the anniversary date in the cloud.

#### Build
- **Definition:** The automated process of compiling human-readable code into an executable file that a phone or server can run.
- **Why it matters to LUVMEE:** Expo EAS builds our React Native code into an installable Android package.
- **Example:** Turning 100 TypeScript files into a single `.aab` file ready for the Google Play Store.

---

### C

#### Closed Testing (Alpha Track)
- **Definition:** A restricted testing track in Google Play Console where an app is shared with a designated list of trusted testers before public launch.
- **Why it matters to LUVMEE:** For personal developer accounts created after Nov 13, 2023, Google requires a mandatory 14-day closed test with at least 12 opted-in testers before allowing production release.
- **Example:** 15 friends install LUVMEE through an invite link and use it for 14 days, unlocking the public Play Store release.

#### Concurrency Lock
- **Definition:** A safety mechanism that prevents two different background processes from executing the exact same operation at the same time.
- **Why it matters to LUVMEE:** Ensures that the cloud reminder job and in-app fallback service don't accidentally send two identical anniversary notifications.

---

### D

#### Day Counter (Relationship Hero Widget)
- **Definition:** The prominent counter on LUVMEE’s Home dashboard calculating the exact number of days a couple has been together.
- **Why it matters to LUVMEE:** Serves as the emotional anchor of the app, celebrating relationship longevity (e.g., *"Together 412 Days"*).

#### Deduplication Key
- **Definition:** A unique electronic tag assigned to every scheduled notification (combining user ID, occasion ID, and target date).
- **Why it matters to LUVMEE:** Prevents duplicate reminders. If an alert has already fired today, the database sees the tag and skips it.

#### Deno Edge Functions
- **Definition:** Lightweight, super-fast cloud scripts that run on-demand in milliseconds without maintaining a dedicated 24/7 server.
- **Why it matters to LUVMEE:** Powers `dispatch-push-notifications` (delivers lock screen chimes) and `delete-user-account` (permanent data erasure).

---

### E

#### EAS (Expo Application Services)
- **Definition:** Cloud infrastructure provided by Expo that compiles React Native code into native Android and iOS binary packages.
- **Why it matters to LUVMEE:** Allows us to build production `.aab` files in the cloud with Hermes bytecode without needing powerful local Android Studio machines.

#### Environment Variable
- **Definition:** A configuration setting kept outside the code that tells software where servers and public keys live.
- **Why it matters to LUVMEE:** Allows the app to connect to Supabase and Vercel without exposing sensitive master passwords inside public git history.
- **Example:** `EXPO_PUBLIC_SUPABASE_URL` tells the app which database to connect to.

---

### G

#### Guest Mode
- **Definition:** An unauthenticated mode allowing a first-time user to explore LUVMEE's screens and features without providing an email.
- **Why it matters to LUVMEE:** Maximizes user conversion by letting curious visitors test the app with zero initial friction.

---

### J

#### JWT (JSON Web Token)
- **Definition:** An encrypted, tamper-proof electronic passport issued by Supabase when a user signs in.
- **Why it matters to LUVMEE:** The mobile app attaches this token to every database query so the database knows who is making the request.

---

### K

#### Keystore
- **Definition:** A cryptographically secure digital key used to sign an Android app binary before submission to Google Play.
- **Why it matters to LUVMEE:** Google Play requires all updates to be signed with the exact same keystore (`kli75Ms7Ws`). EAS securely manages this in the cloud.

---

### L

#### Love Note
- **Definition:** A private romantic message sent between connected partners inside LUVMEE.
- **Why it matters to LUVMEE:** Supports **Timed Surprise Reveals** (notes can be locked until an anniversary or birthday morning).

---

### M

#### Monorepo
- **Definition:** A software repository structure where multiple related projects (mobile app, recipient web, shared library) live together in one repository.
- **Why it matters to LUVMEE:** Allows mobile and web to share data models and anniversary math from `@luvmee/shared` without duplicating code.

---

### N

#### Next.js 15
- **Definition:** A premier React web framework created by Vercel for building high-speed, server-rendered websites.
- **Why it matters to LUVMEE:** Powers the recipient web application (`apps/recipient-web`), rendering interactive greeting cards and legal pages.

---

### O

#### Occasion
- **Definition:** Any significant calendar event tracked in LUVMEE, such as a birthday, wedding anniversary, first date, or custom milestone.
- **Why it matters to LUVMEE:** Feeds both the relationship calendar and the two-wave automated reminder engine.

#### OTP (One-Time Password)
- **Definition:** A single-use 6-digit numeric security code emailed to a user to verify their identity.
- **Why it matters to LUVMEE:** Eliminates passwords completely, making login effortless and immune to password reuse hacks.

---

### P

#### Partner Code (Invite Code)
- **Definition:** An 8-character uppercase identifier (e.g., `LUV-VED9`) assigned to each registered user.
- **Why it matters to LUVMEE:** Allows two partners to pair their accounts securely without searching through public user directories.

#### pg_cron
- **Definition:** A PostgreSQL database extension that acts as a reliable, built-in scheduled alarm clock.
- **Why it matters to LUVMEE:** Wakes up every day at 08:00 UTC to evaluate upcoming occasions and queue reminder alerts.

---

### R

#### Recipient Website
- **Definition:** The public web application hosted at `https://luvmee.eventsslot.com`.
- **Why it matters to LUVMEE:** Allows recipients to open digital greeting cards on any phone or computer without installing an app or registering.

#### Row-Level Security (RLS)
- **Definition:** A database security feature where access rules are enforced directly by the database engine for every single row.
- **Why it matters to LUVMEE:** Guarantees that Partner A and Partner B can only see their own notes and occasions, never another couple's data.

---

### S

#### Supabase
- **Definition:** An open-source cloud backend platform providing managed PostgreSQL databases, user authentication, file storage, and edge functions.
- **Why it matters to LUVMEE:** Serves as the central cloud brain for the entire LUVMEE ecosystem.

---

### T

#### Timed Reveal
- **Definition:** A feature of LUVMEE Love Notes where a message is delivered immediately but remains sealed until a future date.
- **Why it matters to LUVMEE:** Builds anticipation and romance for upcoming milestones.

---

### U

#### Unknown Year Logic
- **Definition:** An intelligent date calculation feature that tracks birthdays or milestones when the user only knows the month and day.
- **Why it matters to LUVMEE:** Ensures reminders still trigger annually without displaying bizarre or inaccurate age numbers.

---

### V

#### Vercel
- **Definition:** A leading global cloud platform designed for deploying Next.js web applications with automatic scaling and zero configuration.
- **Why it matters to LUVMEE:** Hosts `https://luvmee.eventsslot.com` with 99.99% uptime and global CDN distribution.

#### Version Code (`versionCode`)
- **Definition:** A strictly increasing positive integer required by Google Play to distinguish different builds of an Android app.
- **Why it matters to LUVMEE:** Every time a new `.aab` is uploaded to Google Play, the `versionCode` in `app.json` must be bumped (e.g. from 1 to 2).

---

### Z

#### Zod
- **Definition:** A TypeScript-first data validation library that ensures data matches expected structures before being saved.
- **Why it matters to LUVMEE:** Prevents malformed, corrupted, or incomplete data from ever reaching database tables.
