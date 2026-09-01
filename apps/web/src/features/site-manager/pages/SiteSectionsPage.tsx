import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSection={name:string;summary:string;route:string}

// Fonte de verdade visual: apps/web/src/pages/home/PublicHome.tsx.
// Hero, Grid principal, Mais Lidas e Publicidade lateral são preservados.
// Todo o restante abaixo foi reconstruído com os nomes/blocos que realmente existem na Home pública.
const SITE_SECTIONS:SiteSection[]=[
  {name:'Hero principal',summary:'Hero real da Home. A Barra “AGORA” faz parte dele e é configurada dentro do próprio Hero.',route:'hero'},
  {name:'Grid principal',summary:'Primeiro grid editorial da Home; no site público o cabeçalho desse bloco é “EM DESTAQUE”.',route:'grid-principal'},
  {name:'Mais Lidas',summary:'Lista “MAIS LIDAS” posicionada na lateral direita do Grid principal.',route:'mais-lidas'},
  {name:'Publicidade lateral',summary:'Publicidade posicionada abaixo de Mais Lidas na mesma lateral direita.',route:'publicidade-lateral'},
  {name:'Últimas Notícias',summary:'Seção “ÚLTIMAS NOTÍCIAS” exibida abaixo do primeiro bloco editorial.',route:'ultimas-noticias'},
  {name:'Em Alta',summary:'Lista “EM ALTA” posicionada à direita de Últimas Notícias.',route:'em-alta'},
  {name:'Banner horizontal',summary:'Publicidade horizontal exibida entre Últimas Notícias e Lançamentos.',route:'banner-horizontal'},
  {name:'Lançamentos',summary:'Seção “LANÇAMENTOS” exibida abaixo do banner horizontal.',route:'lancamentos'},
  {name:'Agenda',summary:'Seção “AGENDA” posicionada à direita de Lançamentos.',route:'agenda'},
  {name:'Footer',summary:'Rodapé institucional que encerra a página inicial.',route:'footer'},
]

export function SiteSectionsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Estrutura reconstruída para espelhar somente as seções realmente renderizadas na Página inicial. Conteúdos editoriais continuam no módulo Conteúdos.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções reais da página inicial">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.route}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Posição definida pelo layout real da Home</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
