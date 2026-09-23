# Rythme

Habit-tracking SaaS (French UI) built with **Next.js App Router**, **Supabase** (Auth + Postgres + RLS), **TanStack Query**, **Zod**, and **shadcn/ui**.

## Quick start

```bash
npm install
npm run dev -- --port 3421
```

Open [http://127.0.0.1:3421](http://127.0.0.1:3421).

Without Supabase env vars the app runs in **demo mode** (localStorage mock, any email/password works). A banner indicates demo mode.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for prod | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for prod | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical site URL for auth redirects / metadata |

Never put the service-role key in this app. All user data access goes through the anon key + user JWT and RLS.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/20260323_000001_init.sql` (SQL editor or Supabase CLI).
3. Auth → URL configuration: add `http://127.0.0.1:3421/**` and your production URL; set redirect for password recovery to `/reset-password/update`.
4. Fill `.env.local` and restart the dev server.

## Scripts

```bash
npm run dev -- --port 3421   # development
npm run build                # production build
npm run lint                 # ESLint
npm run test                 # Vitest (streaks, dates, completion)
npm run typecheck            # tsc --noEmit
```

## Product surface

- Auth: signup, login, logout, password recovery, session, protected app routes, profile + timezone
- Habits: CRUD, archive/reactivate, frequency & days, color/icon, optional period goal
- Tracking: complete/uncomplete with optimistic UI, streaks, history
- Dashboard, calendar (success / partial / missed), stats (rates, streaks, weekly evolution)
- Reminders: DB stub only (no notification delivery in v1)

## Architecture

See project architecture notes in the agent store (`docs/architecture.md`) and the schema under `supabase/migrations/`.

## Deploy

1. **Supabase**: create a project, run `supabase/migrations/20260323_000001_init.sql`, copy URL + anon key.
2. **Vercel**: import the repo (or `npx vercel deploy --prod`), set env vars, set Auth redirect URLs to the Vercel domain.
3. Full checklist: see project store `docs/deploy-vercel-supabase.md` when working from the agent.

Without Supabase env vars the app still runs in **demo mode** (localStorage).
