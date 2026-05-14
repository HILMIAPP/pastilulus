# Supabase Backend Setup

Status: environment variable sudah disiapkan, dependency sudah terpasang dari terminal lokal user, helper Supabase sudah dibuat, dan schema v2 berhasil dijalankan di Supabase.

## 1. Install Dependency

Sudah dijalankan dari terminal Windows biasa di root project:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Package yang direkomendasikan:

- `@supabase/supabase-js@2`
- `@supabase/ssr`

Catatan: dokumentasi Supabase merekomendasikan `@supabase/ssr` untuk App Router dan cookie-based auth. Di Next.js 16, file middleware sekarang disebut `proxy.ts`, jadi integrasi session refresh harus masuk ke `proxy.ts` yang sudah ada.

## 2. Environment Variable

`.env.local` sudah dibuat dengan:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GROQ_API_KEY`

`.env.local` tidak ikut commit karena `.gitignore` sudah mengabaikan `.env*`.

`.env.example` juga sudah ditambah placeholder agar agent berikutnya tahu variable yang dibutuhkan.

## 3. File Helper Yang Sudah Dibuat

Struktur yang disarankan:

File:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`

## 4. Integrasi Dengan `proxy.ts`

Project saat ini sudah punya `proxy.ts` untuk proteksi route:

- `/siswa`
- `/admin`
- `/masuk`
- `/daftar`

`proxy.ts` sudah dibuat `async`, memanggil `refreshSupabaseSession(request)`, lalu tetap menjalankan redirect existing. Jangan membuat `middleware.ts` baru karena Next.js 16 memakai `proxy.ts` dan project ini sudah punya satu proxy aktif.

## 5. Database Schema

Schema yang berhasil dijalankan:

- `docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql`

Schema tambahan yang perlu dijalankan setelah Supabase Auth aktif:

- `docs/SUPABASE_AUTH_PROFILE_TRIGGER.sql`

Google OAuth:

- Route callback app: `/auth/callback`
- Development redirect URL: `http://localhost:3000/auth/callback`
- Production redirect URL: `https://domain-produksi-kamu/auth/callback`
- Tambahkan redirect URL tersebut di Supabase Auth URL Configuration dan Google OAuth Console.

Schema v2 sudah mencakup:

- enum role, tier, subscription status, question status, dan exam session status
- tabel `profiles`, `subscriptions`, `ptns`, `ptn_deadlines`, `tryout_packages`, `questions`, `exam_sessions`, `exam_answers`, dan `audit_logs`
- index dasar untuk query penting
- Row Level Security
- policy dasar untuk user dan admin

## 6. Prioritas Implementasi Setelah Supabase Aktif

1. Test daftar akun baru, login email/password, dan login Google.
2. Simpan profile, target PTN, progress belajar, attempt CBT, dan payment status ke database.
3. Tambahkan seed data untuk 20 PTN, paket tryout, dan soal production.
4. Integrasikan Midtrans webhook untuk mengaktifkan subscription dari server.
5. Gunakan `GROQ_API_KEY` hanya di server route, jangan expose ke client.

## 7. Midtrans

Env lokal sudah disiapkan di `.env.local`:

- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_IS_PRODUCTION=true`

Route yang sudah aktif:

- `POST /api/payments/snap-token`: membuat transaksi Midtrans Snap.
- `POST /api/payments/midtrans-webhook`: memverifikasi `signature_key` Midtrans.

Backlog:

- Buat tabel `payments` atau pakai `subscriptions` sebagai order ledger.
- Simpan order sebelum redirect ke Midtrans.
- Webhook harus update `subscriptions.status` hanya setelah status transaksi valid.
- Handler webhook harus idempotent berdasarkan `order_id`.
