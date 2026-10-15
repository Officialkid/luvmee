# LUVMEE — Google Play Store Submission Pack

**Document Version:** 1.0.0  
**Date:** October 15, 2026  
**Target Platform:** Google Play Console  
**Application ID:** `com.officialkid.luvmee`  
**Target SDK:** Android 15 / 16 (API 35+)  

---

## 1. Store Listing Copy

### App Title (Max 30 Characters)
```text
LUVMEE: Couples & Love Notes
```
*(Character count: 28 / 30)*

*Alternative approved title:*
```text
LUVMEE: Relationship Calendar
```
*(Character count: 29 / 30)*

---

### Short Description (Max 80 Characters)
```text
Remember birthdays, exchange private daily love notes, and celebrate your partner.
```
*(Character count: 80 / 80)*

---

### Full Description (Up to 4,000 Characters)
```text
LUVMEE (Love Me) is your private, shared space to celebrate your relationship, remember the moments that matter, and make your partner smile every single day.

Life gets busy, but remembering the people you love shouldn't feel like a chore. LUVMEE brings together intimate daily communication, relationship milestone tracking, and personalized digital surprises into one warm, beautifully crafted mobile experience.

----------------------------------------
WHAT YOU CAN DO WITH LUVMEE:
----------------------------------------

💕 1. CONNECT IN PRIVATE: LOVE NOTES & SPARKS
• Pair your phones with a simple, secure 6-character partner code.
• Exchange private Love Notes in an intimate, distraction-free chat feed created exclusively for the two of you.
• Explore daily "Love Sparks" conversation prompts designed to ignite meaningful talks and rediscover what you adore about each other.

📅 2. REMEMBER WHO MATTERS: CELEBRATION CALENDAR
• Never miss a birthday, anniversary, or special occasion again.
• Keep a personal directory of the important people in your life—family, close friends, coworkers, or mentors—even if they don't have a LUVMEE account.
• Smart annual recurrence automatically handles countdowns, leap-year dates (February 29th roll-over), and upcoming date highlights.
• Receive timely 24-hour and day-of reminders right on your device.

🎁 3. CELEBRATE WITH DIGITAL SURPRISES
• Design personalized, interactive romantic greeting cards and digital experiences.
• Choose from curated starter themes including Digital Love Letters, Playful Questions with escaping buttons, and Virtual Gift Unboxing.
• Share surprises publicly via a private web link that opens seamlessly on any phone or desktop browser with zero recipient signup required, or keep them strictly partner-exclusive.

✨ 4. PLAN TOGETHER: DATE IDEAS & WISHLISTS
• Save date ideas, restaurants to try, romantic weekend getaways, and gift wishlists.
• Set target dates, add personal notes, and mark plans as completed once experienced together.

🔒 PRIVACY & SECURITY FIRST
• Zero ads: LUVMEE is 100% ad-free. We never sell your personal data or track you across the web.
• Strict database security: Every record is protected by multi-tenant access controls. Your private Love Notes stay between you and your partner.
• Complete ownership: Delete your account and all associated records permanently at any time, directly from the app or via our online deletion portal.

Download LUVMEE today and make every moment count!
```

---

## 2. Store URLs & Listing Contact Details

| Field | Production Value | Verification Status |
| :--- | :--- | :--- |
| **Privacy Policy URL** | `https://luvmee.eventsslot.com/privacy` | Implemented (Verified locally) |
| **Account Deletion URL** | `https://luvmee.eventsslot.com/delete-account` | Implemented (Verified locally) |
| **Support / Help URL** | `https://luvmee.eventsslot.com/support` | Implemented (Verified locally) |
| **Website URL** | `https://luvmee.eventsslot.com` | Deployed & Active |
| **Support Email** | `support@eventsslot.com` | Requires Founder Confirmation |
| **Support Phone** | Optional (leave blank) | Optional |
| **Developer Name** | Founder Name / Official Entity Name | Requires Founder Confirmation |

---

## 3. Store Graphics & Screenshot Specifications

Google Play enforces strict asset format and resolution guidelines:

### A. Required Store Assets

| Asset Type | Dimensions | Aspect Ratio | Format & Rules |
| :--- | :--- | :--- | :--- |
| **App Icon** | `512 x 512 px` | 1:1 | 32-bit PNG, max 1MB. No transparent background (use theme `#FCE7ED`). |
| **Feature Graphic** | `1024 x 500 px` | 1024:500 | JPEG or 24-bit PNG (no alpha), max 15MB. Center-focused artwork. |
| **Phone Screenshots** | Minimum 2, up to 8 | 16:9 or 9:16 | 1080 x 2400 px or 1080 x 1920 px (minimum 1080 px on short side). PNG or JPEG. |

### B. Mandatory Real Screenshot Capture Plan

Capture the following 6 screens directly from the physical Android preview build or high-resolution emulator:

1. **Screenshot 1 — Love Notes:** Navigate to `Messages` tab. Show a warm exchange of notes and a Daily Sparks question prompt.
2. **Screenshot 2 — Celebration Calendar:** Navigate to `Calendar` tab. Show the monthly visual calendar grid with occasion dot indicators and upcoming birthday/anniversary countdown cards.
3. **Screenshot 3 — People Directory:** Navigate to `People` tab. Show saved contacts with relationship badges (Partner, Family, Friend).
4. **Screenshot 4 — Personal Date Plans:** Navigate to `Profile` → `Personal Plans & Wishlist`. Show date ideas, places to visit, and gift ideas.
5. **Screenshot 5 — Partner Connection:** Open Partner Pairing Modal. Show the 6-character partner code (`LUV-XXXX`) and connection state.
6. **Screenshot 6 — Digital Surprise Preview:** Open Experience Studio preview showing an interactive digital love letter or celebration card.

---

## 4. Play Console App Content & Policy Declarations

### A. App Access (Reviewer Instructions)
Google review teams must be able to test all app features:
- **Credential Access:** Select *"All or some functionality is restricted"*.
- **Reviewer Instructions:**
  ```text
  Test Account 1:
  Username: reviewer_one
  Email: reviewer.one@luvmee.eventsslot.com (or test email provided by founder)
  Password: [Provided by Founder in Console]

  Test Account 2 (for partner pairing):
  Username: reviewer_two
  Partner Code: LUV-TEST

  Note: Reviewers can also tap "Explore LUVMEE as Guest" on the sign-in screen to browse templates and create cards without logging in.
  ```

### B. Ads Declaration
- Select: **"No, my app does not contain ads"**.

### C. Content Rating Questionnaire
- **Category:** Social, Communication, or Utility.
- **Violence, Blood, Gore:** No.
- **Profanity or Crude Humor:** No.
- **Sexuality or Nudity:** No.
- **Gambling:** No.
- **User Interaction:** Select *"Users can exchange messages or share content with other users"* (Love Notes between paired partners).
- **Resulting Rating:** Typically **PEGI 3 / ESRB Everyone / Teen (12+)** due to open text messaging between users.

### D. Target Audience and Content
- **Target Age Groups:** Select **18 and over** (Recommended to avoid Google Play's complex "Designed for Families" policy overhead).
- **Appeal to Children:** Select *"No, could not appeal to children under 13"*.

### E. Data Safety Form (Grounded in Code)

| Data Category | Specific Type | Collected? | Shared? | Purpose | Ephemeral? |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Personal Info** | Name / Username | Yes | No | App functionality, profile customization | No |
| **Personal Info** | Email address | Yes | No | Account authentication, password recovery | No |
| **Personal Info** | User IDs (UUID) | Yes | No | Account management, data segregation | No |
| **Messages** | Other in-app messages | Yes | No | Delivering private Love Notes to paired partner | No |
| **Contacts** | Contacts (Directory) | Yes | No | Personal birthday & anniversary tracking | No |
| **Calendar** | Calendar events / dates | Yes | No | Annual celebration reminders | No |
| **Device / Other IDs** | Device Token (Push) | Yes | No | Delivering reminders & note notifications | No |

- **Is data encrypted in transit?** **Yes** (all API calls use HTTPS/TLS).
- **Can users request data deletion?** **Yes** (via in-app button and web URL `https://luvmee.eventsslot.com/delete-account`).
- **Are any collected data categories sold to third parties?** **No**.
- **Is data used for cross-app advertising?** **No**.

---

## 5. Developer Account Testing Rules (Personal vs. Organization)

Google Play enforces closed testing requirements based on the account creation date:

### Determining Your Account Requirement:
1. Open [Google Play Console](https://play.google.com/console).
2. Look at your dashboard for the app.
3. **If you see "Closed Testing (20 testers for 14 days)":**
   - For personal accounts created after **November 13, 2023**, Google requires a closed test with **at least 12 or 20 opted-in testers** continuously for **14 consecutive days** before production access is unlocked.
4. **If your account is an Organization account (D-U-N-S registered) or created before November 13, 2023:**
   - You can publish directly to the Production track after completing app content and store listing reviews.

### Operating the 14-Day Closed Test (If Required):
1. Create a Closed Testing track in Play Console.
2. Create an email list of at least 12–20 Android users (friends, family, colleagues).
3. Send them the closed test invite link generated by Google Play.
4. Ensure all testers accept the invitation and install the app via Google Play.
5. Keep the test active for the full 14 days without interruptions.
6. Once completed, tap **"Apply for Production Access"** in Google Play Console.
