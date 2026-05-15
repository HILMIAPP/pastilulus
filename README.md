# White-Label Ujian Mandiri Platform

Platform persiapan **ujian mandiri PTN** berbasis Next.js. Termasuk landing pemasaran, area siswa, onboarding, Info PTN, try out CBT, rasionalisasi nilai, checkout pembayaran, dan admin portal.

Brand, logo, kontak, prefix storage, cookie session, dan harga paket bisa diganti dari `.env.local` tanpa mengubah komponen UI satu per satu.

## Menjalankan Lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Rute Utama

| Rute | Keterangan |
|------|------------|
| `/` | Landing & value proposition |
| `/harga` | Paket Free / Belajar / Pro |
| `/katalog` | Katalog produk PDF |
| `/pembayaran?paket=belajar` | Checkout pembayaran |
| `/pembayaran/status` | Status pembayaran |
| `/masuk`, `/daftar` | UI auth |
| `/siswa` | Dashboard siswa |
| `/siswa/onboarding` | Onboarding target dan jadwal belajar |
| `/siswa/target` | Kampus target dan checklist |
| `/siswa/info-ptn` | Explorer 20 PTN Ujian Mandiri |
| `/siswa/jadwal` | Jadwal belajar personal |
| `/siswa/rasionalisasi` | Rasionalisasi dari hasil tryout terakhir |
| `/siswa/tryout` | Daftar paket UM |
| `/siswa/tryout/paket-1` | Simulasi CBT + skor + pembahasan |
| `/admin` | Admin portal |

## Alur Pembayaran

Alur checkout saat ini sudah disiapkan untuk integrasi Midtrans:

1. User memilih paket di `/harga`.
2. User masuk `/pembayaran?paket=...`.
3. User wajib menyetujui Syarat Layanan, Kebijakan Privasi, dan Kebijakan Pembayaran.
4. Frontend memanggil `POST /api/payments/snap-token`.
5. Jika env Midtrans belum diisi, route mengembalikan status simulasi pengembangan ke `/pembayaran/status`.

## White Label & Harga

Konfigurasi utama ada di `.env.example` dan dipakai oleh `lib/site-config.ts` serta `lib/billing.ts`.

- `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BRAND_OWNER`, `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_BRAND_LOGO_WIDE`, `NEXT_PUBLIC_BRAND_LOGO_ICON`
- `NEXT_PUBLIC_STORAGE_PREFIX`, `NEXT_PUBLIC_SESSION_COOKIE_NAME`
- `NEXT_PUBLIC_PLAN_BELAJAR_PRICE`, `NEXT_PUBLIC_PLAN_PRO_PRICE`

Untuk mengaktifkan Midtrans:

1. Isi `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.
2. Implementasikan pembuatan Snap token asli di `app/api/payments/snap-token/route.ts`.
3. Aktifkan webhook di `app/api/payments/midtrans-webhook/route.ts`.
4. Verifikasi `signature_key`, simpan order, dan aktifkan paket dari backend.
5. Jangan pernah mengaktifkan paket dari status frontend saja.

## Legal

Halaman legal yang sudah tersedia:

- `/syarat-layanan`
- `/kebijakan-privasi`
- `/kebijakan-pembayaran`

## Stack

Next.js 16, React 19, Tailwind CSS 4, TypeScript, lucide-react.

## Integrasi Berikutnya

Supabase Auth + Postgres + RLS, Midtrans Snap, AI tutor server-side, WhatsApp reminder worker, pipeline konten SOAL UM, dan observability.

## Admin production mode

Admin portal sudah punya fallback mock agar UI tetap bisa dicoba lokal. Untuk membuat semua fitur admin memakai data produksi:

1. Jalankan `docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql` di Supabase SQL editor.
2. Jalankan `docs/ADMIN_PRODUCTION_SCHEMA.sql`.
3. Isi env server-only:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Pastikan user admin punya `profiles.role = 'admin'` atau `profiles.role = 'super_admin'`.

Setelah itu `/admin` akan membaca data dari tabel produksi:

- `payment_transactions`
- `promo_codes`
- `affiliate_partners`
- `site_content`
- `blog_posts`
- `profiles`
- `questions`

Checkout akan mencatat order ke `payment_transactions`, webhook Midtrans akan mengubah status transaksi, membuat/memperbarui subscription, dan menaikkan `profiles.tier` saat pembayaran berhasil.

## Production ERD

Dokumen ERD publik tersedia di `docs/PRODUCTION_ERD_PUBLIC.md`.
Checklist kesiapan publish tersedia di `docs/PUBLISH_READINESS_CHECKLIST.md`.
Owner launch gates tersedia di `docs/OWNER_PUBLIC_LAUNCH_GATES.md`.

Untuk hardening schema sesuai ERD publik, jalankan setelah schema utama:

1. `docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql`
2. `docs/ADMIN_PRODUCTION_SCHEMA.sql`
3. `docs/PRODUCTION_ERD_HARDENING.sql`
"# pastilulus" 
