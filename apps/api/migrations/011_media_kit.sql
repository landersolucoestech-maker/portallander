begin;

create table if not exists media_kit_versions (
  version integer primary key,
  status text not null check (status in ('draft','published','inactive')),
  payload jsonb not null,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create unique index if not exists idx_media_kit_single_draft
  on media_kit_versions(status)
  where status='draft';
create unique index if not exists idx_media_kit_single_published
  on media_kit_versions(status)
  where status='published';
create index if not exists idx_media_kit_versions_updated_at
  on media_kit_versions(updated_at desc);

comment on table media_kit_versions is 'Versioned Media Kit configuration. One editable draft and one currently published version are allowed.';

commit;
