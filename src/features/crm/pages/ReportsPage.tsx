import { BadgeCheck, Flame, Target, UserCheck } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function ReportsPage(){
  const {contacts,leads,metrics}=crmReadModel
  const conversionRate=Math.round((metrics.convertedLeads/Math.max(metrics.leads,1))*100)
  const statusCounts=Array.from(new Set(leads.map(item=>item.status))).map(status=>({status,total:leads.filter(item=>item.status===status).length}))
  const maxStatus=Math.max(...statusCounts.map(item=>item.total),1)
  const sources=Array.from(new Set(leads.map(item=>item.source))).map(source=>({source,total:leads.filter(item=>item.source===source).length})).sort((a,b)=>b.total-a.total)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Relatórios" title="Relatórios" description="Leitura executiva da base de relacionamentos, aquisição e conversão de leads."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Leads" value={String(metrics.leads)} detail="Oportunidades demonstrativas" icon={<Target size={16}/>}/>
      <AdminKpi label="Qualificados" value={String(metrics.qualifiedLeads)} detail="Qualificado, proposta ou negociação" icon={<BadgeCheck size={16}/>}/>
      <AdminKpi label="Leads quentes" value={String(metrics.hotLeads)} detail="Prioridade comercial" icon={<Flame size={16}/>}/>
      <AdminKpi label="Conversão" value={`${conversionRate}%`} detail={`${metrics.convertedLeads} convertido(s)`} icon={<UserCheck size={16}/>}/>
    </div>
    <div className="admin-grid admin-grid-spaced"><section className="admin-card"><div className="admin-card-head"><div><span>Status</span><h2>Distribuição dos leads</h2></div></div><div className="report-bars">{statusCounts.map(item=><div key={item.status}><span>{item.status}</span><b style={{width:`${Math.max(4,(item.total/maxStatus)*100)}%`}}/></div>)}</div></section><section className="admin-card"><div className="admin-card-head"><div><span>Origem</span><h2>Canais de entrada</h2></div></div><div className="crm-dashboard-list">{sources.map(item=><div className="crm-dashboard-row" key={item.source}><div><b>{item.source}</b><small>Origem registrada no CRM</small></div><strong>{item.total}</strong></div>)}</div></section></div>
    <section className="admin-card admin-grid-spaced"><div className="admin-card-head"><div><span>Base</span><h2>Composição dos contatos</h2></div></div><p>{contacts.length} contatos demonstrativos distribuídos entre artistas, assessorias, gravadoras, produtores, eventos e outros relacionamentos relevantes ao Portal Lander. A estrutura está pronta para métricas reais assim que a persistência for conectada.</p></section>
  </AdminShell>
}
