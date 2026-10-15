# LUVMEE — UI/UX Comprehensive Quality Audit

**Date:** 2026-10-13  
**Status:** Baseline Completed — Proceeding to Design System Consolidation & Screen Redesign  

---

## 1. Executive Summary & Problems Identified

While LUVMEE possesses comprehensive backend and business functionality (authentication, partner linking, Love Notes, people directory, recurrence calendar, personal plans, and push notifications), the user interface suffers from common symptoms of rapid, AI-driven prototyping:

1. **Crowded 7-Tab Bottom Navigation:** The tab bar currently contains 7 items (`Home`, `Love Notes`, `People`, `Calendar`, `Templates`, `Surprises`, `Profile`). On devices with standard widths (< 390px), tab titles truncate or overlap, creating an unrefined, cluttered look.
2. **Excessive & Inconsistent Icons / Emojis:** Headers, cards, and labels feature random emoji pairs (`👰🏽`, `🎁`, `✨`, `💕`, `💌`) side-by-side with Lucide icons.
3. **Oversized & Nested Cards:** Multiple screens nest full-width cards inside parent cards with stacked high-contrast borders and heavy shadows (`elevation: 12`), reducing information density and creating visual fatigue.
4. **Lack of Standardized Reusable UI Primitives:** The codebase relies on raw React Native `<View>` and `<Text>` with ad-hoc styles in individual screens. There are no unified components for `EmptyState`, `LoadingSkeleton`, `SectionHeader`, `Badge`, `Avatar`, or `InlineNotice`.
5. **Repetitive Decoration:** Pink backgrounds (`#FCE7ED`) are applied uniformly across entire views without adequate neutral ivory/white surface contrast.
6. **Missing Startup / Splash Screen Coordination:** Expo's splash screen lacks smooth coordination with auth check and initialization, resulting in abrupt layout shifts.

---

## 2. Existing Reusable Components Inventory

| Component | Path | Current State | Refactor Needed |
| :--- | :--- | :--- | :--- |
| `Button` | `apps/mobile/components/Button.tsx` | Basic primary/secondary variants | Add ghost/outline/subtle variants, standard heights (48px primary, 38px compact), and icon support. |
| `Card` | `apps/mobile/components/Card.tsx` | Minimal container with fixed padding | Add subtle border, shadow levels, surface color tokens. |
| `Input` | `apps/mobile/components/Input.tsx` | Basic text field | Standardize height, typography, error states, and clear focus states. |
| `Logo` | `apps/mobile/components/Logo.tsx` | Good asset loader for horizontal/stacked/symbol | Keep and standardize usage across splash and headers. |
| `AuthGateModal` | `apps/mobile/components/AuthGateModal.tsx` | Functioning auth interceptor | Redesign with unified modal tokens. |
| `PartnerConnectModal`| `apps/mobile/components/PartnerConnectModal.tsx` | Complex partner linking flows | Clean up layout hierarchy and status banners. |
| `EditUsernameModal` | `apps/mobile/components/EditUsernameModal.tsx` | Simple username form | Elevate with standard modal primitives. |
| `DeleteAccountModal`| `apps/mobile/components/DeleteAccountModal.tsx` | Two-stage destructive dialog | Polish typography, buttons, and alert hierarchy. |

---

## 3. Screens Requiring Redesign

1. **Bottom Navigation (`apps/mobile/app/(tabs)/_layout.tsx`):**
   - Streamline from 7 crowded tabs to **5 core tabs**:
     - `Home` (`Heart` outline)
     - `Love Notes` (`MessageSquare` or `MessageCircle` outline)
     - `People` (`Users` or `UserCheck` outline)
     - `Calendar` (`Calendar` outline)
     - `Profile` (`User` outline)
   - Route `Templates` and `Surprises` directly from prominent, well-placed action hubs on Home and Profile (or a consolidated "Moments" tab), preserving 100% of route functionality without cluttering the bottom bar.
2. **Home Screen (`apps/mobile/app/(tabs)/index.tsx`):**
   - Replace bloated welcome banner with clean, high-clarity header.
   - Surface actionable relationship radar: upcoming occasions, partner status, and quick-action pills.
   - Clean up guest preview sections.
3. **Love Notes (`apps/mobile/app/(tabs)/messages.tsx`):**
   - Streamline header and partner status card.
   - Restructure conversation history and note composer with refined typography and soft ivory bubbles.
4. **People Directory (`apps/mobile/app/(tabs)/people.tsx`):**
   - Replace heavy list cards with clean contact rows, elegant circular initials/avatars, and occasion chips.
5. **Calendar (`apps/mobile/app/(tabs)/calendar.tsx`):**
   - Clean up month grid, event indicator dots, and selected date detail view.
6. **Profile & Settings (`apps/mobile/app/(tabs)/profile.tsx`):**
   - Professional grouped settings sections (Account, Partner & Love Sparks, Preferences, Danger Zone).

---

## 4. Functional Risks & Mitigations

- **Risk 1:** Reorganizing tabs breaks deep links or existing bookmarks.  
  *Mitigation:* Keep existing routes (`templates.tsx`, `my-experiences.tsx`) registered in the stack/tabs layout with `href: null` so router navigation (`router.push('/(tabs)/templates')` or `/my-experiences`) works transparently.
- **Risk 2:** Auth or Session state flickers on app launch.  
  *Mitigation:* Use `SplashScreen.preventAutoHideAsync()` in root `_layout.tsx` until session and partner status are initialized, then hide splash cleanly.
- **Risk 3:** Guest access accidentally blocked.  
  *Mitigation:* Retain all existing `AuthGateModal` intercepts and guest safe fallbacks.

---

## 5. Baseline Test & Check Results

- **Shared Package Tests:** `npm test --workspace=@luvmee/shared` -> **67/67 tests passing (13 suites)**.
- **Mobile TypeScript:** `npm run check-types --workspace=luvmee-mobile` -> **0 errors**.
- **Next.js Web Build:** `npm run build --workspace=recipient-web` -> **Compiled successfully (5/5 static pages)**.
