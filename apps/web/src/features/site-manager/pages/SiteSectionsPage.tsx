import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSection={name:string;summary:string;route:string}

const SITE_SECTIONS:SiteSection[]=[
  {name:'Hero Section',summary:'Hero oficial da Homepage.',route:'hero'},
  {name:'Ticker',summary:'Ticker oficial imediatamente abaixo do Hero Section; sua configuração permanece no mesmo editor do Hero.',route:'ticker'},
  {name:'Em Destaque',summary:'Seção “EM DESTAQUE” da Homepage.',route:'em-destaque'},
  {name:'Mais Lidas',summary:'Seção “MAIS LIDAS” da Homepage.',route:'mais-lidas'},
  {name:'Últimas Notícias',summary:'Seção “ÚLTIMAS NOTÍCIAS” da Homepage.',route:'ultimas-noticias'},
  {name:'Publicidade Lateral',summary:'Seção de publicidade lateral da Homepage.',route:'publicidade-lateral'},
  {name:'Em Alta',summary:'Seção “EM ALTA” da Homepage.',route:'em-alta'},
  {name:'Seção Anuncie Aqui',summary:'Seção publicitária “ANUNCIE AQUI” da Homepage.',route:'secao-anuncie-aqui'},
  {name:'Lançamentos',summary:'Seção “LANÇAMENTOS” da Homepage.',route:'lancamentos'},
  {name:'Agenda',summary:'Seção “AGENDA” da Homepage.',route:'agenda'},
  {name:'Rodapé',summary:'Rodapé oficial da Homepage.',route:'rodape'},
]

export function SiteSectionsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Fonte de verdade da Homepage: somente as seções oficiais, com os nomes e a ordem definidos para a página pública.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções oficiais da Homepage">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.route}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Ordem oficial da Homepage</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
