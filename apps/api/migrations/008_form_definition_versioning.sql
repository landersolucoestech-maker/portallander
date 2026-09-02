begin;

alter table site_form_versions
  add column if not exists definition_meta jsonb not null default '{}'::jsonb;

update site_form_versions v
set definition_meta=jsonb_build_object(
  'key',f.key,
  'name',f.name,
  'slug',f.slug,
  'purpose',f.purpose,
  'source',f.source
)
from site_forms f
where f.id=v.form_id
  and (v.definition_meta='{}'::jsonb or v.definition_meta is null);

comment on column site_form_versions.definition_meta is 'Versioned form metadata. Draft changes are promoted to site_forms only when that version is published.';

commit;
