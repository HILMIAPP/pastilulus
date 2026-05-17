-- Pastilulus production ERD hardening
-- Run after docs/SUPABASE_SCHEMA_V2_RUN_THIS.sql and docs/ADMIN_PRODUCTION_SCHEMA.sql.

create extension if not exists "pgcrypto";

create table if not exists public.broadcast_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  target_segment text not null default 'all',
  status public.content_status not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.broadcast_messages enable row level security;

drop policy if exists "admin manage broadcast messages" on public.broadcast_messages;
create policy "admin manage broadcast messages"
on public.broadcast_messages for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_broadcast_messages_status_updated
on public.broadcast_messages(status, updated_at desc);

do $$
begin
  alter table public.payment_transactions
    add constraint fk_payment_transactions_promo_code
    foreign key (promo_code)
    references public.promo_codes(code)
    on update cascade
    on delete set null;
exception
  when duplicate_object then null;
  when undefined_table then null;
end $$;

do $$
begin
  alter table public.payment_transactions
    add constraint fk_payment_transactions_affiliate_code
    foreign key (affiliate_code)
    references public.affiliate_partners(code)
    on update cascade
    on delete set null;
exception
  when duplicate_object then null;
  when undefined_table then null;
end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch_updated_at on public.profiles;
create trigger trg_profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_payment_transactions_touch_updated_at on public.payment_transactions;
create trigger trg_payment_transactions_touch_updated_at
before update on public.payment_transactions
for each row execute function public.touch_updated_at();

drop trigger if exists trg_subscriptions_touch_updated_at on public.subscriptions;
create trigger trg_subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists trg_promo_codes_touch_updated_at on public.promo_codes;
create trigger trg_promo_codes_touch_updated_at
before update on public.promo_codes
for each row execute function public.touch_updated_at();

drop trigger if exists trg_affiliate_partners_touch_updated_at on public.affiliate_partners;
create trigger trg_affiliate_partners_touch_updated_at
before update on public.affiliate_partners
for each row execute function public.touch_updated_at();

drop trigger if exists trg_site_content_touch_updated_at on public.site_content;
create trigger trg_site_content_touch_updated_at
before update on public.site_content
for each row execute function public.touch_updated_at();

drop trigger if exists trg_blog_posts_touch_updated_at on public.blog_posts;
create trigger trg_blog_posts_touch_updated_at
before update on public.blog_posts
for each row execute function public.touch_updated_at();

drop trigger if exists trg_broadcast_messages_touch_updated_at on public.broadcast_messages;
create trigger trg_broadcast_messages_touch_updated_at
before update on public.broadcast_messages
for each row execute function public.touch_updated_at();

create or replace function public.increment_promo_usage(promo text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.promo_codes
  set used_count = used_count + 1,
      updated_at = now()
  where code = promo;
$$;

create or replace function public.increment_affiliate_conversion(affiliate text, paid_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.affiliate_partners
  set conversion_count = conversion_count + 1,
      revenue_amount = revenue_amount + greatest(paid_amount, 0),
      updated_at = now()
  where code = affiliate;
$$;

-- Atomically validate and claim one usage slot for a promo code.
-- Uses SELECT FOR UPDATE so concurrent requests queue rather than
-- both reading the same used_count and both slipping through the limit.
-- Returns (valid, discount_type, discount_value, discount_amount) where
-- discount_amount is already computed against the given base_amount.
create or replace function public.claim_promo_code(
  p_code       text,
  p_base_amount integer
)
returns table (
  valid          boolean,
  discount_type  text,
  discount_value integer,
  discount_amount integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.promo_codes;
  computed_discount integer;
begin
  -- Row-level lock: only one caller can proceed at a time for this code.
  select * into r
  from public.promo_codes
  where code = p_code
  for update;

  if not found then
    return query select false, ''::text, 0, 0;
    return;
  end if;

  if r.status != 'published' then
    return query select false, ''::text, 0, 0;
    return;
  end if;

  if r.usage_limit > 0 and r.used_count >= r.usage_limit then
    return query select false, ''::text, 0, 0;
    return;
  end if;

  if r.starts_at is not null and r.starts_at > now() then
    return query select false, ''::text, 0, 0;
    return;
  end if;

  if r.expires_at is not null and r.expires_at < now() then
    return query select false, ''::text, 0, 0;
    return;
  end if;

  -- All checks passed — consume one slot atomically.
  update public.promo_codes
  set used_count = used_count + 1,
      updated_at = now()
  where code = p_code;

  computed_discount := case
    when r.discount_type = 'percent'
      then least(p_base_amount, greatest(0, (p_base_amount * r.discount_value) / 100))
    else
      least(p_base_amount, greatest(0, r.discount_value))
  end;

  return query select true, r.discount_type::text, r.discount_value, computed_discount;
end;
$$;
