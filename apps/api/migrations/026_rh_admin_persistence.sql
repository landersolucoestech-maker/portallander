begin;

create table if not exists rh_admin_state (
  id text primary key check (id = 'primary'),
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version > 0),
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists rh_admin_state_set_updated_at on rh_admin_state;
create trigger rh_admin_state_set_updated_at
before update on rh_admin_state
for each row execute function set_portal_updated_at();

comment on table rh_admin_state is 'Canonical authenticated RH domain state; development fixtures never populate this table.';
comment on column rh_admin_state.payload is 'RH-domain-only JSON state. This table is not an application-wide administrative snapshot.';
comment on column rh_admin_state.updated_by is 'Authenticated admin user responsible for the latest RH mutation.';

commit;
