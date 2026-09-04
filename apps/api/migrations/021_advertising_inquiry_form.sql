begin;

with form_row as (
  insert into site_forms(key,name,slug,purpose,status,source,routing,success_message)
  values(
    'advertising-inquiry','Contato Comercial · Anuncie','anuncie-contato','advertising','active','system',
    '{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","anuncie","publicidade"]}}'::jsonb,
    'Recebemos sua solicitação comercial. A equipe do Portal Lander fará a triagem pelo CRM.'
  )
  on conflict(key) do update set
    name=excluded.name,
    slug=excluded.slug,
    purpose=excluded.purpose,
    status=excluded.status,
    source=excluded.source,
    routing=excluded.routing,
    success_message=excluded.success_message,
    updated_at=now()
  returning id
)
insert into site_form_versions(form_id,version,fields,consents,routing,success_message,definition_meta,published_at)
select id,1,
  '[{"id":"ads-name","key":"name","label":"Nome","type":"text","required":true,"placeholder":"Seu nome","order":1},{"id":"ads-email","key":"email","label":"E-mail profissional","type":"email","required":true,"placeholder":"voce@empresa.com","order":2},{"id":"ads-phone","key":"phone","label":"Telefone / WhatsApp","type":"tel","required":false,"order":3},{"id":"ads-company","key":"company","label":"Empresa / Marca","type":"text","required":true,"placeholder":"Nome da empresa ou marca","order":4},{"id":"ads-type","key":"type","label":"Perfil comercial","type":"select","required":true,"options":["anunciante","patrocinador","agencia_publicidade","parceiro_comercial","outro"],"order":5},{"id":"ads-service","key":"service","label":"Interesse comercial","type":"select","required":true,"options":["banner_publicitario","materia_patrocinada","campanha_publicitaria","publicacao_comercial","patrocinio","parceria_comercial","outro"],"order":6},{"id":"ads-message","key":"message","label":"Conte sobre a oportunidade","type":"textarea","required":true,"placeholder":"Objetivo, campanha, período e outras informações relevantes","order":7}]'::jsonb,
  '[{"id":"ads-privacy","kind":"privacy","label":"Privacidade","required":true,"version":"1.0","text":"Autorizo o tratamento dos dados informados para que o Portal Lander responda a esta solicitação comercial."}]'::jsonb,
  '{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","anuncie","publicidade"]}}'::jsonb,
  'Recebemos sua solicitação comercial. A equipe do Portal Lander fará a triagem pelo CRM.',
  '{"key":"advertising-inquiry","name":"Contato Comercial · Anuncie","slug":"anuncie-contato","purpose":"advertising","source":"system"}'::jsonb,
  now()
from form_row
on conflict(form_id,version) do nothing;

commit;
