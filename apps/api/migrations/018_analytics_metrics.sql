begin;

create table if not exists analytics_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_account_id text not null,
  provider_property_id text,
  scope_type text not null default 'portal',
  scope_id text not null default 'portal',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','succeeded','partial','failed')),
  records_imported integer not null default 0 check (records_imported >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  cursor jsonb not null default '{}'::jsonb,
  checkpoint jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0 check (retry_count >= 0),
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_sync_runs_cursor_object check (jsonb_typeof(cursor)='object'),
  constraint analytics_sync_runs_checkpoint_object check (jsonb_typeof(checkpoint)='object'),
  constraint analytics_sync_runs_metadata_object check (jsonb_typeof(metadata)='object')
);

create index if not exists idx_analytics_sync_runs_provider_account
  on analytics_sync_runs(provider, provider_account_id, provider_property_id, started_at desc);
create index if not exists idx_analytics_sync_runs_status
  on analytics_sync_runs(status, started_at desc);

create table if not exists analytics_raw_metrics (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid references analytics_sync_runs(id) on delete set null,
  provider text not null,
  provider_account_id text not null,
  provider_property_id text,
  scope_type text not null default 'portal',
  scope_id text not null default 'portal',
  provider_metric text not null,
  value numeric,
  unit text not null default 'count',
  period_start timestamptz not null,
  period_end timestamptz not null,
  granularity text not null,
  timezone text not null default 'UTC',
  dimensions jsonb not null default '{}'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  source_reference text not null,
  collected_at timestamptz not null default now(),
  provider_updated_at timestamptz,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_raw_metrics_period check (period_end > period_start),
  constraint analytics_raw_metrics_dimensions_object check (jsonb_typeof(dimensions)='object'),
  constraint analytics_raw_metrics_filters_object check (jsonb_typeof(filters)='object'),
  constraint analytics_raw_metrics_payload_object check (jsonb_typeof(provider_payload)='object'),
  unique(provider, provider_account_id, source_reference)
);

create index if not exists idx_analytics_raw_metrics_lookup
  on analytics_raw_metrics(provider, provider_account_id, provider_property_id, provider_metric, period_start desc);
create index if not exists idx_analytics_raw_metrics_sync
  on analytics_raw_metrics(sync_id);

create table if not exists analytics_metrics (
  id uuid primary key default gen_random_uuid(),
  raw_metric_id uuid references analytics_raw_metrics(id) on delete set null,
  sync_id uuid references analytics_sync_runs(id) on delete set null,
  metric_key text not null,
  value numeric,
  unit text not null default 'count',
  provider text,
  provider_account_id text,
  provider_property_id text,
  scope_type text not null default 'portal',
  scope_id text not null default 'portal',
  period_start timestamptz not null,
  period_end timestamptz not null,
  granularity text not null,
  timezone text not null default 'UTC',
  dimensions jsonb not null default '{}'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  source_type text not null check (source_type in ('provider','manual','derived')),
  source_reference text not null,
  collected_at timestamptz,
  provider_updated_at timestamptz,
  normalized_at timestamptz not null default now(),
  freshness_status text not null default 'UNKNOWN' check (freshness_status in ('FRESH','STALE','UNKNOWN')),
  data_status text not null check (data_status in ('LIVE','CACHED','MANUAL','STALE','UNAVAILABLE','SYNC_ERROR','MOCK')),
  provenance jsonb not null default '{}'::jsonb,
  is_estimated boolean not null default false,
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_metrics_period check (period_end > period_start),
  constraint analytics_metrics_dimensions_object check (jsonb_typeof(dimensions)='object'),
  constraint analytics_metrics_filters_object check (jsonb_typeof(filters)='object'),
  constraint analytics_metrics_provenance_object check (jsonb_typeof(provenance)='object'),
  constraint analytics_metrics_provider_source check (
    source_type <> 'provider' or (provider is not null and provider_account_id is not null)
  ),
  constraint analytics_metrics_manual_flag check (
    (source_type='manual' and is_manual=true) or source_type<>'manual'
  ),
  unique(source_type, source_reference, metric_key, period_start, period_end, scope_type, scope_id)
);

create index if not exists idx_analytics_metrics_query
  on analytics_metrics(metric_key, provider, provider_account_id, provider_property_id, period_start desc);
create index if not exists idx_analytics_metrics_scope
  on analytics_metrics(scope_type, scope_id, period_start desc);
create index if not exists idx_analytics_metrics_status
  on analytics_metrics(data_status, freshness_status, normalized_at desc);
create index if not exists idx_analytics_metrics_sync
  on analytics_metrics(sync_id);

comment on table analytics_sync_runs is 'Provider-specific Analytics synchronization ledger. Contains no provider secrets.';
comment on table analytics_raw_metrics is 'Raw numeric provider metrics preserving provider semantics before normalization.';
comment on table analytics_metrics is 'Shared normalized Analytics metrics with provenance for Marketing, Analytics UI and Media Kit consumers.';
comment on table integration_events is 'Durable provider/webhook event ledger; intentionally distinct from analytics metrics and behavioral events.';

commit;
