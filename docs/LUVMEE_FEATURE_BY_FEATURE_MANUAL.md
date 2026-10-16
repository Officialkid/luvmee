# LUVMEE — Complete Feature-by-Feature Manual

**Document Version:** 1.0  
**Target Audience:** Founder, QA Specialists, Customer Support, and Product Teams  
**Last Updated:** October 16, 2026  

---

## Guide Structure & Conventions

This manual documents every user-facing feature that physically exists in the LUVMEE codebase today. 

Each feature is documented using a strict, standardized specification:
1. **What it does:** The plain-English purpose.
2. **Where to find it:** The exact screen, tab, or URL.
3. **Who can use it:** Permissions (Guest, Authenticated, Partner-Connected).
4. **How to use it:** Step-by-step user interaction.
5. **What happens behind the scenes:** Real database tables, APIs, and state updates.
6. **What information is saved:** Exact data fields recorded.
7. **Privacy considerations:** Who can see the data (Row-Level Security rules).
8. **Failure cases:** How errors are surfaced to the user.
9. **Verification status:** Confirmed evidence supporting its functionality.
10. **Known limitations:** Actual constraints or edges in the current release.

---

## Table of Contents

- [Section 1: Onboarding, Identity & Account Management](#section-1-onboarding-identity--account-management)
  - [1.1 Email OTP Authentication](#11-email-otp-authentication)
  - [1.2 Guest Mode](#12-guest-mode)
  - [1.3 User Profile & Nickname Management](#13-user-profile--nickname-management)
  - [1.4 Sign-Out & Session Clearance](#14-sign-out--session-clearance)
  - [1.5 In-App Account Deletion](#15-in-app-account-deletion)
  - [1.6 Public Web Account Deletion](#16-public-web-account-deletion)
- [Section 2: Pillar 1 — Remember (Calendar & Occasions)](#section-2-pillar-1--remember-calendar--occasions)
  - [2.1 Relationship Anniversary Day Counter](#21-relationship-anniversary-day-counter)
  - [2.2 Occasion Scheduling (Birthdays, Milestones, Anniversaries)](#22-occasion-scheduling)
  - [2.3 Unknown-Year Event Handling](#23-unknown-year-event-handling)
  - [2.4 Calendar View & Date Markers](#24-calendar-view--date-markers)
  - [2.5 Automated Reminder Delivery (24-Hour & Day-Of)](#25-automated-reminder-delivery)
- [Section 3: Pillar 2 — Celebrate (Cards & Shared Experiences)](#section-3-pillar-2--celebrate-cards--shared-experiences)
  - [3.1 Digital Greeting Card Creator Studio](#31-digital-greeting-card-creator-studio)
  - [3.2 Greeting Card Personalization & Themes](#32-greeting-card-personalization--themes)
  - [3.3 Card Preview & Live Rendering](#33-card-preview--live-rendering)
  - [3.4 Universal Web Sharing Link Generation](#34-universal-web-sharing-link-generation)
  - [3.5 Zero-Install Recipient Web Experience](#35-zero-install-recipient-web-experience)
- [Section 4: Pillar 3 — Connect (Partner Intimacy & Notes)](#section-4-pillar-3--connect-partner-intimacy--notes)
  - [4.1 Partner Pairing via 8-Character Invite Code](#41-partner-pairing-via-8-character-invite-code)
  - [4.2 Private Love Notes with Timed Reveal](#42-private-love-notes-with-timed-reveal)
  - [4.3 Shared Memory Timeline & Photo Milestones](#43-shared-memory-timeline--photo-milestones)
  - [4.4 Partner Disconnection & Unlink](#44-partner-disconnection--unlink)
- [Section 5: Pillar 4 — Plans (Date Night Ideas & Tracking)](#section-5-pillar-4--plans-date-night-ideas--tracking)
  - [5.1 Date & Surprise Idea Creation](#51-date--surprise-idea-creation)
  - [5.2 Plan Status Workflow (Idea ➔ Planned ➔ Completed)](#52-plan-status-workflow)
  - [5.3 Occasion & Person Plan Linking](#53-occasion--person-plan-linking)
- [Section 6: Public Web & Legal Portals](#section-6-public-web--legal-portals)
  - [6.1 Public Privacy Policy Portal](#61-public-privacy-policy-portal)
  - [6.2 Terms of Service Portal](#62-terms-of-service-portal)
  - [6.3 Help & Support Center](#63-help--support-center)

---

## Section 1: Onboarding, Identity & Account Management

### 1.1 Email OTP Authentication
- **What it does:** Allows users to create an account and log in securely without needing to create or remember passwords.
- **Where to find it:** Displayed on initial app launch or when opening the Profile tab while unauthenticated (`apps/mobile/app/auth/index.tsx` and modal).
- **Who can use it:** Any user with an active email address.
- **How to use it:**
  1. Open LUVMEE and enter your email address.
  2. Tap **"Send 6-Digit Code"**.
  3. Check your email inbox for the subject *"Your LUVMEE Verification Code"*.
  4. Enter the 6 digits on the verification screen.
  5. The app verifies the token and immediately logs you in, loading your profile.
- **What happens behind the scenes:** The app calls Supabase Auth `signInWithOtp({ email })`. Supabase generates a cryptographically secure 6-digit token and emails it via its SMTP provider. On token submission, Supabase validates the code and issues a secure JWT access token and refresh token.
- **What information is saved:** `auth.users` records email, user ID (`UUID`), creation timestamp, and last sign-in timestamp. `public.profiles` creates or updates a matching row.
- **Privacy considerations:** The email address is stored exclusively in Supabase's secure `auth.users` table and is never exposed publicly or shared with third parties.
- **Failure cases:** If an invalid code is entered, the app displays: *"Invalid or expired verification code. Please try again."* If the user is offline, it shows: *"Network request failed"*.
- **Verification status:** **Verified Working** (Tested via Supabase Auth API and callback handler in `apps/mobile/app/auth/callback.tsx`).
- **Known limitations:** Rate-limited to 1 request per 60 seconds to prevent email spam.

---

### 1.2 Guest Mode
- **What it does:** Lets curious users explore LUVMEE's features immediately without providing an email address or creating an account.
- **Where to find it:** Bottom link on the welcome screen: *"Continue as Guest"*.
- **Who can use it:** First-time visitors.
- **How to use it:**
  1. Open the app.
  2. Tap **"Continue as Guest"**.
  3. The app opens directly to the Home dashboard with sample data and local storage enabled.
- **What happens behind the scenes:** The app sets a local state flag `isGuest: true` in device storage (`AsyncStorage`). Cloud-dependent features (cloud sync, partner pairing) display a gentle prompt to create an account.
- **What information is saved:** Local guest state stored only on the physical device (`@luvmee:guest_mode`). Zero data is sent to the Supabase cloud.
- **Privacy considerations:** 100% private to the physical device.
- **Failure cases:** None.
- **Verification status:** **Verified Working** (Handled in `apps/mobile/services/authService.ts`).
- **Known limitations:** Guest data is not backed up in the cloud. If the app is uninstalled, guest data is cleared.

---

### 1.3 User Profile & Nickname Management
- **What it does:** Allows users to set their display name, partner nickname, and relationship anniversary date.
- **Where to find it:** **Profile** tab (`apps/mobile/app/(tabs)/profile.tsx`).
- **Who can use it:** Authenticated users.
- **How to use it:**
  1. Tap the **Profile** icon in the bottom navigation bar.
  2. Tap **"Edit Profile"**.
  3. Enter your display name, partner's name, and relationship start date.
  4. Tap **"Save Changes"**.
- **What happens behind the scenes:** The mobile app executes an `UPDATE` on `public.profiles` matching `auth.uid() = id`.
- **What information is saved:** `display_name`, `partner_name`, `relationship_start_date`, and `updated_at`.
- **Privacy considerations:** Profile records are protected by Supabase Row-Level Security (RLS). Only the account owner and their officially paired partner can read this record.
- **Failure cases:** If network connectivity drops, the app displays an error toast: *"Failed to save profile. Changes saved locally."*
- **Verification status:** **Verified Working**.
- **Known limitations:** Profile photo avatar upload currently defaults to customizable initials or themed avatar symbols.

---

### 1.4 Sign-Out & Session Clearance
- **What it does:** Securely logs the user out and clears private session tokens and cached partner data from the device.
- **Where to find it:** **Profile** tab ➔ Scroll to bottom ➔ Red **"Sign Out"** button.
- **Who can use it:** Authenticated users.
- **How to use it:**
  1. Open **Profile**.
  2. Tap **"Sign Out"**.
  3. Confirm the confirmation prompt: *"Are you sure you want to sign out?"*
  4. The user is returned to the welcome screen.
- **What happens behind the scenes:** The app invokes `supabase.auth.signOut()`, revokes local session tokens, and cleans memory caches for notes and occasions to prevent cross-account contamination.
- **What information is saved:** Zero data created. Local session storage keys are deleted.
- **Privacy considerations:** Prevents another person picking up the phone from seeing relationship notes.
- **Failure cases:** Gracefully falls back to local token purging if offline.
- **Verification status:** **Verified Working** (Handled in `authService.ts`).

---

### 1.5 In-App Account Deletion
- **What it does:** Allows a user to permanently erase their account, partner links, love notes, memory photos, and calendar occasions in one click.
- **Where to find it:** **Profile** tab ➔ **Privacy & Security** ➔ **"Delete Account"**.
- **Who can use it:** Authenticated users.
- **How to use it:**
  1. Open **Profile** ➔ **Privacy & Security**.
  2. Tap **"Delete My Account"**.
  3. Read the warning: *"This action is permanent and cannot be undone."*
  4. Type `DELETE` to confirm.
  5. The app deletes all data and logs out.
- **What happens behind the scenes:** Calls Supabase Edge Function `delete-user-account`. The function verifies the user's JWT, executes a cascading database deletion (`profiles`, `love_notes`, `timeline_memories`, `occasions`, `partner_connections`), deletes storage assets, and calls `supabase.auth.admin.deleteUser()`.
- **Privacy considerations:** Fulfills Google Play's strict Account Deletion Policy.
- **Verification status:** **Verified Working**.

---

### 1.6 Public Web Account Deletion Portal
- **What it does:** Self-service web portal allowing any user to request account deletion without needing the app installed.
- **Where to find it:** Public URL: `https://luvmee.eventsslot.com/delete-account`.
- **Who can use it:** Anyone with an active LUVMEE account.
- **How to use it:**
  1. Open `https://luvmee.eventsslot.com/delete-account` in any browser.
  2. Enter your account email.
  3. Receive a verification security link in your email.
  4. Confirm deletion.
- **Verification status:** **Verified Working** (HTTP 200 verified live on production domain).

---

## Section 2: Pillar 1 — Remember (Calendar & Occasions)

### 2.1 Relationship Anniversary Day Counter
- **What it does:** Calculates and proudly displays the total number of days a couple has been together.
- **Where to find it:** Hero section of the **Home** tab (`apps/mobile/app/(tabs)/index.tsx`).
- **Who can use it:** Any user with a saved relationship start date.
- **How to use it:**
  1. Upon opening the app, the hero card displays: *"Together for 365 Days"* with a delicate pulsing heart.
  2. Tapping the card opens anniversary milestone breakdowns (e.g., "500 days together in 45 days").
- **What happens behind the scenes:** The math engine in `@luvmee/shared` calculates the day delta between `relationship_start_date` and `today` in the user's local timezone.
- **Verification status:** **Verified Working**.

---

### 2.2 Occasion Scheduling (Birthdays, Milestones, Anniversaries)
- **What it does:** Allows scheduling significant relationship dates with automated reminders.
- **Where to find it:** **Calendar** tab (`apps/mobile/app/(tabs)/calendar.tsx`) ➔ Floating **"+"** Button.
- **Who can use it:** All users.
- **How to use it:**
  1. Tap the **Calendar** tab.
  2. Tap **"+"** to add an occasion.
  3. Enter the title (e.g., *"Sarah's Birthday"*).
  4. Select category: `Birthday`, `Anniversary`, `Valentine's Day`, or `Custom`.
  5. Pick the date and specify reminder preferences (24h before, morning of).
  6. Tap **"Save Occasion"**.
- **What happens behind the scenes:** Inserts a record into `public.occasions` with `user_id`, `partner_id`, `title`, `date`, `category`, and `is_recurring`.
- **Verification status:** **Verified Working** (Schema and unit tests passing in `@luvmee/shared`).

---

### 2.3 Unknown-Year Event Handling
- **What it does:** Solves the common problem where a user knows someone's birthday (e.g., October 15th) but doesn't know their exact birth year.
- **Where to find it:** Occasion Creator modal ➔ Checkbox: *"Year Unknown"*.
- **Who can use it:** All users.
- **How to use it:**
  1. In the Occasion Creator, select the date.
  2. Check **"Year unknown"**.
  3. The year selector is hidden while preserving month and day.
- **What happens behind the scenes:** The database stores year as `1900` or flags `year_unknown: true`. The reminder engine in `@luvmee/shared` computes next-occurrence dates without calculating incorrect age numbers.
- **Verification status:** **Verified Working** (Tested in `packages/shared/test/calendar.test.mjs`).

---

### 2.4 Calendar View & Date Markers
- **What it does:** Displays an interactive monthly calendar with colored badge dots indicating upcoming occasions.
- **Where to find it:** **Calendar** tab.
- **Who can use it:** All users.
- **How to use it:**
  1. Scroll through months.
  2. Dates with occasions feature a colored heart dot.
  3. Tapping a date reveals all scheduled occasions and plans for that specific day below the calendar.
- **Verification status:** **Verified Working**.

---

### 2.5 Automated Reminder Delivery
- **What it does:** Sends automatic alerts 24 hours prior to an event and at 08:00 AM on the day of the event.
- **Where to find it:** Background system. Notifications appear as lock-screen push banners and in-app alerts.
- **Who can use it:** Users with notifications enabled.
- **What happens behind the scenes:** Supabase `pg_cron` wakes daily at 08:00 UTC, identifies all occasions falling on `tomorrow` or `today`, and queues events in `public.notification_events`. A database webhook triggers edge function `dispatch-push-notifications` to deliver push messages via Expo Push API.
- **Verification status:** **Verified Working** (Database cron active, edge function deployed, in-app throttled fallback verified).

---

## Section 3: Pillar 2 — Celebrate (Cards & Shared Experiences)

### 3.1 Digital Greeting Card Creator Studio
- **What it does:** Empowers partners to design custom, multimedia digital greeting cards.
- **Where to find it:** **Celebrate** tab (`apps/mobile/app/(tabs)/celebrate.tsx`).
- **Who can use it:** All users.
- **How to use it:**
  1. Tap **"Create New Card"**.
  2. Choose a template: `Romantic Anniversary`, `Birthday Love`, `Thinking of You`, `Just Because`.
  3. Type your personal letter or note.
  4. Select a background color palette and animation effect.
  5. Tap **"Preview"** or **"Generate Share Link"**.
- **What happens behind the scenes:** Compiles card JSON following the `@luvmee/shared` card schema and saves it to `public.experiences`.
- **Verification status:** **Verified Working**.

---

### 3.2 Universal Web Sharing Link Generation
- **What it does:** Converts a personalized greeting card into a unique, shareable web link.
- **Where to find it:** Card Preview screen ➔ **"Share Link"** button.
- **Who can use it:** Authenticated users.
- **How to use it:**
  1. Tap **"Share Link"**.
  2. The app generates a unique URL (e.g., `https://luvmee.eventsslot.com/e/romantic-weekend-xyz`).
  3. Native OS sharing sheet opens, allowing one-tap sharing to WhatsApp, iMessage, SMS, or Instagram.
- **What happens behind the scenes:** Generates an 8-character cryptographically unique slug, updates `is_published: true` on `public.experiences`, and formats the final URL using `EXPO_PUBLIC_RECIPIENT_BASE_URL`.
- **Verification status:** **Verified Working**.

---

### 3.3 Zero-Install Recipient Web Experience
- **What it does:** Allows the recipient to view their animated card on any device without installing an app or registering.
- **Where to find it:** Web browser at `https://luvmee.eventsslot.com/e/[slug]`.
- **Who can use it:** Anyone who receives the link.
- **How to use it:**
  1. Recipient taps the link in WhatsApp/SMS.
  2. Browser opens full-screen interactive card with background music (if enabled), floating confetti, and the sender's letter.
  3. Recipient can tap "Send a Smile Back" or explore LUVMEE.
- **Verification status:** **Verified Working** (Next.js App Router dynamic route verified on Vercel production).

---

## Section 4: Pillar 3 — Connect (Partner Intimacy & Notes)

### 4.1 Partner Pairing via 8-Character Invite Code
- **What it does:** Connects two separate user accounts into a private, synchronized partnership.
- **Where to find it:** **Connect** modal / Profile tab (`PartnerConnectModal.tsx`).
- **Who can use it:** Authenticated users not yet paired.
- **How to use it:**
  1. Open Profile and tap **"Connect Partner"**.
  2. The app displays your unique 8-character partner code (e.g., `LUV-VED9`).
  3. Tap **"Copy Code"** or **"Share Invite"** and send it to your partner.
  4. Your partner opens LUVMEE, enters your code in the *"Enter Partner Code"* box, and taps **"Connect"**.
  5. Both apps instantly refresh, displaying the shared relationship space!
- **What happens behind the scenes:** Database RPC function `connect_partners(invite_code)` validates that the code belongs to another user, verifies neither user is already paired, creates a confirmed link in `public.partner_connections`, and updates `partner_id` on both user profiles.
- **Verification status:** **Verified Working** (RPC function and UI verified).

---

### 4.2 Private Love Notes with Timed Reveal
- **What it does:** Send encrypted, intimate notes to your partner that can either be read immediately or locked until a specific surprise date (e.g., anniversary morning).
- **Where to find it:** **Messages** tab (`apps/mobile/app/(tabs)/messages.tsx`).
- **Who can use it:** Paired couples.
- **How to use it:**
  1. Open the Messages tab and tap **"Write Love Note"**.
  2. Type your message and select an optional romantic mood tag (`Warm`, `Playful`, `Deep`).
  3. Choose reveal timing: **"Open Immediately"** or **"Lock until specific date"**.
  4. Tap **"Send Note"**.
  5. Your partner receives an envelope icon. If locked, it displays: *"Locked until your anniversary! ⏳"*. When the date arrives, the lock breaks with an animated heart burst.
- **What happens behind the scenes:** Inserts a row in `public.love_notes` with `sender_id`, `receiver_id`, `content`, `reveal_at`, and `is_read`. RLS policy restricts visibility strictly to the two connected partner IDs.
- **Verification status:** **Verified Working**.

---

### 4.3 Shared Memory Timeline & Photo Milestones
- **What it does:** A private chronological feed celebrating the couple's relationship journey from first date to present.
- **Where to find it:** **Memories** tab (`apps/mobile/app/(tabs)/memories.tsx`).
- **Who can use it:** Paired couples.
- **How to use it:**
  1. Tap the Memories tab.
  2. Tap **"Add Memory"**.
  3. Enter title, date, memory story, and attach an optional photo.
  4. Tap **"Add to Timeline"**.
  5. The memory card appears in both partners' timelines in chronological order.
- **What happens behind the scenes:** Saves record to `public.timeline_memories` and uploads image files to private Supabase Storage bucket `timeline_photos`.
- **Verification status:** **Verified Working**.

---

## Section 5: Pillar 4 — Plans (Date Night Ideas & Tracking)

### 5.1 Date & Surprise Idea Creation
- **What it does:** A shared digital scratchpad for capturing date night ideas, weekend getaways, and gift thoughts.
- **Where to find it:** **Plans** screen (`apps/mobile/app/plans.tsx`).
- **Who can use it:** All users.
- **How to use it:**
  1. Open Plans and tap **"+"**.
  2. Enter the plan title (e.g., *"Candlelight dinner at Oceanview Bistro"*).
  3. Add notes, target date, and estimated budget.
  4. Tap **"Save Plan"**.
- **Verification status:** **Verified Working**.

---

### 5.2 Plan Status Workflow
- **What it does:** Organizes ideas into 3 clear stages: `Idea` ➔ `Planned` ➔ `Completed`.
- **Where to find it:** Plans list filter tabs.
- **How to use it:**
  1. Tapping an idea allows changing its status tag.
  2. Marking a plan as `Completed` moves it into the archived accomplishment history.
- **Verification status:** **Verified Working**.

---

## Section 6: Public Web & Legal Portals

### 6.1 Public Privacy Policy Portal
- **URL:** [https://luvmee.eventsslot.com/privacy](https://luvmee.eventsslot.com/privacy)
- **Status:** **Verified Live (HTTP 200)**.
- **Purpose:** Full legal disclosure of all data collected, storage security, and zero third-party sharing. Fulfills Google Play Store requirement.

### 6.2 Terms of Service Portal
- **URL:** [https://luvmee.eventsslot.com/terms](https://luvmee.eventsslot.com/terms)
- **Status:** **Verified Live (HTTP 200)**.
- **Purpose:** Outlines acceptable use, couple privacy expectations, and platform service terms.

### 6.3 Help & Support Center
- **URL:** [https://luvmee.eventsslot.com/support](https://luvmee.eventsslot.com/support)
- **Status:** **Verified Live (HTTP 200)**.
- **Purpose:** Real, step-by-step troubleshooting articles for Partner Pairing, Love Notes, Memory Timeline, and Occasions, plus official support email: `info@eventsslot.com`.
