-- Performance indexes — run after all schema migrations.
-- These cover the hot query paths identified in the API routes.

-- payment webhooks: always filter by order_id
create index if not exists idx_payment_transactions_order_id
  on public.payment_transactions(order_id);

-- checkout & payment webhooks: user transaction history
create index if not exists idx_payment_transactions_user_id
  on public.payment_transactions(user_id, created_at desc);

-- mayar-webhook: fallback lookup when webhook payload only includes provider id
create index if not exists idx_payment_transactions_provider_payment
  on public.payment_transactions(payment_provider, provider_payment_id);

-- tryout/submit: package lookup by slug, only published rows
create index if not exists idx_tryout_packages_slug_published
  on public.tryout_packages(slug)
  where is_published = true;

-- tryout/submit & scoring loop: questions by package, only published rows
create index if not exists idx_questions_package_status
  on public.questions(package_id)
  where status = 'published';

-- student dashboard: exam history ordered by submission time
create index if not exists idx_exam_sessions_user_submitted
  on public.exam_sessions(user_id, submitted_at desc);

-- exam answers: join from session side
create index if not exists idx_exam_answers_session_id
  on public.exam_answers(session_id);

-- promo validation in checkout
create index if not exists idx_promo_codes_code_status
  on public.promo_codes(code)
  where status = 'published';

-- affiliate lookup in checkout
create index if not exists idx_affiliate_partners_code_status
  on public.affiliate_partners(code)
  where status = 'published';

-- audit log queries by actor or entity
create index if not exists idx_audit_logs_actor_created
  on public.audit_logs(actor_id, created_at desc);

create index if not exists idx_audit_logs_entity
  on public.audit_logs(entity_type, entity_id);
