# Supabase Setup Guide for LUVMEE V1

This guide covers setting up your Supabase project, executing database migrations, and configuring authentication for LUVMEE.

---

## 1. Create a Supabase Project

1. Navigate to [database.new](https://database.new) and sign in to Supabase.
2. Click **New project** and name it `luvmee-prod` (or `luvmee-dev`).
3. Set a strong database password and choose your preferred region.

---

## 2. Execute Migrations & Seed Data

1. In your Supabase Dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Copy the contents of [`supabase/migrations/20261012000000_init_schema.sql`](../supabase/migrations/20261012000000_init_schema.sql) and click **Run**.
4. Create a second query, copy the contents of [`supabase/seed.sql`](../supabase/seed.sql), and click **Run**.

---

## 3. Configure Authentication Settings

1. In Supabase Dashboard, go to **Authentication** > **Providers** > **Email**.
2. Ensure **Email provider** is **Enabled**.
3. For prototyping / initial testing, you may toggle off **Confirm email** to allow instant sign-in, or leave it enabled for production.
4. Go to **Authentication** > **URL Configuration**:
   - **Site URL:** `https://luvmee.vercel.app` (or your recipient web domain).
   - **Redirect URLs:** Add `luvmee://*` (for mobile app deep linking) and `http://localhost:3000/*`.

---

## 4. Environment Variables Configuration

Copy the provided template files into `.env` for your local apps:

### Mobile App (`apps/mobile/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_WEB_BASE_URL=https://luvmee.vercel.app
```

### Recipient Web App (`apps/recipient-web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-never-share-publicly>
```

---

## 5. Security & Row Level Security (RLS) Verification

LUVMEE enforces strict security:
- **Creators:** Can only view, create, update, and delete their own experiences (`auth.uid() = user_id`).
- **Recipients:** Have public read access (`SELECT`) **strictly** to published experiences matching the unique slug (`status = 'published'`).
- **Unpublished drafts:** Cannot be accessed by public visitors or other users.
