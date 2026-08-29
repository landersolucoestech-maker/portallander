import { BadgeCheck, Flame, Target, UserCheck } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function ReportsPage(){
  const {contacts,leads,metrics,relatedContent}=crmReadModel
  const conversionRate=Math.round((metrics.convertedLeads/Math.max(metrics.leads,1))*100)
  const statusCounts=Array.from(new Set(leads.map(item=>item.status))).map(status=>({label:status,total:leads.filter(item=>item.status===status).length}))
  const sourceCounts=Array.from(new Set(leads.map(item=>item.source))).map(source=>({label:source,total:leads.filter(item=>item.source===source).length})).sort((a,b)=>b.total-a.total)
  const categoryCounts=Array.from(new Set(contacts.map(item=>item.category))).map(category=>({label:category,total:contacts.filter(item=>item.category===category).length})).sort((a,b)=>b.total-a.total)
  const interestCounts=Array.from(new Set(leads.map(item=>item.interest))).map(interest=>({label:interest,total:leads.filter(item=>item.interest===interest).length})).sort((a,b)=>b.total-a.total)
  const maxStatus=Math.max(...statusCounts.map(item=>item.total),1)
  const published=relatedContent.filter(item=>item.status==='Publicado').length

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Relatórios" title="Relatórios" description="Leitura executiva de aquisição, relacionamento, interesses, conversão e atividade editorial ligada ao CRM."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Leads" value={String(metrics.leads)} detail="Oportunidades demonstrativas" icon={<Target size={16}/>}/>
      <AdminKpi label="Qualificados" value={String(metrics.qualifiedLeads)} detail="Qualificado, proposta ou negociação" icon={<BadgeCheck size={16}/>}/>
      <AdminKpi label="Leads quentes" value={String(metrics.hotLeads)} detail="Prioridade comercial" icon={<Flame size={16}/>}/>
      <AdminKpi label="Conversão" value={`${conversionRate}%`} detail={`${metrics.convertedLeads} convertido(s)`} icon={<UserCheck size={16}/>}/>
    </div>
    <div className="admin-grid admin-grid-spaced">
      <section className="admin-card"><div className="admin-card-head"><div><span>Status</span><h2>Distribuição dos leads</h2></div></div><div className="report-bars">{statusCounts.map(item=><div key={item.label}><span>{item.label}</span><b style={{width:`${Math.max(4,(item.total/maxStatus)*100)}%`}}/></div>)}</div></section>
      <section className="admin-card"><div className="admin-card-head"><div><span>Origem</span><h2>Canais de entrada</h2></div></div><div className="crm-dashboard-list">{sourceCounts.map(item=><div className="crm-dashboard-row" key={item.label}><div><b>{item.label}</b><small>Origem registrada no CRM</small></div><strong>{item.total}</strong></div>)}</div></section>
    </div>
    <div className="admin-grid admin-grid-spaced">
      <section className="admin-card"><div className="admin-card-head"><div><span>Relacionamento</span><h2>Categorias de contatos</h2></div></div><div className="crm-dashboard-list">{categoryCounts.map(item=><div className="crm-dashboard-row" key={item.label}><div><b>{item.label}</b><small>Classificação da base</small></div><strong>{item.total}</strong></div>)}</div></section>
      <section className="admin-card"><div className="admin-card-head"><div><span>Demanda</span><h2>Interesses dos leads</h2></div></div><div className="crm-dashboard-list">{interestCounts.map(item=><div className="crm-dashboard-row" key={item.label}><div><b>{item.label}</b><small>Interesse registrado</small></div><strong>{item.total}</strong></div>)}</div></section>
    </div>
    <section className="admin-card admin-grid-spaced"><div className="admin-card-head"><div><span>Editorial</span><h2>Conteúdo relacionado à base</h2></div></div><p>{relatedContent.length} conteúdo(s) demonstrativo(s) vinculados a registros do CRM, sendo {published} publicado(s). Essa leitura permitirá medir quais artistas, assessorias, marcas e parceiros mais geram conteúdo e oportunidades quando a persistência real estiver conectada.</p></section>
  </AdminShell>
}
