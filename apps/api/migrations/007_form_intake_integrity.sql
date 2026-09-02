begin;

alter table form_submission_attachments
  add column if not exists field_key text not null default 'attachment';

create index if not exists idx_form_submissions_ip_date
  on form_submissions(ip_hash, submitted_at desc)
  where ip_hash is not null;

create unique index if not exists uq_form_submissions_request_id
  on form_submissions(request_id)
  where request_id is not null;

create index if not exists idx_form_submission_attachments_field
  on form_submission_attachments(submission_id, field_key, created_at);

comment on column form_submission_attachments.field_key is 'Key of the published form field that accepted this attachment.';
comment on column form_submissions.request_id is 'Client request identifier used to prevent accidental duplicate ingestion.';

commit;
