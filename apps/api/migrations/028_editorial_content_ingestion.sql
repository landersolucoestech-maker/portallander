create table if not exists integration_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  provider text not null check (provider in ('rss','gdelt','youtube','official_source')),
  name text not null,
  source_type text not null default 'news',
  category text,
  country text,
  language text,
  url text,
  feed_url text,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  sync_frequency_minutes integer not null default 60 check (sync_frequency_minutes between 15 and 10080),
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  last_status text not null default 'never_synced' check (last_status in ('never_synced','configuration_required','syncing','succeeded','failed','disabled')),
  last_imported_count integer not null default 0 check (last_imported_count >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integration_sources_provider_enabled_idx on integration_sources(provider, enabled);
create index if not exists integration_sources_due_idx on integration_sources(next_sync_at) where enabled=true;

create table if not exists integration_source_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references integration_sources(id) on delete cascade,
  provider text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  received integer not null default 0 check (received >= 0),
  created integer not null default 0 check (created >= 0),
  duplicates integer not null default 0 check (duplicates >= 0),
  ignored integer not null default 0 check (ignored >= 0),
  errors integer not null default 0 check (errors >= 0),
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_source_sync_runs_source_started_idx on integration_source_sync_runs(source_id, started_at desc);

create table if not exists content_import_candidates (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  source_id uuid references integration_sources(id) on delete set null,
  source_name text not null,
  external_id text,
  canonical_url text not null,
  normalized_url text not null,
  title text not null,
  normalized_title text not null,
  title_hash text not null,
  description text not null default '',
  image_url text,
  author text,
  published_at timestamptz,
  discovered_at timestamptz not null default now(),
  language text,
  country text,
  source_type text not null default 'news',
  suggested_category text,
  suggested_tags text[] not null default '{}',
  detected_entities jsonb not null default '{}'::jsonb,
  relevance_score integer not null default 0 check (relevance_score between 0 and 100),
  relevance_reasons text[] not null default '{}',
  duplicate_key text,
  provenance jsonb not null default '[]'::jsonb,
  raw_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','reviewing','approved','rejected','ignored','converted')),
  reviewed_at timestamptz,
  reviewed_by text references admin_users(id) on delete set null,
  editorial_content_id text references editorial_contents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_import_candidates_source_external_uidx
  on content_import_candidates(provider, source_id, external_id)
  where external_id is not null and source_id is not null;
create unique index if not exists content_import_candidates_normalized_url_uidx
  on content_import_candidates(normalized_url);
create index if not exists content_import_candidates_status_score_idx
  on content_import_candidates(status, relevance_score desc, published_at desc nulls last);
create index if not exists content_import_candidates_title_hash_idx
  on content_import_candidates(title_hash, published_at desc nulls last);
create index if not exists content_import_candidates_source_idx
  on content_import_candidates(source_id, discovered_at desc);

insert into integration_sources(source_key,provider,name,source_type,category,country,language,url,enabled,configuration,sync_frequency_minutes,last_status)
values
  ('gdelt-music-br','gdelt','GDELT — Mercado Musical Brasil','news_discovery','Mercado Musical','BR','en','https://www.gdeltproject.org/',true,'{"query":"(music OR streaming OR Spotify OR YouTube OR record label OR copyright OR royalties) (Brazil OR Brasil)","timespan":"24h","maxRecords":50}'::jsonb,60,'never_synced'),
  ('youtube-music-br','youtube','YouTube — Sinais de Música Brasil','video_discovery','Lançamentos','BR','pt-BR','https://www.youtube.com/',false,'{"query":"música lançamento Brasil","regionCode":"BR","relevanceLanguage":"pt","maxResults":25}'::jsonb,120,'configuration_required'),
  ('ecad-official','official_source','ECAD','official_news','Direitos Autorais','BR','pt-BR','https://www4.ecad.org.br/',false,'{}'::jsonb,180,'configuration_required'),
  ('promusica-official','official_source','Pro-Música Brasil','official_news','Mercado Musical','BR','pt-BR','https://abpd.org.br/',false,'{}'::jsonb,180,'configuration_required'),
  ('ubc-official','official_source','UBC — União Brasileira de Compositores','official_news','Direitos Autorais','BR','pt-BR','https://www.ubc.org.br/home/',false,'{}'::jsonb,180,'configuration_required'),
  ('abramus-official','official_source','ABRAMUS','official_news','Direitos Autorais','BR','pt-BR','https://www.abramus.org.br/',false,'{}'::jsonb,180,'configuration_required'),
  ('ifpi-official','official_source','IFPI','official_news','Mercado Musical','GB','en','https://www.ifpi.org/news/',false,'{}'::jsonb,360,'configuration_required')
on conflict(source_key) do nothing;

comment on table integration_sources is 'Non-secret configuration for external editorial discovery sources. Credentials remain backend-only.';
comment on table integration_source_sync_runs is 'Operational observability for source synchronization. Kept separate from integration_events because that ledger models provider/webhook events.';
comment on table content_import_candidates is 'External discovery candidates awaiting human editorial curation. This table is not a publication source of truth.';
comment on column content_import_candidates.image_url is 'External metadata/reference only; no automatic media ingestion or publication rights are implied.';
