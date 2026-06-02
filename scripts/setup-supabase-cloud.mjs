/**
 * Setup Supabase Cloud — jalankan SEKALI:
 *   node scripts/setup-supabase-cloud.mjs
 *
 * Yang dilakukan:
 *   1. Buat semua tabel yang diperlukan via SQL Editor API
 *   2. Buat storage bucket "pasti-lulus"
 *   3. Upload 28 PDF dari tryout_univ_jurusan_pastilulus_pdf/ ke storage
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SUPABASE_URL = "https://jfftniliplnretpdpfah.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZnRuaWxpcGxucmV0cGRwZmFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU4ODM5OCwiZXhwIjoyMDk0MTY0Mzk4fQ.nENGSigEp0cu1E0cPeJsU2iGa8YasWbREJpzStHSXX8";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helper: run SQL via Supabase Management API ────────────────────────────
async function runSQL(label, sql) {
  process.stdout.write(`  [SQL] ${label} ... `);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) { console.log("✓"); return; }

  // exec_sql tidak tersedia → coba endpoint lain
  const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res2.ok) { console.log("✓"); return; }

  const text = await res2.text().catch(() => "");
  if (text.includes("already exists") || text.includes("duplicate")) {
    console.log("✓ (sudah ada)");
  } else {
    console.log(`⚠ perlu manual — ${text.slice(0, 100)}`);
  }
}

// ── SQL Migrations ─────────────────────────────────────────────────────────
const SQL_MIGRATIONS = [
  ["profiles table", `
    create table if not exists public.profiles (
      id uuid primary key references auth.users(id) on delete cascade,
      full_name text,
      email text,
      role text not null default 'student',
      tier text not null default 'free',
      target_ptns text[],
      exam_track text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `],
  ["pasti_lulus_tokens", `
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
  `],
  ["pasti_lulus_materials", `
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
  `],
];

// ── Create Storage Bucket ──────────────────────────────────────────────────
async function createBucket() {
  process.stdout.write("  [Storage] Buat bucket pasti-lulus ... ");
  const { error } = await supabase.storage.createBucket("pasti-lulus", {
    public: false,
    fileSizeLimit: 52428800, // 50 MB
    allowedMimeTypes: ["application/pdf"],
  });
  if (!error || error.message?.includes("already exists") || error.message?.includes("duplicate")) {
    console.log("✓");
  } else {
    console.log(`⚠ ${error.message}`);
  }
}

// ── Upload PDFs ────────────────────────────────────────────────────────────
async function uploadPdfs() {
  const pdfDir = path.join(ROOT, "tryout_univ_jurusan_pastilulus_pdf");
  if (!fs.existsSync(pdfDir)) {
    console.log("  [PDF] Folder tidak ditemukan, skip.\n");
    return;
  }

  const files = fs.readdirSync(pdfDir).filter((f) => f.endsWith(".pdf"));
  console.log(`  [PDF] ${files.length} file ditemukan, mulai upload...`);

  let ok = 0, skip = 0, err = 0;
  for (const filename of files) {
    const match = filename.match(/^(\d{2})_/);
    const nomor = match?.[1] ?? "00";
    const storagePath = `original/${nomor}_${filename}`;
    const buffer = fs.readFileSync(path.join(pdfDir, filename));

    process.stdout.write(`    ${filename.slice(0, 60).padEnd(60)} ... `);
    const { error } = await supabase.storage
      .from("pasti-lulus")
      .upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });

    if (!error) { console.log("✓"); ok++; }
    else if (error.message?.includes("already exists")) { console.log("skip"); skip++; }
    else { console.log(`✗ ${error.message}`); err++; }
  }

  console.log(`\n  PDF selesai: ${ok} upload, ${skip} skip, ${err} error\n`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 Setup Supabase Cloud: jfftniliplnretpdpfah.supabase.co\n");

  console.log("── Step 1: SQL Migrations ──");
  for (const [label, sql] of SQL_MIGRATIONS) {
    await runSQL(label, sql);
  }

  console.log("\n── Step 2: Storage Bucket ──");
  await createBucket();

  console.log("\n── Step 3: Upload PDF ke Storage ──");
  await uploadPdfs();

  console.log("✅ SELESAI!\n");
  console.log("Langkah selanjutnya:");
  console.log("  1. Buka Supabase SQL Editor dan jalankan sisa migration jika ada tanda ⚠");
  console.log("  2. Connect repo ke Vercel: https://vercel.com/new");
  console.log("  3. Set env variables di Vercel (copy dari .env.production)\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
