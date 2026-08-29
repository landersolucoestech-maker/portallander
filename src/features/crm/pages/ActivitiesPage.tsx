import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { CRM_DEMO_DESCRIPTION } from '../presentation'
import { crmReadModel } from '../repository'

export function ActivitiesPage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Atividades" title="Atividades" description="Agenda comercial consolidada para ligações, reuniões e acompanhamentos." action="Nova atividade" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <section className="admin-card"><div className="admin-card-head"><div><span>Agenda</span><h2>Próximas atividades</h2></div></div>{crmReadModel.activities.map(item=><div className="activity-row" key={item.id}><span>{item.time}</span><div><b>{item.title}</b><small>{item.channel}</small></div></div>)}</section>
  </AdminShell>
}
