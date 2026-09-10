begin;

insert into editorial_section_configurations(page_key,section_slug,configuration,created_at,updated_at)
select page_key,
       case section_slug
         when 'colabore-diretrizes' then 'collaborate-guidelines'
         when 'colabore-formulario' then 'collaborate-form'
         when 'contato-canais' then 'contact-channels'
         when 'sobre-conteudo' then 'about-content'
         else section_slug
       end,
       configuration,created_at,updated_at
from editorial_section_configurations
where section_slug in ('colabore-diretrizes','colabore-formulario','contato-canais','sobre-conteudo')
on conflict(page_key,section_slug) do update
set configuration=excluded.configuration,
    updated_at=greatest(editorial_section_configurations.updated_at,excluded.updated_at);

delete from editorial_section_configurations
where section_slug in ('colabore-diretrizes','colabore-formulario','contato-canais','sobre-conteudo');

delete from editorial_page_sections old
where old.slug in ('colabore-diretrizes','colabore-formulario','contato-canais','sobre-conteudo')
  and exists (
    select 1 from editorial_page_sections current
    where current.page_key=old.page_key
      and current.slug=case old.slug
        when 'colabore-diretrizes' then 'collaborate-guidelines'
        when 'colabore-formulario' then 'collaborate-form'
        when 'contato-canais' then 'contact-channels'
        when 'sobre-conteudo' then 'about-content'
      end
  );

update editorial_page_sections
set slug=case slug
  when 'colabore-diretrizes' then 'collaborate-guidelines'
  when 'colabore-formulario' then 'collaborate-form'
  when 'contato-canais' then 'contact-channels'
  when 'sobre-conteudo' then 'about-content'
  else slug end
where slug in ('colabore-diretrizes','colabore-formulario','contato-canais','sobre-conteudo');

commit;
