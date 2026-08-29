import { BriefcaseBusiness, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { formatCurrency, statusClass } from './model'
import { crmReadModel } from './repository'

const {contacts,activities,deals,metrics}=crmReadModel
const pipelineStages=['Novo','Contato','Proposta','Negociação','Fechado'] as const
const demoDescription='Os registros abaixo são demonstrativos e servem somente para validar a estrutura visual e operacional. Nenhuma alteração é persistida.'

export function CrmDashboard(){
  const stageTotals=pipelineStages.map(stage=>({stage,total:deals.filter(deal=>deal.stage===stage).reduce((sum,deal)=>sum+deal.value,0)}))
  const maxStageValue=Math.max(...stageTotals.map(item=>item.total),1)
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Dashboard" title="Dashboard" description="Visão operacional de relacionamentos, oportunidades e movimentação comercial." action="Novo contato" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Contatos" value={String(metrics.contacts)} detail="Base demonstrativa" icon={<Users size={16}/>}/>
      <AdminKpi label="Leads" value={String(metrics.leads)} detail="Base demonstrativa" icon={<UserPlus size={16}/>}/>
      <AdminKpi label="Clientes" value={String(metrics.clients)} detail="Base demonstrativa" icon={<BriefcaseBusiness size={16}/>}/>
      <AdminKpi label="Pipeline" value={formatCurrency(metrics.pipelineValue)} detail="Valor demonstrativo" icon={<TrendingUp size={16}/>}/>
    </div>
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Relacionamentos</span><h2>Contatos recentes</h2></div><Link to="/app/crm/contatos" className="button outline">Ver todos</Link></div>
        {contacts.map(contact=><div className="compact-row" key={contact.id}><div className="table-avatar">{contact.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</div><div className="grow"><b>{contact.name}</b><small>{contact.company} · {contact.owner}</small></div><span className={`status ${statusClass(contact.status)}`}>{contact.status}</span><strong>{formatCurrency(contact.relatedValue)}</strong></div>)}
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Agenda comercial</span><h2>Próximas atividades</h2></div><Link to="/app/crm/atividades" className="button outline">Abrir agenda</Link></div>
        {activities.map(item=><div className="activity-row" key={item.id}><span>{item.time}</span><div><b>{item.title}</b><small>{item.channel}</small></div></div>)}
      </section>
    </div>
    <div className="dashboard-wide-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Comercial</span><h2>Negócios do snapshot</h2></div><Link className="dashboard-card-link" to="/app/crm/negocios">VER NEGÓCIOS</Link></div>
        <div className="dashboard-summary-list">{deals.map(deal=><div className="dashboard-summary-row" key={deal.id}><div><b>{deal.title}</b><small>{deal.company} · {deal.owner}</small></div><span className={`status ${statusClass(deal.stage)}`}>{deal.stage}</span><strong>{formatCurrency(deal.value)}</strong></div>)}</div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Pipeline</span><h2>Valor por etapa</h2></div><Link className="dashboard-card-link" to="/app/crm/pipeline">ABRIR PIPELINE</Link></div>
        <div className="dashboard-stage-list">{stageTotals.map(item=><div className="dashboard-stage" key={item.stage}><span>{item.stage}</span><div className="dashboard-stage-track"><span style={{width:`${Math.max(4,(item.total/maxStageValue)*100)}%`}}/></div><small>{formatCurrency(item.total)}</small></div>)}</div>
      </section>
    </div>
  </AdminShell>
}

export function ActivitiesPage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Atividades" title="Atividades" description="Agenda comercial consolidada para ligações, reuniões e acompanhamentos." action="Nova atividade" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>
    <section className="admin-card"><div className="admin-card-head"><div><span>Agenda</span><h2>Próximas atividades</h2></div></div>{activities.map(item=><div className="activity-row" key={item.id}><span>{item.time}</span><div><b>{item.title}</b><small>{item.channel}</small></div></div>)}</section>
  </AdminShell>
}

export function PipelinePage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Pipeline" title="Pipeline comercial" description="Leitura das oportunidades por etapa para visualizar volume e valor em andamento."/>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>
    <div className="pipeline-board">{pipelineStages.map(stage=>{const stageDeals=deals.filter(deal=>deal.stage===stage);const total=stageDeals.reduce((sum,deal)=>sum+deal.value,0);return <section className="pipeline-column" key={stage}><div className="pipeline-column-head"><div><span>{stage}</span><strong>{stageDeals.length}</strong></div><small>{formatCurrency(total)}</small></div>{stageDeals.length?stageDeals.map(deal=><article className="pipeline-card" key={deal.id}><span>{deal.company}</span><h3>{deal.title}</h3><strong>{formatCurrency(deal.value)}</strong><small>{deal.nextAction}</small></article>):<div className="pipeline-empty">Sem negócios nesta etapa</div>}</section>})}</div>
  </AdminShell>
}
