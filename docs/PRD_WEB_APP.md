# PRD â€” White-Label UM Platform Web App (Produksi)

**Versi:** 1.0 Â· **Mei 2026** Â· **Owner:** Produk + Engineering  
**Repo app:** `White-Label UM Platform/` (Next.js 16, React 19, Tailwind 4)

---

## 1. Ringkasan eksekutif

**White-Label UM Platform** adalah platform **B2C** persiapan **ujian mandiri PTN**: latihan & **simulasi ber-timer**, **bank soal** (AI terkurasi + paket kurasi dari dokumen **SOAL UM**), **AI tutor**, **informasi & deadline PTN**, serta **langganan** via Midtrans. Web app ini adalah **MVP front-end + alur produk** yang siap dihubungkan ke **Supabase**, pembayaran, dan pipeline konten.

**Value proposition (marketing):** vertikal UM (bukan SNBT umum), harga pelajar yang dapat dikonfigurasi per brand, pengingat deadline, dan pengalaman try out yang meniru pola SIMAK / ITB / UGM / UNPAD dll.

---

## 2. Sasaran bisnis & metrik

| Metrik | Target arah (dari dokumen strategi) |
|--------|-------------------------------------|
| Konversi free â†’ berbayar | 8â€“12% |
| North star proxy | WAU, soal/user/minggu |
| Pilot geografis | Bandung-first â†’ ekspansi kota besar |
| Monetisasi | Midtrans subscription + addon B2B bimbel (fase lanjut) |

---

## 3. Persona

1. **Siswa UM PTN** â€” butuh try out, pembahasan, reminder jadwal.  
2. **Orang tua** â€” butuh bukti progres (tier Pro).  
3. **Admin / kurator** â€” kurasi soal AI, kelola paket UM, PTN, billing, broadcast.

---

## 4. Ruang lingkup rilis (web app codebase)

### 4.1 Sudah ada di codebase (demo siap jalan)

- **Landing** pemasaran (`/`) â€” messaging, CTA, diferensiasi vs incumbent.  
- **Harga** (`/harga`) â€” tier Free / Belajar / Pro.  
- **Auth UI** (`/masuk`, `/daftar`) â€” placeholder; integrasi **Supabase Auth**.  
- **Area siswa** (`/siswa`, `/siswa/tryout`, `/siswa/tryout/[paketId]`) â€” alur pilih paket â†’ simulasi â†’ skor + pembahasan (subset soal demo).  
- **Admin portal** (`/admin`) â€” dashboard, user, bank soal AI, PTN, billing, broadcast (mock).

### 4.2 Backlog integrasi produksi (wajib sebelum go-live)

- Supabase: **users**, **soal**, **exam_sessions**, **subscriptions**, **ptn**, **ptn_deadlines**, **notifications**, **tutor_messages** (sesuai `Docs/White-Label UM Platform_sql_schema.html`).  
- **Midtrans** webhook â†’ update tier & masa aktif.  
- **Groq** (AI tutor) + rate limit **Upstash Redis**.  
- Impor **SOAL UM** DOCX â†’ parser â†’ staging â†’ QA nomor & pembahasan.  
- **Admin proteksi** (role admin + secret route / middleware).

---

## 5. Kebutuhan fungsional utama

### 5.1 Siswa

- Browse paket try out; gate tier untuk paket berbayar.  
- Simulasi: navigasi nomor, jawaban, submit, **skoring +4 / 0 / âˆ’1** (konfigurasi per paket).  
- Pembahasan per nomor setelah submit.  
- (Produksi) Riwayat sesi & analitik mapel.

### 5.2 Admin

- Kurasi soal AI (approve/reject), kelola PTN & deadline.  
- Pantau transaksi Midtrans; export CSV.  
- Broadcast notifikasi tersegmentasi.

### 5.3 Marketing / Growth

- SEO halaman per PTN (â€œujian mandiri [nama PTN]â€).  
- Konten TikTok/IG mengarah ke trial.gratis.  
- Referral â€œajak 3 temanâ€ (fase growth).

---

## 6. Arsitektur teknis (target)

| Layer | Stack |
|--------|--------|
| Frontend | Next.js App Router, TypeScript, Tailwind 4 |
| UI | lucide-react; opsional shadcn/ui pada iterasi berikutnya |
| Backend | Route Handlers + Supabase (Postgres + Auth + RLS) |
| AI | Groq (tutor), Claude/GPT (generator + kurasi) |
| Payment | Midtrans Snap |
| Observabilitas | Sentry, PostHog (sesuai dokumen biaya) |

---

## 7. Konten **SOAL UM**

- Sumber: folder `SOAL UM/PAKET n/` â€” pasangan **soal + pembahasan** DOCX.  
- PAKET 1â€“2 berisi file; **PAKET 3â€“5** placeholder hingga konten siap.  
- PRD teknis impor: validasi **jumlah butir** & mapping pembahasan; normalisasi tingkat **MUDAH / SEDANG / HOTS**.

---

## 8. Risiko & mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Inkonsistensi dokumen internal (limit free, harga) | **Single freeze sheet** sebelum deploy |
| Salah kunci / salah mapping pembahasan | Automated QA + sampling manual |
| Biaya API tutor | Rate limit per tier, caching jawaban umum |
| Musiman UM | Konten SNBT off-season |

---

## 9. Kriteria selesai MVP produksi

- Auth nyata + RLS aktif.  
- Minimal satu alur pembayaran sandboxâ†’production teruji.  
- Satu paket UM penuh terpublish dari pipeline konten (bukan hanya 3 soal demo).  
- Admin tidak boleh diakses publik tanpa autentikasi.

---

## 10. Referensi dokumen internal

- `Docs/White-Label UM Platform_prd_v2.html`, `prd_ujian_mandiri_app.html`  
- `Docs/White-Label UM Platform_implementation_plan.html`, `White-Label UM Platform_building_plan.html`  
- `Docs/White-Label UM Platform_sql_schema.html`, `White-Label UM Platform_erd.html`  
- `Docs/techstack_biaya_White-Label UM Platform.html`

---

*Dokumen ini menjadi satu sumber kebenaran produk untuk repo web app `White-Label UM Platform/` dan dapat direvisi bersama freeze sheet bisnis.*


