# PRD — Fitur Upload Paket Tryout via Admin

**Status:** Implemented (v1)  
**Author:** Admin  
**Last updated:** 2026-06-01

---

## 1. Latar Belakang

Sebelumnya, menambah paket tryout baru mengharuskan developer untuk:
1. Membuat file TypeScript baru di `/lib/` dengan ratusan soal
2. Menambah entry di `lib/app-data.ts`
3. Build ulang dan deploy ke VPS

Proses ini membutuhkan akses kode dan pengetahuan teknis. Tujuan fitur ini adalah agar **admin non-teknis bisa menambah paket soal baru hanya dengan mengisi spreadsheet dan upload CSV** — tanpa menyentuh kode sama sekali.

---

## 2. User Story

> Sebagai admin konten, saya ingin bisa menambah paket tryout baru cukup dengan mengisi template Excel dan upload file CSV di panel admin, agar platform punya soal baru tanpa menunggu developer.

---

## 3. Flow Lengkap

```
Admin buka tab "Manajemen Paket" di /admin
  ↓
Download template CSV (classical atau IRT)
  ↓
Buka di Excel / Google Sheets → isi soal, opsi, kunci, pembahasan
  ↓
Save as CSV (UTF-8 with BOM)
  ↓
Kembali ke admin → isi metadata paket (slug, judul, durasi, akses, tipe scoring)
  ↓
Upload CSV → sistem parsing otomatis → preview 5 soal pertama
  ↓
Klik "Simpan paket ke database"
  ↓
Soal tersimpan di tabel `question_bank_uploads` (Supabase)
  ↓
Siswa buka halaman tryout → paket baru langsung tersedia (/siswa/tryout/[slug])
```

---

## 4. Format Template CSV

### Kolom (urutan wajib):
| Kolom | Tipe | Keterangan |
|---|---|---|
| nomor | integer | Nomor urut soal (1, 2, 3, …) |
| bagian | string | Nama sub-tes (mis. "Penalaran Umum") |
| tingkat | enum | MUDAH / SEDANG / HOTS |
| pertanyaan | string | Teks soal lengkap (bisa panjang, bungkus dengan tanda kutip) |
| opsi_a | string | Pilihan A |
| opsi_b | string | Pilihan B |
| opsi_c | string | Pilihan C |
| opsi_d | string | Pilihan D |
| opsi_e | string | Pilihan E |
| kunci | enum | A / B / C / D / E |
| pembahasan | string | Penjelasan jawaban |

### Aturan format:
- **Enkoding:** UTF-8 with BOM (untuk kompatibilitas Excel Indonesia)
- **Separator:** koma (`,`)
- **Teks panjang:** bungkus dengan `"tanda kutip"`, koma di dalam teks aman
- **Baris pertama:** header (tidak dibaca sebagai soal)
- **Baris kosong:** dilewati otomatis

### Contoh baris soal:
```
1,Penalaran Umum,HOTS,"Bacaan berikut menampilkan data inflasi tahunan...","Inflasi menurun","Inflasi stabil","Inflasi meningkat","Tidak dapat ditentukan","Inflasi berfluktuasi",C,"Berdasarkan data pada paragraf 3, inflasi menunjukkan tren meningkat."
```

---

## 5. Metadata Paket

Saat upload, admin mengisi:

| Field | Contoh | Keterangan |
|---|---|---|
| Slug | `paket-3` | URL identifier, unik, huruf kecil + tanda hubung |
| Judul | `Paket UM Mandiri PTN - Set 3` | Tampil di halaman tryout |
| Subtitle | `120 soal HOTS pola 2026` | Deskripsi singkat |
| Durasi | `120` | Menit |
| Akses | `Pro` atau `Gratis` | Tier akses |
| Tipe Scoring | `Classical` atau `IRT` | Metode penilaian |

---

## 6. Tabel Database

### `question_bank_uploads`
```sql
CREATE TABLE question_bank_uploads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paket_id       TEXT NOT NULL UNIQUE,   -- slug paket
  paket_title    TEXT NOT NULL,
  paket_subtitle TEXT,
  soal_count     INTEGER,
  durasi_menit   INTEGER DEFAULT 120,
  akses          TEXT DEFAULT 'belajar_pro',
  scoring_type   TEXT DEFAULT 'classical',
  questions      JSONB NOT NULL,          -- array TryoutQuestion
  uploaded_by    TEXT,                   -- email admin
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

> **Jalankan query ini di Supabase SQL Editor** sebelum fitur upload bisa menyimpan ke DB.

---

## 7. Lookup Priority di Questions API

`GET /api/tryout/questions/[paketId]`:

1. **Cek `question_bank_uploads`** — jika `paket_id` ditemukan di DB, gunakan soal dari sana
2. **Fallback static** — jika tidak ada di DB, gunakan soal dari file TypeScript bawaan

Ini berarti paket baru yang diupload langsung aktif tanpa deploy ulang, dan paket lama tetap berjalan normal.

---

## 8. Akses Paket Baru oleh Siswa

Paket yang diupload via DB **belum otomatis muncul di halaman `/siswa/tryout`** karena list paket masih dibaca dari `lib/app-data.ts` (static). Untuk paket muncul di listing:

### Opsi A (rekomendasi jangka pendek):
Tambah entry manual di `lib/app-data.ts` → build + deploy. Upload CSV hanya untuk soalnya.

### Opsi B (roadmap v2):
Fetch list paket dari DB + static → tampilkan di halaman tryout secara dinamis. Butuh perubahan pada `app/siswa/tryout/page.tsx`.

---

## 9. Scoring

- **Classical:** Benar +4, Kosong 0, Salah -1 — digunakan untuk paket UM Mandiri PTN
- **IRT 3-PL:** Penilaian per sub-tes, skala 0–1000, tanpa penalti — digunakan untuk UM PTKIN

Tipe scoring ditentukan saat upload dan disimpan di metadata. Engine tryout (`lib/tryout-scoring.ts`) sudah mendukung keduanya.

---

## 10. Batasan v1

- Gambar dalam soal **belum didukung** — pertanyaan harus berbasis teks
- Paket baru **belum otomatis muncul di listing** (perlu Opsi B di atas)
- Tidak ada validasi duplikasi nomor soal dalam satu paket
- Tidak ada rollback — upload ulang dengan slug sama akan **overwrite** paket lama

---

## 11. Roadmap v2

- [ ] Fetch listing paket dari DB secara dinamis
- [ ] Preview soal lengkap (semua opsi) sebelum simpan
- [ ] Support gambar/LaTeX dalam soal
- [ ] Version history per paket
- [ ] Soft delete / archive paket
