# Publish Readiness Checklist

Status ini dipakai sebelum Pastilulus dibuka untuk pengguna umum berbayar.

## Payment

- [x] Checkout membuat `payment_transactions` sebelum redirect.
- [x] Promo dihitung server-side dari `promo_codes`.
- [x] Affiliate code divalidasi server-side dari `affiliate_partners`.
- [x] Webhook Midtrans mengubah transaksi menjadi `paid`, `expired`, atau `failed`.
- [x] Webhook paid mengaktifkan `subscriptions` dan menaikkan `profiles.tier`.
- [x] Webhook paid menaikkan `promo_codes.used_count`.
- [x] Webhook paid menaikkan `affiliate_partners.conversion_count` dan `revenue_amount`.
- [ ] Tes sandbox Midtrans end-to-end dengan QRIS/VA/e-wallet.
- [ ] Rotate service role key sebelum production karena pernah dikirim di chat.

## Content

- [x] Landing page membaca hero content dari `site_content` jika published.
- [x] Blog list membaca artikel dari `blog_posts` jika published.
- [x] Blog detail tersedia di `/blog/[slug]`.
- [ ] Admin content editor perlu save action produksi untuk edit/publish landing dan blog.

## Tryout

- [x] Submit tryout menyimpan ringkasan ke `exam_sessions`.
- [x] Submit tryout menulis audit log `tryout_submitted`.
- [ ] Jawaban per nomor perlu dipersist ke `exam_answers` setelah bank soal lokal dimigrasi ke tabel `questions`.
- [ ] Timer perlu bertahan refresh/tab close dengan `exam_sessions.expires_at`.

## Admin

- [x] Admin membaca data produksi dengan fallback lokal.
- [x] Billing, promo, affiliate, user detail, review soal, dan content CMS sudah punya alur UI.
- [ ] Semua aksi admin perlu menulis `audit_logs`.
- [ ] Dashboard admin butuh summary query/materialized view saat data membesar.

## Support and Safety

- [ ] Email verification dan resend verification flow.
- [ ] Support/contact flow untuk pembayaran gagal.
- [ ] Halaman loading/error yang konsisten untuk dashboard, checkout, admin, dan tryout.
- [ ] Monitoring webhook error dan payment mismatch.
- [ ] Backup/retention policy untuk exam dan billing data.

