begin;

alter table if exists content_collaborations
  drop constraint if exists content_collaborations_status_check;

update content_collaborations
set status = 'review'
where status = 'analysis';

alter table if exists content_collaborations
  add constraint content_collaborations_status_check
  check (status in ('received','triage','review','approved','production','published','rejected','duplicate','spam','archived'));

commit;
