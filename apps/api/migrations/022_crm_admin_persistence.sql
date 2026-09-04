begin;

alter table crm_leads
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists interactions jsonb not null default '[]'::jsonb;

create table if not exists crm_contacts (
  id text primary key default gen_random_uuid()::text,
  entity_type text not null default 'pessoa_juridica',
  category text not null default 'outro',
  profile text not null default '',
  name text not null,
  company text not null default '',
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  city text not null default '',
  state text not null default '',
  document text not null default '',
  website text not null default '',
  instagram text not null default '',
  priority text not null default 'media',
  status text not null default 'ativo',
  tags text[] not null default '{}',
  notes text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  source_lead_id text unique references crm_leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_contacts_entity_type_check check (entity_type in ('pessoa_fisica','pessoa_juridica')),
  constraint crm_contacts_category_check check (category in ('cliente','anunciante','parceiro','fornecedor','prestador_servico','assessoria_agencia','fonte_editorial','patrocinador','instituicao','investidor','outro')),
  constraint crm_contacts_priority_check check (priority in ('baixa','media','alta','estrategica')),
  constraint crm_contacts_status_check check (status in ('ativo','inativo')),
  constraint crm_contacts_attachments_array_check check (jsonb_typeof(attachments)='array'),
  constraint crm_contacts_timeline_array_check check (jsonb_typeof(timeline)='array')
);

create index if not exists idx_crm_contacts_created on crm_contacts(created_at desc);
create index if not exists idx_crm_contacts_name on crm_contacts(lower(name));
create index if not exists idx_crm_contacts_email on crm_contacts(lower(email)) where email <> '';
create index if not exists idx_crm_contacts_phone on crm_contacts(regexp_replace(phone,'\D','','g')) where phone <> '';
create index if not exists idx_crm_contacts_category on crm_contacts(category,status,priority,created_at desc);

drop trigger if exists crm_contacts_set_updated_at on crm_contacts;
create trigger crm_contacts_set_updated_at
before update on crm_contacts
for each row execute function set_portal_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='crm_leads_converted_contact_fk'
  ) then
    alter table crm_leads
      add constraint crm_leads_converted_contact_fk
      foreign key (converted_contact_id) references crm_contacts(id) on delete set null;
  end if;
end $$;

comment on table crm_contacts is 'Canonical administrative CRM contacts. Authenticated CRM UI persists here instead of browser localStorage.';
comment on column crm_contacts.source_lead_id is 'Lead that originated the contact when created through conversion.';

commit;
