-- Migration: Create pasti_lulus_materials table
-- Run this in Supabase SQL editor

create table if not exists public.pasti_lulus_materials (
  id uuid primary key default gen_random_uuid(),
  nomor text not null unique,           -- "01", "02", ..., "27"
  universitas text not null,
  jurusan text not null,
  soal_filename text,                   -- custom uploaded soal (null = gunakan default dari folder)
  pembahasan_filename text,             -- uploaded pembahasan PDF
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin saja yang bisa CRUD
alter table public.pasti_lulus_materials enable row level security;

create policy "Admin dapat membaca materials"
  on public.pasti_lulus_materials for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

create policy "Admin dapat insert materials"
  on public.pasti_lulus_materials for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

create policy "Admin dapat update materials"
  on public.pasti_lulus_materials for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );
