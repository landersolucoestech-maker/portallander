import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSectionKey='hero'|'grid'|'most-read'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'

const SITE_SECTIONS:{key:SiteSectionKey;name:string;summary:string;route:string}[]=[
  {key:'hero',name:'Hero principal',summary:'Destaque principal da página, com título, CTA, imagem, Barra Agora e aparência.',route:'hero'},
  {key:'grid',name:'Grid principal',summary:'Bloco editorial principal. Estrutura fixa de 3 cards por linha no desktop.',route:'grid-principal'},
  {key:'most-read',name:'Mais Lidas',summary:'Lista Mais Lidas fixa na lateral direita do Grid principal.',route:'mais-lidas'},
  {key:'side-ad',name:'Publicidade lateral',summary:'Slot publicitário fixo abaixo de Mais Lidas.',route:'publicidade-lateral'},
  {key:'secondary',name:'Últimas Notícias',summary:'Bloco editorial de últimas notícias exibido antes de Em Alta.',route:'ultimas-noticias'},
  {key:'trending',name:'Em alta',summary:'Lista Em Alta fixa ao lado de Últimas Notícias.',route:'em-alta'},
  {key:'banner',name:'Banner horizontal',summary:'Slot publicitário horizontal entre os blocos da Home.',route:'banner-horizontal'},
  {key:'videos',name:'Vídeos',summary:'Seção audiovisual com conteúdos vindos do módulo de Conteúdos.',route:'videos'},
  {key:'agenda',name:'Agenda / Eventos',summary:'Agenda fixa na lateral da seção de Vídeos.',route:'agenda'},
  {key:'newsletter',name:'Newsletter',summary:'Faixa de inscrição exibida antes do rodapé.',route:'newsletter'},
  {key:'footer',name:'Footer',summary:'Rodapé institucional, links e redes sociais.',route:'footer'},
]

export function SiteSectionsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Configure somente as seções e sua aparência. Conteúdos editoriais continuam no módulo Conteúdos.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções da página inicial">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.key}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Posição definida pelo layout oficial</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
