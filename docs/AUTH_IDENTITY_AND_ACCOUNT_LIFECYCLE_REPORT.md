# LUVMEE — Complete Authentication, Identity, Session Management and Account Lifecycle System

## 1. Executive Overview

This report details the implementation of LUVMEE's complete, production-ready identity and account management system across the mobile application (`apps/mobile`), recipient web application (`apps/recipient-web`), shared TypeScript library (`packages/shared`), and Supabase backend architecture (`supabase`).

### Key Deliverables Completed:
1. **Unified Authentication Entry Screen:** Clear separation of Continue with Google vs. Continue with Email; only one method displayed at a time with clean mode switching and back navigation.
2. **Email Registration Flow with Username & OTP:** Email, 8+ character password, confirm password validation, unique case-insensitive username reservation, and branded 6-digit email confirmation OTP.
3. **Google OAuth & Automatic Username Generation:** Native Google OAuth browser flow with auto-generated safe usernames (e.g. `user_1234`) ensuring zero email exposure and unique database constraints.
4. **Username Editing:** Self-service username change modal on the Profile screen, validated with real-time character checks and database uniqueness RPC.
5. **Session Management & Two-Month Inactivity Policy:** Secure persistent sessions via AsyncStorage, background token refreshes, and enforced 60-day inactivity timeout with remote activity tracking.
6. **Account Deletion & Data Removal:** Two-step confirmation modal with destructive safeguards, atomic database cleanup RPC (`delete_user_account`), and server-side Edge Function admin user purge.
7. **Preserved Guest-First Access:** Public card previews and guest browsing remain fully functional without forcing login.

---

## 2. Authentication Architecture & Screen Experience

### 2.1 State-Driven Unified Screen (`apps/mobile/app/(auth)/sign-in.tsx`)
Rather than overwhelming users with multiple simultaneous forms, the screen uses a dedicated state machine:
- `selection`: Primary "Continue with Google" button and secondary "Continue with Email" option.
- `email_login`: Email and Password form with "Forgot password?" and "Create one" mode toggle.
- `email_signup`: Email, Username, Password, and Confirm Password form.
- `signup_otp`: 6-digit OTP verification code entry with a 60-second cooldown timer for resends.
- `forgot_password`: Email password recovery request.

Brand visual identity adheres strictly to LUVMEE design tokens:
- Blush Pink: `#FCE7ED`
- Rose: `#E85D75`
- Deep Burgundy: `#542838`
- Soft Ivory: `#FFF9F2`
- Dark Text: `#25212A`

---

## 3. Google OAuth & Username Management

### 3.1 Google OAuth Flow
- Uses `expo-web-browser` with `WebBrowser.openAuthSessionAsync` and Supabase Auth `signInWithOAuth({ provider: 'google' })`.
- Redirects seamlessly back into the app using `Linking.createURL('auth/callback')` or `process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL`.
- Trigger `handle_new_user()` checks for Google metadata (`full_name`, `name`, `email`) and calls `public.generate_unique_username()` to assign a unique, normalized handle without exposing personal emails.

### 3.2 Username Editing (`apps/mobile/components/EditUsernameModal.tsx`)
- Available directly from the Profile screen by tapping the `@handle` pill or selecting "Edit Username" under Preferences & Actions.
- Validates 3–30 characters, alphanumeric and underscore only.
- Invokes `supabase.rpc('update_my_username', { new_username })` for case-insensitive atomic reservation.

---

## 4. Persistent Sessions & Two-Month Inactivity Policy

### 4.1 Activity Tracking Architecture
- `authService.getValidSession()` checks whether the user has been inactive for more than 60 days (`60 * 24 * 60 * 60 * 1000` ms).
- If inactive beyond 60 days, the session is invalidated, caches are cleared, and the user is signed out.
- For active sessions, `recordActivity()` updates local storage and invokes the database RPC `record_authenticated_activity()` (throttled to at most once per hour to minimize database writes).

---

## 5. Account Deletion & Table-by-Table Data Cleanup

### 5.1 Destructive Action Safeguards (`apps/mobile/components/DeleteAccountModal.tsx`)
- Accessible under Profile -> Preferences & Actions -> "Permanently Delete Account".
- Step 1: Warning modal outlining permanent data loss with "Keep my account" as the default cancel option.
- Step 2: Confirmation modal with explicit "Yes, Permanently Delete Everything" trigger.

### 5.2 Table-by-Table Cleanup Plan (`supabase/migrations/20261013000005_...sql`)
The atomic database RPC `delete_user_account()` executes the following order of operations under `SECURITY DEFINER`:

| Table | Relationship / Cleanup Rule |
| :--- | :--- |
| `user_active_partners` | Both active partner rows for the partnership are removed atomically. |
| `partnerships` | Historical partnership status marked `disconnected`, disconnected timestamp recorded. |
| `partner_invitations` | Any pending sent or received invitations are marked `cancelled`. |
| `user_push_tokens` | All registered device push tokens for the user are deleted. |
| `notification_events` | All in-app notifications directed to this user are deleted. |
| `notification_preferences` | Notification preferences for this user are deleted. |
| `personal_plans` | All private personal plans owned by the user are deleted. |
| `scheduled_reminders` | All queued reminder jobs for the user are deleted. |
| `important_dates` | All saved occasions and birthdays owned by the user are deleted. |
| `people` | All contacts in the user's personal directory are deleted. |
| `love_notes` | All private notes authored by the deleted user are deleted. |
| `experiences` | All surprise drafts and published experiences created by the user are deleted (cascades to `recipient_responses`). |
| `profiles` | User profile record is deleted. |
| `auth.users` | Purged via Supabase Admin API in Edge Function `delete-user-account`. |

---

## 6. Verification & Test Results

| Test Gate | Scope | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Shared Unit Tests** | `npm test --workspace=@luvmee/shared` | **PASS (13 suites, 67 tests)** | Auth identity, password validation, username normalization, and 60-day inactivity tests passing. |
| **Mobile TypeScript Check** | `npm run check-types --workspace=luvmee-mobile` | **PASS (0 errors)** | All screens, modals, and services type-checked cleanly. |
| **Recipient Web Production Build** | `npm run build --workspace=recipient-web` | **PASS (5/5 pages static)** | Next.js 15 build succeeds with `/auth/callback` static bundle. |

---

## 7. Production Configuration Checklist

### 7.1 Supabase Dashboard Setup
1. **Google OAuth Provider:**  
   Navigate to **Authentication -> Providers -> Google**:
   - Enable Google.
   - Enter your **Client ID** and **Client Secret** from the Google Cloud Console.
   - Set Authorized Redirect URI in Google Cloud Console to: `https://<project-ref>.supabase.co/auth/v1/callback`.
2. **Apply Database Migration:**  
   Execute `supabase/migrations/20261013000005_phase_5_auth_identity_and_account_lifecycle.sql` in the Supabase SQL Editor.
3. **Deploy Edge Function:**  
   Deploy `supabase/functions/delete-user-account` via Supabase CLI:
   ```bash
   npx supabase functions deploy delete-user-account
   ```
