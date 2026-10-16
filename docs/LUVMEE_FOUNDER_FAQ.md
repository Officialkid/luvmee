# LUVMEE — Founder & Investor FAQ

**Document Version:** 1.0  
**Target Audience:** Founder, Potential Investors, Strategic Partners, and Advisors  
**Last Updated:** October 16, 2026  

---

## 1. Product & Business Fundamentals

### Q1: What exactly is LUVMEE?
**A:** LUVMEE is a mobile-first relationship management and intimacy platform for romantic couples. It combines a shared anniversary day counter, smart two-wave reminder calendar, private Love Notes channel with timed surprise reveals, and a universal digital greeting card generator that recipients can view on any web browser without downloading an app.

### Q2: What makes LUVMEE different from Google Calendar or Apple Reminders?
**A:** Standard calendar apps are designed for business meetings and dentist appointments. They lack emotional resonance, don't calculate days together, can't send surprise letters, and don't create a private shared sanctuary for two partners. LUVMEE turns anniversary remembering into an intimate, celebratory experience rather than a cold notification.

### Q3: What is LUVMEE’s core brand positioning?
**A:** **“A little help remembering. A better way to show you care.”**

### Q4: Can someone try LUVMEE without giving an email address?
**A:** **Yes.** LUVMEE features an instant **Guest Mode**. A user can download the app, tap *"Continue as Guest"*, and immediately test the Calendar, explore date night ideas, and preview greeting card templates. Upgrading to an email account is only required when they are ready to link with their partner or save data to the cloud.

---

## 2. Intimacy, Privacy & Data Security

### Q5: Does LUVMEE sell user data or show advertisements?
**A:** **No, absolutely not.** LUVMEE contains zero advertising SDKs, zero third-party tracking pixels, and zero data broker partnerships. The Google Play Store Data Safety declaration explicitly discloses zero third-party data sharing.

### Q6: Can strangers or other users see our private love notes or photos?
**A:** **No.** All intimate content is secured at the database layer using PostgreSQL **Row-Level Security (RLS)**. Even if an attacker gains network access, the database engine strictly refuses to return any note, photo, or occasion unless the requester's authenticated ID matches the note's sender or receiver.

### Q7: How does partner pairing work? Can three people connect?
**A:** Partner pairing is strictly **1-on-1**. Each user is assigned an 8-character code (e.g., `LUV-VED9`). Partner B enters Partner A's code to link. Once linked, the database locks the pairing. A user cannot link with a second person without explicitly unlinking their existing partner first.

### Q8: What happens when a user requests account deletion?
**A:** Unlike apps that merely "deactivate" or hide accounts, LUVMEE performs a permanent, irreversible purge across all database tables, erases uploaded photos from cloud storage, deletes the user identity from Supabase Auth, and wipes all local phone storage.

---

## 3. Technology & Architecture

### Q9: Why doesn't LUVMEE use passwords for login?
**A:** Passwords create high friction, account lockouts, and security vulnerabilities. LUVMEE uses **Passwordless Email OTP (One-Time Passwords)**. Users enter their email and receive a secure 6-digit code. It is fast, familiar, and eliminates password reset support requests completely.

### Q10: Does LUVMEE send reminders automatically if the app is closed?
**A:** **Yes.** A daily alarm clock (`pg_cron`) runs in the Supabase cloud every morning at 08:00 UTC. It scans all couples' calendars, identifies anniversaries occurring today or tomorrow, and dispatches push notifications directly to user phone lock screens via the Expo Push Gateway.

### Q11: What if a user knows their partner's birthday but not the birth year?
**A:** LUVMEE includes intelligent **Unknown Year Logic**. A user can check *"Year Unknown"*. The reminder engine continues to sound the alarm every year on that month and day without displaying inaccurate age calculations.

### Q12: Does the recipient of a digital card need to download the app?
**A:** **No.** Cards are rendered by the recipient website at `https://luvmee.eventsslot.com/e/[slug]`. The recipient opens the link in Safari, Chrome, or any mobile browser to experience the unboxing animation, floating confetti, and love letter with zero login required.

### Q13: Can LUVMEE run on Apple iPhones (iOS)?
**A:** **Yes.** LUVMEE is built with **React Native and Expo**, which is natively cross-platform. While Version 1.0 is currently launching first on Android via Google Play, the codebase is fully prepared for an iOS App Store submission via EAS Build (`npx eas-cli build --platform ios`).

---

## 4. Cloud Infrastructure & Operating Costs

### Q14: Which external services does LUVMEE depend on?
**A:** LUVMEE relies on four premier cloud providers:
1. **Supabase:** PostgreSQL database, user authentication, file storage, and edge functions.
2. **Vercel:** Hosting and global edge CDN for `https://luvmee.eventsslot.com`.
3. **Expo / EAS:** Cloud mobile app compiler and push notification delivery service.
4. **Google Play Console:** Official Android app distribution platform.

### Q15: What does it cost to keep LUVMEE running right now?
**A:** During the launch phase, operational infrastructure costs are virtually **$0 to $25 per month**:
- **Vercel:** Running on the Free Hobby Tier (Generous bandwidth and serverless limits).
- **Supabase:** Running on the Free Tier (Up to 50,000 monthly active users and 500MB database storage). Upgrading to Pro is an affordable $25/month when scaling.
- **Expo / EAS:** Running on the Free Tier for builds and push notifications.

### Q16: What happens if Supabase experiences a temporary outage?
**A:** Existing app users can still open LUVMEE and view previously cached memories and occasions stored locally in `AsyncStorage`. If they try to write a new note or save a card while offline, the app gently notifies them: *"Offline — changes will sync once connection is restored."*

---

## 5. Operations & Release Roadmap

### Q17: What is the current status of LUVMEE Version 1.0?
**A:** **Submitted & In Review on Google Play.** All store listing copy, graphics, privacy policies, data safety forms, and release bundles were completed and submitted on October 15, 2026.

### Q18: Why does Google require 12 testers for 14 days before public release?
**A:** In November 2023, Google introduced a global policy for all personal developer accounts to ensure new apps are tested by real humans before reaching billions of users. Once 12+ testers use LUVMEE for 14 days, Google automatically unlocks public production release access.

### Q19: What can the founder manage without hiring a developer?
**A:** The founder can independently:
- Add or remove testers in Google Play Console.
- Update store listing text, feature graphics, and screenshots.
- View user sign-ups and auth logs in Supabase.
- Update customer support email addresses.
- Monitor crash reports and app reviews.

### Q20: When does the founder need to call a developer?
**A:** Involve a developer only if:
- Modifying the underlying database tables or SQL schemas.
- Adding new product features or changing native device permissions.
- Updating sensitive backend security policies.
