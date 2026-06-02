-- Migration: Create pasti_lulus_tokens table
-- Run this in Supabase SQL editor before deploying PASTI LULUS 1 feature

create table if not exists public.pasti_lulus_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Index untuk lookup cepat per user
create index if not exists idx_pasti_lulus_tokens_redeemed_by
  on public.pasti_lulus_tokens(redeemed_by);

-- Row Level Security
alter table public.pasti_lulus_tokens enable row level security;

-- Admin bisa baca semua token
create policy "Admin dapat membaca semua token"
  on public.pasti_lulus_tokens for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- Admin bisa insert token baru
create policy "Admin dapat membuat token"
  on public.pasti_lulus_tokens for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- Admin bisa update token (misal nonaktifkan)
create policy "Admin dapat mengupdate token"
  on public.pasti_lulus_tokens for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- User dapat membaca token yang sudah mereka redeem (untuk verifikasi akses)
create policy "User dapat membaca token miliknya"
  on public.pasti_lulus_tokens for select
  using (redeemed_by = auth.uid());

-- Catatan: redemption dilakukan via service role (admin client) dari server action,
-- bukan langsung dari klien, sehingga tidak perlu policy update untuk user biasa.
