import { BriefcaseBusiness, CalendarDays, CircleDollarSign, TrendingUp } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass } from '../model'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function FinancePage(){
  const openDeals=crmReadModel.deals.filter(deal=>deal.stage!=='Fechado')
  const closedDeals=crmReadModel.deals.filter(deal=>deal.stage==='Fechado')
  const openValue=openDeals.reduce((sum,deal)=>sum+deal.value,0)
  const closedValue=closedDeals.reduce((sum,deal)=>sum+deal.value,0)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Financeiro" title="Financeiro" description="Visão comercial de valores relacionados às oportunidades do snapshot atual."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Em aberto" value={formatCurrency(openValue)} detail="Negócios não fechados" icon={<TrendingUp size={16}/>}/>
      <AdminKpi label="Fechado" value={formatCurrency(closedValue)} detail="Negócios fechados" icon={<BriefcaseBusiness size={16}/>}/>
      <AdminKpi label="Total relacionado" value={formatCurrency(openValue+closedValue)} detail="Snapshot demonstrativo" icon={<CircleDollarSign size={16}/>}/>
      <AdminKpi label="Negócios" value={String(crmReadModel.deals.length)} detail="Registros demonstrativos" icon={<CalendarDays size={16}/>}/>
    </div>
    <section className="table-card"><table><thead><tr><th>Referência</th><th>Empresa</th><th>Etapa</th><th>Valor</th></tr></thead><tbody>{crmReadModel.deals.map(deal=><tr key={deal.id}><td>{deal.title}</td><td>{deal.company}</td><td><span className={`status ${statusClass(deal.stage)}`}>{deal.stage}</span></td><td><strong>{formatCurrency(deal.value)}</strong></td></tr>)}</tbody></table></section>
  </AdminShell>
}
