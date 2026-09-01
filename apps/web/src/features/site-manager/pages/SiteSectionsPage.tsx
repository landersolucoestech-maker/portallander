import { Eye, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/site-sections.css'

type SiteSection={name:string;summary:string;route:string}

const SITE_SECTIONS:SiteSection[]=[
  {name:'Hero principal',summary:'Hero real da Home. A Barra “AGORA” continua integrada e configurada dentro dele.',route:'hero'},
  {name:'Grid principal',summary:'Primeiro grid editorial da Home, exibido publicamente com o cabeçalho “EM DESTAQUE”.',route:'grid-principal'},
  {name:'Mais Lidas',summary:'Lista “MAIS LIDAS” posicionada na lateral direita do Grid principal.',route:'mais-lidas'},
  {name:'Publicidade lateral',summary:'Publicidade posicionada abaixo de Mais Lidas na mesma lateral direita.',route:'publicidade-lateral'},
  {name:'Últimas Notícias',summary:'Seção “ÚLTIMAS NOTÍCIAS” exibida abaixo do primeiro bloco editorial.',route:'ultimas-noticias'},
  {name:'Em Alta',summary:'Lista “EM ALTA” posicionada à direita de Últimas Notícias.',route:'em-alta'},
  {name:'Publicidade horizontal',summary:'Publicidade horizontal exibida entre Últimas Notícias e Lançamentos.',route:'publicidade-horizontal'},
  {name:'Lançamentos',summary:'Seção “LANÇAMENTOS” exibida abaixo da publicidade horizontal.',route:'lancamentos'},
  {name:'Agenda',summary:'Seção “AGENDA” posicionada à direita de Lançamentos.',route:'agenda'},
  {name:'Rodapé',summary:'Rodapé institucional que encerra a página inicial.',route:'rodape'},
]

export function SiteSectionsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Esta lista espelha exclusivamente os blocos que existem hoje na Página inicial. Não há seções legadas ou paralelas.'}}>
    <div className="site-sections-toolbar">
      <label>Página<select defaultValue="home"><option value="home">Página inicial</option></select></label>
      <a href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>
    <div className="site-sections-list" role="table" aria-label="Seções reais da página inicial">
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {SITE_SECTIONS.map((section,index)=><div className="site-sections-row" role="row" key={section.route}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Posição definida pela estrutura atual da Home</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={`/app/site/secoes/home/${section.route}`}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>
  </AdminShell>
}
