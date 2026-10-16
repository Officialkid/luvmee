# LUVMEE — Plain-English Founder's Guide

**Document Version:** 1.0  
**Target Audience:** Founder, Business Partners, Investors, and Non-Technical Stakeholders  
**Last Updated:** October 16, 2026  

---

## Introduction: How to Think About Software

Building an app can feel overwhelming because software engineers use dozens of specialized terms like "APIs", "environment variables", "cron jobs", and "edge functions".

In reality, software is just like a well-organized physical business:
- The **mobile app** is the storefront your customers carry in their pockets.
- The **recipient website** is a public greeting card display stand accessible from any sidewalk.
- The **database** is a secure filing cabinet with smart locks.
- The **backend** is the office staff working behind closed doors to deliver mail, check IDs, and sound reminder alarms.

This guide explains every important part of LUVMEE in plain, everyday English. By the end of this document, you will have a clear mental picture of how LUVMEE works, how all the pieces connect, and how to talk about it with confidence.

---

## 1. The Mobile Application

### What it means in everyday language
The mobile application is the program that a user downloads from the app store and installs directly on their phone. When they tap the LUVMEE heart icon on their home screen, the app opens.

### Why LUVMEE needs it
A relationship app needs to feel personal, responsive, and close at hand. A mobile app can run smoothly offline, display smooth animations, store small bits of information locally on the phone, and trigger push notification alerts on the lock screen.

### Where it fits into LUVMEE
- Located in the folder: `apps/mobile`
- Built using **React Native** and **Expo**. This allows us to write the code once and run it on both Android phones and Apple iPhones.

### A practical example
You wake up in the morning, open LUVMEE, and see: *"Together 412 days. Next occasion: Sarah's Birthday in 3 days."* You tap the heart icon and write a secret Love Note scheduled to open on her birthday.

### What happens if it stops working
If there is a bug in the mobile app, it might freeze on open or display an error message. It would not affect the recipient website or delete data from the server.

### Do you need to manage it personally?
No. Once the app is compiled and published to Google Play, Google manages the distribution and updates automatically.

---

## 2. The Recipient Website

### What it means in everyday language
A website is an address on the internet (like `https://luvmee.eventsslot.com`) that anyone can open using a web browser (such as Chrome, Safari, or Edge) without downloading or installing anything.

### Why LUVMEE needs it
If you send your partner or friend a digital anniversary card, they should not have to create an account, enter a credit card, or download an 80MB application just to read your sweet message. The website allows anyone with the link to open and enjoy their card instantly.

### Where it fits into LUVMEE
- Located in the folder: `apps/recipient-web`
- Deployed on **Vercel** at the web domain `https://luvmee.eventsslot.com`.
- Handles public card links (`/e/[slug]`), the Privacy Policy (`/privacy`), Terms of Service (`/terms`), Help Center (`/support`), and Account Deletion (`/delete-account`).

### A practical example
You generate a digital greeting card in the app and tap "Share". You paste the link into WhatsApp: `https://luvmee.eventsslot.com/e/our-anniversary`. Your partner taps it and sees a full-screen, romantic interactive card with floating hearts and your personal letter.

### What happens if it stops working
If the website goes down, people who click shared card links or legal links will see a "Site Unavailable" error in their browser. Existing mobile app users can still use their mobile app.

### Do you need to manage it personally?
No. Vercel automatically keeps the website running 24/7 on global servers with zero daily maintenance required.

---

## 3. The Database & Tables

### What it means in everyday language
The database is a massive, highly organized digital filing cabinet in the cloud. Inside the cabinet are separate folders called **tables** (e.g., a table for `profiles`, a table for `love_notes`, a table for `occasions`).

### Why LUVMEE needs it
If user data were only saved on their phone, losing the phone would mean losing all relationship memories forever. The database safely stores accounts, partner pairings, love notes, and anniversaries in the cloud so they are always preserved and synchronized between partners.

### Where it fits into LUVMEE
- Hosted on **Supabase** (`https://zfcqbydqdmoyjgiebplo.supabase.co`).
- Uses **PostgreSQL**, the gold standard in database technology.
- Protected by **Row-Level Security (RLS)**: Smart electronic locks that ensure User A can only see their own notes and their paired partner's notes, never a stranger's data.

### A practical example
When you write a Love Note, the mobile app sends that note to the `love_notes` table in the database. When your partner opens their phone, their app checks the database, sees the new note, and displays it in their inbox.

### What happens if it stops working
If the database is unreachable, users will see a message saying "Unable to connect to server" or "Please check your internet connection".

### Do you need to manage it personally?
No. Supabase handles database uptime, automated hardware maintenance, and daily storage operations.

---

## 4. Authentication & OTP (One-Time Passwords)

### What it means in everyday language
Authentication is the digital bouncer at the door. It checks: *"Who are you, and can you prove it?"* Instead of forcing users to remember complicated passwords that get forgotten or hacked, LUVMEE uses **Email OTP (One-Time Passwords)**.

### Why LUVMEE needs it
Passwords cause frustration and support tickets. With Email OTP, a user simply types their email address, receives a temporary 6-digit code in their inbox, types it in, and they are securely logged in.

### Where it fits into LUVMEE
- Handled by **Supabase Auth**.
- If a user hasn't created an account yet, LUVMEE also provides a **"Guest Mode"** so they can explore the app immediately without giving an email.

### A practical example
You install LUVMEE on a new phone. You enter `daniel@example.com`. Five seconds later, you receive an email: *"Your LUVMEE code is 849201"*. You enter the numbers, and all your memories and partner notes instantly appear.

### What happens if it stops working
If the email delivery service is delayed, users will have to wait a couple of minutes for their code or tap "Resend Code".

### Do you need to manage it personally?
No. Supabase automatically generates, delivers, and verifies the 6-digit tokens.

---

## 5. APIs (Application Programming Interfaces)

### What it means in everyday language
Think of an API like a waiter at a restaurant. You (the mobile app) sit at the table and look at the menu. You tell the waiter (the API): *"Please bring me my partner's latest love notes."* The waiter walks into the kitchen (the database), collects the notes, and brings them back to your table.

### Why LUVMEE needs it
The mobile app running on a phone cannot directly touch the raw database files for security reasons. The API acts as the safe, strictly guarded messenger between the app and the server.

### Where it fits into LUVMEE
Every time you save an anniversary, invite a partner, or upload a photo, the app speaks to Supabase via its secure API.

### What happens if it stops working
If the API messenger is blocked (for instance, if the user turns on Airplane Mode), the app will display a notification: *"Offline — please connect to Wi-Fi or mobile data."*

---

## 6. Scheduled Jobs (pg_cron & Reminders)

### What it means in everyday language
A scheduled job is an automatic alarm clock built into the server. Even if no users have the app open, the server wakes up at an exact time every single day, looks through the calendar, and checks: *"Whose anniversary or birthday is coming up today or tomorrow?"*

### Why LUVMEE needs it
The core promise of LUVMEE is: *"A little help remembering"*. If reminders only worked when the user manually opened the app, they would defeat their own purpose. The server must check dates autonomously in the background.

### Where it fits into LUVMEE
- Configured via **pg_cron** inside Supabase.
- Runs every morning at **08:00 UTC**.
- Calls an internal database procedure named `process_due_reminders()`.

### A practical example
Your wedding anniversary is tomorrow. At 08:00 UTC, the scheduled job finds your anniversary in the database, realizes it is 24 hours away, and creates a reminder alert: *"Tomorrow is your 3rd Wedding Anniversary! 💕"*

### What happens if it stops working
If the server alarm fails to run, the mobile app has a built-in safety net: whenever you open the app, it checks if any reminders were missed and displays them on your screen.

---

## 7. Push Notifications

### What it means in everyday language
A push notification is a banner alert that pops up on your phone's lock screen with a gentle chime, even when your phone is locked in your pocket.

### Why LUVMEE needs it
When your partner sends you a surprise Love Note or an anniversary is tomorrow, a push notification alerts you immediately without requiring you to constantly check the app.

### Where it fits into LUVMEE
- Supported by the **Expo Push Notification Gateway** and Supabase Edge Function `dispatch-push-notifications`.

### A practical example
Your phone buzzes while you are at work. You look at your screen: *"💌 Daniel left you a Love Note: 'Thinking of you right now!' Tap to open."*

### What happens if it stops working
If push notifications are disabled by the user in their phone settings, the notes and reminders still appear inside the app the next time they open it.

---

## 8. Builds: APK vs. AAB

### What it means in everyday language
When engineers write code, it consists of text files (`.tsx`, `.ts`). A **Build** is the process of compiling and packaging all that code, images, and fonts into a single binary file that an Android phone can run.

There are two kinds of Android build packages:
1. **APK (Android Package Kit):** A standalone installable file. You can download an APK directly onto an Android phone to test the app without going through the Google Play Store. (This is what you installed during testing).
2. **AAB (Android App Bundle):** The official format required by the Google Play Store. Google takes the `.aab`, splits it into optimized pieces for every specific phone model, signs it, and delivers it to users through the Play Store.

### Why LUVMEE needs it
Google Play has banned standalone APK uploads for new apps since August 2021. LUVMEE must be compiled into an `.aab` file to be published on the store.

---

## 9. Environment Variables

### What it means in everyday language
Imagine you have a master key card to open your office door. You would never tape that key card to the outside of your front window for the public to see. 

**Environment variables** are private configuration labels that tell software: *"Here is the address of our server, and here is our secure public key"*, without hardcoding secrets inside public code repositories.

### Practical example
- `EXPO_PUBLIC_SUPABASE_URL`: Tells the mobile app where our cloud server lives.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tells the website which safe public key to use to read cards.

---

## 10. Summary Matrix: The Founder's System Map

| Component | What is it? | Where does it live? | Does it run 24/7? | What does it cost to run? |
| :--- | :--- | :--- | :---: | :--- |
| **Mobile App** | User interface on phone | Android / iOS devices | When opened by user | Free (Client device) |
| **Recipient Web** | Interactive card & legal site | Vercel Cloud | Yes (24/7) | Free tier / Pay as you scale |
| **Database & Auth** | Filing cabinet & Security gate | Supabase Cloud | Yes (24/7) | Free tier / $25/mo Pro tier |
| **Reminder Cron** | Daily 08:00 UTC alarm | Supabase pg_cron | Yes (Automated) | Included in database |
| **Push Gateway** | Delivers lock-screen alerts | Expo Push Service | Yes (On demand) | Free tier |
