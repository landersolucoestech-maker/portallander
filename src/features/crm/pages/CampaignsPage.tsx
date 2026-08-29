import { CalendarDays, CircleDollarSign, Megaphone, Target } from 'lucide-react'
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
  const attributedLeads=crmReadModel.leads.filter(lead=>lead.campaign)
  const attributedValue=attributedLeads.reduce((sum,lead)=>sum+lead.potentialValue,0)

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Campanhas" title="Campanhas" description="Conecte aquisição, mídia e oportunidades ao relacionamento comercial do Portal Lander." action="Nova campanha" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Ativas" value={String(active)} detail="Campanhas demonstrativas" icon={<Megaphone size={16}/>}/>
      <AdminKpi label="Planejadas" value={String(planned)} detail="Campanhas demonstrativas" icon={<CalendarDays size={16}/>}/>
      <AdminKpi label="Investimento" value={formatCurrency(budget)} detail="Orçamento demonstrativo" icon={<CircleDollarSign size={16}/>}/>
      <AdminKpi label="Potencial atribuído" value={formatCurrency(attributedValue)} detail={`${attributedLeads.length} lead(s) do CRM`} icon={<Target size={16}/>}/>
    </div>
    <section className="table-card"><table><thead><tr><th>Campanha</th><th>Status</th><th>Canais</th><th>Orçamento</th><th>Leads de mídia</th><th>Leads no CRM</th><th>Potencial CRM</th></tr></thead><tbody>{campaigns.map(campaign=>{const crmLeads=crmReadModel.leads.filter(lead=>lead.campaign===campaign.name);const potential=crmLeads.reduce((sum,lead)=>sum+lead.potentialValue,0);return <tr key={campaign.id}><td><strong>{campaign.name}</strong></td><td><span className={`status ${statusClass(campaign.status)}`}>{campaign.status}</span></td><td>{campaign.channels}</td><td>{formatCurrency(campaign.budget)}</td><td>{campaign.leads===null?'—':campaign.leads}</td><td>{crmLeads.length}</td><td><strong>{formatCurrency(potential)}</strong></td></tr>})}</tbody></table></section>
    <div className="admin-grid admin-grid-spaced"><section className="admin-card"><div className="admin-card-head"><div><span>Atribuição</span><h2>Leads vinculados a campanhas</h2></div></div><div className="crm-dashboard-list">{attributedLeads.map(lead=><div className="crm-dashboard-row" key={lead.id}><div><b>{lead.name}</b><small>{lead.campaign} · {lead.source}</small></div><strong>{formatCurrency(lead.potentialValue)}</strong></div>)}</div></section><section className="admin-card"><div className="admin-card-head"><div><span>Integração futura</span><h2>Origem e UTM</h2></div></div><p>Campanhas já se relacionam ao lead por campanha e origem. Quando as integrações de mídia e o backend existirem, UTMs, custo, conversão e receita poderão ser atribuídos ao mesmo registro sem criar cadastros paralelos.</p></section></div>
  </AdminShell>
}
