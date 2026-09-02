begin;

insert into editorial_page_sections (id,page_key,page_id,name,slug,sort_order)
values
  ('home-em-destaque','home',null,'Em Destaque','em-destaque',10),
  ('home-mais-lidas','home',null,'Mais Lidas','mais-lidas',20),
  ('home-ultimas-noticias','home',null,'Últimas Notícias','ultimas-noticias',30),
  ('home-publicidade-lateral','home',null,'Publicidade Lateral','publicidade-lateral',40),
  ('home-em-alta','home',null,'Em Alta','em-alta',50),
  ('home-anuncie-aqui','home',null,'Anuncie Aqui','anuncie-aqui',60),
  ('home-lancamentos','home',null,'Lançamentos','lancamentos',70),
  ('home-agenda','home',null,'Agenda','agenda',80)
on conflict (page_key,slug) do nothing;

commit;
