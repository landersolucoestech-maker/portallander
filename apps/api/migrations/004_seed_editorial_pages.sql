begin;

-- Enforce the architectural rule: only Sobre, Colabore and Contato may use a non-editorial layout.
update editorial_pages
set page_type='editorial'
where slug not in ('sobre','colabore','contato')
  and page_type <> 'editorial';

alter table editorial_pages
  drop constraint if exists editorial_pages_layout_classification;

alter table editorial_pages
  add constraint editorial_pages_layout_classification check (
    (slug in ('sobre','colabore','contato') and page_type in ('institutional','special'))
    or
    (slug not in ('sobre','colabore','contato') and page_type='editorial')
  );

insert into editorial_pages(
  id,title,navigation_label,slug,description,page_type,status,active,visibility,
  show_in_main_menu,menu_order,sort_order,parent_id,seo,created_at,updated_at,published_at
) values
  ('page_noticias','Notícias','Notícias','noticias','Cobertura diária de acontecimentos, lançamentos e movimentos da cultura urbana.','editorial','published',true,'public',true,10,10,null,'{"metaTitle":"Notícias | Portal Lander","metaDescription":"Notícias e contexto sobre música, cultura urbana e entretenimento."}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_cultura','Cultura','Cultura','cultura','Histórias, comportamento, estética e movimentos culturais.','editorial','published',true,'public',true,20,20,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_lancamentos','Lançamentos','Lançamentos','lancamentos','Singles, clipes, projetos e novidades de catálogo.','editorial','published',true,'public',true,30,30,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_bastidores','Bastidores','Bastidores','bastidores','Processos, produção, carreira e acontecimentos por trás das entregas.','editorial','published',true,'public',true,40,40,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_sobre','Sobre o Portal','Sobre','sobre','Informações institucionais do Portal Lander.','institutional','published',true,'public',false,90,90,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_colabore','Colabore','Colabore','colabore','Envie pautas e materiais para análise da equipe editorial.','institutional','published',true,'public',false,91,91,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_contato','Contato','Contato','contato','Acesse os canais oficiais configurados pelo Portal Lander.','institutional','published',true,'public',false,92,92,null,'{}'::jsonb,'2026-01-10T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-01-10T12:00:00.000Z'),
  ('page_parcerias','Parcerias','Parcerias','parcerias','Informações sobre parcerias e oportunidades.','editorial','published',true,'public',false,93,93,null,'{}'::jsonb,'2026-02-01T12:00:00.000Z','2026-08-30T12:00:00.000Z','2026-02-01T12:00:00.000Z'),
  ('page_special_2026','Especial 2026','Especial','especial-2026','Cobertura especial em preparação.','editorial','draft',false,'private',false,100,100,null,'{"noIndex":true}'::jsonb,'2026-08-20T12:00:00.000Z','2026-08-30T12:00:00.000Z',null)
on conflict do nothing;

commit;
