# LUVMEE — Version 1.0 Founder Decisions Register

**Target Application:** LUVMEE Version 1.0.0 (`com.officialkid.luvmee`)  
**Date:** October 15, 2026  
**Status:** **PENDING FOUNDER REVIEW & SIGN-OFF**  

---

## Executive Context

The technical deliverables, legal policy endpoints, mobile configuration, and Google Play submission assets for **LUVMEE Version 1.0** are fully prepared and verified. Before triggering the live production deployment and Google Play Console submission, the founder must confirm the 7 operational and legal decisions recorded below.

---

## 1. Decision Matrix & Action Items

| # | Decision Item | Recommended Value | Options / Choices | Founder Action Required |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Google Play Account Type** | **Personal** *(or Organization if D-U-N-S registered)* | - **Personal:** Requires 14-day Closed Test with 20 testers before production.<br>- **Organization:** Direct submission to Production allowed. | Verify your registered account type in Google Play Console. |
| **2** | **Public Developer Name** | **Eventsslot** *(or Founder's Legal Name)* | - Company / Entity Name (e.g. `Eventsslot Ltd`)<br>- Individual Developer Name | Specify the exact name to display on Google Play. |
| **3** | **Public Support Email** | `support@eventsslot.com` | - `support@eventsslot.com` (configured on web portal)<br>- Custom email (e.g. `support@luvmee.com` or personal inbox) | Confirm or provide preferred customer support email. |
| **4** | **Target Launch Territories** | **All Available Countries & Territories (Global)** | - Global (all 177+ countries supported by Google Play)<br>- Phased release (e.g., US, UK, Canada, Australia only) | Confirm if initial launch should be worldwide or regional. |
| **5** | **Pricing & Monetization** | **Free ($0.00) / No Ads** | - Free with zero ads or in-app purchases (current codebase)<br>- Paid app *(not recommended for V1 launch)* | Confirm free distribution model. |
| **6** | **Authorize Vercel Legal Deployment** | **Approved** | - Push branch and deploy `/privacy`, `/delete-account`, `/terms`, `/support` live to `https://luvmee.eventsslot.com`. | Authorize Git commit & Vercel deployment. |
| **7** | **Authorize EAS Production Build** | **Approved** | - Run `npx eas-cli build --platform android --profile production` to generate `.aab`. | Authorize EAS build invocation. |

---

## 2. Detailed Decision Breakdown

### Decision 1: Google Play Account Type (Personal vs. Organization)
- **Background:** In November 2023, Google introduced a policy for all new personal developer accounts requiring a mandatory **14-day Closed Test with a minimum of 20 opted-in testers** before applying for production access. Organization accounts with verified D-U-N-S numbers are exempt.
- **Impact:**
  - If your account is **Personal**, follow Section 4.4 of [LUVMEE_VERSION_1_PUBLISHING_GUIDE.md](file:///c:/Users/DANIEL/Documents/WebApp%20Projects/luvmee/docs/LUVMEE_VERSION_1_PUBLISHING_GUIDE.md) to set up the 20-tester closed testing track.
  - If your account is **Organization**, you may publish directly to the Production track.

### Decision 2: Public Developer / Entity Name
- **Background:** Google Play displays the developer name publicly beneath the app title on all store listings.
- **Requirement:** This name must match the identity verified on the Google Play Developer Console.

### Decision 3: Public Support Contact Email
- **Current Setup:** `support@eventsslot.com` has been configured on the live recipient website footer, legal pages, and store listing metadata.
- **Requirement:** The founder must ensure that emails sent to `support@eventsslot.com` are received and monitored, or provide an alternate inbox before store submission.

### Decision 4: Target Launch Countries & Territories
- **Recommendation:** Release to **All countries and regions** supported by Google Play, or restrict to primary English-speaking markets (US, UK, CA, AU, NZ) if preferred for the initial rollout.

### Decision 5: App Pricing and Monetization Model
- **Codebase Truth:** LUVMEE has zero advertising SDKs, zero tracking libraries, and zero in-app billing dependencies in `package.json`.
- **Declaration:** Select **Free** in Google Play Console. Note that Google Play does not permit converting a free app to a paid app after publication.

### Decision 6: Authorization for Vercel Deployment
- **Status:** All legal and deletion pages (`/privacy`, `/delete-account`, `/terms`, `/support`) are implemented, integrated into the navigation, and pass production static compilation.
- **Action:** Grant authorization to deploy to `https://luvmee.eventsslot.com` so Google Play review bots find live HTTP 200 pages.

### Decision 7: Authorization to Run EAS Production Build
- **Status:** `apps/mobile/eas.json` is configured for production `app-bundle`, and `apps/mobile/app.json` has `versionCode: 1`.
- **Action:** Run `npx eas-cli build --platform android --profile production` to generate the production `.aab`.

---

## 3. Immediate Next Step for the Founder

Once you review the 7 decisions above:
1. Provide approval for **Decision 6** (Deploy legal pages to Vercel) and **Decision 7** (Run EAS production `.aab` build).
2. Confirm your **Account Type** (Personal vs Organization) and **Developer Name**.
