# Owner Public Launch Gates

Dokumen ini adalah gerbang terakhir sebelum Pastilulus dibuka untuk publik berbayar. Targetnya bukan "kelihatan jalan", tetapi aman untuk menerima user umum, pembayaran, dan data belajar.

## Gate 1: Secrets dan Security

- [ ] Rotate Supabase service role key karena key lama pernah terkirim di chat.
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` di local, hosting, dan secret manager.
- [ ] Pastikan service role hanya dipakai di server route/server action.
- [ ] Pastikan `.env.local` tidak masuk git.
- [ ] Pastikan admin hanya email owner/team dengan `profiles.role = 'admin'` atau `super_admin`.

## Gate 2: Payment Sandbox

- [ ] Isi kredensial Midtrans sandbox.
- [ ] Buat transaksi paket Belajar tanpa promo.
- [ ] Buat transaksi paket Pro dengan promo valid.
- [ ] Buat transaksi dengan affiliate valid.
- [ ] Simulasikan paid webhook.
- [ ] Pastikan `payment_transactions.status = paid`.
- [ ] Pastikan `subscriptions.status = active`.
- [ ] Pastikan `profiles.tier` naik ke paket yang dibeli.
- [ ] Pastikan `promo_codes.used_count` naik.
- [ ] Pastikan `affiliate_partners.conversion_count` dan `revenue_amount` naik.

## Gate 3: Student Flow

- [ ] Daftar akun baru.
- [ ] Login.
- [ ] Buka dashboard siswa.
- [ ] Checkout paket.
- [ ] Lihat transaksi pending di dashboard.
- [ ] Lihat transaksi di `/siswa/transaksi`.
- [ ] Kerjakan tryout gratis.
- [ ] Submit tryout.
- [ ] Pastikan `exam_sessions` dan `exam_answers` terisi.
- [ ] Pastikan rasionalisasi menampilkan hasil terbaru.

## Gate 4: Admin Flow

- [ ] Login admin.
- [ ] Buka Transaksi & Billing.
- [ ] Buka Promo & Affiliate.
- [ ] Buat kode promo draft.
- [ ] Buat affiliate partner draft.
- [ ] Edit landing hero dari Konten Website.
- [ ] Pastikan landing publik berubah.
- [ ] Buat draft blog.
- [ ] Publish blog dari Supabase/admin workflow.
- [ ] Review soal: approve/reject.

## Gate 5: Public Content dan Legal

- [ ] Landing page jelas untuk user baru.
- [ ] Harga dan benefit paket tidak ambigu.
- [ ] Syarat Layanan tersedia.
- [ ] Kebijakan Privasi tersedia.
- [ ] Kebijakan Pembayaran dan Refund tersedia.
- [ ] Kontak support aktif dan dipantau.

## Gate 6: Operational Safety

- [ ] Backup Supabase aktif.
- [ ] Monitoring error hosting aktif.
- [ ] Log webhook payment dipantau.
- [ ] SOP refund/manual activation dibuat.
- [ ] Akun admin cadangan tersedia.

## Launch Decision

Soft launch boleh dilakukan jika Gate 1-3 sudah hijau.

Public paid launch sebaiknya hanya dilakukan jika Gate 1-6 hijau.

