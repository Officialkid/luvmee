# LUVMEE — Founder's Practical Troubleshooting Manual

**Document Version:** 1.0  
**Target Audience:** Founder, Customer Support, Community Managers, and Non-Technical Responders  
**Last Updated:** October 16, 2026  

---

## How to Use This Manual

When a user reports a problem or something behaves unexpectedly, **do not panic**. 

Most software issues fall into predictable categories: a typo in an email address, an aggressive phone battery saver, or a temporary network drop.

Follow this decision-tree guide step by step:
1. **Identify the symptom** below.
2. **Follow what you can safely check** without writing any code.
3. **Collect evidence** before escalating to a developer.
4. **Follow the "What NOT to do" warning** to prevent accidental data loss.

---

## Master Incident Index

- [Issue 1: User Did Not Receive 6-Digit Email Code](#issue-1-user-did-not-receive-6-digit-email-code)
- [Issue 2: Shared Card Displays "Surprise Not Found"](#issue-2-shared-card-displays-surprise-not-found)
- [Issue 3: Partner Connect Fails ("Invalid Partner Code")](#issue-3-partner-connect-fails-invalid-partner-code)
- [Issue 4: Partner Note is Locked or Won't Open](#issue-4-partner-note-is-locked-or-wont-open)
- [Issue 5: User Did Not Receive Anniversary Reminder](#issue-5-user-did-not-receive-anniversary-reminder)
- [Issue 6: App Shows "Network Request Failed" or Won't Load](#issue-6-app-shows-network-request-failed-or-wont-load)
- [Issue 7: EAS Mobile Build Fails](#issue-7-eas-mobile-build-fails)
- [Issue 8: Account Deletion Request Fails](#issue-8-account-deletion-request-fails)

---

### Issue 1: User Did Not Receive 6-Digit Email Code

#### What the user experiences:
The user enters their email address and taps *"Send Code"*, but after a minute, their inbox is empty.

#### Potential causes:
1. Email went to Spam, Junk, or Promotions folder.
2. Typo in the email address (e.g., `user@gmial.com`).
3. User tapped "Send Code" multiple times within 60 seconds (rate limited).
4. Corporate or school email firewall blocked transactional emails.

#### What you can safely check (Takes 1 Minute):
1. Ask the user: *"Did you check your Spam or Promotions folder for 'LUVMEE'?"*
2. Verify the exact spelling of their email address.
3. Check the **Supabase Dashboard**:
   - Go to **Authentication** ➔ **Logs**.
   - Search for the user's email.
   - If log shows `429 Rate Limit Exceeded`, the user sent too many requests. Ask them to wait 2 minutes.

#### What NOT to do:
- **Do NOT delete the user's account** in Supabase Auth to "reset" it.
- **Do NOT change the SMTP email settings** without a developer.

#### How to know it's resolved:
The user enters the 6-digit code and successfully lands on the Home dashboard.

---

### Issue 2: Shared Card Displays "Surprise Not Found"

#### What the user experiences:
A recipient opens a shared card link (e.g. `https://luvmee.eventsslot.com/e/our-love`), but sees:
> *"SURPRISE NOT FOUND — This surprise is unavailable"*

#### Potential causes:
1. The link was copied incompletely in WhatsApp/SMS (missing trailing letters).
2. The sender saved the card as a draft but did not tap *"Generate Share Link"*.
3. The sender deleted the card from their app.
4. The website was not deployed with the latest dynamic routes.

#### What you can safely check:
1. Compare the URL in the recipient's browser with the URL displayed in the sender's app. Ensure all characters after `/e/` match exactly.
2. Ask the sender to open their app ➔ **Celebrate** tab ➔ tap the card ➔ tap **"Share"** again to copy a fresh link.
3. Test opening [https://luvmee.eventsslot.com/privacy](https://luvmee.eventsslot.com/privacy). If the privacy page loads, the website is healthy.

#### What to send to a developer (if unresolved):
- The exact URL that returned 404.
- The sender's email address.

---

### Issue 3: Partner Connect Fails ("Invalid Partner Code")

#### What the user experiences:
Partner B enters Partner A's invite code (e.g., `LUV-VED9`) into the connect box, but the app shows:
> *"Invalid or expired partner code. Please verify with your partner."*

#### Potential causes:
1. Partner B mistyped the code (e.g., entered letter `O` instead of number `0`).
2. Partner A is already connected to another account.
3. Partner B is already connected to another account.
4. Partner A and Partner B are logged into the same account on two phones.

#### What you can safely check:
1. Verify the code: LUVMEE invite codes are uppercase letters and numbers separated by a hyphen (e.g., `LUV-XXXX`).
2. Verify accounts: Check **Profile** on both phones. Ensure Partner A and Partner B are logged in with **two different email addresses**.
3. Check partner status: In **Profile**, verify neither phone says *"Connected with [Name]"*. If one is already paired, they must tap *"Unlink Partner"* before pairing with someone else.

---

### Issue 4: Partner Note is Locked or Won't Open

#### What the user experiences:
Partner B receives an envelope in their Messages tab, but tapping it shows a lock icon and says *"Locked until Oct 24"*.

#### Potential causes:
- **This is intended behavior!** The sender intentionally configured a **"Timed Surprise Reveal"** so the note cannot be read until their anniversary or birthday morning.

#### What to tell the user:
Explain gently: *"Your partner set this note as a special timed surprise! It is locked to keep the secret safe until the scheduled reveal date. It will unlock automatically on that morning."*

---

### Issue 5: User Did Not Receive Anniversary Reminder

#### What the user experiences:
An anniversary passed, but the user did not receive a chime or push banner on their lock screen.

#### Potential causes:
1. User denied push notification permissions in their phone settings.
2. Phone's aggressive battery-saver mode (common on Xiaomi/Samsung) killed background push services.
3. User scheduled the occasion with reminder toggles turned off.

#### What you can safely check:
1. Ask the user: *"In your phone's Settings > Apps > LUVMEE > Notifications, is 'Allow Notifications' turned on?"*
2. Ask the user to open LUVMEE: Did the reminder appear as a pink card on their in-app Home dashboard?
   - If **Yes**: The cloud reminder engine worked, but the phone operating system blocked the lock-screen banner.

---

### Issue 6: App Shows "Network Request Failed" or Won't Load

#### What the user experiences:
Opening the app displays an error toast: *"Network request failed. Please check your internet connection."*

#### Potential causes:
1. User is on airplane mode or weak cellular data.
2. Supabase Cloud is undergoing a scheduled maintenance window.
3. Workplace Wi-Fi is blocking WebSocket / database ports.

#### What you can safely check:
1. Ask the user to open any webpage (e.g. `google.com`) to confirm internet access.
2. Check Supabase status: Open [status.supabase.com](https://status.supabase.com) in your browser to verify global database availability.

---

### Issue 7: EAS Mobile Build Fails

#### What the developer / founder experiences:
Running `npx eas-cli build` fails with a red error.

#### Potential causes & instant solutions:
1. *Error:* `"Version code 1 has already been used"`:
   - **Solution:** Increase `versionCode` by 1 in `apps/mobile/app.json` (e.g. from 1 to 2).
2. *Error:* `"Cannot find module @luvmee/shared"`:
   - **Solution:** Run `npm run build:shared` before triggering EAS build so the `dist/` directory exists.

---

### Issue 8: Account Deletion Request Fails

#### What the user experiences:
Submitting the web deletion form shows *"An error occurred. Please try again."*

#### Potential causes:
1. User entered an email address that doesn't exist in LUVMEE.
2. User did not confirm the email verification link within 30 minutes.

#### What you can safely check:
1. Verify the email exists in Supabase Dashboard ➔ **Authentication** ➔ **Users**.
2. If the user cannot access their email, an administrator can manually delete the user row from Supabase Dashboard ➔ Authentication ➔ Users ➔ Click `...` ➔ Delete User.
