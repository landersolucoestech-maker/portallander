import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSectionKey='hero'|'grid'|'most-read'|'side-ad'|'latest'|'trending'|'banner'|'releases'|'agenda'|'footer'

const SITE_SECTIONS:{key:SiteSectionKey;name:string;summary:string;route:string}[]=[
  {key:'hero',name:'Hero principal',summary:'Destaque principal da Home. A Barra “Agora” permanece integrada e configurada dentro do próprio Hero.',route:'hero'},
  {key:'grid',name:'Grid principal',summary:'Primeiro bloco editorial da Home, com a estrutura real utilizada no site.',route:'grid-principal'},
  {key:'most-read',name:'Mais Lidas',summary:'Lista lateral exibida à direita do Grid principal.',route:'mais-lidas'},
  {key:'side-ad',name:'Publicidade lateral',summary:'Publicidade exibida abaixo de Mais Lidas na lateral direita.',route:'publicidade-lateral'},
  {key:'latest',name:'Últimas Notícias',summary:'Segundo bloco editorial da Home, exibido abaixo do Grid principal.',route:'ultimas-noticias'},
  {key:'trending',name:'Em Alta',summary:'Lista “Em Alta” exibida ao lado de Últimas Notícias.',route:'em-alta'},
  {key:'banner',name:'Banner horizontal',summary:'Publicidade horizontal exibida entre Últimas Notícias e Lançamentos.',route:'banner-horizontal'},
  {key:'releases',name:'Lançamentos',summary:'Bloco de lançamentos exibido na parte inferior da Home.',route:'lancamentos'},
  {key:'agenda',name:'Agenda',summary:'Agenda de eventos exibida ao lado de Lançamentos.',route:'agenda'},
  {key:'footer',name:'Footer',summary:'Rodapé institucional exibido no encerramento da página.',route:'footer'},
]

export function SiteSectionsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'As seções abaixo refletem a estrutura real atualmente renderizada na Página inicial. Conteúdos editoriais continuam no módulo Conteúdos.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções reais da página inicial">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.key}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Posição definida pelo layout real da Home</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
