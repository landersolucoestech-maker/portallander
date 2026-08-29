import { BriefcaseBusiness, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass, type CrmDealStage } from '../model'
import { crmReadModel } from '../repository'

const dealStages: readonly ('Todas'|CrmDealStage)[]=['Todas','Novo','Contato','Proposta','Negociação','Fechado']
const demoDescription='Busca e filtros funcionam localmente sobre o snapshot demonstrativo. Criação, edição e exclusão continuam indisponíveis até existir backend real.'

export function DealsPage(){
  const [query,setQuery]=useState('')
  const [stage,setStage]=useState<(typeof dealStages)[number]>('Todas')
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const deals=useMemo(()=>crmReadModel.deals.filter(deal=>{
    const matchesQuery=!normalized||[deal.title,deal.company,deal.owner,deal.nextAction].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesStage=stage==='Todas'||deal.stage===stage
    return matchesQuery&&matchesStage
  }),[normalized,stage])

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Negócios" title="Negócios" description="Oportunidades comerciais organizadas por etapa, responsável, valor e próximo passo." action="Novo negócio" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar negócios</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar negócio, empresa ou responsável..."/></label><label className="sr-only" htmlFor="deal-stage">Filtrar negócios por etapa</label><select id="deal-stage" className="admin-filter" value={stage} onChange={event=>setStage(event.target.value as (typeof dealStages)[number])}>{dealStages.map(value=><option key={value}>{value}</option>)}</select></div><span className="admin-breadcrumb">{deals.length} de {crmReadModel.deals.length} negócios</span></div>
    <section className="table-card"><table><thead><tr><th>Negócio</th><th>Empresa</th><th>Etapa</th><th>Responsável</th><th>Valor</th><th>Próximo passo</th></tr></thead><tbody>{deals.map(deal=><tr key={deal.id}><td><div className="table-primary"><span className="table-avatar"><BriefcaseBusiness size={14} aria-hidden="true"/></span><div><b>{deal.title}</b><small>Oportunidade comercial</small></div></div></td><td>{deal.company}</td><td><span className={`status ${statusClass(deal.stage)}`}>{deal.stage}</span></td><td>{deal.owner}</td><td><strong>{formatCurrency(deal.value)}</strong></td><td>{deal.nextAction}</td></tr>)}</tbody></table>{deals.length===0&&<div className="table-empty-row">Nenhum negócio corresponde aos filtros atuais.</div>}</section>
  </AdminShell>
}
