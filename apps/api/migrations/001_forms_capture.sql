begin;

create extension if not exists pgcrypto;

create table if not exists site_forms (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  slug text not null unique,
  purpose text not null check (purpose in ('lead_capture','contact','advertising','editorial_submission','newsletter','survey','event_registration','custom')),
  status text not null default 'draft' check (status in ('draft','active','inactive')),
  source text not null default 'custom' check (source in ('system','custom')),
  routing jsonb not null default '{}'::jsonb,
  success_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references site_forms(id) on delete cascade,
  version integer not null,
  fields jsonb not null default '[]'::jsonb,
  consents jsonb not null default '[]'::jsonb,
  routing jsonb not null default '{}'::jsonb,
  success_message text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(form_id, version)
);

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references site_forms(id),
  form_version_id uuid not null references site_form_versions(id),
  payload jsonb not null default '{}'::jsonb,
  source jsonb not null default '{}'::jsonb,
  processing_status text not null default 'received' check (processing_status in ('received','validating','accepted','rejected','spam','failed')),
  routing_results jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  processed_at timestamptz,
  request_id text,
  spam_score numeric,
  ip_hash text,
  user_agent text
);

create table if not exists form_submission_consents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references form_submissions(id) on delete cascade,
  consent_key text not null,
  kind text not null check (kind in ('privacy','marketing','terms','content_rights')),
  version text not null,
  text_snapshot text not null,
  accepted boolean not null,
  accepted_at timestamptz,
  unique(submission_id, consent_key)
);

create table if not exists form_submission_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references form_submissions(id) on delete cascade,
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  checksum text,
  scan_status text not null default 'pending' check (scan_status in ('pending','clean','blocked','failed')),
  created_at timestamptz not null default now()
);

create table if not exists content_collaborations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references form_submissions(id),
  type text not null check (type in ('noticia','video','foto','pauta')),
  title text not null,
  description text not null,
  submitter_name text not null,
  submitter_email text not null,
  submitter_phone text not null default '',
  location text not null default '',
  source_url text not null default '',
  status text not null default 'received' check (status in ('received','triage','analysis','approved','production','published','rejected','duplicate','spam','archived')),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  assigned_user_id text,
  tags text[] not null default '{}',
  internal_notes jsonb not null default '[]'::jsonb,
  published_content_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_forms_status on site_forms(status);
create index if not exists idx_form_versions_form on site_form_versions(form_id, version desc);
create index if not exists idx_form_submissions_form_date on form_submissions(form_id, submitted_at desc);
create index if not exists idx_form_submissions_status on form_submissions(processing_status, submitted_at desc);
create index if not exists idx_content_collaborations_status on content_collaborations(status, created_at desc);
create index if not exists idx_content_collaborations_assignee on content_collaborations(assigned_user_id, status);

comment on table site_forms is 'Canonical form definitions managed by Site → Formulários.';
comment on table site_form_versions is 'Immutable published snapshots used to preserve historical form configuration.';
comment on table form_submissions is 'Neutral intake envelope. A submission is not automatically a CRM lead.';
comment on table content_collaborations is 'Editorial queue populated from forms routed to Site → Conteúdos → Colaborações recebidas.';

commit;
