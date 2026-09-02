begin;

with form_row as (
  insert into site_forms(key,name,slug,purpose,status,source,routing,success_message)
  values(
    'lead-capture','Captação de Leads','captacao-leads','lead_capture','draft','system',
    '{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario"]}}'::jsonb,
    'Recebemos seus dados. Nossa equipe entrará em contato.'
  )
  on conflict(key) do update set
    name=excluded.name,slug=excluded.slug,purpose=excluded.purpose,status=excluded.status,source=excluded.source,
    routing=excluded.routing,success_message=excluded.success_message,updated_at=now()
  returning id
)
insert into site_form_versions(form_id,version,fields,consents,routing,success_message,published_at)
select id,1,
  '[{"id":"lead-name","key":"name","label":"Nome","type":"text","required":true,"placeholder":"Nome completo","order":1},{"id":"lead-email","key":"email","label":"E-mail","type":"email","required":true,"placeholder":"voce@empresa.com","order":2},{"id":"lead-phone","key":"phone","label":"Telefone / WhatsApp","type":"tel","required":false,"order":3},{"id":"lead-company","key":"company","label":"Empresa / Marca","type":"text","required":false,"order":4},{"id":"lead-message","key":"message","label":"Como podemos ajudar?","type":"textarea","required":true,"order":5}]'::jsonb,
  '[{"id":"lead-privacy","kind":"privacy","label":"Privacidade","required":true,"version":"1.0","text":"Autorizo o tratamento dos dados informados para atendimento da minha solicitação."}]'::jsonb,
  '{"destination":"crm","crm":{"origin":"formulario_portal","tags":["site","formulario"]}}'::jsonb,
  'Recebemos seus dados. Nossa equipe entrará em contato.',null
from form_row
on conflict(form_id,version) do update set fields=excluded.fields,consents=excluded.consents,routing=excluded.routing,success_message=excluded.success_message;

with form_row as (
  insert into site_forms(key,name,slug,purpose,status,source,routing,success_message)
  values(
    'collaborate','Colabore','colabore','editorial_submission','active','system',
    '{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb,
    'Material recebido. Nossa equipe editorial fará a triagem.'
  )
  on conflict(key) do update set
    name=excluded.name,slug=excluded.slug,purpose=excluded.purpose,status=excluded.status,source=excluded.source,
    routing=excluded.routing,success_message=excluded.success_message,updated_at=now()
  returning id
)
insert into site_form_versions(form_id,version,fields,consents,routing,success_message,published_at)
select id,1,
  '[{"id":"collab-name","key":"nome","label":"Seu nome","type":"text","required":true,"placeholder":"Nome completo","order":1},{"id":"collab-email","key":"email","label":"E-mail","type":"email","required":true,"order":2},{"id":"collab-whatsapp","key":"whatsapp","label":"WhatsApp","type":"tel","required":false,"order":3},{"id":"collab-location","key":"local","label":"Cidade / Estado","type":"text","required":false,"order":4},{"id":"collab-title","key":"titulo","label":"Título","type":"text","required":true,"order":5},{"id":"collab-type","key":"tipo","label":"Assunto / Tipo de conteúdo","type":"select","required":true,"options":["noticia","video","foto","pauta"],"order":6},{"id":"collab-message","key":"mensagem","label":"Conte a história","type":"textarea","required":true,"order":7},{"id":"collab-source","key":"fonte","label":"Fonte ou link de referência","type":"url","required":false,"order":8},{"id":"collab-file","key":"arquivo","label":"Arquivo de apoio","type":"file","required":false,"order":9}]'::jsonb,
  '[{"id":"collab-rights","kind":"content_rights","label":"Autorização de compartilhamento","required":true,"version":"1.0","text":"Confirmo que as informações são verdadeiras e que possuo autorização para compartilhar os materiais anexados quando necessário."}]'::jsonb,
  '{"destination":"content_collaborations","collaboration":{"defaultStatus":"received","defaultPriority":"normal"}}'::jsonb,
  'Material recebido. Nossa equipe editorial fará a triagem.',now()
from form_row
on conflict(form_id,version) do update set fields=excluded.fields,consents=excluded.consents,routing=excluded.routing,success_message=excluded.success_message,published_at=coalesce(site_form_versions.published_at,excluded.published_at);

commit;
