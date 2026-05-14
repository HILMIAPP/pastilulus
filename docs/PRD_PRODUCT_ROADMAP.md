# PRD Produk & Roadmap Produksi - White-Label UM Platform

**Versi:** 1.1  
**Tanggal:** 12 Mei 2026  
**Status:** Draft rekomendasi produksi  
**Owner:** Product, Engineering, Content, Growth  

## 1. Ringkasan

White-Label UM Platform adalah platform persiapan ujian mandiri PTN untuk siswa SMA/gap year yang membutuhkan try out realistis, pembahasan, reminder deadline, dan rekomendasi belajar berbasis progres.

Codebase saat ini sudah cukup kuat untuk demo produk: landing page, pricing, dashboard siswa mock, simulasi try out sederhana, dan admin portal mock. Namun, aplikasi belum siap produksi karena data masih hardcoded, autentikasi belum aktif, akses admin belum diproteksi, pembayaran belum terhubung, sesi ujian belum tersimpan, dan pipeline konten soal belum ada.

Target PRD ini adalah mengubah proyek dari demo UI menjadi MVP berbayar yang bisa digunakan oleh siswa nyata.

## 2. Masalah Yang Ingin Diselesaikan

Siswa yang mengejar jalur mandiri PTN punya beberapa masalah utama:

- Informasi ujian mandiri tersebar, deadline mudah terlewat.
- Latihan online banyak yang terlalu umum dan tidak spesifik ke pola UM.
- Pembahasan sering tidak cukup membantu saat siswa stuck.
- Siswa sulit tahu kelemahan per mapel/topik.
- Orang tua sulit melihat bukti progres belajar.

White-Label UM Platform harus menjadi produk yang fokus: bukan sekadar bank soal, tetapi sistem latihan dan monitoring khusus jalur mandiri PTN.

## 3. Gap Saat Ini

### 3.1 Produk

- Belum ada onboarding untuk memilih target PTN, jurusan, jalur, dan rumpun saintek/soshum.
- Belum ada riwayat try out siswa.
- Belum ada analitik kelemahan per mapel/topik.
- Belum ada reminder deadline nyata.
- Belum ada AI tutor di halaman pembahasan.
- Belum ada laporan orang tua untuk paket Pro.
- Paket berbayar hanya UI, belum benar-benar mengunci akses.

### 3.2 Teknis

- Data masih berasal dari `lib/mock-data.ts`.
- Auth `/masuk` dan `/daftar` masih placeholder.
- Route `/admin` belum dilindungi role admin.
- Sesi ujian tidak tersimpan ke database.
- Timer belum berjalan dan belum tahan refresh/tab close.
- Tidak ada backend route handler untuk payment, exam, user profile, atau content.
- Belum ada schema database, RLS policy, migration, seed, dan environment validation di repo.
- Belum ada observability: error tracking, audit log, product analytics.

### 3.3 Operasional

- Belum ada workflow kurasi soal dari DOCX ke database.
- Belum ada QA otomatis untuk kunci jawaban, pembahasan, jumlah soal, dan duplikasi.
- Belum ada dashboard konten untuk publish/unpublish paket.
- Belum ada SOP refund, komplain pembayaran, dan koreksi soal.

## 4. Tujuan MVP Produksi

MVP produksi dianggap layak rilis jika pengguna bisa:

1. Membuat akun dan login.
2. Memilih target PTN dan paket belajar.
3. Mengerjakan minimal 1 paket try out penuh.
4. Mendapat skor, pembahasan, dan riwayat pengerjaan.
5. Upgrade paket via Midtrans.
6. Mengakses fitur sesuai tier.
7. Menerima reminder deadline PTN.

Admin harus bisa:

1. Mengelola user dan subscription.
2. Mengelola bank soal dan paket try out.
3. Review soal sebelum publish.
4. Mengelola PTN dan deadline.
5. Melihat transaksi pembayaran.
6. Mengirim broadcast notifikasi.

## 5. Non-Goals MVP

Hal berikut tidak perlu masuk MVP pertama:

- Marketplace tutor manusia.
- Mobile app native.
- Live class.
- Sistem bimbel B2B lengkap.
- Adaptive learning berbasis ML kompleks.
- Gamification berat seperti leaderboard nasional real-time.

Fokus MVP harus tajam: auth, try out, payment, pembahasan, progress, dan deadline.

## 6. Persona

### 6.1 Siswa Free

Ingin mencoba kualitas soal sebelum membayar. Butuh akses terbatas ke try out demo, info PTN dasar, dan reminder minimal.

### 6.2 Siswa Belajar

Butuh latihan intensif dan pembahasan. Cocok untuk langganan harga paket Belajar sesuai konfigurasi dengan akses try out penuh, riwayat, dan AI tutor terbatas.

### 6.3 Siswa Pro

Butuh analitik lebih dalam, laporan orang tua, dan prioritas support. Cocok untuk harga paket Pro sesuai konfigurasi.

### 6.4 Admin/Kurator

Bertanggung jawab menjaga kualitas soal, paket try out, deadline PTN, dan validitas pembahasan.

### 6.5 Orang Tua

Butuh laporan ringkas: anak sudah belajar berapa kali, skor naik/turun, mapel lemah, dan rekomendasi fokus minggu ini.

## 7. Rekomendasi Arsitektur

### 7.1 Stack

| Layer | Rekomendasi | Alasan |
|---|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 | Sudah digunakan di repo, cocok untuk landing, dashboard, dan server-rendered pages. |
| Backend | Next.js Route Handlers + Server Actions selektif | Menekan biaya dan kompleksitas untuk MVP. Tidak perlu VPS custom di fase awal. |
| Database | Supabase Postgres | Cocok untuk relational data: users, soal, paket, sesi ujian, transaksi, deadline. Ada Auth dan RLS. |
| Auth | Supabase Auth | Cepat untuk email/password, magic link, OAuth opsional. |
| Payment | Midtrans Snap + webhook | Lokal Indonesia, QRIS/VA/e-wallet, cocok untuk harga pelajar. |
| Cache/Rate Limit | Upstash Redis | Rate limit AI tutor, payment webhook idempotency, attempt lock. |
| AI | Groq untuk tutor cepat, provider lain untuk generator konten internal | Tutor perlu respons cepat dan murah. Generator soal harus tetap melewati review manusia. |
| Storage | Supabase Storage | Simpan DOCX sumber, asset pembahasan, dan bukti impor. |
| Observability | Sentry + PostHog | Error tracking dan funnel analytics. |

Catatan kritis: jangan mulai dengan VPS custom kecuali ada kebutuhan background worker berat. Untuk MVP, serverless lebih murah, lebih cepat dirilis, dan lebih mudah dioperasikan.

### 7.2 Modul Utama

- `Auth Module`: login, register, role, session.
- `Profile Module`: target PTN, rumpun, kelas/gap year, nomor WhatsApp opsional.
- `Exam Module`: paket, soal, sesi, jawaban, timer, scoring.
- `Content Module`: bank soal, import DOCX, review, publish.
- `Payment Module`: order, Midtrans token, webhook, subscription state.
- `Notification Module`: reminder deadline, broadcast, email/WhatsApp integration fase lanjut.
- `Tutor Module`: AI tutor per soal/pembahasan dengan rate limit.
- `Admin Module`: dashboard operasional.

## 8. Model Data Minimum

Tabel minimum untuk MVP:

- `profiles`: data user, role, tier aktif.
- `subscriptions`: status paket, periode aktif, Midtrans order id.
- `ptns`: data kampus.
- `ptn_deadlines`: jalur, tanggal buka/tutup, link resmi.
- `tryout_packages`: paket ujian.
- `questions`: soal, opsi, kunci terenkripsi/terbatas akses admin.
- `question_explanations`: pembahasan dan metadata.
- `exam_sessions`: sesi pengerjaan user.
- `exam_answers`: jawaban per soal.
- `tutor_messages`: histori AI tutor.
- `notifications`: reminder dan broadcast.
- `audit_logs`: aktivitas admin penting.

Index penting:

- `profiles(user_id)`
- `subscriptions(user_id, status, current_period_end)`
- `ptn_deadlines(ptn_id, close_at)`
- `questions(package_id, subject, difficulty, status)`
- `exam_sessions(user_id, package_id, submitted_at)`
- `exam_answers(session_id, question_id)`
- `notifications(user_id, scheduled_at, status)`

## 9. Functional Requirements

### 9.1 Auth & User Profile

**Requirement:**

- User bisa daftar/login/logout.
- User wajib punya profile setelah register.
- User memilih target PTN, jurusan, rumpun, dan jadwal ujian.
- Role minimal: `student`, `admin`, `super_admin`.

**Acceptance Criteria:**

- User belum login tidak bisa membuka `/siswa`.
- Admin route hanya bisa dibuka role admin/super_admin.
- Profile incomplete diarahkan ke onboarding.

### 9.2 Try Out

**Requirement:**

- User melihat daftar paket sesuai tier.
- User bisa mulai sesi try out.
- Timer berjalan dan sesi tersimpan.
- Jawaban tersimpan berkala.
- Submit mengunci sesi.
- Hasil menampilkan skor, benar/salah/kosong, dan pembahasan.

**Acceptance Criteria:**

- Refresh halaman tidak menghapus jawaban.
- User tidak bisa submit dua kali untuk session yang sama.
- Paket berbayar tidak bisa dibuka user Free.
- Scoring menggunakan konfigurasi per paket, bukan hardcoded.

### 9.3 Analitik Siswa

**Requirement:**

- Dashboard menampilkan total try out, rata-rata skor, tren skor, mapel lemah, dan aktivitas minggu ini.

**Acceptance Criteria:**

- Data berasal dari `exam_sessions` dan `exam_answers`.
- Mapel lemah dihitung dari akurasi terendah minimal 5 soal terjawab.
- Empty state jelas untuk user baru.

### 9.4 Payment & Subscription

**Requirement:**

- User bisa memilih paket Belajar/Pro.
- Sistem membuat order Midtrans.
- Webhook Midtrans mengubah status subscription.
- Akses fitur mengikuti subscription aktif.

**Acceptance Criteria:**

- Webhook validasi signature.
- Order id idempotent.
- Payment pending tidak langsung membuka akses penuh.
- Subscription expired otomatis menurunkan tier.

### 9.5 Admin Content Management

**Requirement:**

- Admin bisa CRUD PTN, deadline, paket, dan soal.
- Soal punya status `draft`, `review`, `published`, `rejected`, `archived`.
- Publish hanya bisa dilakukan jika soal punya opsi lengkap, kunci, pembahasan, mapel, difficulty, dan sumber.

**Acceptance Criteria:**

- Semua perubahan penting masuk `audit_logs`.
- Admin biasa tidak bisa menghapus permanen data penting.
- Delete menggunakan soft delete/archive.

### 9.6 Import Konten DOCX

**Requirement:**

- Admin upload DOCX soal dan pembahasan.
- Sistem parsing ke staging.
- Kurator memvalidasi hasil parsing sebelum publish.

**Acceptance Criteria:**

- Sistem mendeteksi jumlah soal tidak sesuai.
- Sistem menandai soal tanpa kunci/pembahasan.
- Duplikasi soal dicegah dengan similarity/hash check.

### 9.7 AI Tutor

**Requirement:**

- User bisa bertanya pada AI tutor dari halaman pembahasan.
- Konteks tutor dibatasi pada soal, opsi, jawaban user, dan pembahasan resmi.
- Rate limit berbeda per tier.

**Acceptance Criteria:**

- Free: sangat terbatas.
- Belajar: kuota harian sedang.
- Pro: kuota lebih besar.
- Prompt tidak boleh membocorkan kunci sebelum sesi submit.

### 9.8 Notification & Reminder

**Requirement:**

- User mendapat reminder deadline berdasarkan target PTN.
- Admin bisa broadcast ke segmen user.

**Acceptance Criteria:**

- Reminder dikirim H-30, H-7, H-1.
- User bisa opt-out dari kanal tertentu.
- Broadcast punya preview dan confirmation sebelum send.

## 10. Security Requirements

### 10.1 SQL Injection

Gunakan Supabase client/query builder atau parameterized SQL. Jangan pernah menyusun query dari string input user.

### 10.2 XSS

- Jangan render HTML mentah dari soal/pembahasan tanpa sanitasi.
- Jika perlu rich text, gunakan whitelist sanitizer.
- Semua konten AI atau DOCX harus dianggap untrusted sampai lolos sanitasi.

### 10.3 CSRF

- Untuk route mutation yang memakai cookie session, validasi origin dan gunakan CSRF token bila diperlukan.
- Webhook Midtrans tidak memakai CSRF, tetapi wajib validasi signature.

### 10.4 Authorization

- Terapkan RLS Supabase.
- User hanya boleh membaca sesi dan jawaban miliknya.
- Admin route wajib cek role di server, bukan hanya sembunyi menu di client.
- Kunci jawaban jangan dikirim ke client sebelum submit.

### 10.5 Payment Security

- Validasi Midtrans signature key.
- Terapkan idempotency untuk webhook.
- Jangan percaya status pembayaran dari client.
- Simpan audit trail semua perubahan subscription.

### 10.6 AI Safety

- Batasi prompt injection dari input user.
- Jangan kirim data pribadi yang tidak perlu ke provider AI.
- Rate limit per user dan per IP.
- Log hanya metadata seperlunya.

## 11. Performance Requirements

### 11.1 Database

- Gunakan pagination untuk daftar soal, user, transaksi, dan sesi.
- Tambahkan index sesuai query utama.
- Hindari mengambil semua soal sekaligus untuk paket besar jika ada media berat.
- Gunakan agregasi materialized view atau table summary untuk dashboard admin jika data membesar.

### 11.2 Client

- Pisahkan komponen interaktif hanya di bagian yang perlu `use client`.
- Halaman marketing dan pricing tetap server-rendered.
- Gunakan optimistic save untuk jawaban, tetapi server tetap sumber kebenaran.
- Hindari state global berat; untuk MVP cukup server data + local component state. Jika kompleks, gunakan Zustand atau TanStack Query.

### 11.3 Caching

- Cache daftar PTN dan deadline publik.
- Cache pricing/config paket.
- Jangan cache data personal tanpa kontrol user/session.
- Cache respons AI hanya untuk pertanyaan umum yang tidak mengandung data user.

## 12. Edge Cases & Mitigasi

1. **User refresh saat try out berjalan**  
   Mitigasi: jawaban disimpan berkala ke `exam_answers`, timer dihitung dari `started_at` server.

2. **Webhook Midtrans terkirim lebih dari sekali**  
   Mitigasi: idempotency berdasarkan `order_id` dan status transition yang valid.

3. **User Free mencoba akses paket berbayar lewat URL langsung**  
   Mitigasi: authorization server-side sebelum mengembalikan data paket/soal.

4. **Soal salah kunci setelah publish**  
   Mitigasi: admin bisa archive/revise, sesi lama tetap menyimpan versi soal yang dikerjakan, audit log wajib.

5. **AI tutor membocorkan jawaban saat ujian belum submit**  
   Mitigasi: tutor hanya aktif setelah submit atau hanya memberi hint tanpa kunci selama sesi berjalan.

6. **Deadline PTN berubah dari situs resmi**  
   Mitigasi: simpan sumber/link resmi, field `verified_at`, dan workflow review berkala admin.

7. **User membuka dua tab try out yang sama**  
   Mitigasi: satu active session per user-package, lock submit, dan conflict handling saat save jawaban.

## 13. Roadmap Prioritas

### Phase 0 - Stabilkan Demo

- Perbaiki teks encoding yang rusak.
- Rapikan typo pricing seperti "Produkksi".
- Tambahkan empty state dan loading state.
- Tambahkan basic lint/build gate.

### Phase 1 - MVP Foundation

- Supabase Auth.
- Middleware proteksi `/siswa` dan `/admin`.
- Database schema + RLS.
- Profile onboarding.
- Ganti mock data ke Supabase untuk paket dan soal.

### Phase 2 - Exam Production

- Exam session persistence.
- Timer server-based.
- Autosave jawaban.
- Submit locking.
- Scoring configurable.
- Riwayat try out dan analitik dasar.

### Phase 3 - Monetization

- Midtrans Snap checkout.
- Webhook subscription.
- Tier enforcement.
- Billing admin.
- Expired subscription job.

### Phase 4 - Content Pipeline

- Upload DOCX.
- Parser staging.
- Review soal.
- Publish package.
- QA kunci/pembahasan.

### Phase 5 - Engagement

- Reminder deadline.
- AI tutor.
- Broadcast notification.
- Laporan orang tua.
- Product analytics funnel.

## 14. KPI

### Product

- Activation rate: user daftar lalu mengerjakan minimal 5 soal.
- Try out completion rate.
- Retention D7.
- Jumlah soal dikerjakan per user per minggu.
- Free to paid conversion.

### Business

- MRR.
- Churn bulanan.
- ARPU.
- CAC dari channel konten.
- Refund/complaint rate.

### Quality

- Error rate payment.
- Jumlah soal dikoreksi setelah publish.
- Latency AI tutor.
- Waktu rata-rata admin review soal.

## 15. Open Questions

- Apakah paket Belajar memakai batas kuota AI harian atau bulanan?
- Apakah Free boleh melihat pembahasan penuh atau hanya skor?
- Apakah laporan orang tua dikirim via email, WhatsApp, atau dashboard?
- Apakah setiap kampus punya paket spesifik, atau paket awal tetap multi-kampus?
- Siapa yang menjadi final approver kualitas soal sebelum publish?

## 16. Rekomendasi Kritis

Prioritas pertama bukan menambah banyak halaman baru, tetapi membuat alur inti benar-benar hidup: auth, database, sesi ujian, scoring, dan payment. Tanpa itu, produk akan terlihat lengkap tetapi belum bisa menghasilkan revenue atau data belajar yang bisa dipercaya.

Untuk go-live awal, gunakan satu paket try out penuh yang sangat berkualitas. Lebih baik 1 paket kuat dengan pembahasan rapi dan scoring valid daripada 10 paket yang kualitasnya belum terjamin.



