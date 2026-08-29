import { BriefcaseBusiness, CalendarDays, CircleDollarSign, TrendingUp } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency } from '../model'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function ReportsPage(){
  const closed=crmReadModel.deals.filter(deal=>deal.stage==='Fechado')
  const averageTicket=closed.length?closed.reduce((sum,deal)=>sum+deal.value,0)/closed.length:0
  const totalContacts=Math.max(crmReadModel.metrics.contacts,1)
  const leadPercent=Math.round((crmReadModel.metrics.leads/totalContacts)*100)
  const clientPercent=Math.round((crmReadModel.metrics.clients/totalContacts)*100)
  const proposalCount=crmReadModel.deals.filter(deal=>deal.stage==='Proposta').length
  const proposalPercent=Math.round((proposalCount/Math.max(crmReadModel.deals.length,1))*100)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Relatórios" title="Relatórios" description="Leitura executiva da operação comercial e dos principais indicadores do funil."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Negócios" value={String(crmReadModel.deals.length)} detail="Snapshot demonstrativo" icon={<TrendingUp size={16}/>}/>
      <AdminKpi label="Ticket fechado" value={formatCurrency(averageTicket)} detail="Média dos fechados" icon={<CircleDollarSign size={16}/>}/>
      <AdminKpi label="Pipeline" value={formatCurrency(crmReadModel.metrics.pipelineValue)} detail="Snapshot demonstrativo" icon={<BriefcaseBusiness size={16}/>}/>
      <AdminKpi label="Atividades" value={String(crmReadModel.activities.length)} detail="Agenda demonstrativa" icon={<CalendarDays size={16}/>}/>
    </div>
    <div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><div><span>Funil</span><h2>Distribuição comercial</h2></div></div><div className="report-bars"><div><span>Contatos</span><b style={{width:'100%'}}/></div><div><span>Leads</span><b style={{width:`${Math.max(4,leadPercent)}%`}}/></div><div><span>Propostas</span><b style={{width:`${Math.max(4,proposalPercent)}%`}}/></div><div><span>Clientes</span><b style={{width:`${Math.max(4,clientPercent)}%`}}/></div></div></section><section className="admin-card"><div className="admin-card-head"><div><span>Leitura</span><h2>Indicadores prioritários</h2></div></div><p>Esta visão está pronta para receber conversão, receita, ciclo de venda, origem de leads e performance por responsável assim que uma fonte persistente for conectada.</p></section></div>
  </AdminShell>
}
