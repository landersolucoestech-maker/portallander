import { Eye, Settings2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSection={name:string;summary:string;route:string}

const SITE_SECTIONS:SiteSection[]=[
  {name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',route:'hero'},
  {name:'Rodapé',summary:'Rodapé oficial da Homepage.',route:'rodape'},
]

const LEGACY_SECTION_KEYS=[
  'portal-lander:cms:section-config:grid:v4',
  'portal-lander:cms:section-config:ranking:v4',
  'portal-lander:cms:section-config:most-read:v4',
  'portal-lander:cms:section-config:secondary:v4',
  'portal-lander:cms:section-config:trending:v4',
  'portal-lander:cms:section-config:banner:v4',
  'portal-lander:cms:section-config:videos:v4',
  'portal-lander:cms:section-config:newsletter:v4',
  'portal-lander:cms:section-config:grid:v1',
  'portal-lander:cms:section-config:em-destaque:v1',
  'portal-lander:cms:section-config:mais-lidas:v1',
  'portal-lander:cms:section-config:ultimas-noticias:v1',
  'portal-lander:cms:section-config:em-alta:v1',
  'portal-lander:cms:section-config:horizontal-ad:v1',
  'portal-lander:cms:section-config:secao-anuncie-aqui:v1',
  'portal-lander:cms:section-config:releases:v1',
  'portal-lander:cms:section-config:lancamentos:v1',
  'portal-lander:cms:section-config:agenda:v1',
  'portal-lander:cms:section-config:footer:v1',
  'portal-lander:cms:section-config:rodape:v1',
]

function purgeLegacySectionData(){
  for(const key of LEGACY_SECTION_KEYS)localStorage.removeItem(key)
}

export function SiteSectionsPage(){
  useEffect(()=>{purgeLegacySectionData()},[])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Este módulo contém somente as duas seções mantidas: Hero Section e Rodapé. Estruturas antigas foram removidas do CMS.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções mantidas da página inicial">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.route}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Seção mantida</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
