begin;

create table if not exists marketing_contents (
  id text primary key,
  title text not null,
  context text not null default '',
  subject text not null default '',
  channels text[] not null default '{}',
  content_type text not null,
  publish_date date not null,
  publish_time time not null,
  copy text not null default '',
  campaign text not null default '',
  hashtags text not null default '',
  location text not null default '',
  status text not null default 'agendado',
  approval text not null default 'pendente',
  owner text not null default '',
  creative_config jsonb,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_contents_status_check check (status in ('ideia','producao','revisao','agendado','publicado','falhou','atrasado')),
  constraint marketing_contents_approval_check check (approval in ('pendente','aprovado','reprovado','ajustes_solicitados')),
  constraint marketing_contents_channels_check check (cardinality(channels) > 0),
  constraint marketing_contents_creative_object_check check (creative_config is null or jsonb_typeof(creative_config)='object')
);

create index if not exists idx_marketing_contents_publish on marketing_contents(publish_date,publish_time);
create index if not exists idx_marketing_contents_status on marketing_contents(status,publish_date);
create index if not exists idx_marketing_contents_channels on marketing_contents using gin(channels);

drop trigger if exists marketing_contents_set_updated_at on marketing_contents;
create trigger marketing_contents_set_updated_at
before update on marketing_contents
for each row execute function set_portal_updated_at();

comment on table marketing_contents is 'Canonical authenticated Marketing Calendar contents. Browser localStorage remains development-fixture only.';
comment on column marketing_contents.creative_config is 'Versioned aggregate creative composition. Source media and rendered output point to persistent media-library assets; blob/data URLs are forbidden.';

commit;
