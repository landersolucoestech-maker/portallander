import { BadgeCheck, CircleDollarSign, Flame, Target } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass } from '../model'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function FinancePage(){
  const leads=crmReadModel.leads
  const activeLeads=leads.filter(lead=>!['Convertido','Perdido'].includes(lead.status))
  const convertedLeads=leads.filter(lead=>lead.status==='Convertido')
  const activeValue=activeLeads.reduce((sum,lead)=>sum+lead.potentialValue,0)
  const convertedValue=convertedLeads.reduce((sum,lead)=>sum+lead.potentialValue,0)
  const hotValue=leads.filter(lead=>lead.temperature==='Quente'&&!['Convertido','Perdido'].includes(lead.status)).reduce((sum,lead)=>sum+lead.potentialValue,0)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Financeiro" title="Financeiro" description="Visão comercial dos valores potenciais associados aos leads do CRM."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Potencial ativo" value={formatCurrency(activeValue)} detail="Leads ainda em acompanhamento" icon={<Target size={16}/>}/>
      <AdminKpi label="Leads quentes" value={formatCurrency(hotValue)} detail="Potencial prioritário" icon={<Flame size={16}/>}/>
      <AdminKpi label="Convertido" value={formatCurrency(convertedValue)} detail="Valor relacionado a leads convertidos" icon={<BadgeCheck size={16}/>}/>
      <AdminKpi label="Total relacionado" value={formatCurrency(activeValue+convertedValue)} detail="Snapshot demonstrativo" icon={<CircleDollarSign size={16}/>}/>
    </div>
    <section className="table-card"><table><thead><tr><th>Lead</th><th>Interesse</th><th>Status</th><th>Temperatura</th><th>Valor potencial</th></tr></thead><tbody>{leads.map(lead=><tr key={lead.id}><td><strong>{lead.name}</strong><br/><small>{lead.company}</small></td><td>{lead.interest}</td><td><span className={`status ${statusClass(lead.status)}`}>{lead.status}</span></td><td>{lead.temperature}</td><td><strong>{formatCurrency(lead.potentialValue)}</strong></td></tr>)}</tbody></table></section>
  </AdminShell>
}
