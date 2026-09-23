-- Rythme habit tracker — initial schema
-- Run via Supabase SQL editor or `supabase db push`

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'Europe/Paris',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User settings
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  reminder_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text,
  color text not null default '#0F766E',
  icon text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  days_of_week smallint[] not null default '{1,2,3,4,5,6,0}',
  target_per_period int check (target_per_period is null or target_per_period > 0),
  position int not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily completions (one row per habit per local calendar day)
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_on date not null,
  completed_at timestamptz not null default now(),
  note text,
  unique (habit_id, completed_on)
);

-- Reminders stub (no delivery infra in v1)
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  time_local time not null default '09:00',
  days_of_week smallint[] not null default '{1,2,3,4,5,6,0}',
  enabled boolean not null default false,
  channel text not null default 'local',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists habits_user_active_idx
  on public.habits (user_id)
  where archived_at is null;

create index if not exists habits_user_position_idx
  on public.habits (user_id, position);

create index if not exists habit_completions_user_date_idx
  on public.habit_completions (user_id, completed_on);

create index if not exists habit_completions_habit_date_idx
  on public.habit_completions (habit_id, completed_on);

create index if not exists reminders_user_enabled_idx
  on public.reminders (user_id)
  where enabled = true;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create trigger reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- Signup: create profile + settings
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'timezone', 'Europe/Paris')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.reminders enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Settings policies
create policy "settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);

-- Habits policies
create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

-- Completions policies
create policy "completions_select_own" on public.habit_completions
  for select using (auth.uid() = user_id);
create policy "completions_insert_own" on public.habit_completions
  for insert with check (auth.uid() = user_id);
create policy "completions_update_own" on public.habit_completions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "completions_delete_own" on public.habit_completions
  for delete using (auth.uid() = user_id);

-- Reminders policies
create policy "reminders_select_own" on public.reminders
  for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders
  for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders
  for delete using (auth.uid() = user_id);
