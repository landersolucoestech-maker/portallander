begin;

create table if not exists chat_admin_state (
  id text primary key check (id = 'primary'),
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version > 0),
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists chat_admin_state_set_updated_at on chat_admin_state;
create trigger chat_admin_state_set_updated_at
before update on chat_admin_state
for each row execute function set_portal_updated_at();

comment on table chat_admin_state is 'Canonical authenticated Chat domain state. Development fixtures never populate this table.';
comment on column chat_admin_state.payload is 'Chat-domain-only JSON state; never used as an application-wide admin snapshot.';
comment on column chat_admin_state.updated_by is 'Authenticated admin user responsible for the latest mutation.';

commit;
