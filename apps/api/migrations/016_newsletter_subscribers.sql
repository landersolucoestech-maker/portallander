begin;

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'active',
  source text not null default 'home-newsletter',
  consent_version text not null default 'v1',
  consent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  resend_contact_id text,
  resend_synced_at timestamptz,
  last_sync_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_status_check check (status in ('active','unsubscribed','suppressed')),
  constraint newsletter_subscribers_metadata_check check (jsonb_typeof(metadata) = 'object')
);

create unique index if not exists idx_newsletter_subscribers_email_lower
on newsletter_subscribers(lower(email));
create index if not exists idx_newsletter_subscribers_status
on newsletter_subscribers(status, created_at desc);

drop trigger if exists newsletter_subscribers_set_updated_at on newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at
before update on newsletter_subscribers
for each row execute function set_portal_updated_at();

alter table newsletter_subscribers enable row level security;

comment on table newsletter_subscribers is 'Portal Lander newsletter consent ledger. Public clients never write directly; subscriptions go through the Portal API.';
comment on column newsletter_subscribers.resend_contact_id is 'Resend contact identifier used only for synchronization/auditing; Resend API keys remain server-side.';

commit;
