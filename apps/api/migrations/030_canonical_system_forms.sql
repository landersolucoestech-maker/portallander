begin;

alter table site_forms
  add column if not exists retired_at timestamptz;

comment on column site_forms.retired_at is 'When set, the definition is historical-only and excluded from operational form registries and APIs.';

alter table content_collaborations
  drop constraint if exists content_collaborations_type_check;

alter table content_collaborations
  add constraint content_collaborations_type_check check (
    type in ('noticia','video','foto','pauta','publicidade','patrocinio','parceria_comercial','conteudo_patrocinado')
  );

-- Preserve the exact historical form/version references. Clear advertising entries are
-- associated to the canonical collaborate key in source metadata; ambiguous entries remain
-- explicitly marked as ambiguous instead of being classified by guesswork.
with legacy as (
  select id from site_forms where key='advertising-inquiry' limit 1
)
update form_submissions s
set source=coalesce(s.source,'{}'::jsonb) || jsonb_build_object(
  'legacyFormKey','advertising-inquiry',
  'canonicalFormKey','collaborate',
  'legacyClassification','advertising',
  'entryContext',coalesce(nullif(s.source->>'entryContext',''),'anuncie')
)
where s.form_id=(select id from legacy)
  and (
    lower(coalesce(s.source->>'entryContext',''))='anuncie'
    or lower(coalesce(s.source->>'campaign',''))='anuncie'
    or lower(coalesce(s.source->>'page','')) like '%anuncie%'
    or coalesce(s.routing_results,'{}'::jsonb) ? 'crmLeadId'
    or lower(coalesce(s.payload->>'type','')) in ('anunciante','patrocinador','agencia_publicidade','parceiro_comercial')
    or lower(coalesce(s.payload->>'service','')) in ('banner_publicitario','materia_patrocinada','campanha_publicitaria','publicacao_comercial','patrocinio','parceria_comercial')
  );

with legacy as (
  select id from site_forms where key='advertising-inquiry' limit 1
)
update form_submissions s
set source=coalesce(s.source,'{}'::jsonb) || jsonb_build_object(
  'legacyFormKey','advertising-inquiry',
  'legacyClassification','ambiguous'
)
where s.form_id=(select id from legacy)
  and coalesce(s.source->>'legacyClassification','')='';

update site_forms
set name='Contato Comercial',
    slug='contato-comercial',
    purpose='lead_capture',
    status='active',
    source='system',
    routing='{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario","contato-comercial"]}}'::jsonb,
    success_message='Recebemos sua solicitação. Nossa equipe comercial entrará em contato.',
    retired_at=null,
    updated_at=now()
where key='lead-capture';

with form_row as (
  select id from site_forms where key='lead-capture'
)
insert into site_form_versions(form_id,version,fields,consents,routing,success_message,definition_meta,published_at)
select id,2,
  '[{"id":"contact-name","key":"name","label":"Nome","type":"text","required":true,"placeholder":"Nome completo","order":1},{"id":"contact-email","key":"email","label":"E-mail","type":"email","required":true,"placeholder":"voce@empresa.com","order":2},{"id":"contact-phone","key":"phone","label":"Telefone / WhatsApp","type":"tel","required":false,"order":3},{"id":"contact-company","key":"company","label":"Empresa / Marca","type":"text","required":false,"order":4},{"id":"contact-type","key":"type","label":"Perfil comercial","type":"select","required":false,"options":["empresa_marca","agencia_publicidade","anunciante","patrocinador","parceiro_comercial","outro"],"order":5},{"id":"contact-service","key":"service","label":"Interesse comercial","type":"select","required":false,"options":["materia_patrocinada","banner_publicitario","campanha_publicitaria","patrocinio","parceria_comercial","outro"],"order":6},{"id":"contact-message","key":"message","label":"Como podemos ajudar?","type":"textarea","required":true,"order":7}]'::jsonb,
  '[{"id":"contact-privacy","kind":"privacy","label":"Privacidade","required":true,"version":"2.0","text":"Autorizo o tratamento dos dados informados para atendimento da minha solicitação comercial."}]'::jsonb,
  '{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario","contato-comercial"]}}'::jsonb,
  'Recebemos sua solicitação. Nossa equipe comercial entrará em contato.',
  '{"key":"lead-capture","name":"Contato Comercial","slug":"contato-comercial","purpose":"lead_capture","source":"system"}'::jsonb,
  now()
from form_row
on conflict(form_id,version) do nothing;

update site_forms
set name='Colabore / Anuncie',
    slug='colabore-anuncie',
    purpose='editorial_submission',
    status='active',
    source='system',
    routing='{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb,
    success_message='Recebemos sua solicitação. Nossa equipe fará a triagem em Colaborações recebidas.',
    retired_at=null,
    updated_at=now()
where key='collaborate';

with form_row as (
  select id from site_forms where key='collaborate'
)
insert into site_form_versions(form_id,version,fields,consents,routing,success_message,definition_meta,published_at)
select id,2,
  '[{"id":"collab-name","key":"nome","label":"Seu nome","type":"text","required":true,"placeholder":"Nome completo","order":1},{"id":"collab-email","key":"email","label":"E-mail","type":"email","required":true,"order":2},{"id":"collab-whatsapp","key":"whatsapp","label":"WhatsApp","type":"tel","required":false,"order":3},{"id":"collab-company","key":"empresa","label":"Empresa / Marca","type":"text","required":false,"order":4},{"id":"collab-location","key":"local","label":"Cidade / Estado","type":"text","required":false,"order":5},{"id":"collab-title","key":"titulo","label":"Título / assunto","type":"text","required":true,"order":6},{"id":"collab-type","key":"tipo","label":"Tipo de solicitação","type":"select","required":true,"options":["noticia","video","foto","pauta","publicidade","patrocinio","parceria_comercial","conteudo_patrocinado"],"order":7},{"id":"collab-message","key":"mensagem","label":"Conte sua proposta","type":"textarea","required":true,"order":8},{"id":"collab-source","key":"fonte","label":"Fonte ou link de referência","type":"url","required":false,"order":9},{"id":"collab-file","key":"arquivo","label":"Arquivo de apoio","type":"file","required":false,"order":10}]'::jsonb,
  '[{"id":"collab-privacy","kind":"privacy","label":"Privacidade","required":true,"version":"2.0","text":"Autorizo o tratamento dos dados informados para triagem da minha solicitação."},{"id":"collab-rights","kind":"content_rights","label":"Autorização de compartilhamento","required":true,"version":"2.0","text":"Confirmo que possuo autorização para compartilhar as informações e os materiais enviados."}]'::jsonb,
  '{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb,
  'Recebemos sua solicitação. Nossa equipe fará a triagem em Colaborações recebidas.',
  '{"key":"collaborate","name":"Colabore / Anuncie","slug":"colabore-anuncie","purpose":"editorial_submission","source":"system"}'::jsonb,
  now()
from form_row
on conflict(form_id,version) do nothing;

update site_forms
set name='Legado histórico ambíguo — formulário comercial/publicidade',
    slug='legacy-advertising-inquiry',
    status='inactive',
    retired_at=coalesce(retired_at,now()),
    updated_at=now()
where key='advertising-inquiry';

create or replace function enforce_canonical_system_form_identity()
returns trigger language plpgsql as $$
begin
  if new.retired_at is null and new.source='system' then
    if new.key='lead-capture' then
      new.name:='Contato Comercial';
      new.slug:='contato-comercial';
      new.purpose:='lead_capture';
      new.routing:='{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario","contato-comercial"]}}'::jsonb;
    elsif new.key='collaborate' then
      new.name:='Colabore / Anuncie';
      new.slug:='colabore-anuncie';
      new.purpose:='editorial_submission';
      new.routing:='{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb;
    else
      raise exception using message='Only lead-capture and collaborate may be operational system forms.', errcode='23514';
    end if;
  end if;
  if new.retired_at is null and new.source='custom' and lower(new.slug) in (
    'lead-capture','captacao-leads','captacao-de-leads','contato','contato-comercial',
    'collaborate','colabore','anuncie','anuncie-contato','advertising-inquiry','colabore-anuncie','contato-comercial-anuncie'
  ) then
    raise exception using message='Slug reserved for a canonical system form.', errcode='23514';
  end if;
  return new;
end $$;

drop trigger if exists trg_canonical_system_form_identity on site_forms;
create trigger trg_canonical_system_form_identity
before insert or update on site_forms
for each row execute function enforce_canonical_system_form_identity();

create or replace function enforce_canonical_system_form_version_identity()
returns trigger language plpgsql as $$
declare parent_key text; parent_source text; parent_retired_at timestamptz; candidate_slug text;
begin
  select key,source,retired_at into parent_key,parent_source,parent_retired_at from site_forms where id=new.form_id;
  candidate_slug:=lower(coalesce(new.definition_meta->>'slug',''));
  if parent_retired_at is null and parent_source='system' then
    if parent_key='lead-capture' then
      new.definition_meta:=coalesce(new.definition_meta,'{}'::jsonb) || '{"key":"lead-capture","name":"Contato Comercial","slug":"contato-comercial","purpose":"lead_capture","source":"system"}'::jsonb;
      new.routing:='{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario","contato-comercial"]}}'::jsonb;
    elsif parent_key='collaborate' then
      new.definition_meta:=coalesce(new.definition_meta,'{}'::jsonb) || '{"key":"collaborate","name":"Colabore / Anuncie","slug":"colabore-anuncie","purpose":"editorial_submission","source":"system"}'::jsonb;
      new.routing:='{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb;
    else
      raise exception using message='Only canonical system forms may receive operational versions.', errcode='23514';
    end if;
  elsif parent_retired_at is null and parent_source='custom' and candidate_slug in (
    'lead-capture','captacao-leads','captacao-de-leads','contato','contato-comercial',
    'collaborate','colabore','anuncie','anuncie-contato','advertising-inquiry','colabore-anuncie','contato-comercial-anuncie'
  ) then
    raise exception using message='Draft slug reserved for a canonical system form.', errcode='23514';
  end if;
  return new;
end $$;

drop trigger if exists trg_canonical_system_form_version_identity on site_form_versions;
create trigger trg_canonical_system_form_version_identity
before insert or update on site_form_versions
for each row execute function enforce_canonical_system_form_version_identity();

create index if not exists idx_site_forms_operational_system
  on site_forms(source,key)
  where source='system' and retired_at is null;

commit;
