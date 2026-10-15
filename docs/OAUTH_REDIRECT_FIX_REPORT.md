# LUVMEE — Google OAuth Redirect Fix Report

**Date:** 2026-10-15  
**Scope:** Android Google sign-in redirecting to `localhost:3000` → `ERR_CONNECTION_REFUSED`  
**Status:** Code fixes applied ✅ — Supabase Dashboard action required 🔧

---

## 1. Root Cause

The `localhost:3000` redirect is **not a code bug**. It is a **Supabase Dashboard misconfiguration**.

### Exact mechanism

```
Mobile App
  ↓ signInWithGoogle()
  ↓ getRedirectUrl() → Linking.createURL('auth/callback')
     → "exp://192.168.0.126:8081/--/auth/callback"  (Expo Go on LAN)
     → "luvmee://auth/callback"                      (standalone build)
  ↓ supabase.auth.signInWithOAuth({ redirectTo: <above URL>, skipBrowserRedirect: true })
  ↓ Supabase receives request

  IF the redirectTo URL is NOT in Supabase's allowed Redirect URLs list:
    Supabase silently ignores redirectTo and substitutes the configured Site URL
    Site URL default = http://localhost:3000
    
  ↓ Browser opens Google consent screen
  ↓ User consents → Google → zfcqbydqdmoyjgiebplo.supabase.co/auth/v1/callback
  ↓ Supabase exchanges code and redirects to... http://localhost:3000  ← ❌ ERR_CONNECTION_REFUSED
```

**The source code is correct.** The `redirectTo` URL is constructed properly using `Linking.createURL('auth/callback')`, which resolves to the correct Expo Go deep link. The problem is that Supabase never uses it because it isn't allowlisted.

---

## 2. Required Supabase Dashboard Changes

> **You must do this manually** — these settings live in the Supabase Dashboard and cannot be changed from code.

### Step 1 — Open URL Configuration

Go to:  
**https://supabase.com/dashboard/project/zfcqbydqdmoyjgiebplo/auth/url-configuration**

### Step 2 — Change the Site URL

| Field | Current (likely) | Change to |
|-------|-----------------|-----------|
| **Site URL** | `http://localhost:3000` | `https://luvmee.app` (or your Vercel production URL) |

> ⚠️ If you don't have a production domain yet, set it to your Vercel preview URL (e.g. `https://luvmee-web.vercel.app`). This can be updated again before launch.

### Step 3 — Add Redirect URLs to the Allowlist

Click **"Add URL"** and add each of these entries:

| URL | Purpose |
|-----|---------|
| `exp://192.168.0.126:8081/--/auth/callback` | Expo Go on your Android phone (current LAN IP) |
| `luvmee://auth/callback` | Standalone / production builds |
| `exp://*.exp.direct/--/auth/callback` | Expo tunnel mode (optional but useful) |
| `https://luvmee.app/auth/callback` | Web app callback (for future web auth) |

> ℹ️ If your phone's IP changes (different WiFi networks), you will need to add the new `exp://<NEW-IP>:8081/--/auth/callback` entry. Using a fixed IP or tunnel mode avoids this.

### Step 4 — Save

Click **Save** on the URL Configuration page.

---

## 3. Google Cloud Console (No Change Needed)

The Google Cloud authorized redirect URI pointing to Supabase is **already correct**:

```
https://zfcqbydqdmoyjgiebplo.supabase.co/auth/v1/callback
```

**Do not change this.** This is the server-to-server URL between Google and Supabase, not the mobile deep link.

---

## 4. Code Changes Applied

### `apps/mobile/services/authService.ts`

#### `getRedirectUrl()` — defensive logging
- Added dev-mode `console.log` that prints the computed redirect URL in the Metro console every time `signInWithGoogle()` is called.
- Added an explanatory comment about the Supabase allowlist requirement.
- This makes it trivial to copy the exact URL needed for the allowlist during development.

**Metro output when you tap "Continue with Google":**
```
[LUVMEE Auth] OAuth redirect URL: exp://192.168.0.126:8081/--/auth/callback
[LUVMEE Auth] Add the above URL to Supabase → Authentication → URL Configuration → Redirect URLs
```

#### `signInWithGoogle()` — `prompt: 'select_account'`
- Added `queryParams: { prompt: 'select_account' }` to the OAuth options.
- Forces Google to always show the account picker instead of silently signing in with a previously authorised account. Prevents "wrong account" confusion for users with multiple Google accounts.

---

## 5. How to Test After Dashboard Changes

1. Ensure the Expo Go app is open on your Android phone and connected to the same WiFi as your development machine.
2. Check the Metro console in your terminal — confirm the server is running on `http://192.168.0.126:8081`.
3. In the app, tap **"Continue with Google"**.
4. The Metro console should log:
   ```
   [LUVMEE Auth] OAuth redirect URL: exp://192.168.0.126:8081/--/auth/callback
   ```
5. The Google consent screen should appear.
6. Select a Google account and approve.
7. The in-app browser should close automatically and the app should navigate to the Home tab `/(tabs)`.
8. If the browser stays open or shows `localhost:3000`, the Site URL or allowlist has not been saved correctly in Supabase.

---

## 6. Production Checklist (Before Public Launch)

- [ ] Set Supabase Site URL to the production domain.
- [ ] Add `luvmee://auth/callback` to Supabase redirect URL allowlist.
- [ ] Build a standalone EAS Development Build or Production Build (`eas build`).
- [ ] Test Google OAuth on the standalone build — it will use `luvmee://auth/callback` instead of the `exp://` Expo Go URL.
- [ ] Remove the dev-only `exp://192.168.0.126:8081/--/auth/callback` allowlist entry (or keep it for ongoing development).
- [ ] Confirm email OTP redirect URL also uses the production domain, not localhost.

---

## 7. Files Modified

| File | Change |
|------|--------|
| `apps/mobile/services/authService.ts` | Added dev logging to `getRedirectUrl()`; added `prompt: 'select_account'` to `signInWithGoogle()` |
| `docs/OAUTH_REDIRECT_FIX_REPORT.md` | This document |
