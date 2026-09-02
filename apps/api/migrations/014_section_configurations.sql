begin;

create table if not exists editorial_section_configurations (
  page_key text not null,
  section_slug text not null,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (page_key, section_slug),
  constraint editorial_section_configurations_slug_check check (section_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint editorial_section_configurations_object_check check (jsonb_typeof(configuration) = 'object')
);

create index if not exists idx_editorial_section_configurations_page
  on editorial_section_configurations(page_key, updated_at desc);

drop trigger if exists editorial_section_configurations_set_updated_at on editorial_section_configurations;
create trigger editorial_section_configurations_set_updated_at
before update on editorial_section_configurations
for each row execute function set_portal_updated_at();

comment on table editorial_section_configurations is 'Persisted CMS configuration for each page section. The Home uses page_key=home; configuration is the single source of truth shared by admin preview and public renderers.';

commit;
