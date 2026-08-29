import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, CircleDollarSign, FileText, Globe2, Images, LayoutDashboard, Megaphone, Newspaper, Search, Settings, Tags, TrendingUp, UserPlus, Users } from 'lucide-react'
import { EditorialContentsAdmin, EditorialPagesAdmin } from '../features/editorial/components/EditorialAdmin'
import { editorialReadModel } from '../features/editorial/repository'
import { AdminEmpty, AdminKpi, AdminPageHeader, AdminShell } from '../shared/internal/AdminUi'

const contacts = [
  { name: 'Marina Costa', company: 'Norte Produções', status: 'Lead', owner: 'Comercial', value: 'R$ 18.000' },
  { name: 'Rafael Alves', company: 'Estúdio Horizonte', status: 'Cliente', owner: 'Deyvisson', value: 'R$ 32.500' },
  { name: 'Camila Rocha', company: 'Aurora Music', status: 'Negociação', owner: 'Comercial', value: 'R$ 24.000' },
  { name: 'Bruno Lima', company: 'BL Eventos', status: 'Contato', owner: 'Equipe', value: 'R$ 7.500' },
]

const crmNav = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['Contatos',Users,'/app/crm/contatos'],
  ['Negócios',BriefcaseBusiness,'/app/crm/negocios'],
  ['Atividades',CalendarDays,'/app/crm/atividades'],
  ['Pipeline',TrendingUp,'/app/crm/pipeline'],
  ['Campanhas',Megaphone,'/app/crm/campanhas'],
  ['Relatórios',BarChart3,'/app/crm/relatorios'],
  ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
] as const

const cmsNav = [
  ['Dashboard',LayoutDashboard,'/app/site'],
  ['Páginas',Globe2,'/app/site/paginas'],
  ['Conteúdos',FileText,'/app/site/conteudos'],
  ['Categorias',Tags,'/app/site/categorias'],
  ['Mídia',Images,'/app/site/midia'],
  ['Mídia Kit',Newspaper,'/app/site/midia-kit'],
  ['Configurações',Settings,'/app/site/configuracoes'],
] as const

const statusClass=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-')

function WorkspaceHome() {
  return <div className="workspace-picker">
    <div className="picker-copy">
      <span className="kicker">Portal Lander · Área interna</span>
      <h1>Operação em dois workspaces.</h1>
      <p>CRM para relacionamento e operação comercial. Gerenciador do Site para conteúdo, páginas e estrutura editorial.</p>
    </div>
    <div className="workspace-cards">
      <Link to="/app/crm" className="workspace-card"><div className="workspace-icon"><BriefcaseBusiness/></div><span>Relacionamento e vendas</span><h2>CRM</h2><p>Contatos, oportunidades, atividades, pipeline, campanhas e visão financeira da operação.</p><ArrowRight/></Link>
      <Link to="/app/site" className="workspace-card"><div className="workspace-icon"><Globe2/></div><span>Conteúdo e publicação</span><h2>Gerenciador do Site</h2><p>Páginas, conteúdos, categorias, mídia e estrutura editorial do Portal Lander.</p><ArrowRight/></Link>
    </div>
    <Link className="back-site" to="/">← Voltar ao site público</Link>
  </div>
}

function CrmDashboard() {
  return <AdminShell area="crm" items={crmNav}>
    <AdminPageHeader eyebrow="CRM / Dashboard" title="Dashboard" description="Visão operacional de relacionamentos, oportunidades e movimentação comercial." action="Novo contato"/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Contatos" value="248" detail="+18 neste mês" icon={<Users size={16}/>}/>
      <AdminKpi label="Leads" value="42" detail="12 qualificados" icon={<UserPlus size={16}/>}/>
      <AdminKpi label="Clientes" value="31" detail="5 em atividade" icon={<BriefcaseBusiness size={16}/>}/>
      <AdminKpi label="Pipeline" value="R$ 82k" detail="Valor em negociação" icon={<TrendingUp size={16}/>}/>
    </div>
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Relacionamentos</span><h2>Contatos recentes</h2></div><Link to="/app/crm/contatos" className="button outline">Ver todos</Link></div>
        {contacts.map(contact=><div className="compact-row" key={contact.name}><div className="table-avatar">{contact.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</div><div className="grow"><b>{contact.name}</b><small>{contact.company} · {contact.owner}</small></div><span className={`status ${statusClass(contact.status)}`}>{contact.status}</span><strong>{contact.value}</strong></div>)}
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Agenda comercial</span><h2>Próximas atividades</h2></div></div>
        {['Retornar proposta — Aurora Music','Reunião — Norte Produções','Follow-up — BL Eventos'].map((item,index)=><div className="activity-row" key={item}><span>{['10:30','14:00','16:15'][index]}</span><div><b>{item}</b><small>{['Ligação','Reunião','WhatsApp'][index]}</small></div></div>)}
      </section>
    </div>
  </AdminShell>
}

function Contacts() {
  return <AdminShell area="crm" items={crmNav}>
    <AdminPageHeader eyebrow="CRM / Contatos" title="Contatos" description="Pessoas e empresas relacionadas comercial ou institucionalmente ao portal." action="Novo contato"/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><div className="searchbox"><Search size={16}/><input placeholder="Buscar por nome, empresa ou responsável..."/></div><button className="admin-filter" type="button">Todos os status</button></div><span className="admin-breadcrumb">{contacts.length} contatos exibidos</span></div>
    <section className="table-card"><table><thead><tr><th>Contato</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th></tr></thead><tbody>{contacts.map(c=><tr key={c.name}><td><div className="table-primary"><span className="table-avatar">{c.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{c.name}</b><small>Contato comercial</small></div></div></td><td>{c.company}</td><td><span className={`status ${statusClass(c.status)}`}>{c.status}</span></td><td>{c.owner}</td><td><strong>{c.value}</strong></td></tr>)}</tbody></table></section>
  </AdminShell>
}

function CmsDashboard() {
  const pages=editorialReadModel.pages
  const contents=editorialReadModel.contents
  const published=contents.filter(item=>item.status==='published'&&item.active).length
  const menuPages=pages.filter(page=>page.showInMainMenu).length

  return <AdminShell area="cms" items={cmsNav}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Dashboard" title="Dashboard" description="Arquitetura editorial, publicação e estrutura das páginas que alimentam o portal público."/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Páginas" value={String(pages.length)} detail="Estruturas cadastradas" icon={<Globe2 size={16}/>}/>
      <AdminKpi label="Conteúdos" value={String(contents.length)} detail="Itens no catálogo atual" icon={<FileText size={16}/>}/>
      <AdminKpi label="Publicados" value={String(published)} detail="Visíveis no portal" icon={<Newspaper size={16}/>}/>
      <AdminKpi label="No menu" value={String(menuPages)} detail="Entradas editoriais" icon={<LayoutDashboard size={16}/>}/>
    </div>
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Arquitetura editorial</span><h2>Estrutura consolidada</h2></div></div>
        <p>Páginas e conteúdos utilizam o mesmo modelo e o mesmo contrato de leitura. A estrutura pública consome essa fonte editorial única.</p>
        <div className="admin-actions-row"><Link className="button dark" to="/app/site/paginas">Gerenciar páginas</Link><Link className="button outline" to="/app/site/conteudos">Gerenciar conteúdos</Link></div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Infraestrutura</span><h2>Persistência editorial</h2></div></div>
        <p>O projeto ainda não possui backend, banco ou API editorial. Escritas continuam bloqueadas para não simular persistência.</p>
      </section>
    </div>
  </AdminShell>
}

function CmsPages(){return <AdminShell area="cms" items={cmsNav}><EditorialPagesAdmin/></AdminShell>}
function CmsContents(){return <AdminShell area="cms" items={cmsNav}><EditorialContentsAdmin/></AdminShell>}

function Placeholder({area,title}:{area:'crm'|'cms',title:string}) {
  const items=area==='crm'?crmNav:cmsNav
  return <AdminShell area={area} items={items}><AdminPageHeader eyebrow={area==='crm'?`CRM / ${title}`:`Gerenciador do Site / ${title}`} title={title} description="A área já utiliza a nova identidade visual e permanece sem comportamento simulado até a implementação funcional."/><AdminEmpty title={`${title} ainda não implementado`} description="Nenhuma funcionalidade falsa foi adicionada. Este módulo será conectado à infraestrutura real quando sua implementação funcional entrar no escopo."/></AdminShell>
}

export default function LegacyApp() {
  return <Routes>
    <Route path="/app" element={<WorkspaceHome/>}/>
    <Route path="/app/crm" element={<CrmDashboard/>}/>
    <Route path="/app/crm/contatos" element={<Contacts/>}/>
    <Route path="/app/crm/negocios" element={<Placeholder area="crm" title="Negócios"/>}/>
    <Route path="/app/crm/atividades" element={<Placeholder area="crm" title="Atividades"/>}/>
    <Route path="/app/crm/pipeline" element={<Placeholder area="crm" title="Pipeline comercial"/>}/>
    <Route path="/app/crm/campanhas" element={<Placeholder area="crm" title="Campanhas"/>}/>
    <Route path="/app/crm/relatorios" element={<Placeholder area="crm" title="Relatórios"/>}/>
    <Route path="/app/crm/financeiro" element={<Placeholder area="crm" title="Financeiro"/>}/>
    <Route path="/app/site" element={<CmsDashboard/>}/>
    <Route path="/app/site/conteudos" element={<CmsContents/>}/>
    <Route path="/app/site/paginas" element={<CmsPages/>}/>
    {['midia','categorias','midia-kit','configuracoes'].map(p=><Route key={p} path={`/app/site/${p}`} element={<Placeholder area="cms" title={({midia:'Mídia',categorias:'Categorias','midia-kit':'Mídia Kit',configuracoes:'Configurações'} as Record<string,string>)[p]}/>}/>)}
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Routes>
}
