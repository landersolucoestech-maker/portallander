import { BriefcaseBusiness, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { formatCurrency, statusClass, type CrmContactStatus, type CrmDealStage } from './model'
import { crmReadModel } from './repository'

const contactStatuses: readonly ('Todos'|CrmContactStatus)[]=['Todos','Lead','Cliente','Negociação','Contato']
const dealStages: readonly ('Todas'|CrmDealStage)[]=['Todas','Novo','Contato','Proposta','Negociação','Fechado']
const demoDescription='Busca e filtros funcionam localmente sobre o snapshot demonstrativo. Criação, edição e exclusão continuam indisponíveis até existir backend real.'

export function ContactsPage(){
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<(typeof contactStatuses)[number]>('Todos')
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const contacts=useMemo(()=>crmReadModel.contacts.filter(contact=>{
    const matchesQuery=!normalized||[contact.name,contact.company,contact.owner].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesStatus=status==='Todos'||contact.status===status
    return matchesQuery&&matchesStatus
  }),[normalized,status])

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / Contatos" title="Contatos" description="Pessoas e empresas relacionadas comercial ou institucionalmente ao portal." action="Novo contato" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar contatos</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por nome, empresa ou responsável..."/></label><label className="sr-only" htmlFor="contact-status">Filtrar contatos por status</label><select id="contact-status" className="admin-filter" value={status} onChange={event=>setStatus(event.target.value as (typeof contactStatuses)[number])}>{contactStatuses.map(value=><option key={value}>{value}</option>)}</select></div><span className="admin-breadcrumb">{contacts.length} de {crmReadModel.contacts.length} contatos</span></div>
    <section className="table-card"><table><thead><tr><th>Contato</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th></tr></thead><tbody>{contacts.map(contact=><tr key={contact.id}><td><div className="table-primary"><span className="table-avatar">{contact.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{contact.name}</b><small>Contato comercial</small></div></div></td><td>{contact.company}</td><td><span className={`status ${statusClass(contact.status)}`}>{contact.status}</span></td><td>{contact.owner}</td><td><strong>{formatCurrency(contact.relatedValue)}</strong></td></tr>)}</tbody></table>{contacts.length===0&&<div className="table-empty-row">Nenhum contato corresponde aos filtros atuais.</div>}</section>
  </AdminShell>
}

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
