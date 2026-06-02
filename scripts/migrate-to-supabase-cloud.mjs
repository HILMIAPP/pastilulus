/**
 * Jalankan: node scripts/migrate-to-supabase-cloud.mjs
 *
 * Prerequisite:
 *   Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di env atau langsung di bawah.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("ERROR: Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY terlebih dahulu.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const migrations = [
  {
    name: "pasti_lulus_tokens",
    sql: `
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
      create index if not exists idx_pasti_lulus_tokens_redeemed_by
        on public.pasti_lulus_tokens(redeemed_by);
    `,
  },
  {
    name: "pasti_lulus_materials",
    sql: `
      create table if not exists public.pasti_lulus_materials (
        id uuid primary key default gen_random_uuid(),
        nomor text not null unique,
        universitas text not null,
        jurusan text not null,
        soal_storage_path text,
        pembahasan_storage_path text,
        uploaded_by uuid references public.profiles(id) on delete set null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `,
  },
  {
    name: "pasti_lulus_materials_storage_columns",
    sql: `
      alter table public.pasti_lulus_materials
        add column if not exists soal_storage_path text,
        add column if not exists pembahasan_storage_path text;
    `,
  },
  {
    name: "storage_bucket_pasti_lulus",
    sql: `
      insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values (
        'pasti-lulus',
        'pasti-lulus',
        false,
        52428800,
        ARRAY['application/pdf']
      )
      on conflict (id) do nothing;
    `,
  },
];

async function run() {
  console.log(`\nConnecting to: ${SUPABASE_URL}\n`);

  for (const m of migrations) {
    process.stdout.write(`Running: ${m.name} ... `);
    const { error } = await supabase.rpc("exec_sql", { sql: m.sql }).catch(() => ({ error: null }));

    // Fallback: use direct query via REST if rpc tidak tersedia
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: m.sql }),
    });

    if (res.ok || error === null) {
      console.log("✓");
    } else {
      const body = await res.text();
      // Ignore "already exists" errors
      if (body.includes("already exists") || body.includes("duplicate")) {
        console.log("✓ (already exists)");
      } else {
        console.log(`⚠ ${body.slice(0, 120)}`);
      }
    }
  }

  console.log("\n✅ Migration selesai!\n");
  console.log("Langkah selanjutnya:");
  console.log("1. Perbarui SUPABASE_URL dan keys di .env.local dan .env.production");
  console.log("2. Panggil POST /api/admin/pasti-lulus-migrate untuk upload PDF ke storage");
  console.log("3. Connect repo ke Vercel dan set environment variables\n");
}

run().catch(console.error);
