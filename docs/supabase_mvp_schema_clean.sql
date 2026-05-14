-- White-Label UM Platform MVP schema
-- Run in Supabase SQL editor after reviewing project-specific auth settings.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'admin', 'super_admin');
create type public.user_tier as enum ('free', 'belajar', 'pro');
create type public.subscription_status as enum ('pending', 'active', 'expired', 'cancelled');
create type public.question_status as enum ('draft', 'review', 'published', 'rejected', 'archived');
create type public.exam_session_status as enum ('in_progress', 'submitted', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'student',
  tier public.user_tier not null default 'free',
  target_ptns text[] not null default '{}',
  exam_track text check (exam_track in ('saintek', 'soshum')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan public.user_tier not null check (plan in ('belajar', 'pro')),
  status public.subscription_status not null default 'pending',
  midtrans_order_id text not null unique,
  amount integer not null check (amount > 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ptns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  has_mandiri boolean not null default true,
  official_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ptn_deadlines (
  id uuid primary key default gen_random_uuid(),
  ptn_id uuid not null references public.ptns(id) on delete cascade,
  title text not null,
  open_at timestamptz,
  close_at timestamptz not null,
  source_url text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tryout_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null,
  required_tier public.user_tier not null default 'free',
  duration_minutes integer not null check (duration_minutes > 0),
  correct_score integer not null default 4,
  wrong_score integer not null default -1,
  blank_score integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.tryout_packages(id) on delete cascade,
  number integer not null,
  subject text not null,
  difficulty text not null check (difficulty in ('MUDAH', 'SEDANG', 'HOTS')),
  prompt text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  option_e text not null,
  answer_key text not null check (answer_key in ('A', 'B', 'C', 'D', 'E')),
  explanation text not null,
  source_label text,
  status public.question_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, number)
);

create table public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.tryout_packages(id) on delete restrict,
  status public.exam_session_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  expires_at timestamptz,
  score integer,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  blank_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_answer text check (selected_answer in ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean,
  updated_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_subscriptions_user_status on public.subscriptions(user_id, status, current_period_end);
create index idx_ptn_deadlines_ptn_close on public.ptn_deadlines(ptn_id, close_at);
create index idx_questions_package_status on public.questions(package_id, status);
create index idx_exam_sessions_user_package on public.exam_sessions(user_id, package_id, submitted_at);
create index idx_exam_answers_session on public.exam_answers(session_id);
create index idx_audit_logs_actor_created on public.audit_logs(actor_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ptns enable row level security;
alter table public.ptn_deadlines enable row level security;
alter table public.tryout_packages enable row level security;
alter table public.questions enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'super_admin')
$$;

create policy "read own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and role = 'student');

create policy "read own subscriptions"
on public.subscriptions for select
using (user_id = auth.uid() or public.is_admin());

create policy "public read ptn"
on public.ptns for select
using (true);

create policy "public read deadlines"
on public.ptn_deadlines for select
using (true);

create policy "public read published packages"
on public.tryout_packages for select
using (is_published = true or public.is_admin());

create policy "read published questions"
on public.questions for select
using (status = 'published' or public.is_admin());

create policy "read own sessions"
on public.exam_sessions for select
using (user_id = auth.uid() or public.is_admin());

create policy "insert own sessions"
on public.exam_sessions for insert
with check (user_id = auth.uid());

create policy "read own answers"
on public.exam_answers for select
using (
  exists (
    select 1 from public.exam_sessions s
    where s.id = session_id and (s.user_id = auth.uid() or public.is_admin())
  )
);

create policy "write own answers"
on public.exam_answers for insert
with check (
  exists (
    select 1 from public.exam_sessions s
    where s.id = session_id and s.user_id = auth.uid() and s.status = 'in_progress'
  )
);

create policy "admin read audit logs"
on public.audit_logs for select
using (public.is_admin());


