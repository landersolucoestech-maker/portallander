begin;

insert into editorial_section_configurations(page_key,section_slug,configuration,created_at,updated_at)
select page_key,
       case section_slug
         when 'publicidade-lateral' then 'sidebar-advertising'
         when 'anuncie-aqui' then 'advertising-cta'
         when 'mais-lidas' then 'most-read'
         when 'em-destaque' then 'featured'
         when 'ultimas-noticias' then 'latest-news'
         when 'lancamentos' then 'releases'
         when 'em-alta' then 'trending'
         when 'sobre-hero' then 'about-hero'
         when 'contato-hero' then 'contact-hero'
         when 'colabore-hero' then 'collaborate-hero'
         else section_slug
       end,
       configuration,created_at,updated_at
from editorial_section_configurations
where section_slug in ('publicidade-lateral','anuncie-aqui','mais-lidas','em-destaque','ultimas-noticias','lancamentos','em-alta','sobre-hero','contato-hero','colabore-hero')
on conflict(page_key,section_slug) do update
set configuration=excluded.configuration,
    updated_at=greatest(editorial_section_configurations.updated_at,excluded.updated_at);

delete from editorial_section_configurations
where section_slug in ('publicidade-lateral','anuncie-aqui','mais-lidas','em-destaque','ultimas-noticias','lancamentos','em-alta','sobre-hero','contato-hero','colabore-hero');

delete from editorial_page_sections old
where old.slug in ('publicidade-lateral','anuncie-aqui','mais-lidas','em-destaque','ultimas-noticias','lancamentos','em-alta','sobre-hero','contato-hero','colabore-hero')
  and exists (
    select 1 from editorial_page_sections current
    where current.page_key=old.page_key
      and current.slug=case old.slug
        when 'publicidade-lateral' then 'sidebar-advertising'
        when 'anuncie-aqui' then 'advertising-cta'
        when 'mais-lidas' then 'most-read'
        when 'em-destaque' then 'featured'
        when 'ultimas-noticias' then 'latest-news'
        when 'lancamentos' then 'releases'
        when 'em-alta' then 'trending'
        when 'sobre-hero' then 'about-hero'
        when 'contato-hero' then 'contact-hero'
        when 'colabore-hero' then 'collaborate-hero'
      end
  );

update editorial_page_sections
set slug=case slug
  when 'publicidade-lateral' then 'sidebar-advertising'
  when 'anuncie-aqui' then 'advertising-cta'
  when 'mais-lidas' then 'most-read'
  when 'em-destaque' then 'featured'
  when 'ultimas-noticias' then 'latest-news'
  when 'lancamentos' then 'releases'
  when 'em-alta' then 'trending'
  when 'sobre-hero' then 'about-hero'
  when 'contato-hero' then 'contact-hero'
  when 'colabore-hero' then 'collaborate-hero'
  else slug end
where slug in ('publicidade-lateral','anuncie-aqui','mais-lidas','em-destaque','ultimas-noticias','lancamentos','em-alta','sobre-hero','contato-hero','colabore-hero');

commit;
