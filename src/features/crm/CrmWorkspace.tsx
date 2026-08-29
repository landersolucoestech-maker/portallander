import { BriefcaseBusiness, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminKpi, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { formatCurrency, statusClass } from './model'
import { crmReadModel } from './repository'

const {contacts,activities,deals,metrics}=crmReadModel

function DemoNotice(){
  return <div className="admin-notice"><div><strong>Dados de demonstração</strong><p>O CRM ainda não possui backend ou banco conectado. Estes registros servem somente para validar a estrutura visual e operacional das telas; nenhuma alteração é persistida.</p></div></div>
}

export function CrmDashboard(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Dashboard" title="Dashboard" description="Visão operacional de relacionamentos, oportunidades e movimentação comercial." action="Novo contato" disabled/>
    <DemoNotice/>
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
  </AdminShell>
}

export function ActivitiesPage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Atividades" title="Atividades" description="Agenda comercial consolidada para ligações, reuniões e acompanhamentos." action="Nova atividade" disabled/>
    <DemoNotice/>
    <section className="admin-card"><div className="admin-card-head"><div><span>Agenda</span><h2>Próximas atividades</h2></div></div>{activities.map(item=><div className="activity-row" key={item.id}><span>{item.time}</span><div><b>{item.title}</b><small>{item.channel}</small></div></div>)}</section>
  </AdminShell>
}

export function PipelinePage(){
  const stages=['Novo','Contato','Proposta','Negociação','Fechado'] as const
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Pipeline" title="Pipeline comercial" description="Leitura das oportunidades por etapa para visualizar volume e valor em andamento."/>
    <DemoNotice/>
    <div className="pipeline-board">{stages.map(stage=>{const stageDeals=deals.filter(deal=>deal.stage===stage);const total=stageDeals.reduce((sum,deal)=>sum+deal.value,0);return <section className="pipeline-column" key={stage}><div className="pipeline-column-head"><div><span>{stage}</span><strong>{stageDeals.length}</strong></div><small>{formatCurrency(total)}</small></div>{stageDeals.length?stageDeals.map(deal=><article className="pipeline-card" key={deal.id}><span>{deal.company}</span><h3>{deal.title}</h3><strong>{formatCurrency(deal.value)}</strong><small>{deal.nextAction}</small></article>):<div className="pipeline-empty">Sem negócios nesta etapa</div>}</section>})}</div>
  </AdminShell>
}
