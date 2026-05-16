-- CRM chat bot + admin inbox

create table if not exists public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  source_page text,
  topic text not null default 'general',
  status text not null default 'waiting_admin' check (status in ('bot','waiting_admin','assigned','closed')),
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor','bot','admin')),
  sender_id uuid,
  body text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_internal_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  admin_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null default 'general',
  body text not null,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_conversations_status_last on public.crm_conversations(status, last_message_at desc);
create index if not exists idx_crm_messages_conversation_created on public.crm_messages(conversation_id, created_at asc);

alter table public.crm_conversations enable row level security;
alter table public.crm_messages enable row level security;
alter table public.crm_internal_notes enable row level security;
alter table public.crm_templates enable row level security;

drop policy if exists "admin manage crm conversations" on public.crm_conversations;
create policy "admin manage crm conversations"
on public.crm_conversations for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage crm messages" on public.crm_messages;
create policy "admin manage crm messages"
on public.crm_messages for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage crm internal notes" on public.crm_internal_notes;
create policy "admin manage crm internal notes"
on public.crm_internal_notes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage crm templates" on public.crm_templates;
create policy "admin manage crm templates"
on public.crm_templates for all
using (public.is_admin())
with check (public.is_admin());

insert into public.crm_templates (title, topic, body, status)
values
  ('Pembayaran belum aktif', 'payment', 'Halo, kak. Boleh kirim email akun, Order ID, dan screenshot bukti bayar? Kami cek status pembayaran dan aktivasi paketnya.', 'published'),
  ('Tanya paket belajar', 'package', 'Halo, kak. Paket Belajar cocok untuk latihan soal dan tryout. Paket Pro cocok kalau butuh analitik lebih lengkap dan prioritas support.', 'published'),
  ('Info Ujian Mandiri', 'ptn_info', 'Halo, kak. Untuk info deadline dan jalur mandiri, sebutkan kampus targetnya ya. Nanti kami bantu arahkan halaman info yang relevan.', 'published')
on conflict do nothing;
