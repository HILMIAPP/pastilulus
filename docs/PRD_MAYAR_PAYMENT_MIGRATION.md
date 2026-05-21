# PRD Migrasi Pembayaran Midtrans ke Mayar

## Ringkasan

Dokumen ini mendefinisikan rencana migrasi pembayaran lolosujian dari Midtrans Snap ke Mayar Headless Commerce. Fokus fase ini adalah mengganti pembuatan transaksi, redirect checkout, dan webhook status pembayaran tanpa mengubah model bisnis paket Belajar/Pro, promo, affiliate, dashboard admin, atau aktivasi subscription yang sudah berjalan.

Implementasi belum dilakukan pada dokumen ini. PRD ini menjadi acuan sebelum perubahan kode.

## Sumber Referensi

- Mayar Headless Commerce: https://mayar.id/headless-commerce
- Mayar API Introduction: https://docs.mayar.id/api-reference/introduction
- Mayar Create Invoice: https://docs.mayar.id/api-reference/invoice/create
- Mayar Invoice Detail/Status: https://docs.mayar.id/api-reference/invoice/detail
- Mayar Create Single Payment Request: https://docs.mayar.id/api-reference/reqpayment/create
- Mayar Webhook: https://docs.mayar.id/integration/webhook
- Mayar API Rate Limit: https://docs.mayar.id/api-reference/rate-limit

## Latar Belakang

Alur saat ini:

1. User login membuka `/pembayaran?paket=...`.
2. Frontend memanggil `POST /api/payments/snap-token`.
3. Backend menghitung harga, promo, affiliate, membuat `payment_transactions`, lalu membuat transaksi Midtrans Snap.
4. Frontend redirect ke `redirectUrl` Midtrans.
5. Midtrans webhook `POST /api/payments/midtrans-webhook` memverifikasi signature, mengubah status transaksi, mengklaim promo, menambah konversi affiliate, membuat subscription, dan menaikkan tier profil.

Target migrasi:

1. User tetap checkout dari halaman yang sama.
2. Backend membuat payment request/invoice Mayar.
3. Frontend redirect ke payment link Mayar.
4. Webhook Mayar `payment.received` mengaktifkan paket secara idempotent.
5. Admin dan siswa tetap melihat riwayat transaksi dari `payment_transactions`.

## Tujuan

- Mengganti provider pembayaran dari Midtrans ke Mayar.
- Mempertahankan UX checkout yang sudah ada: pilih paket, input promo, input affiliate, setuju ketentuan, lanjut pembayaran.
- Mempertahankan ledger internal `payment_transactions` sebagai sumber kebenaran aplikasi.
- Mempertahankan efek bisnis saat pembayaran sukses: promo claim, affiliate conversion, subscription upsert, profile tier upgrade.
- Menyediakan mode sandbox dan production Mayar.
- Menyediakan fallback development saat kredensial Mayar belum diisi.

## Non-Tujuan

- Tidak membuat ulang pricing engine.
- Tidak mengubah paket Belajar/Pro.
- Tidak mengganti Supabase schema besar-besaran sebelum kebutuhan kolom final jelas.
- Tidak membuat halaman produk Mayar sebagai storefront utama.
- Tidak memindahkan promo dan affiliate internal ke fitur diskon/affiliate Mayar pada fase pertama.
- Tidak mengubah admin portal selain label/provider data yang diperlukan.

## Temuan Dokumentasi Mayar

Mayar Headless Commerce mendukung pemisahan frontend dan backend untuk storefront/custom checkout. API menggunakan Bearer API Key. API key dibuat dari dashboard Mayar production atau sandbox. Dokumentasi Mayar menyebut environment sandbox memakai `web.mayar.club` untuk dashboard/testing, sementara base API publik yang terlihat adalah `https://api.mayar.id/hl/v1`.

Endpoint yang relevan:

- `POST /invoice/create`: membuat invoice dengan `name`, `email`, `mobile`, `redirectUrl`, `description`, `expiredAt`, `items`, dan `extraData`. Response berisi `data.id`, `data.transactionId`, `data.link`, `data.expiredAt`.
- `GET /invoice/{id}`: mengambil detail/status invoice. Response contoh memakai status seperti `unpaid`, amount, customer, `transactionId`, dan `paymentUrl`.
- `POST /payment/create`: membuat single payment request dengan `name`, `email`, `amount`, `mobile`, `redirectUrl` atau `redirectURL`, `description`, dan `expiredAt`. Response berisi `data.id`, `data.transactionId`, dan `data.link`.
- Webhook dikirim dengan method `POST`, content type `application/json`, dan event seperti `payment.received` serta `payment.reminder`.
- Rate limit API Mayar: 20 request per menit per IP, dengan response 429 dan header `Retry-After`.

Catatan risiko dokumentasi:

- Dokumen `Create Single Payment Request` menampilkan contoh curl ke `/invoice/create`, tetapi bagian endpoint menyebut `/payment/create`.
- Nama field redirect tampil sebagai `redirectUrl` pada contoh, tetapi tabel request body menyebut `redirectURL`.
- Dokumentasi publik yang ditemukan belum menjelaskan signature/header verifikasi webhook seperti `signature_key` Midtrans.

Konsekuensi: implementasi harus diuji di sandbox Mayar dan webhook test payload harus direkam sebelum go-live.

## Keputusan Produk

### Pilihan Integrasi

Fase pertama memakai Mayar Invoice atau Single Payment Request sebagai hosted checkout link, bukan embedded popup.

Rekomendasi teknis awal: gunakan `POST /invoice/create` karena mendukung `items` dan `extraData`, sehingga order internal (`orderId`, `planId`, `userId`, promo, affiliate, discount) dapat dikirim lebih jelas. Jika sandbox membuktikan `/payment/create` lebih stabil untuk pembayaran satu kali, implementasi boleh beralih dengan kontrak response yang sama di backend.

### UX Checkout

Frontend tidak lagi membutuhkan Snap token. Tombol "Lanjutkan pembayaran" akan memanggil endpoint internal baru dan redirect ke link Mayar.

Copy UI tetap generik:

- "Lanjutkan pembayaran"
- "Menyiapkan pembayaran..."
- "Pembayaran aman"

Tidak perlu menyebut Midtrans di UI.

### Sumber Kebenaran Status

Status internal tetap berasal dari `payment_transactions.status`:

- `pending`
- `paid`
- `expired`
- `failed`

Webhook Mayar menjadi trigger utama untuk `paid`. Untuk keamanan, backend dapat melakukan verifikasi tambahan dengan `GET /invoice/{id}` sebelum menerapkan side effects.

## Scope Fungsional

### 1. Konfigurasi Environment

Tambahkan env:

```bash
MAYAR_API_KEY=
MAYAR_BASE_URL=https://api.mayar.id/hl/v1
MAYAR_IS_PRODUCTION=false
MAYAR_WEBHOOK_SECRET=
MAYAR_CHECKOUT_MODE=invoice
```

Catatan:

- `MAYAR_WEBHOOK_SECRET` digunakan sebagai secret internal pada URL atau header custom jika Mayar tidak menyediakan signature resmi.
- Jika Mayar dashboard sandbox membutuhkan API base berbeda, `MAYAR_BASE_URL` harus bisa dioverride.

Hapus/deprecate env Midtrans setelah migrasi stabil:

```bash
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
NEXT_PUBLIC_MIDTRANS_SNAP_URL
MIDTRANS_SERVER_KEY
MIDTRANS_IS_PRODUCTION
```

### 2. Endpoint Create Checkout

Ganti `POST /api/payments/snap-token` menjadi salah satu opsi:

Opsi konservatif:

- Pertahankan route lama sementara, ubah isi menjadi provider-agnostic.
- Response tetap berisi `redirectUrl` agar frontend minim berubah.

Opsi bersih:

- Buat route baru `POST /api/payments/mayar-checkout`.
- Frontend diganti memanggil route baru.

Rekomendasi: route baru agar nama endpoint tidak misleading, lalu route lama bisa dihapus setelah test.

Request frontend:

```json
{
  "planId": "belajar",
  "promoCode": "HEMATUM",
  "affiliateCode": "PARTNER01"
}
```

Response sukses:

```json
{
  "mode": "mayar-checkout",
  "orderId": "PL-belajar-...",
  "planId": "belajar",
  "amount": 25000,
  "promoCode": "HEMATUM",
  "affiliateCode": "PARTNER01",
  "discountAmount": 5000,
  "providerPaymentId": "mayar-invoice-id",
  "providerTransactionId": "mayar-transaction-id",
  "redirectUrl": "https://...mayar.../invoices/...",
  "message": "Transaksi pembayaran berhasil dibuat."
}
```

### 3. Mayar Payload

Jika memakai invoice:

```json
{
  "name": "Nama user",
  "email": "user@example.com",
  "mobile": "080000000000",
  "redirectUrl": "https://app/pembayaran/status?status=pending&order_id=PL-belajar-...",
  "description": "Paket Belajar Pastilulus",
  "expiredAt": "2026-05-22T10:00:00.000Z",
  "items": [
    {
      "quantity": 1,
      "rate": 25000,
      "description": "Paket Belajar Pastilulus"
    }
  ],
  "extraData": {
    "orderId": "PL-belajar-...",
    "userId": "uuid",
    "planId": "belajar",
    "promoCode": "HEMATUM",
    "affiliateCode": "PARTNER01",
    "discountAmount": "5000"
  }
}
```

Jika `mobile` wajib dan user profile belum punya nomor HP:

- Fase MVP: gunakan placeholder yang valid secara format, atau tambah input nomor HP di checkout.
- Rekomendasi produk: tambah input nomor HP singkat di checkout karena Mayar menggunakannya untuk customer/payment reminder.

### 4. Database

Tabel `payment_transactions` tetap dipakai.

Tambahan kolom yang disarankan:

```sql
alter table public.payment_transactions
  add column if not exists payment_provider text default 'mayar',
  add column if not exists provider_payment_id text,
  add column if not exists provider_transaction_id text,
  add column if not exists provider_payment_url text;
```

Kolom lama `midtrans_transaction_id` jangan langsung dihapus agar data historis aman.

Index yang disarankan:

```sql
create index if not exists idx_payment_transactions_provider_payment
  on public.payment_transactions(payment_provider, provider_payment_id);
```

### 5. Webhook Mayar

Buat endpoint:

```text
POST /api/payments/mayar-webhook
```

Webhook diproses jika:

- Event adalah `payment.received`.
- Payload memiliki data customer/amount/provider id yang bisa dicocokkan.
- `orderId` ditemukan dari `extraData`, `custom_field`, atau mapping `provider_payment_id`.
- Amount dari Mayar sama dengan `payment_transactions.amount`.
- Status transaksi internal belum `paid`.

Side effects sama seperti webhook Midtrans:

1. Update `payment_transactions.status = paid`.
2. Simpan `payment_method` jika payload menyediakan channel/metode pembayaran.
3. Simpan `provider_transaction_id`.
4. Simpan `raw_payload`.
5. Set `paid_at`.
6. Jalankan `claim_promo_code`.
7. Jalankan `increment_affiliate_conversion`.
8. Upsert `subscriptions`.
9. Upgrade `profiles.tier` tanpa downgrade.

### 6. Keamanan Webhook

Karena dokumentasi publik belum menampilkan signature webhook, implementasi perlu lapisan pengaman:

- Gunakan URL webhook dengan token rahasia, misalnya `/api/payments/mayar-webhook?secret=...`, atau header custom jika dashboard Mayar mendukung.
- Cocokkan amount, customer email, dan provider id dengan transaksi internal.
- Setelah menerima `payment.received`, panggil API Mayar detail invoice/payment untuk konfirmasi status sebelum side effects.
- Terapkan idempotency: side effects hanya berjalan ketika status sebelumnya bukan `paid`.
- Simpan seluruh payload untuk audit.

Open question wajib sebelum production:

- Apakah Mayar menyediakan webhook signature/header resmi di dashboard atau payload test?
- Field mana yang membawa invoice/payment id, transaction id, payment method, dan custom extra data dalam event `payment.received`?

### 7. Status Page

Halaman `/pembayaran/status` tetap dipakai.

Perilaku:

- Setelah redirect dari Mayar, status awal boleh `pending`.
- Jika query hanya membawa `order_id`, halaman menampilkan status dari database.
- Jika belum paid, user diarahkan untuk menunggu atau mengecek riwayat transaksi.
- Jika webhook sudah masuk, halaman menampilkan sukses dan paket aktif.

### 8. Admin Portal

Admin portal tetap membaca `payment_transactions`.

Perubahan minimal:

- Label provider menjadi Mayar.
- Tampilkan provider transaction id jika tersedia.
- CSV export tetap memakai order id internal.

### 9. Development Mode

Jika `MAYAR_API_KEY` belum diisi:

- Backend tetap membuat `payment_transactions` status `pending`.
- Response `mode = development`.
- `redirectUrl = /pembayaran/status?status=pending&order_id=...`.

Ini mempertahankan perilaku simulasi yang saat ini ada pada Midtrans route.

## Acceptance Criteria

- User login dapat membuat checkout Mayar dari halaman pembayaran.
- Order internal dibuat sebelum redirect ke Mayar.
- Promo valid mengurangi amount sebelum request ke Mayar.
- Affiliate valid tersimpan di transaksi.
- Payment link Mayar dibuka dari response backend.
- Webhook Mayar sukses mengubah transaksi menjadi `paid`.
- Webhook duplicate tidak menggandakan promo claim, affiliate conversion, atau subscription.
- Amount mismatch tidak mengaktifkan subscription.
- Webhook tanpa secret/validasi tambahan ditolak.
- Riwayat transaksi siswa tetap menampilkan order, plan, amount, metode, status, promo, affiliate.
- Admin dapat melihat dan export transaksi Mayar.
- Jika Mayar API error, transaksi ditandai `failed` atau response error tidak membuat user tersesat.
- Jika Mayar rate limit 429, backend mengembalikan pesan retry yang jelas.

## Test Plan

Unit/integration test:

- Pricing dan discount tidak berubah.
- Normalisasi promo/affiliate tetap berjalan.
- Create checkout tanpa login mengembalikan 401.
- Create checkout tanpa API key masuk mode development.
- Create checkout dengan Mayar mock menyimpan `provider_payment_id` dan `provider_payment_url`.
- Webhook `payment.received` valid mengaktifkan subscription.
- Webhook duplicate tidak menggandakan side effects.
- Webhook amount mismatch ditolak.
- Webhook secret invalid ditolak.

Manual sandbox:

1. Buat API key Mayar sandbox.
2. Register/test webhook dari dashboard Mayar.
3. Checkout paket Belajar tanpa promo.
4. Checkout paket Pro dengan promo dan affiliate.
5. Bayar hingga event `payment.received` terkirim.
6. Cek `payment_transactions.status = paid`.
7. Cek `subscriptions` dan `profiles.tier`.
8. Cek admin portal dan halaman siswa transaksi.

## Rollout Plan

1. Tambah env Mayar dan route Mayar tanpa menghapus Midtrans.
2. Tambah kolom provider di database.
3. Uji create checkout Mayar dengan sandbox.
4. Uji webhook Mayar dan mapping payload.
5. Alihkan frontend ke route Mayar.
6. Monitor transaksi sandbox/production kecil.
7. Deprecate route dan env Midtrans setelah stabil.
8. Update README, launch checklist, dan flow transaksi.

## Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Webhook Mayar tidak punya signature publik | Endpoint bisa dipanggil pihak lain | Secret URL/header, verify status via Mayar API, amount matching, idempotency |
| Dokumentasi field redirect berbeda | Checkout gagal dibuat | Test sandbox dengan `redirectUrl`, fallback `redirectURL` jika perlu |
| `mobile` wajib tapi data user belum ada | Request Mayar gagal | Tambah input nomor HP di checkout atau fallback format placeholder untuk MVP |
| Rate limit 20 rpm/IP | Checkout gagal saat spike | Rate limit internal, retry handling, cache/check duplicate pending order |
| Payload webhook tidak membawa `extraData` | Sulit mapping order | Simpan `provider_payment_id` saat create, cocokkan via id/transactionId |
| Provider status berbeda dari internal enum | Salah mapping status | Mapping eksplisit dan raw payload audit |

## Open Questions

- Apakah akun Mayar yang akan dipakai sudah production verified?
- Apakah checkout harus memakai Invoice atau Single Payment Request?
- Apakah nomor HP wajib dikumpulkan dari user pada checkout?
- Apakah Mayar dashboard menyediakan secret/signature webhook yang tidak muncul di dokumentasi publik?
- Apakah produk digital membership di Mayar perlu dipakai pada fase berikutnya, atau cukup payment link hosted checkout?

## Rekomendasi Implementasi

Mulai dengan route baru `POST /api/payments/mayar-checkout`, webhook baru `POST /api/payments/mayar-webhook`, dan kolom provider tambahan. Pertahankan fungsi bisnis internal yang sudah ada, terutama kalkulasi harga, promo, affiliate, subscription, dan tier upgrade. Setelah sandbox Mayar membuktikan payload webhook dan status API, baru hapus referensi Midtrans dari UI, env, README, dan dokumen launch.
