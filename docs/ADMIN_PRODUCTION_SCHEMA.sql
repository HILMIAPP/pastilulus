-- Pastilulus admin production modules
-- Run after docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql.
-- Requires existing public.is_admin() function from the base schema.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.payment_status as enum ('pending', 'paid', 'expired', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text,
  customer_email text,
  plan text not null,
  amount integer not null check (amount >= 0),
  payment_method text,
  payment_provider text not null default 'mayar',
  status public.payment_status not null default 'pending',
  promo_code text,
  affiliate_code text,
  midtrans_transaction_id text,
  provider_payment_id text,
  provider_transaction_id text,
  provider_payment_url text,
  raw_payload jsonb not null default '{}',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('nominal', 'percent')),
  discount_value integer not null check (discount_value >= 0),
  usage_limit integer not null default 0,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  commission_rate integer not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  click_count integer not null default 0,
  conversion_count integer not null default 0,
  revenue_amount integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  owner text,
  content jsonb not null default '{}',
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  excerpt text,
  body text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_transactions_status_created on public.payment_transactions(status, created_at desc);
create index if not exists idx_payment_transactions_user on public.payment_transactions(user_id, created_at desc);
create index if not exists idx_payment_transactions_provider_payment on public.payment_transactions(payment_provider, provider_payment_id);
create index if not exists idx_promo_codes_code_status on public.promo_codes(code, status);
create index if not exists idx_affiliate_partners_code_status on public.affiliate_partners(code, status);
create index if not exists idx_blog_posts_status_updated on public.blog_posts(status, updated_at desc);

alter table public.payment_transactions enable row level security;
alter table public.promo_codes enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.site_content enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "admin manage payment transactions" on public.payment_transactions;
create policy "admin manage payment transactions"
on public.payment_transactions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "read own payment transactions" on public.payment_transactions;
create policy "read own payment transactions"
on public.payment_transactions for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage promo codes" on public.promo_codes;
create policy "admin manage promo codes"
on public.promo_codes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage affiliate partners" on public.affiliate_partners;
create policy "admin manage affiliate partners"
on public.affiliate_partners for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manage site content" on public.site_content;
create policy "admin manage site content"
on public.site_content for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published site content" on public.site_content;
create policy "public read published site content"
on public.site_content for select
using (status = 'published' or public.is_admin());

drop policy if exists "admin manage blog posts" on public.blog_posts;
create policy "admin manage blog posts"
on public.blog_posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published blog posts" on public.blog_posts;
create policy "public read published blog posts"
on public.blog_posts for select
using (status = 'published' or public.is_admin());

insert into public.site_content (section_key, title, owner, content, status)
values
  ('hero', 'Hero landing', 'Marketing', '{"badge":"Khusus pejuang Ujian Mandiri PTN 2026","headline":"Belajar pasti lulus, masa depan pasti cerah.","cta":"Mulai gratis sekarang"}', 'published'),
  ('features', 'Section fitur', 'Product', '{"layout":"three-column"}', 'published'),
  ('pricing', 'CTA harga', 'Growth', '{"cta":"Lihat paket belajar"}', 'published'),
  ('payment_guide', 'Tata cara pembayaran', 'Billing', '{"title":"Tata cara pembayaran","body":"Pilih paket yang sesuai, cek ringkasan pesanan, lalu klik Lanjutkan pembayaran. Kamu akan diarahkan ke halaman pembayaran resmi Mayar. Setelah pembayaran berhasil, paket aktif otomatis setelah sistem menerima konfirmasi.","youtubeUrl":"","imageUrls":"/tutorial/payment-gif-frames/frame-01.png\n/tutorial/payment-gif-frames/frame-02.png\n/tutorial/payment-gif-frames/frame-03.png\n/tutorial/payment-gif-frames/frame-04.png\n/tutorial/payment-gif-frames/frame-05.png","qrisSteps":"Pilih QRIS di halaman pembayaran.\nBuka aplikasi mobile banking atau e-wallet.\nScan kode QR yang tampil.\nPastikan nominal dan nama merchant sudah benar.\nKonfirmasi pembayaran dan tunggu status berhasil.","virtualAccountSteps":"Pilih Virtual Account dan pilih bank yang tersedia.\nSalin nomor virtual account.\nBuka mobile banking, internet banking, atau ATM.\nPilih menu Transfer atau Pembayaran Virtual Account.\nMasukkan nomor virtual account, cek nominal, lalu bayar.","ewalletSteps":"Pilih e-wallet yang tersedia.\nMasukkan nomor HP jika diminta.\nBuka aplikasi e-wallet dan cek notifikasi pembayaran.\nKonfirmasi pembayaran di aplikasi.\nKembali ke halaman status untuk melihat aktivasi paket.","cardSteps":"Pilih Kartu Debit atau Kredit jika tersedia.\nMasukkan data kartu pada halaman pembayaran aman.\nIkuti verifikasi OTP atau 3DS dari bank.\nPastikan transaksi berhasil.\nSimpan bukti pembayaran jika diperlukan."}', 'published')
on conflict (section_key) do nothing;

insert into public.blog_posts (slug, title, category, excerpt, body, status, published_at)
values
  ('strategi-14-hari-ujian-mandiri', 'Strategi 14 hari mengejar Ujian Mandiri', 'Strategi belajar', 'Cara menyusun prioritas latihan saat waktu sudah mepet.', 'Draft artikel produksi.', 'published', now()),
  ('kenapa-soal-mandiri-beda-snbt', 'Kenapa soal mandiri terasa beda dari SNBT?', 'Analisis soal', 'Beberapa kampus punya gaya soal dan tekanan waktu yang berbeda.', 'Draft artikel produksi.', 'published', now())
on conflict (slug) do nothing;
