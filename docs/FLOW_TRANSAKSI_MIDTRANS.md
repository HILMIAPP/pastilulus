# Alur Transaksi & Pembayaran Midtrans - lolosujian

Dokumen ini menjelaskan alur transaksi lengkap dari sisi pengguna mulai dari pemilihan paket, pengisian kupon/affiliate, integrasi Midtrans Snap Popup, hingga verifikasi otomatis oleh sistem.

---

## 📈 Diagram Alur Transaksi (Flowchart)

```mermaid
graph TD
    A[Siswa memilih Paket Belajar] --> B[Masuk Halaman Checkout]
    B --> C{Memiliki Kode Promo/Affiliate?}
    C -- Ya --> D[Masukkan Kode & Hitung Diskon]
    C -- Tidak --> E[Klik Lanjutkan Pembayaran]
    D --> E
    E --> F[API Request ke /api/payments/snap-token]
    F --> G[Dapatkan Snap Token dari Midtrans Server]
    G --> H[Tampilkan Snap Popup di Web lolosujian]
    H --> I{Siswa Memilih Metode Pembayaran & Bayar}
    I -- Sukses --> J[Midtrans kirim Webhook ke /api/payments/webhook]
    I -- Gagal/Expired --> K[Transaksi Expired/Failed]
    J --> L[Sistem memverifikasi signature & mengaktifkan paket siswa]
    L --> M[Siswa dialihkan ke halaman Sukses & Mulai Belajar]
```

---

## 📸 Langkah Demi Langkah & Detail Screenshot

### Langkah 1: Memilih Paket Belajar (Pricing Page)
Siswa mengunjungi halaman harga (`/harga`) untuk melihat dan memilih paket belajar yang tersedia.
* **Paket yang tersedia:** Gratis, Belajar (6 bulan), dan Belajar Full (Selamanya).
* **Tindakan:** Siswa menekan tombol **"Mulai Belajar"** pada paket **Belajar** (Early Bird).

![Langkah 1: Halaman Pemilihan Paket](file:///C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step1_harga_1779217650042.png)

---

### Langkah 2: Verifikasi Checkout & Pengisian Kode Promo/Affiliate
Siswa diarahkan ke halaman checkout (`/pembayaran?paket=belajar`). Di sini siswa harus:
1. Membaca dan mencentang **Syarat Layanan** serta **Kebijakan Refund**.
2. Memasukkan kode promo (misal: `LOLOSPTN26`) atau kode affiliate partner jika ada.
3. Menekan tombol **"Lanjutkan pembayaran"**.

![Langkah 2: Halaman Rincian Checkout](file:///C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step2_ringkasan_1779217666139.png)

---

### Langkah 3: Antarmuka Pembayaran Midtrans Snap
Setelah menekan tombol pembayaran, web akan memanggil API Route `/api/payments/snap-token` untuk mendapatkan token transaksi unik, kemudian membuka pop-up **Midtrans Snap**.
* **Pilihan Pembayaran:** Siswa dapat membayar secara instan melalui QRIS/GoPay, Virtual Account bank (BCA, Mandiri, BNI, BRI), atau Kartu Kredit.
* **Tindakan:** Siswa melakukan transfer pembayaran sesuai dengan petunjuk instan yang diberikan.

![Langkah 3: Overlay Pembayaran Midtrans Snap](file:///C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step3_midtrans_1779217683651.png)

---

### Langkah 4: Pembayaran Berhasil & Aktivasi Paket
Begitu transfer berhasil diselesaikan, Midtrans mengirimkan notifikasi instan (Webhook) ke backend aplikasi. Backend akan secara otomatis memverifikasi keabsahan data dan mengaktifkan paket belajar siswa.
* **Tampilan Akhir:** Siswa dialihkan ke halaman sukses (`/pembayaran/status?status=success`) dan dapat langsung menekan tombol **"Mulai Belajar Sekarang"** untuk membuka semua tryout premium.

![Langkah 4: Konfirmasi Pembayaran Sukses](file:///C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step4_sukses_1779217701500.png)
