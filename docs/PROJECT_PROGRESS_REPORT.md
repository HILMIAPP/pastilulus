# Laporan Progress Proyek - White-Label UM Platform

Tanggal update: 14 Mei 2026  
Status build terakhir: `npm run lint` dan `npm run build` lolos setelah penambahan konfigurasi Supabase/Groq.

## Ringkasan Eksekutif

Proyek sudah berkembang dari landing page awal menjadi MVP web app persiapan Ujian Mandiri PTN dengan area siswa, CBT tryout, materi belajar, Info PTN, rasionalisasi nilai, onboarding, checkout pembayaran, legal page, admin portal, white-label config, dan katalog produk PDF.

Katalog `Katalog_Pastilulus_by_Nuka_Ujian_Mandiri_PTN_2026.pdf` sudah dimasukkan ke proyek sebagai asset publik dan tersedia di route `/katalog`.

## Kondisi Produk Saat Ini

### 1. Brand & White Label

Status: selesai untuk level MVP frontend.

Konfigurasi utama:

- `lib/site-config.ts`
- `.env.example`

Yang sudah bisa diganti dari env:

- `NEXT_PUBLIC_BRAND_NAME`
- `NEXT_PUBLIC_BRAND_OWNER`
- `NEXT_PUBLIC_BRAND_SUFFIX`
- `NEXT_PUBLIC_BRAND_TAGLINE`
- `NEXT_PUBLIC_BRAND_PROMISE`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_BRAND_LOGO_WIDE`
- `NEXT_PUBLIC_BRAND_LOGO_ICON`
- `NEXT_PUBLIC_STORAGE_PREFIX`
- `NEXT_PUBLIC_SESSION_COOKIE_NAME`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `NEXT_PUBLIC_SUPER_ADMIN_EMAIL`

Catatan:

- Nama package sudah diganti ke `white-label-um-platform`.
- Sisa kata Pastilulus di `lib/site-config.ts` dan `.env.example` adalah fallback/default brand, bukan hardcode tersebar.

### 2. Pricing & Billing

Status: selesai untuk konfigurasi MVP.

File utama:

- `lib/billing.ts`
- `app/harga/page.tsx`
- `components/payment-checkout.tsx`
- `app/api/payments/snap-token/route.ts`
- `app/api/payments/midtrans-webhook/route.ts`

Paket aktif:

- Free: Rp 0
- Belajar: default Rp 29.000/bulan
- Pro: default Rp 49.000/bulan

Harga bisa diubah dari:

- `NEXT_PUBLIC_PLAN_BELAJAR_PRICE`
- `NEXT_PUBLIC_PLAN_PRO_PRICE`

Status Midtrans:

- UI checkout dan consent legal sudah ada.
- API route Snap token masih mode development/placeholder.
- Webhook belum mengaktifkan paket produksi; wajib tambah validasi signature dan update subscription dari backend.

### 3. Landing, Blog, Kontak, Katalog

Status: selesai untuk MVP marketing.

Route:

- `/`
- `/blog`
- `/kontak`
- `/harga`
- `/katalog`

Katalog:

- Source PDF dari user: `C:/Users/shafw/Downloads/Katalog_Pastilulus_by_Nuka_Ujian_Mandiri_PTN_2026.pdf`
- Asset publik: `public/katalog/katalog-pastilulus-um-ptn-2026.pdf`
- Viewer page: `app/katalog/page.tsx`

Catatan:

- Route `/katalog` menggunakan PDF embed dengan tombol buka PDF dan unduh.
- Link katalog sudah ditambahkan ke footer.

### 4. Area Siswa

Status: MVP frontend selesai.

Route:

- `/siswa`
- `/siswa/onboarding`
- `/siswa/target`
- `/siswa/belajar`
- `/siswa/belajar/[slug]`
- `/siswa/tryout`
- `/siswa/tryout/[paketId]`
- `/siswa/rasionalisasi`
- `/siswa/info-ptn`
- `/siswa/jadwal`

Fitur:

- Dashboard siswa
- Onboarding target dan jadwal belajar
- Target PTN + checklist administrasi
- Jadwal belajar personal berbasis onboarding
- Materi belajar dari PDF/DOCX master dan logbook
- Tryout CBT full-screen tanpa sidebar saat ujian
- Result, pembahasan, dan rasionalisasi nilai

### 5. Materi Belajar

Status: konten sudah masuk dan terhubung.

File utama:

- `lib/learning-materials.ts`
- `app/siswa/belajar/page.tsx`
- `app/siswa/belajar/[slug]/page.tsx`

Asset publik:

- `public/materi/buku-master-materi-um-ptn-2026.pdf`
- `public/materi/buku-master-materi-um-ptn-2026.docx`
- `public/materi/logbook-rangkuman-um-ptn-2026.pdf`
- `public/materi/logbook-rangkuman-um-ptn-2026.docx`
- `public/materi/images/*`

Jumlah modul:

- 12 modul belajar.

### 6. Tryout CBT dan Bank Soal

Status: engine CBT selesai untuk MVP, konten besar sudah terpasang.

File utama:

- `lib/app-data.ts`
- `lib/um-question-bank.ts`
- `lib/um-question-bank-10-ptn.ts`
- `components/tryout-exam.tsx`

Paket tryout:

- Paket UM Mandiri PTN Set 1: 120 soal
- Paket UM Mandiri PTN Set 2: 120 soal
- SIMAK UI Full: 100 soal
- CBT UM UGM Full: 100 soal
- SM ITB Full: 100 soal
- SMUA UNAIR Full: 100 soal
- UTM IPB Full: 100 soal
- SM ITS Full: 100 soal
- SMUP UNPAD Full: 100 soal
- UM UNDIP Full: 100 soal
- SMUB UB Full: 100 soal
- Mandiri UNHAS Full: 100 soal

Total soal terpasang:

- 1.240 soal.

Fitur CBT:

- Halaman aturan sebelum ujian
- Timer
- Navigasi nomor
- Jawaban A-E
- Tandai ragu
- Submit konfirmasi
- Skoring `Benar +4, kosong 0, salah -1`
- Pembahasan setelah submit
- Simpan hasil terakhir ke localStorage white-label key

Catatan kualitas:

- Data soal saat ini masih static TypeScript.
- Untuk produksi, pindahkan paket dan soal ke database agar bisa kurasi, audit, publish/unpublish, dan analytics.

### 7. Info PTN

Status: MVP selesai.

File utama:

- `components/student-dashboard-data.ts`
- `components/ptn-info-explorer.tsx`
- `app/info-ptn/page.tsx`
- `app/siswa/info-ptn/page.tsx`

Jumlah PTN:

- 20 PTN Ujian Mandiri.

Fitur:

- Search/filter PTN
- Detail deadline, biaya, dokumen, strategi
- Pin target kampus
- Checklist administrasi
- Link sumber resmi

Catatan:

- Jadwal dan biaya kampus bersifat dinamis; sebelum go-live harus diverifikasi ulang dari portal resmi.

### 8. Rasionalisasi Nilai

Status: MVP frontend selesai.

File utama:

- `lib/um-rationalization.ts`
- `components/student-rationalization-page.tsx`
- `app/siswa/rasionalisasi/page.tsx`

Fitur:

- Membaca hasil tryout terakhir.
- Menghitung estimasi peluang dan rekomendasi aksi.
- Disclaimer sudah ada bahwa hasil bukan jaminan kelulusan resmi.

Catatan:

- Model rasionalisasi masih rule-based/static.
- Produksi perlu baseline skor per kampus/prodi dan data historis.

### 9. Auth dan Session

Status: mock/local session selesai untuk MVP.

File utama:

- `lib/auth-actions.ts`
- `lib/session.ts`
- `lib/session-codec.ts`

Fitur:

- Login/register local form.
- Cookie session signed.
- Role berdasarkan email admin/superadmin dari white-label config.

Belum produksi:

- Belum memakai Supabase Auth.
- Belum ada password hashing/database user.
- Belum ada reset password/email verification.

Persiapan Supabase:

- `.env.local` sudah berisi Supabase URL, Supabase publishable key, dan `GROQ_API_KEY`.
- `.env.example` sudah ditambah placeholder variable Supabase dan Groq.
- Panduan integrasi backend ada di `docs/SUPABASE_BACKEND_SETUP.md`.
- Dependency `@supabase/supabase-js` dan `@supabase/ssr` sudah terpasang.
- Helper Supabase sudah dibuat di `lib/supabase/client.ts`, `lib/supabase/server.ts`, dan `lib/supabase/proxy.ts`.
- `proxy.ts` sudah memanggil refresh session Supabase sambil mempertahankan proteksi route mock session existing.
- Schema database v2 `docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql` sudah berhasil dijalankan di Supabase dengan RLS aktif.
- Login/register server action sudah memakai Supabase Auth.
- Trigger profile user baru disiapkan di `docs/SUPABASE_AUTH_PROFILE_TRIGGER.sql` dan perlu dijalankan di Supabase SQL Editor.
- Login Google sudah ditambahkan via Supabase OAuth dengan callback `/auth/callback`.

### 10. Admin Portal

Status: UI admin MVP tersedia.

Route:

- `/admin`

File utama:

- `components/admin-portal.tsx`

Fitur UI:

- Dashboard overview
- Data pengguna
- Bank soal
- Manajemen PTN
- Billing
- Broadcast

Belum produksi:

- Data masih mock/static.
- Belum terhubung database.
- Belum ada RBAC backend yang kuat di route admin.

## Validasi Terakhir

Validasi setelah penambahan konfigurasi Supabase/Groq:

- `npm run lint`: lolos
- `npm run build`: lolos
- Route `/katalog`: terdaftar sebagai static route pada output build

## File Penting Untuk Agent Berikutnya

- `README.md`
- `.env.example`
- `lib/site-config.ts`
- `lib/billing.ts`
- `lib/app-data.ts`
- `lib/learning-materials.ts`
- `lib/um-rationalization.ts`
- `components/tryout-exam.tsx`
- `components/ptn-info-explorer.tsx`
- `components/payment-checkout.tsx`
- `app/katalog/page.tsx`
- `public/katalog/katalog-pastilulus-um-ptn-2026.pdf`

## Backlog Prioritas Produksi

1. Hubungkan Auth ke Supabase.
2. Pindahkan bank soal, paket tryout, hasil ujian, progress belajar, target PTN, dan subscription ke database.
3. Implementasi Midtrans Snap asli dan webhook signature validation.
4. Aktifkan subscription/tier dari backend, bukan dari frontend.
5. Buat admin CRUD untuk soal, paket, PTN, deadline, dan transaksi.
6. Tambahkan riwayat tryout, analitik per subtes, dan export report.
7. Implementasi WhatsApp reminder worker setelah data user/target masuk database.
8. Review ulang semua jadwal/biaya PTN dari sumber resmi sebelum go-live.
9. Tambahkan tests minimal untuk billing, session, tryout scoring, dan rationalization.
10. Audit legal final dengan template T&C/Privacy sebelum produksi.

## Catatan Untuk Agent

- Jangan rename folder repo secara otomatis karena beberapa script lokal masih menunjuk path workspace saat ini.
- Jangan hapus folder temporary tanpa cek, tetapi folder berikut sudah masuk `.gitignore`:
  - `tmp_materi_import/`
  - `tmp_soal10_import/`
  - `tmp_docx_peek/`
- Jangan mengubah `lib/um-question-bank*.ts` secara manual kecuali perlu regenerate dari sumber soal.
- Jika mengubah brand/harga, ubah `.env.local` atau fallback di `lib/site-config.ts` dan `lib/billing.ts`.
- Jika mengubah CBT, cek full-screen exam flow di `/siswa/tryout/[paketId]`.
