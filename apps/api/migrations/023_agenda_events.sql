begin;

create table if not exists agenda_events (
  id text primary key,
  title text not null,
  event_type text not null,
  status text not null default 'agendado',
  participant_ids text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null default '',
  location_id text,
  address text not null default '',
  venue_contact text not null default '',
  venue_phone text not null default '',
  venue_email text not null default '',
  capacity integer,
  fee numeric,
  expected_audience integer,
  description text not null default '',
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agenda_events_status_check check (status in ('agendado','confirmado','pendente','concluido','cancelado','realizado','negociacao')),
  constraint agenda_events_capacity_check check (capacity is null or capacity >= 0),
  constraint agenda_events_fee_check check (fee is null or fee >= 0),
  constraint agenda_events_expected_audience_check check (expected_audience is null or expected_audience >= 0),
  constraint agenda_events_checklist_array_check check (jsonb_typeof(checklist)='array'),
  constraint agenda_events_date_order_check check (ends_at is null or ends_at >= starts_at)
);

create index if not exists idx_agenda_events_starts_at on agenda_events(starts_at);
create index if not exists idx_agenda_events_status on agenda_events(status,starts_at);
create index if not exists idx_agenda_events_type on agenda_events(event_type,starts_at);

drop trigger if exists agenda_events_set_updated_at on agenda_events;
create trigger agenda_events_set_updated_at
before update on agenda_events
for each row execute function set_portal_updated_at();

comment on table agenda_events is 'Canonical authenticated operational agenda. Browser localStorage is development-fixture only.';
comment on column agenda_events.participant_ids is 'Stable participant identifiers selected by the administrative UI; participant profile ownership remains outside Agenda.';
comment on column agenda_events.location_id is 'Optional stable location/catalog identifier when one exists; location snapshot fields remain on the event.';

commit;
