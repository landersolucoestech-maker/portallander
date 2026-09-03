create table if not exists integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('autentique','meta','tiktok','google','spotify','nfe','whatsapp','resend')),
  provider_event_id text not null,
  event_type text not null,
  external_object_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_attempts integer not null default 0 check (processing_attempts >= 0),
  processing_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists integration_events_provider_received_idx
  on integration_events(provider, received_at desc);

create index if not exists integration_events_unprocessed_idx
  on integration_events(provider, received_at)
  where processed_at is null;

comment on table integration_events is 'Durable idempotency and processing ledger for external integration webhook/provider events.';
comment on column integration_events.provider_event_id is 'Provider-supplied immutable event identifier; combined with provider for deduplication.';
comment on column integration_events.payload is 'Original provider event payload after transport-level authenticity verification.';
