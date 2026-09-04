begin;

alter table integration_events
  add column if not exists processing_state text not null default 'pending',
  add column if not exists next_attempt_at timestamptz,
  add column if not exists claimed_at timestamptz,
  add column if not exists claim_expires_at timestamptz,
  add column if not exists claimed_by text,
  add column if not exists max_attempts integer not null default 5,
  add column if not exists dead_lettered_at timestamptz,
  add column if not exists requeue_count integer not null default 0,
  add column if not exists last_requeued_at timestamptz,
  add column if not exists last_requeued_by text,
  add column if not exists last_requeue_reason text;

do $$
begin
  if not exists(select 1 from pg_constraint where conname='integration_events_processing_state_check' and conrelid='integration_events'::regclass) then
    alter table integration_events add constraint integration_events_processing_state_check check (processing_state in ('pending','processing','retry_wait','processed','dead_letter'));
  end if;
  if not exists(select 1 from pg_constraint where conname='integration_events_max_attempts_check' and conrelid='integration_events'::regclass) then
    alter table integration_events add constraint integration_events_max_attempts_check check (max_attempts between 1 and 100);
  end if;
  if not exists(select 1 from pg_constraint where conname='integration_events_requeue_count_check' and conrelid='integration_events'::regclass) then
    alter table integration_events add constraint integration_events_requeue_count_check check (requeue_count >= 0);
  end if;
end $$;

update integration_events
set processing_state='processed',next_attempt_at=null,claimed_at=null,claim_expires_at=null,claimed_by=null
where processed_at is not null and processing_state<>'processed';

update integration_events
set processing_state='retry_wait',next_attempt_at=coalesce(next_attempt_at,now())
where processed_at is null and processing_error is not null and processing_state='pending';

create index if not exists integration_events_ready_idx
  on integration_events(next_attempt_at,received_at)
  where processing_state in ('pending','retry_wait');

create index if not exists integration_events_claim_expiry_idx
  on integration_events(claim_expires_at)
  where processing_state='processing';

create index if not exists integration_events_dead_letter_idx
  on integration_events(dead_lettered_at desc)
  where processing_state='dead_letter';

comment on column integration_events.processing_state is 'Deterministic processing state. Unknown jobs/events must not be marked processed.';
comment on column integration_events.claim_expires_at is 'Lease expiry used to recover orphaned worker claims.';
comment on column integration_events.dead_lettered_at is 'Terminal failure timestamp after the configured attempt budget is exhausted.';

commit;
