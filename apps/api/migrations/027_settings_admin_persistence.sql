begin;

create table if not exists settings_admin_state (
  id text primary key check (id = 'primary'),
  company jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version > 0),
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_admin_state_set_updated_at on settings_admin_state;
create trigger settings_admin_state_set_updated_at
before update on settings_admin_state
for each row execute function set_portal_updated_at();

comment on table settings_admin_state is 'Canonical authenticated Settings domain state. Only non-secret business configuration is persisted here.';
comment on column settings_admin_state.company is 'Company metadata only; secrets, auth tokens and private integration credentials are forbidden.';

commit;
