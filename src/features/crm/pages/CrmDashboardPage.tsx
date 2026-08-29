import { BriefcaseBusiness, UserPlus, Users } from 'lucide-react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function CrmDashboardPage(){
  const {metrics}=crmReadModel

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Dashboard',description:'Visão operacional de relacionamentos e movimentação comercial.'}}>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Contatos" value={String(metrics.contacts)} detail="Base demonstrativa" icon={<Users size={16}/>}/>
      <AdminKpi label="Leads" value={String(metrics.leads)} detail="Base demonstrativa" icon={<UserPlus size={16}/>}/>
      <AdminKpi label="Clientes" value={String(metrics.clients)} detail="Base demonstrativa" icon={<BriefcaseBusiness size={16}/>}/>
    </div>
  </AdminShell>
}
