begin;

create table if not exists editorial_media (
  id text primary key default gen_random_uuid()::text,
  storage_key text not null unique,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  public_url text not null,
  alt_text text not null default '',
  caption text not null default '',
  created_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_editorial_media_created_at
  on editorial_media(created_at desc);
create index if not exists idx_editorial_media_mime_type
  on editorial_media(mime_type);

comment on table editorial_media is 'Persistent public media library used by the authenticated CMS and editorial content.';

commit;
