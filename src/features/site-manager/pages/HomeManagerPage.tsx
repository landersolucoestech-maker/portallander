import { ArrowRight, LayoutGrid, PanelsTopLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'

const sections=[
  {name:'Hero / Destaques principais',state:'Local no navegador',editable:true,description:'Carrossel principal da Home. O editor atual persiste somente neste navegador.',to:'/app/site/home/hero',countLabel:'Editor local'},
  {name:'Em destaque',state:'Snapshot compartilhado',editable:false,description:'Cards exibidos na Home pública vêm do read model compartilhado.',countLabel:`${homeReadModel.featuredStories.length} cards`},
  {name:'Mais lidas',state:'Snapshot compartilhado',editable:false,description:'Ranking ainda não possui analytics real, mas já usa a mesma fonte da Home pública.',countLabel:`${homeReadModel.mostRead.length} itens`},
  {name:'Últimas notícias',state:'Snapshot compartilhado',editable:false,description:'Bloco visual usa o read model único da Home em vez de dados duplicados no componente.',countLabel:`${homeReadModel.latestStories.length} cards`},
  {name:'Categorias',state:'Modelo editorial',editable:false,description:'Navegação é derivada das páginas editoriais configuradas para o menu.',countLabel:'Fonte editorial'},
  {name:'Lançamentos',state:'Snapshot compartilhado',editable:false,description:'Cards de lançamentos agora vêm da mesma fonte consumida pela Home pública.',countLabel:`${homeReadModel.releases.length} lançamentos`},
  {name:'Agenda',state:'Snapshot compartilhado',editable:false,description:'Eventos exibidos na Home usam um inventário centralizado, ainda sem persistência.',countLabel:`${homeReadModel.agenda.length} eventos`},
]

export function HomeManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Home" title="Home" description="Mapa administrativo das seções exibidas na página inicial e da origem atual de cada bloco."/>
    <AdminNotice title="Estado da Home" description={`${ADMIN_CAPABILITIES.editorialPersistence.description} A Home pública e este painel já compartilham o mesmo read model para os blocos estáticos; somente o Hero possui edição local neste momento.`}/>
    <div className="home-section-grid">{sections.map(section=><article className="home-section-card" key={section.name}><div className="home-section-card-head"><span className="home-section-icon" aria-hidden="true">{section.editable?<PanelsTopLeft size={16}/>:<LayoutGrid size={16}/>}</span><span className={`status ${section.editable?'negociacao':''}`}>{section.state}</span></div><h2>{section.name}</h2><p>{section.description}</p><small className="home-section-count">{section.countLabel}</small>{section.to?<Link className="home-section-link" to={section.to}>Abrir editor <ArrowRight size={14} aria-hidden="true"/></Link>:<span className="home-section-unavailable">Edição indisponível sem persistência</span>}</article>)}</div>
  </AdminShell>
}
