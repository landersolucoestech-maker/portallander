begin;

create table if not exists spotify_connections (
  provider text primary key,
  account_id text not null,
  account_name text not null default '',
  access_token_ciphertext text not null,
  refresh_token_ciphertext text not null,
  token_expires_at timestamptz not null,
  scope text not null default '',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spotify_connections_provider_check check (provider = 'spotify')
);

drop trigger if exists spotify_connections_set_updated_at on spotify_connections;
create trigger spotify_connections_set_updated_at
before update on spotify_connections
for each row execute function set_portal_updated_at();

create table if not exists spotify_oauth_states (
  state_hash text primary key,
  return_to text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_spotify_oauth_states_expiry on spotify_oauth_states(expires_at);

create table if not exists spotify_release_sources (
  source_key text primary key,
  provider text not null default 'spotify',
  playlist_id text,
  playlist_name text not null default '',
  playlist_url text not null default '',
  playlist_snapshot_id text not null default '',
  normalized_items jsonb not null default '[]'::jsonb,
  status text not null default 'disconnected',
  last_synced_at timestamptz,
  last_attempt_at timestamptz,
  last_error_code text,
  last_error_message text,
  retry_after_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spotify_release_sources_provider_check check (provider = 'spotify'),
  constraint spotify_release_sources_items_check check (jsonb_typeof(normalized_items) = 'array'),
  constraint spotify_release_sources_status_check check (status in ('disconnected','ready','syncing','empty','stale','error'))
);

drop trigger if exists spotify_release_sources_set_updated_at on spotify_release_sources;
create trigger spotify_release_sources_set_updated_at
before update on spotify_release_sources
for each row execute function set_portal_updated_at();

insert into spotify_release_sources(source_key) values ('home-releases')
on conflict (source_key) do nothing;

comment on table spotify_connections is 'Server-only encrypted Spotify OAuth credentials. Never returned to frontend.';
comment on table spotify_release_sources is 'Normalized Spotify playlist cache used by the Home releases section and its real preview.';

commit;
