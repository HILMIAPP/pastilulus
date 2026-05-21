-- Mayar payment migration for existing production databases.
-- Run after docs/ADMIN_PRODUCTION_SCHEMA.sql has already created payment_transactions.

alter table public.payment_transactions
  add column if not exists payment_provider text not null default 'mayar',
  add column if not exists provider_payment_id text,
  add column if not exists provider_transaction_id text,
  add column if not exists provider_payment_url text;

create index if not exists idx_payment_transactions_provider_payment
  on public.payment_transactions(payment_provider, provider_payment_id);

alter table public.subscriptions
  add column if not exists provider_order_id text;

update public.subscriptions
set provider_order_id = midtrans_order_id
where provider_order_id is null and midtrans_order_id is not null;

alter table public.subscriptions
  alter column midtrans_order_id drop not null;

create unique index if not exists idx_subscriptions_provider_order_id
  on public.subscriptions(provider_order_id)
  where provider_order_id is not null;

comment on column public.payment_transactions.midtrans_transaction_id is
  'Legacy Midtrans transaction id retained for historical rows. New Mayar rows use provider_transaction_id.';

comment on column public.subscriptions.midtrans_order_id is
  'Legacy Midtrans order id retained for historical rows. New Mayar rows use provider_order_id.';
