import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency } from '../model'
import { CRM_DEMO_DESCRIPTION, CRM_PIPELINE_STAGES } from '../presentation'
import { crmReadModel } from '../repository'

export function PipelinePage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Pipeline" title="Pipeline comercial" description="Leitura das oportunidades por etapa para visualizar volume e valor em andamento."/>
    <AdminNotice title="Dados de demonstração" description={CRM_DEMO_DESCRIPTION}/>
    <div className="pipeline-board">{CRM_PIPELINE_STAGES.map(stage=>{
      const stageDeals=crmReadModel.deals.filter(deal=>deal.stage===stage)
      const total=stageDeals.reduce((sum,deal)=>sum+deal.value,0)
      return <section className="pipeline-column" key={stage}><div className="pipeline-column-head"><div><span>{stage}</span><strong>{stageDeals.length}</strong></div><small>{formatCurrency(total)}</small></div>{stageDeals.length?stageDeals.map(deal=><article className="pipeline-card" key={deal.id}><span>{deal.company}</span><h3>{deal.title}</h3><strong>{formatCurrency(deal.value)}</strong><small>{deal.nextAction}</small></article>):<div className="pipeline-empty">Sem negócios nesta etapa</div>}</section>
    })}</div>
  </AdminShell>
}
