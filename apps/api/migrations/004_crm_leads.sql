begin;

create extension if not exists pgcrypto;

create table if not exists crm_leads (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  state text not null default '',
  role text not null default '',
  website text not null default '',
  instagram text not null default '',
  lead_type text not null default 'outro',
  service text not null default 'outro',
  description text not null default '',
  origin text not null default 'formulario_portal',
  status text not null default 'novo',
  priority text not null default 'media',
  responsible text not null default '',
  campaign text not null default '',
  next_follow_up timestamptz,
  estimated_value numeric,
  temperature text not null default 'morno',
  service_details jsonb not null default '{}'::jsonb,
  notes text not null default '',
  tags text[] not null default '{}',
  converted_contact_id text,
  source_submission_id uuid unique references form_submissions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_leads_status_check check (status in ('novo','contato_realizado','qualificado','proposta','negociacao','fechado','perdido')),
  constraint crm_leads_priority_check check (priority in ('baixa','media','alta','estrategica')),
  constraint crm_leads_temperature_check check (temperature in ('frio','morno','quente')),
  constraint crm_leads_origin_check check (origin in ('site','formulario_portal','whatsapp','email','instagram','facebook','linkedin','indicacao','prospeccao_ativa','evento','parceiro','campanha','google','outro'))
);

create index if not exists idx_crm_leads_created on crm_leads(created_at desc);
create index if not exists idx_crm_leads_status on crm_leads(status, priority, created_at desc);
create index if not exists idx_crm_leads_email on crm_leads(lower(email)) where email <> '';
create index if not exists idx_crm_leads_phone on crm_leads(regexp_replace(phone,'\\D','','g')) where phone <> '';
create index if not exists idx_crm_leads_source_submission on crm_leads(source_submission_id) where source_submission_id is not null;

drop trigger if exists crm_leads_set_updated_at on crm_leads;
create trigger crm_leads_set_updated_at
before update on crm_leads
for each row execute function set_portal_updated_at();

comment on table crm_leads is 'Canonical CRM leads. Website form routing writes here instead of browser localStorage.';

commit;
