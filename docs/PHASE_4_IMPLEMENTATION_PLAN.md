# LUVMEE V1 — PHASE 4 MASTER IMPLEMENTATION PLAN
## Partner Experiences, Private Love Notes & Push Notification Infrastructure

**Project:** LUVMEE  
**Repository:** `https://github.com/Officialkid/luvmee`  
**Current Branch:** `feature/phase-4-core-relationship-experiences`  
**Target Delivery:** Phase 4 (4A: Partner-Aware Surprises, 4B: Private Love Notes & Messaging, 4C: Push Notification Infrastructure)  
**Date:** October 12, 2026  
**Architect:** Lead Software Architect & Full-Stack Engineer

---

## 1. CODEBASE AUDIT & BASELINE VERIFICATION

### 1.1 Repository State
- **Git Branch:** Switched from `feature/phase-3-partner-connection` to dedicated `feature/phase-4-core-relationship-experiences`.
- **Working Tree:** Clean (all Phase 3 changes committed in commit `6b60218`).
- **Dependencies & Tools:**
  - `apps/mobile`: Expo SDK 57.0.0, React Native 0.86.0, React 19.2.3, `@supabase/supabase-js` ^2.45.4.
  - `apps/recipient-web`: Next.js 15.1.0, React 19, `@supabase/supabase-js` ^2.45.4.
  - `packages/shared`: Shared schemas (Zod), types, and utility functions.
  - Supabase Database: Migrations `20261012000000_init_schema.sql` and `20261012000001_partner_connections.sql` successfully applied in development database.
- **Baseline Test Results:** 18/18 passing tests in `@luvmee/shared` (7 experience/template tests, 5 partner code tests, 6 partner lifecycle state machine tests).
- **Compilation Check:** TypeScript compiles cleanly (0 errors) in both mobile and web.

### 1.2 Existing Architecture Reused
- **Surprise Creation & Persistence:** `apps/mobile/services/experienceService.ts` and `apps/mobile/app/editor/[id].tsx`.
- **Slug Resolution & Web Viewing:** `apps/recipient-web/app/e/[slug]/page.tsx` and `apps/recipient-web/lib/supabase.ts`.
- **Partnership Architecture:** `user_active_partners` enforcing strictly one active partner at the DB engine level; `partnerService.ts` managing client state and partner codes (`LUV-XXXX`).
- **Branding & Design System:** Colors (`#E85D75` Rose, `#FCE7ED` Blush, `#FFF9F2` Ivory, `#542638` Burgundy), `Logo.tsx`, `THEME`.

---

## 2. WORKSTREAM BREAKDOWN & IMPLEMENTATION PLAN

---

### WORKSTREAM 4A: PARTNER-AWARE SURPRISES

#### Objectives
1. Allow users to designate a surprise as **Partner-Exclusive** (targeted specifically to their connected partner) or **Public Link** (shareable to anyone via web slug).
2. Enforce authorization at the database level:
   - For `partner_exclusive` surprises: only the creator and the targeted partner can view the published surprise.
   - Drafts remain strictly private to the creator.
   - Disconnected partners cannot access newly created partner-exclusive surprises without a valid partnership.
3. Preserve backward compatibility: existing surprises default to `public_link` with zero data loss or breaking changes.

#### Database Changes (`supabase/migrations/20261012000002_phase_4_core_experiences.sql`)
1. Extend `public.experiences`:
   - `ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS sharing_mode TEXT NOT NULL DEFAULT 'public_link' CHECK (sharing_mode IN ('public_link', 'partner_exclusive'));`
   - `ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`
   - `CREATE INDEX IF NOT EXISTS idx_experiences_recipient_id ON public.experiences(recipient_id);`
   - `CREATE INDEX IF NOT EXISTS idx_experiences_sharing_mode ON public.experiences(sharing_mode);`
2. Update RLS on `public.experiences`:
   - Replace open `Recipients can view published experiences` policy with:
     ```sql
     CREATE POLICY "Recipients can view published experiences"
         ON public.experiences FOR SELECT
         USING (
             status = 'published' AND (
                 sharing_mode = 'public_link'
                 OR auth.uid() = recipient_id
                 OR auth.uid() = user_id
             )
         );
     ```
3. Add Creator Target Validation:
   - Creator can only assign `recipient_id` if that user is currently their active partner in `public.user_active_partners`, or if `sharing_mode = 'public_link'` (where `recipient_id` is null).

#### Shared Package Updates (`packages/shared`)
- Update `Experience` interface and `ExperienceConfig` to include `sharingMode: 'public_link' | 'partner_exclusive'` and optional `recipientId?: string`.
- Update `ExperienceCreateSchema` and `ExperiencePublishSchema`.
- Add `PartnerExclusiveSurpriseSchema`.

#### Mobile Application Updates (`apps/mobile`)
- In `experienceService.ts`:
  - Support `sharingMode` and `recipientId` during fetch, draft save, and publish.
- In `apps/mobile/app/editor/[id].tsx`:
  - Add recipient targeting selector:
    - **Public Link:** "Anyone with link can view (Web)"
    - **Partner Exclusive:** "Private for [Partner Name] (Protected)" (disabled if not connected with prompt to connect).
- In `apps/mobile/app/(tabs)/my-experiences.tsx` & `apps/mobile/app/preview/[id].tsx`:
  - Display badge indicating "Partner Exclusive 🔒" vs "Public Link 🌐".

#### Recipient Web Updates (`apps/recipient-web`)
- In `apps/recipient-web/lib/supabase.ts` & `apps/recipient-web/app/e/[slug]/page.tsx`:
  - Query checks `sharing_mode`.
  - If `sharing_mode === 'partner_exclusive'`:
    - If unauthenticated or user is not the designated recipient or creator: render secure protective gate ("This is a private surprise for [Recipient Name]. Sign in with your LUVMEE account to view").
    - Prevent leaking private contents in metadata or error responses.

---

### WORKSTREAM 4B: PRIVATE LOVE NOTES & MESSAGING

#### Objectives
1. Introduce a secure, database-backed private messaging system between connected partners.
2. Message persistence: store conversation history in PostgreSQL so messages are retained across restarts.
3. Supabase Realtime: subscribe to live changes so incoming messages appear instantly without manual polling.
4. Database Security: RLS guarantees that only the two partners in an active partnership can read or send love notes.

#### Database Changes
1. Create `public.love_notes`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.love_notes (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
       sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
       tag TEXT CHECK (tag IS NULL OR length(tag) <= 50),
       read_at TIMESTAMPTZ,
       created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```
2. Enable RLS:
   ```sql
   ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Partners can view their conversation love notes"
       ON public.love_notes FOR SELECT
       USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

   CREATE POLICY "Partners can send love notes to their partner"
       ON public.love_notes FOR INSERT
       WITH CHECK (
           auth.uid() = sender_id
           AND EXISTS (
               SELECT 1 FROM public.user_active_partners
               WHERE user_id = auth.uid() AND partner_id = recipient_id AND partnership_id = love_notes.partnership_id
           )
       );
   ```
3. Enable Realtime:
   - `ALTER PUBLICATION supabase_realtime ADD TABLE public.love_notes;`
4. Atomic RPC Functions:
   - `public.send_love_note(content TEXT, tag TEXT) RETURNS JSONB`:
     - Resolves caller identity from `auth.uid()`.
     - Validates active partner from `user_active_partners`.
     - Inserts note and logs push notification event.
     - Returns `{ success: true, note: ... }`.
   - `public.get_love_notes(limit_count INT, before_timestamp TIMESTAMPTZ) RETURNS JSONB`:
     - Fetches bounded history for caller's active partnership.
   - `public.mark_love_notes_read() RETURNS JSONB`:
     - Updates `read_at = now()` for received unread notes.

#### Shared Package Updates (`packages/shared`)
- Types: `LoveNote`, `SendLoveNotePayload`, `LoveNoteTag`.
- Schemas: `SendLoveNoteSchema`, `LoveNotesQuerySchema`.

#### Mobile Application Updates (`apps/mobile`)
- Create `apps/mobile/services/loveNotesService.ts`:
  - `getNotes()`, `sendNote(content, tag)`, `subscribeToNotes(partnershipId, callback)`, `markRead()`.
- Update `apps/mobile/app/(tabs)/messages.tsx`:
  - Connect to Supabase Realtime channel: `supabase.channel('love_notes:' + partnershipId)`.
  - Replace mock storage with live database queries and realtime listener.
  - Implement composer with pending/sent states, quick nudges (emojis), and connection fallback UI if partner is disconnected.

---

### WORKSTREAM 4C: PUSH NOTIFICATION INFRASTRUCTURE

#### Objectives
1. Implement an Expo-compatible push notification infrastructure supporting 4 core events:
   - Incoming partner invitation.
   - Partner invitation accepted.
   - New private love note.
   - New partner-exclusive surprise published.
2. Device token registration: store user push tokens securely linked to `auth.uid()`.
3. Safe payload privacy: notifications display non-sensitive teasers on lock screens; full protected content is fetched inside the authenticated app.
4. Deep link routing: tapping notifications navigates cleanly to `/messages`, `/editor`, or `/preview`.
5. Non-blocking delivery: push failures never cancel or undo core transactions (messages, invites, or surprises).

#### Database Changes
1. Create `public.user_push_tokens`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.user_push_tokens (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       expo_push_token TEXT NOT NULL,
       platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
       created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
       updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
       CONSTRAINT unique_user_push_token UNIQUE (user_id, expo_push_token)
   );
   ```
2. Create `public.notification_events`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.notification_events (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       category TEXT NOT NULL CHECK (category IN ('partner_invitation', 'invitation_accepted', 'love_note', 'partner_surprise')),
       title TEXT NOT NULL,
       body TEXT NOT NULL,
       data JSONB DEFAULT '{}'::jsonb NOT NULL,
       read BOOLEAN DEFAULT FALSE NOT NULL,
       created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```
3. Create `public.notification_preferences`:
   ```sql
   CREATE TABLE IF NOT EXISTS public.notification_preferences (
       user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       partner_invitations BOOLEAN DEFAULT TRUE NOT NULL,
       love_notes BOOLEAN DEFAULT TRUE NOT NULL,
       surprises BOOLEAN DEFAULT TRUE NOT NULL,
       updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```
4. Enable RLS on all 3 tables with user ownership policies.
5. Create RPCs:
   - `public.register_push_token(token TEXT, platform TEXT)`
   - `public.unregister_push_token(token TEXT)`
   - `public.get_user_notifications(limit_count INT)`
   - `public.mark_notification_read(notification_id UUID)`
   - Internal dispatch triggers/helpers for invitation, love note, and surprise events.

#### Shared Package Updates (`packages/shared`)
- Types: `NotificationCategory`, `NotificationEvent`, `NotificationPreferences`, `RegisterPushTokenPayload`.
- Schemas: `RegisterPushTokenSchema`, `NotificationPreferencesSchema`.

#### Mobile Application Updates (`apps/mobile`)
- Create `apps/mobile/services/notificationService.ts`:
  - Permission request handler with clear user value proposition.
  - Token registration & token refresh handling.
  - Deep link handler for background & cold app starts.
  - Logout cleanup (`unregister_push_token`).

---

## 3. IMPLEMENTATION CHECKLIST & PROGRESS TRACKER

- [ ] **Step 0:** Codebase audit & implementation plan document (this document)
- [ ] **Workstream 4A: Partner-Aware Surprises**
  - [ ] Add sharing mode & recipient ID to `@luvmee/shared` types & schemas
  - [ ] Create migration DDL for `experiences.sharing_mode` and `experiences.recipient_id`
  - [ ] Update RLS policies for recipient-restricted surprise viewing
  - [ ] Update `experienceService.ts` to support partner-exclusive surprises
  - [ ] Update `editor/[id].tsx` with partner-targeting UI
  - [ ] Update recipient-web with authorization check & private gate
  - [ ] Add automated tests for partner surprises in `@luvmee/shared`
- [ ] **Workstream 4B: Private Love Notes & Messaging**
  - [ ] Add love note types & schemas in `@luvmee/shared`
  - [ ] Create migration DDL for `love_notes` table and Realtime publication
  - [ ] Implement `send_love_note`, `get_love_notes`, `mark_love_notes_read` RPCs with RLS
  - [ ] Create `loveNotesService.ts` in mobile app
  - [ ] Upgrade `apps/mobile/app/(tabs)/messages.tsx` with live database & Realtime listener
  - [ ] Add automated tests for love note state & schemas
- [ ] **Workstream 4C: Push Notification Infrastructure**
  - [ ] Add notification types & schemas in `@luvmee/shared`
  - [ ] Create migration DDL for `user_push_tokens`, `notification_events`, `notification_preferences`
  - [ ] Implement `register_push_token`, `unregister_push_token`, and event logging triggers
  - [ ] Implement `notificationService.ts` in mobile app
  - [ ] Add deep link routing to notification handler
  - [ ] Add automated tests for notification registration & preferences
- [ ] **Step 4: Cross-Feature Integration & Verification**
  - [ ] Run full test suite (`npm test`)
  - [ ] Run mobile TypeScript check (`tsc --noEmit`)
  - [ ] Run web TypeScript check (`tsc --noEmit`)
  - [ ] Run web production build (`npm run build:web`)
- [ ] **Step 5: Documentation Deliverables**
  - [ ] `docs/PHASE_4A_PARTNER_SURPRISES_REPORT.md`
  - [ ] `docs/PHASE_4B_LOVE_NOTES_REPORT.md`
  - [ ] `docs/PHASE_4C_NOTIFICATIONS_REPORT.md`
  - [ ] `docs/PHASE_4_FINAL_REPORT.md`
