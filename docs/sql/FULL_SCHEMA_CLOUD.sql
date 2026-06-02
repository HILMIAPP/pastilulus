-- ============================================================
-- FULL SCHEMA — Pastilulus Cloud (jfftniliplnretpdpfah.supabase.co)
-- Jalankan SATU KALI di Supabase SQL Editor.
-- Idempotent: aman dijalankan ulang (pakai IF NOT EXISTS / DO $$ ... END $$).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Types ───────────────────────────────────────────────────
do $$ begin create type public.user_role as enum ('student', 'admin', 'super_admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_tier as enum ('free', 'belajar', 'pro'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_status as enum ('pending', 'active', 'expired', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_status as enum ('draft', 'review', 'published', 'rejected', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.exam_session_status as enum ('in_progress', 'submitted', 'expired'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('pending', 'paid', 'expired', 'failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_status as enum ('draft', 'published', 'archived'); exception when duplicate_object then null; end $$;

-- ── Core tables ─────────────────────────────────────────────
create table if not exists public.profiles (
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

create table if not exists public.ptns (
  id uuid primary key default gen_random_uuid(),
  name text not null, city text not null, has_mandiri boolean not null default true,
  official_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.ptn_deadlines (
  id uuid primary key default gen_random_uuid(),
  ptn_id uuid not null references public.ptns(id) on delete cascade,
  title text not null, open_at timestamptz, close_at timestamptz not null,
  source_url text not null, verified_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.tryout_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, subtitle text not null,
  required_tier public.user_tier not null default 'free',
  duration_minutes integer not null check (duration_minutes > 0),
  correct_score integer not null default 4, wrong_score integer not null default -1, blank_score integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.tryout_packages(id) on delete cascade,
  number integer not null, subject text not null,
  difficulty text not null check (difficulty in ('MUDAH', 'SEDANG', 'HOTS')),
  prompt text not null, option_a text not null, option_b text not null,
  option_c text not null, option_d text not null, option_e text not null,
  answer_key text not null check (answer_key in ('A', 'B', 'C', 'D', 'E')),
  explanation text not null, source_label text,
  status public.question_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (package_id, number)
);

create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.tryout_packages(id) on delete restrict,
  status public.exam_session_status not null default 'in_progress',
  started_at timestamptz not null default now(), expires_at timestamptz,
  score integer, correct_count integer not null default 0,
  wrong_count integer not null default 0, blank_count integer not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_answer text check (selected_answer in ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean, updated_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create table if not exists public.question_bank_uploads (
  id uuid primary key default gen_random_uuid(),
  paket_id text not null unique, paket_title text, paket_subtitle text,
  soal_count integer not null default 0, durasi_menit integer not null default 120,
  akses text not null default 'belajar_pro', scoring_type text not null default 'classical',
  questions jsonb not null default '[]', uploaded_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tryout_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text, nama text not null, whatsapp text not null,
  sekolah text not null, kelas text not null, jurusan text not null,
  kartu_url text, status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  registered_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_type text not null, entity_id uuid,
  metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

-- ── Payment & billing ────────────────────────────────────────
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text, customer_email text,
  plan text not null, amount integer not null check (amount >= 0),
  payment_method text, payment_provider text not null default 'mayar',
  status public.payment_status not null default 'pending',
  promo_code text, affiliate_code text,
  midtrans_transaction_id text,
  provider_payment_id text, provider_transaction_id text, provider_payment_url text,
  raw_payload jsonb not null default '{}',
  paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan public.user_tier not null check (plan in ('belajar', 'pro')),
  status public.subscription_status not null default 'pending',
  provider_order_id text,
  midtrans_order_id text,
  amount integer not null check (amount > 0),
  current_period_start timestamptz, current_period_end timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('nominal', 'percent')),
  discount_value integer not null check (discount_value >= 0),
  usage_limit integer not null default 0, used_count integer not null default 0,
  starts_at timestamptz, expires_at timestamptz,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name text not null,
  commission_rate integer not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  click_count integer not null default 0, conversion_count integer not null default 0, revenue_amount integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── Content ──────────────────────────────────────────────────
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique, title text not null, owner text,
  content jsonb not null default '{}',
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, category text, excerpt text,
  body text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.broadcast_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text not null default '',
  target text not null default 'Semua Pengguna',
  target_segment text not null default 'all',
  status public.content_status not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── CRM ──────────────────────────────────────────────────────
create table if not exists public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  visitor_name text, visitor_email text, visitor_phone text,
  source_page text, topic text not null default 'general',
  status text not null default 'waiting_admin' check (status in ('bot','waiting_admin','assigned','closed')),
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor','bot','admin')),
  sender_id uuid, body text not null,
  metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create table if not exists public.crm_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null, topic text not null default 'general', body text not null,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── PASTI LULUS 1 ────────────────────────────────────────────
create table if not exists public.pasti_lulus_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique, note text,
  created_by uuid references public.profiles(id) on delete set null,
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz, expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pasti_lulus_materials (
  id uuid primary key default gen_random_uuid(),
  nomor text not null unique,
  universitas text not null, jurusan text not null,
  soal_storage_path text, pembahasan_storage_path text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_exam_sessions_user_package on public.exam_sessions(user_id, package_id, submitted_at);
create index if not exists idx_exam_answers_session on public.exam_answers(session_id);
create index if not exists idx_payment_transactions_status_created on public.payment_transactions(status, created_at desc);
create index if not exists idx_payment_transactions_user on public.payment_transactions(user_id, created_at desc);
create index if not exists idx_pasti_lulus_tokens_redeemed_by on public.pasti_lulus_tokens(redeemed_by);
create index if not exists idx_crm_conversations_status_last on public.crm_conversations(status, last_message_at desc);
create index if not exists idx_crm_messages_conversation_created on public.crm_messages(conversation_id, created_at asc);
create index if not exists idx_blog_posts_status_updated on public.blog_posts(status, updated_at desc);

-- ── RLS enable ───────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.promo_codes enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.site_content enable row level security;
alter table public.blog_posts enable row level security;
alter table public.broadcast_messages enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.tryout_packages enable row level security;
alter table public.questions enable row level security;
alter table public.ptns enable row level security;
alter table public.ptn_deadlines enable row level security;
alter table public.crm_conversations enable row level security;
alter table public.crm_messages enable row level security;
alter table public.crm_templates enable row level security;
alter table public.pasti_lulus_tokens enable row level security;
alter table public.pasti_lulus_materials enable row level security;
alter table public.tryout_registrations enable row level security;
alter table public.question_bank_uploads enable row level security;
alter table public.audit_logs enable row level security;

-- ── Helper functions ─────────────────────────────────────────
create or replace function public.current_user_role()
returns public.user_role language sql security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public
as $$ select public.current_user_role() in ('admin', 'super_admin') $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Siswa'),
    new.email, 'student', 'free'
  )
  on conflict (id) do update set
    full_name = excluded.full_name, email = excluded.email, updated_at = now();
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Updated_at triggers
do $$ begin
  create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_payment_transactions_updated_at before update on public.payment_transactions for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_pasti_lulus_materials_updated_at before update on public.pasti_lulus_materials for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ── RLS Policies ─────────────────────────────────────────────
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'student');

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles for insert with check (id = auth.uid());

drop policy if exists "public read ptn" on public.ptns;
create policy "public read ptn" on public.ptns for select using (true);

drop policy if exists "admin manage ptn" on public.ptns;
create policy "admin manage ptn" on public.ptns for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read deadlines" on public.ptn_deadlines;
create policy "public read deadlines" on public.ptn_deadlines for select using (true);

drop policy if exists "admin manage deadlines" on public.ptn_deadlines;
create policy "admin manage deadlines" on public.ptn_deadlines for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own sessions" on public.exam_sessions;
create policy "read own sessions" on public.exam_sessions for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "insert own sessions" on public.exam_sessions;
create policy "insert own sessions" on public.exam_sessions for insert with check (user_id = auth.uid());

drop policy if exists "read own answers" on public.exam_answers;
create policy "read own answers" on public.exam_answers for select using (exists (select 1 from public.exam_sessions s where s.id = session_id and (s.user_id = auth.uid() or public.is_admin())));

drop policy if exists "write own answers" on public.exam_answers;
create policy "write own answers" on public.exam_answers for insert with check (exists (select 1 from public.exam_sessions s where s.id = session_id and s.user_id = auth.uid() and s.status = 'in_progress'));

drop policy if exists "public read published packages" on public.tryout_packages;
create policy "public read published packages" on public.tryout_packages for select using (is_published = true or public.is_admin());

drop policy if exists "read published questions" on public.questions;
create policy "read published questions" on public.questions for select using (status = 'published' or public.is_admin());

drop policy if exists "admin manage payment transactions" on public.payment_transactions;
create policy "admin manage payment transactions" on public.payment_transactions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own payment transactions" on public.payment_transactions;
create policy "read own payment transactions" on public.payment_transactions for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage promo codes" on public.promo_codes;
create policy "admin manage promo codes" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage affiliate partners" on public.affiliate_partners;
create policy "admin manage affiliate partners" on public.affiliate_partners for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage site content" on public.site_content;
create policy "admin manage site content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published site content" on public.site_content;
create policy "public read published site content" on public.site_content for select using (status = 'published' or public.is_admin());

drop policy if exists "admin manage blog posts" on public.blog_posts;
create policy "admin manage blog posts" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published blog posts" on public.blog_posts;
create policy "public read published blog posts" on public.blog_posts for select using (status = 'published' or public.is_admin());

drop policy if exists "admin manage broadcast" on public.broadcast_messages;
create policy "admin manage broadcast" on public.broadcast_messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage crm conversations" on public.crm_conversations;
create policy "admin manage crm conversations" on public.crm_conversations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage crm messages" on public.crm_messages;
create policy "admin manage crm messages" on public.crm_messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage crm templates" on public.crm_templates;
create policy "admin manage crm templates" on public.crm_templates for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage tryout registrations" on public.tryout_registrations;
create policy "admin manage tryout registrations" on public.tryout_registrations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "insert tryout registration" on public.tryout_registrations;
create policy "insert tryout registration" on public.tryout_registrations for insert with check (true);

drop policy if exists "admin manage question bank uploads" on public.question_bank_uploads;
create policy "admin manage question bank uploads" on public.question_bank_uploads for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read question bank uploads" on public.question_bank_uploads;
create policy "read question bank uploads" on public.question_bank_uploads for select using (true);

drop policy if exists "admin manage pasti lulus tokens" on public.pasti_lulus_tokens;
create policy "admin manage pasti lulus tokens" on public.pasti_lulus_tokens for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own pasti lulus token" on public.pasti_lulus_tokens;
create policy "read own pasti lulus token" on public.pasti_lulus_tokens for select using (redeemed_by = auth.uid() or public.is_admin());

drop policy if exists "admin manage pasti lulus materials" on public.pasti_lulus_materials;
create policy "admin manage pasti lulus materials" on public.pasti_lulus_materials for all using (public.is_admin()) with check (public.is_admin());

-- ── Promo code helpers ───────────────────────────────────────
create or replace function public.claim_promo_code(p_code text, p_base_amount integer)
returns table (valid boolean, discount_type text, discount_value integer, discount_amount integer)
language plpgsql security definer set search_path = public
as $$
declare r public.promo_codes; computed_discount integer;
begin
  select * into r from public.promo_codes where code = p_code for update;
  if not found or r.status != 'published' then return query select false, ''::text, 0, 0; return; end if;
  if r.usage_limit > 0 and r.used_count >= r.usage_limit then return query select false, ''::text, 0, 0; return; end if;
  if r.expires_at is not null and r.expires_at < now() then return query select false, ''::text, 0, 0; return; end if;
  update public.promo_codes set used_count = used_count + 1, updated_at = now() where code = p_code;
  computed_discount := case when r.discount_type = 'percent' then least(p_base_amount, greatest(0, (p_base_amount * r.discount_value) / 100)) else least(p_base_amount, greatest(0, r.discount_value)) end;
  return query select true, r.discount_type::text, r.discount_value, computed_discount;
end; $$;

-- ── Seed data ────────────────────────────────────────────────
insert into public.site_content (section_key, title, owner, content, status)
values
  ('hero', 'Hero landing', 'Marketing', '{"badge":"Khusus pejuang Ujian Mandiri PTN 2026","headline":"Belajar pasti lulus, masa depan pasti cerah.","cta":"Mulai gratis sekarang"}', 'published'),
  ('payment_guide', 'Tata cara pembayaran', 'Billing', '{"title":"Tata cara pembayaran","body":"Pilih paket, cek ringkasan, lalu klik Lanjutkan pembayaran."}', 'published')
on conflict (section_key) do nothing;

-- ============================================================
-- SELESAI — semua tabel, fungsi, trigger, RLS, dan seed data sudah dibuat.
-- ============================================================
