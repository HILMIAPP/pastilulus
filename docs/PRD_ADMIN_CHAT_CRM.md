# PRD Admin Chat Bot & CRM Inbox

## Ringkasan

Fitur ini menambahkan bubble chat di website publik Nukaedu/Pastilulus untuk membantu calon siswa bertanya soal paket, pembayaran, tryout, dan info Ujian Mandiri. Versi awal menampilkan bot-style quick reply dan eskalasi ke WhatsApp. Versi production berikutnya menyimpan percakapan ke database dan menyediakan dashboard CRM agar admin manusia bisa membalas dari satu inbox.

## Tujuan Produk

1. Meningkatkan konversi dari pengunjung landing/blog/harga menjadi daftar atau beli paket.
2. Mengurangi kebingungan user terkait pembayaran, aktivasi paket, dan alur tryout.
3. Menyediakan inbox admin agar chat tidak tercecer di WhatsApp pribadi.
4. Membuat histori percakapan terhubung dengan profil user dan transaksi.

## Scope MVP

- Bubble chat fixed di kanan bawah halaman publik.
- Sapaan bot otomatis.
- Quick replies:
  - Tanya paket belajar.
  - Pembayaran belum aktif.
  - Info Ujian Mandiri PTN.
- CTA ke WhatsApp group/admin.
- CTA beli paket.
- Copy menjelaskan bahwa mode CRM akan menyimpan dan meneruskan chat ke admin.

## Scope Production CRM

### Widget Publik

- User bisa mengetik pesan dari website.
- Jika user login, chat otomatis terhubung ke `profiles.id`.
- Jika belum login, user diminta mengisi nama dan nomor WA/email.
- Bot memberi jawaban awal dari FAQ.
- User bisa minta “hubungkan ke admin”.
- Status percakapan: `bot`, `waiting_admin`, `assigned`, `closed`.

### Dashboard CRM Admin

- Tab admin baru: `CRM Chat`.
- Inbox percakapan masuk.
- Filter:
  - Semua.
  - Belum dibalas.
  - Assigned ke saya.
  - Pembayaran.
  - Paket.
  - Tryout.
- Detail user:
  - Nama.
  - Email.
  - Paket aktif.
  - Riwayat transaksi.
  - Halaman terakhir yang dikunjungi.
- Admin bisa:
  - Membalas pesan.
  - Assign ke admin lain.
  - Ubah status.
  - Tambah internal note.
  - Kirim template jawaban.
  - Buka transaksi terkait.

## Data Model Usulan

### `crm_conversations`

- `id uuid primary key`
- `user_id uuid null references profiles(id)`
- `visitor_name text`
- `visitor_email text`
- `visitor_phone text`
- `source_page text`
- `topic text`
- `status text check in ('bot','waiting_admin','assigned','closed')`
- `assigned_admin_id uuid null`
- `last_message_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

### `crm_messages`

- `id uuid primary key`
- `conversation_id uuid references crm_conversations(id)`
- `sender_type text check in ('visitor','bot','admin')`
- `sender_id uuid null`
- `body text`
- `metadata jsonb`
- `created_at timestamptz`

### `crm_internal_notes`

- `id uuid primary key`
- `conversation_id uuid references crm_conversations(id)`
- `admin_id uuid`
- `body text`
- `created_at timestamptz`

### `crm_templates`

- `id uuid primary key`
- `title text`
- `topic text`
- `body text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

## Bot Rules MVP

- Jika pesan mengandung “bayar”, “transfer”, “paket belum aktif”, bot meminta:
  - Email akun.
  - Order ID.
  - Screenshot bukti bayar.
- Jika pesan mengandung “harga”, “paket”, bot mengarahkan ke `/harga`.
- Jika pesan mengandung “tryout”, bot mengarahkan ke `/siswa/tryout`.
- Jika user mengetik “admin”, status menjadi `waiting_admin`.

## SLA Admin

- Jam aktif awal: 09.00-21.00 WIB.
- Target respons pembayaran: maksimal 30 menit.
- Target respons pertanyaan umum: maksimal 2 jam.
- Percakapan pembayaran paid-but-not-active diprioritaskan.

## Security & Privacy

- Jangan minta password, OTP, atau data kartu penuh.
- Pesan disimpan dengan RLS.
- Admin hanya bisa melihat percakapan jika role `admin` atau `super_admin`.
- Internal note tidak tampil ke user.
- Audit log untuk assignment, close, dan perubahan status.

## Metrics

- Chat opened rate.
- First response time.
- Resolution time.
- Conversion to signup.
- Conversion to paid.
- Top topics.
- Payment issue resolution rate.

## Roadmap

### Phase 1

- Bubble chat bot-style + CTA WhatsApp.
- PRD dan data model.

### Phase 2

- Simpan percakapan ke Supabase.
- Admin CRM inbox read/reply.
- Template jawaban.

### Phase 3

- Assignment admin.
- Notifikasi admin.
- Link conversation ke transaksi dan user detail.

### Phase 4

- Bot FAQ semi-otomatis.
- Analytics CRM.
- Export percakapan dan SLA report.
