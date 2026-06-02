-- Migration: Tambah kolom storage path untuk Vercel + Supabase Storage
-- Jalankan di Supabase SQL Editor

-- 1. Tambah kolom storage path (nullable, backward-compatible)
alter table public.pasti_lulus_materials
  add column if not exists soal_storage_path text,
  add column if not exists pembahasan_storage_path text;

-- 2. Buat Supabase Storage bucket (jalankan di Supabase Dashboard > Storage)
-- Atau via API:
--   insert into storage.buckets (id, name, public)
--   values ('pasti-lulus', 'pasti-lulus', false)
--   on conflict (id) do nothing;

-- 3. RLS policy untuk Storage bucket "pasti-lulus"
-- (Akses hanya via service role — admin client — tidak perlu policy user biasa
--  karena semua akses dilakukan server-side via signed URL)

-- Catatan: signed URL di-generate server-side via createAdminClient()
-- dan berlaku 2 jam. User tidak bisa akses bucket langsung.
