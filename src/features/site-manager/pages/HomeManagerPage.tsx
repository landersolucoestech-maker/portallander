import { ArrowRight, LayoutGrid, PanelsTopLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'

const sections=[
  {name:'Hero / Destaques principais',state:'Local no navegador',editable:true,description:'Carrossel principal da Home. O editor atual persiste somente neste navegador.',to:'/app/site/home/hero'},
  {name:'Em destaque',state:'Frontend estático',editable:false,description:'Cards editoriais ainda estão definidos no snapshot da Home pública.'},
  {name:'Mais lidas',state:'Frontend estático',editable:false,description:'Ranking atual ainda não possui fonte de analytics ou CMS conectada.'},
  {name:'Últimas notícias',state:'Frontend estático',editable:false,description:'Bloco visual ainda usa dados de compatibilidade da Home.'},
  {name:'Categorias',state:'Modelo editorial',editable:false,description:'Navegação é derivada das páginas editoriais configuradas para o menu.'},
  {name:'Lançamentos',state:'Frontend estático',editable:false,description:'Cards de lançamentos ainda não possuem coleção persistente própria.'},
  {name:'Agenda',state:'Frontend estático',editable:false,description:'Eventos exibidos na Home ainda não possuem módulo persistente.'},
]

export function HomeManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Home" title="Home" description="Mapa administrativo das seções exibidas na página inicial e da origem atual de cada bloco."/>
    <AdminNotice title="Estado da Home" description={`${ADMIN_CAPABILITIES.editorialPersistence.description} Somente o Hero possui edição local neste momento; os demais blocos permanecem em leitura até terem uma fonte persistente própria.`}/>
    <div className="home-section-grid">{sections.map(section=><article className="home-section-card" key={section.name}><div className="home-section-card-head"><span className="home-section-icon" aria-hidden="true">{section.editable?<PanelsTopLeft size={16}/>:<LayoutGrid size={16}/>}</span><span className={`status ${section.editable?'negociacao':''}`}>{section.state}</span></div><h2>{section.name}</h2><p>{section.description}</p>{section.to?<Link className="home-section-link" to={section.to}>Abrir editor <ArrowRight size={14} aria-hidden="true"/></Link>:<span className="home-section-unavailable">Edição indisponível sem persistência</span>}</article>)}</div>
  </AdminShell>
}
