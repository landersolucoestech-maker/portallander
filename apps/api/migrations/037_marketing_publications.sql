begin;

create table if not exists marketing_publications (
  id uuid primary key default gen_random_uuid(),
  content_id text not null references marketing_contents(id) on delete cascade,
  provider text not null,
  status text not null default 'pending',
  external_creation_id text,
  external_media_id text,
  permalink text,
  attempt_count integer not null default 0,
  started_at timestamptz,
  published_at timestamptz,
  last_error text,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_publications_provider_check check (provider in ('instagram')),
  constraint marketing_publications_status_check check (status in ('pending','publishing','published','failed')),
  constraint marketing_publications_attempt_count_check check (attempt_count >= 0),
  unique(content_id,provider)
);

create index if not exists idx_marketing_publications_content on marketing_publications(content_id,provider);
create index if not exists idx_marketing_publications_status on marketing_publications(provider,status,updated_at);

drop trigger if exists marketing_publications_set_updated_at on marketing_publications;
create trigger marketing_publications_set_updated_at
before update on marketing_publications
for each row execute function set_portal_updated_at();

comment on table marketing_publications is 'Durable provider-specific publication state for Marketing contents. One content may have one independent publication record per social provider.';
comment on column marketing_publications.external_creation_id is 'Provider media container ID retained across retries so a failed attempt can resume without creating a new container.';
comment on column marketing_publications.external_media_id is 'Provider publication/media ID. Once present, retries must not republish the content.';

commit;
