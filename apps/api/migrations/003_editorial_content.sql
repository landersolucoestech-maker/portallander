begin;

create extension if not exists pgcrypto;

create table if not exists editorial_pages (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  navigation_label text not null,
  slug text not null unique,
  description text not null default '',
  cover_image text,
  page_type text not null default 'editorial' check (page_type in ('editorial','institutional','special')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  active boolean not null default false,
  visibility text not null default 'private' check (visibility in ('public','private')),
  show_in_main_menu boolean not null default false,
  menu_order integer not null default 0,
  sort_order integer not null default 0,
  parent_id text references editorial_pages(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint editorial_pages_publication_consistency check (
    status <> 'published' or (active = true and visibility = 'public' and published_at is not null)
  )
);

create table if not exists editorial_contents (
  id text primary key default gen_random_uuid()::text,
  page_id text not null references editorial_pages(id) on delete restrict,
  title text not null,
  slug text not null,
  subtitle text,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  cover_image text,
  cover_image_alt text,
  author text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  active boolean not null default false,
  tags text[] not null default '{}',
  media jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique(page_id, slug),
  constraint editorial_contents_body_is_array check (jsonb_typeof(body) = 'array'),
  constraint editorial_contents_media_is_array check (jsonb_typeof(media) = 'array'),
  constraint editorial_contents_publication_consistency check (
    status <> 'published' or (active = true and published_at is not null)
  )
);

create index if not exists idx_editorial_pages_public
  on editorial_pages(page_type, status, visibility, active, menu_order);
create index if not exists idx_editorial_pages_parent
  on editorial_pages(parent_id, sort_order);
create index if not exists idx_editorial_contents_page_status
  on editorial_contents(page_id, status, active, published_at desc);
create index if not exists idx_editorial_contents_published
  on editorial_contents(status, active, published_at desc);
create index if not exists idx_editorial_contents_tags
  on editorial_contents using gin(tags);

create or replace function set_portal_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists editorial_pages_set_updated_at on editorial_pages;
create trigger editorial_pages_set_updated_at
before update on editorial_pages
for each row execute function set_portal_updated_at();

drop trigger if exists editorial_contents_set_updated_at on editorial_contents;
create trigger editorial_contents_set_updated_at
before update on editorial_contents
for each row execute function set_portal_updated_at();

comment on table editorial_pages is 'Canonical page entities. Editorial pages select the shared listing/content templates; institutional and special pages are rendered by explicit special-layout registry entries.';
comment on table editorial_contents is 'Canonical editorial publications linked to editorial_pages. Slugs are unique within a page.';
comment on constraint editorial_contents_page_id_fkey on editorial_contents is 'RESTRICT prevents deleting a page while dependent content exists; callers must resolve dependencies explicitly.';

commit;
