import { CalendarDays, CircleDollarSign, Megaphone, Users } from 'lucide-react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass } from '../model'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function CampaignsPage(){
  const campaigns=crmReadModel.campaigns
  const active=campaigns.filter(campaign=>campaign.status==='Ativa').length
  const planned=campaigns.filter(campaign=>campaign.status==='Planejada').length
  const budget=campaigns.reduce((sum,campaign)=>sum+campaign.budget,0)
  const leads=campaigns.reduce((sum,campaign)=>sum+(campaign.leads||0),0)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Campanhas" title="Campanhas" description="Acompanhe iniciativas comerciais, investimento, canais e geração de oportunidades." action="Nova campanha" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Ativas" value={String(active)} detail="Campanhas demonstrativas" icon={<Megaphone size={16}/>}/>
      <AdminKpi label="Planejadas" value={String(planned)} detail="Campanhas demonstrativas" icon={<CalendarDays size={16}/>}/>
      <AdminKpi label="Investimento" value={formatCurrency(budget)} detail="Orçamento demonstrativo" icon={<CircleDollarSign size={16}/>}/>
      <AdminKpi label="Leads" value={String(leads)} detail="Atribuição demonstrativa" icon={<Users size={16}/>}/>
    </div>
    <section className="table-card"><table><thead><tr><th>Campanha</th><th>Status</th><th>Canais</th><th>Orçamento</th><th>Resultado</th></tr></thead><tbody>{campaigns.map(campaign=><tr key={campaign.id}><td><strong>{campaign.name}</strong></td><td><span className={`status ${statusClass(campaign.status)}`}>{campaign.status}</span></td><td>{campaign.channels}</td><td>{formatCurrency(campaign.budget)}</td><td>{campaign.leads===null?'—':`${campaign.leads} leads`}</td></tr>)}</tbody></table></section>
  </AdminShell>
}
