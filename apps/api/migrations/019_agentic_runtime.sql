begin;

create extension if not exists pgcrypto;

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  requester_type text not null check (requester_type in ('user','event','cron','webhook','system')),
  requester_id text not null,
  idempotency_key text not null check (length(idempotency_key) between 8 and 200),
  objective text not null check (length(objective) between 1 and 4000),
  agent_key text not null default 'portal-supervisor',
  agent_version text not null default '1',
  skill_id text not null,
  skill_version text not null,
  state text not null default 'queued' check (state in ('queued','running','waiting_approval','succeeded','failed','cancelled')),
  risk_level smallint not null check (risk_level between 0 and 4),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  policy_decision jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_type, requester_id, idempotency_key)
);

create table if not exists agent_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  sequence integer not null check (sequence >= 0),
  skill_id text not null,
  skill_version text not null,
  state text not null default 'queued' check (state in ('queued','running','waiting_approval','succeeded','failed','cancelled')),
  risk_level smallint not null check (risk_level between 0 and 4),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, sequence)
);

create table if not exists skill_invocations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  step_id uuid not null references agent_steps(id) on delete cascade,
  skill_id text not null,
  skill_version text not null,
  attempt integer not null check (attempt >= 1),
  state text not null check (state in ('running','succeeded','failed')),
  permissions text[] not null default '{}',
  policy_decision jsonb not null default '{}'::jsonb,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (step_id, attempt)
);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  step_id uuid references agent_steps(id) on delete cascade,
  risk_level smallint not null check (risk_level between 2 and 4),
  requested_roles text[] not null check (cardinality(requested_roles) > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired','cancelled')),
  decision_actor_type text,
  decision_actor_id text,
  decision_role text,
  decision_note text,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_runs_state_created_idx on agent_runs(state,created_at desc);
create index if not exists agent_runs_requester_created_idx on agent_runs(requester_type,requester_id,created_at desc);
create index if not exists agent_steps_run_idx on agent_steps(run_id,sequence);
create index if not exists skill_invocations_run_idx on skill_invocations(run_id,created_at);
create index if not exists approval_requests_pending_idx on approval_requests(created_at) where status='pending';

comment on table agent_runs is 'Durable governed execution ledger for Portal Lander agentic runtime requests.';
comment on table agent_steps is 'Ordered execution steps bound to one agent run.';
comment on table skill_invocations is 'Per-attempt skill execution evidence including deterministic policy decision.';
comment on table approval_requests is 'Human approval records. Agent output alone can never satisfy an approval.';

commit;
