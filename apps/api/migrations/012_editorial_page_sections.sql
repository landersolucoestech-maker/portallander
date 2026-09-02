begin;

create table if not exists editorial_page_sections (
  id text primary key default gen_random_uuid()::text,
  page_key text not null,
  page_id text references editorial_pages(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_key, slug),
  constraint editorial_page_sections_owner_consistency check (
    (page_key = 'home' and page_id is null) or
    (page_key <> 'home' and page_id is not null and page_key = page_id)
  )
);

create index if not exists idx_editorial_page_sections_page
  on editorial_page_sections(page_key, sort_order, created_at);

drop trigger if exists editorial_page_sections_set_updated_at on editorial_page_sections;
create trigger editorial_page_sections_set_updated_at
before update on editorial_page_sections
for each row execute function set_portal_updated_at();

comment on table editorial_page_sections is 'Custom section composition for the Home and non-editorial pages. Editorial content pages continue to inherit the shared Notícias template.';

commit;
