begin;

create table if not exists integration_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('rss','gdelt','youtube','official_source')),
  name text not null,
  source_type text not null default 'news' check (source_type in ('news','official','video','trend')),
  category text not null default '',
  country text not null default '',
  language text not null default '',
  url text,
  feed_url text,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  sync_frequency_minutes integer not null default 60 check (sync_frequency_minutes between 15 and 10080),
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  last_status text not null default 'idle' check (last_status in ('idle','syncing','succeeded','failed','disabled','unconfigured')),
  last_imported_count integer not null default 0 check (last_imported_count >= 0),
  last_duplicate_count integer not null default 0 check (last_duplicate_count >= 0),
  last_error text,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,name),
  constraint integration_sources_configuration_object check (jsonb_typeof(configuration)='object')
);

create table if not exists editorial_ingestion_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references integration_sources(id) on delete cascade,
  provider text not null,
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  received_count integer not null default 0 check (received_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  ignored_count integer not null default 0 check (ignored_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  error_summary text,
  created_at timestamptz not null default now()
);

create table if not exists content_import_candidates (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references integration_sources(id) on delete set null,
  provider text not null,
  source_external_id text,
  source_name text not null,
  external_id text,
  canonical_url text,
  normalized_url text,
  title text not null,
  normalized_title text not null,
  description text not null default '',
  image_url text,
  author text not null default '',
  published_at timestamptz,
  discovered_at timestamptz not null default now(),
  language text not null default '',
  country text not null default '',
  source_type text not null default 'news',
  suggested_category text not null default 'Atualidades',
  suggested_tags text[] not null default '{}',
  detected_entities jsonb not null default '{}'::jsonb,
  relevance_score integer not null default 0 check (relevance_score between 0 and 100),
  duplicate_key text not null,
  provenance jsonb not null default '[]'::jsonb,
  raw_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','reviewing','approved','converted','rejected','ignored')),
  reviewed_at timestamptz,
  reviewed_by uuid references admin_users(id) on delete set null,
  editorial_content_id text references editorial_contents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_import_candidates_entities_object check (jsonb_typeof(detected_entities)='object'),
  constraint content_import_candidates_provenance_array check (jsonb_typeof(provenance)='array'),
  constraint content_import_candidates_raw_metadata_object check (jsonb_typeof(raw_metadata)='object')
);

create unique index if not exists uq_content_import_candidates_provider_external on content_import_candidates(provider,external_id) where external_id is not null and external_id<>'';
create unique index if not exists uq_content_import_candidates_normalized_url on content_import_candidates(normalized_url) where normalized_url is not null and normalized_url<>'';
create index if not exists idx_integration_sources_due on integration_sources(enabled,next_sync_at,provider);
create index if not exists idx_ingestion_sync_runs_source_started on editorial_ingestion_sync_runs(source_id,started_at desc);
create index if not exists idx_content_import_candidates_status_score on content_import_candidates(status,relevance_score desc,discovered_at desc);
create index if not exists idx_content_import_candidates_source_status on content_import_candidates(source_id,status,discovered_at desc);
create index if not exists idx_content_import_candidates_duplicate on content_import_candidates(duplicate_key,published_at desc nulls last,discovered_at desc);

create trigger integration_sources_set_updated_at before update on integration_sources for each row execute function set_portal_updated_at();
create trigger content_import_candidates_set_updated_at before update on content_import_candidates for each row execute function set_portal_updated_at();

insert into integration_sources(provider,name,source_type,category,country,language,url,enabled,configuration,sync_frequency_minutes,last_status)
values
  ('gdelt','GDELT — Mercado Musical Brasil','trend','Mercado Musical','BR','pt','https://api.gdeltproject.org/api/v2/doc/doc',true,'{"query":"(music OR musician OR streaming OR spotify OR \"music industry\") (Brazil OR Brasil)","timespan":"24h","maxRecords":50}'::jsonb,60,'idle'),
  ('youtube','YouTube — Em Alta Brasil','video','Lançamentos','BR','pt','https://www.googleapis.com/youtube/v3/videos',false,'{"regionCode":"BR","maxResults":25}'::jsonb,120,'unconfigured'),
  ('official_source','ECAD','official','Direitos Autorais','BR','pt','https://www4.ecad.org.br/category/noticias/',false,'{}'::jsonb,360,'unconfigured'),
  ('official_source','Pro-Música Brasil','official','Mercado Musical','BR','pt','https://pro-musicabr.org.br/',false,'{}'::jsonb,360,'unconfigured'),
  ('official_source','UBC','official','Direitos Autorais','BR','pt','https://www.ubc.org.br/',false,'{}'::jsonb,360,'unconfigured'),
  ('official_source','ABRAMUS','official','Direitos Autorais','BR','pt','https://www.abramus.org.br/category/noticias/',false,'{}'::jsonb,360,'unconfigured'),
  ('official_source','IFPI','official','Mercado Musical','','en','https://www.ifpi.org/news/',false,'{}'::jsonb,360,'unconfigured')
on conflict(provider,name) do nothing;

comment on table integration_sources is 'Configurable external editorial discovery sources. Secrets are never stored here.';
comment on table editorial_ingestion_sync_runs is 'Operational sync telemetry for polling-based editorial ingestion; separate from integration_events provider-event processing.';
comment on table content_import_candidates is 'External discoveries awaiting human editorial curation. Editorial publication remains canonical in editorial_contents.';

commit;
