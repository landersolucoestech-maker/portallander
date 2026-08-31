import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSectionKey='hero'|'ticker'|'grid'|'ranking'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'

const SITE_SECTIONS:{key:SiteSectionKey;name:string;summary:string;route:string}[]=[
  {key:'hero',name:'Hero principal',summary:'Destaque principal da página, com título, CTA, imagem e aparência.',route:'hero'},
  {key:'ticker',name:'Barra Agora',summary:'Faixa de chamadas exibida imediatamente abaixo do Hero.',route:'barra-agora'},
  {key:'grid',name:'Grid principal',summary:'Bloco editorial principal. Estrutura fixa de 3 cards por linha no desktop.',route:'grid-principal'},
  {key:'ranking',name:'Ranking',summary:'Lista de ranking fixa na lateral direita do Grid principal.',route:'ranking'},
  {key:'side-ad',name:'Publicidade lateral',summary:'Slot publicitário fixo abaixo do Ranking.',route:'publicidade-lateral'},
  {key:'secondary',name:'Destaques secundários',summary:'Segundo bloco editorial da página inicial.',route:'destaques'},
  {key:'trending',name:'Em alta',summary:'Lista lateral fixa ao lado dos Destaques secundários.',route:'em-alta'},
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
