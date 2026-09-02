create table if not exists admin_users (
  id text primary key,
  email text not null,
  password_hash text not null,
  display_name text not null default '',
  role text not null default 'admin' check (role in ('owner','admin','editor')),
  active boolean not null default true,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_lower_unique
  on admin_users (lower(email));

create table if not exists admin_sessions (
  id text primary key,
  user_id text not null references admin_users(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  ip_hash char(64)
);

create index if not exists admin_sessions_user_id_idx on admin_sessions(user_id);
create index if not exists admin_sessions_expires_at_idx on admin_sessions(expires_at);
