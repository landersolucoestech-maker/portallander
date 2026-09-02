begin;

create extension if not exists pgcrypto;

create table if not exists editorial_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  navigation_label text not null,
  slug text not null unique,
  description text not null default '',
  cover_image text,
  type text not null default 'editorial' check (type in ('editorial','institutional','special')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  active boolean not null default false,
  visibility text not null default 'private' check (visibility in ('public','private')),
  show_in_main_menu boolean not null default false,
  menu_order integer not null default 0,
  sort_order integer not null default 0,
  parent_id uuid references editorial_pages(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists editorial_contents (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references editorial_pages(id) on delete restrict,
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
  unique(page_id, slug)
);

create index if not exists idx_editorial_pages_public on editorial_pages(type,status,active,visibility,menu_order);
create index if not exists idx_editorial_contents_page on editorial_contents(page_id,status,active,published_at desc);
create index if not exists idx_editorial_contents_slug on editorial_contents(page_id,slug);

comment on table editorial_pages is 'Canonical Site → Páginas entities. Editorial pages share the Notícias listing/content templates; institutional/special pages use explicit layouts.';
comment on table editorial_contents is 'Canonical Site → Conteúdos publications. Content records never own or duplicate page templates.';

commit;
