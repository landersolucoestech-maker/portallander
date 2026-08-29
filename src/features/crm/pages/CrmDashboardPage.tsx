import { BadgeCheck, Flame, Link2, Newspaper, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OPERATIONS_MODULES } from '../../operations/modules'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { statusClass } from '../model'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function CrmDashboardPage(){
  const {contacts,leads,metrics,relationships,relatedContent}=crmReadModel
  const recentLeads=leads.slice(0,4)
  const followUps=[...leads.map(item=>({id:`lead-${item.id}`,name:item.name,context:item.nextAction,date:item.nextFollowUp})),...contacts.filter(item=>item.nextFollowUp).map(item=>({id:`contact-${item.id}`,name:item.name,context:item.category,date:item.nextFollowUp!}))].slice(0,5)
  const originCounts=Array.from(new Set(leads.map(item=>item.source))).map(source=>({source,total:leads.filter(item=>item.source===source).length})).sort((a,b)=>b.total-a.total)
  const maxOrigin=Math.max(...originCounts.map(item=>item.total),1)

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Dashboard',description:'Visão operacional dos relacionamentos editoriais, comerciais e institucionais.'}}>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Contatos" value={String(metrics.contacts)} detail="Relacionamentos cadastrados" icon={<Users size={16}/>}/>
      <AdminKpi label="Leads" value={String(metrics.leads)} detail="Oportunidades identificadas" icon={<UserPlus size={16}/>}/>
      <AdminKpi label="Qualificados" value={String(metrics.qualifiedLeads)} detail="Em avanço comercial" icon={<BadgeCheck size={16}/>}/>
      <AdminKpi label="Leads quentes" value={String(metrics.hotLeads)} detail="Prioridade de acompanhamento" icon={<Flame size={16}/>}/>
    </div>

    <section className="admin-card admin-grid-spaced">
      <div className="admin-card-head"><div><span>Workspace CRM</span><h2>Módulos operacionais</h2></div></div>
      <div className="crm-module-grid">{OPERATIONS_MODULES.map(module=>{const Icon=module.icon;return <Link className="crm-module-card" to={`/app/crm/${module.key}`} key={module.key}><span className="crm-module-icon"><Icon size={17}/></span><div><strong>{module.title}</strong><small>{module.eyebrow}</small></div></Link>})}</div>
    </section>

    <div className="admin-grid admin-grid-spaced">
      <section className="admin-card"><div className="admin-card-head"><div><span>CRM</span><h2>Leads recentes</h2></div></div><div className="crm-dashboard-list">{recentLeads.map(lead=><div className="crm-dashboard-row" key={lead.id}><div><b>{lead.name}</b><small>{lead.company} · {lead.interest}</small></div><span className={`status ${statusClass(lead.status)}`}>{lead.status}</span></div>)}</div></section>
      <section className="admin-card"><div className="admin-card-head"><div><span>Acompanhamento</span><h2>Próximos follow-ups</h2></div></div><div className="crm-dashboard-list">{followUps.map(item=><div className="crm-dashboard-row" key={item.id}><div><b>{item.name}</b><small>{item.context}</small></div><strong>{item.date}</strong></div>)}</div></section>
    </div>

    <div className="admin-grid admin-grid-spaced">
      <section className="admin-card"><div className="admin-card-head"><div><span>Rede</span><h2>Relacionamentos vinculados</h2></div><Link2 size={16}/></div><div className="crm-network-list">{relationships.map(item=><div className="crm-network-row" key={item.id}><div><b>{item.sourceName}</b><span>↔</span><b>{item.targetName}</b></div><small>{item.relation}</small></div>)}</div></section>
      <section className="admin-card"><div className="admin-card-head"><div><span>Editorial</span><h2>Conteúdos relacionados</h2></div><Newspaper size={16}/></div><div className="crm-content-list">{relatedContent.slice(0,5).map(item=><div className="crm-content-row" key={item.id}><div><span>{item.type}</span><b>{item.title}</b><small>{item.recordName} · {item.date}</small></div><strong className={`crm-content-status ${statusClass(item.status)}`}>{item.status}</strong></div>)}</div></section>
    </div>

    <section className="admin-card admin-grid-spaced"><div className="admin-card-head"><div><span>Aquisição</span><h2>Origem dos leads</h2></div></div><div className="crm-origin-list">{originCounts.map(item=><div className="crm-origin-row" key={item.source}><span>{item.source}</span><div><b style={{width:`${Math.max(8,(item.total/maxOrigin)*100)}%`}}/></div><strong>{item.total}</strong></div>)}</div></section>
  </AdminShell>
}
