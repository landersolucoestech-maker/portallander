import { BadgeCheck, MoreHorizontal, Search, Target, TrendingUp, UserCheck, UserPlus, Users, UserX, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass, type CrmContact, type CrmContactStatus } from '../model'
import { crmReadModel } from '../repository'

type CrmTab='contacts'|'leads'
type DialogMode='view'|'edit'|'delete'|null

const contactStatuses: readonly ('Todos'|CrmContactStatus)[]=['Todos','Cliente','Contato']
const leadStatuses: readonly ('Todos'|CrmContactStatus)[]=['Todos','Lead','Negociação']
const demoDescription='Busca, filtros, abas e visualização funcionam localmente sobre o snapshot demonstrativo. Criação, gravação de edição e exclusão definitiva continuam indisponíveis até existir backend real.'

const contactKpis=[
  ['Total de contatos','248','Base demonstrativa',Users],
  ['Novos contatos','18','Snapshot demonstrativo',UserPlus],
  ['Contatos ativos','217','Snapshot demonstrativo',UserCheck],
  ['Sem interação','31','Snapshot demonstrativo',UserX],
] as const

const leadKpis=[
  ['Total de leads','42','Base demonstrativa',Target],
  ['Novos leads','9','Snapshot demonstrativo',UserPlus],
  ['Leads qualificados','16','Snapshot demonstrativo',BadgeCheck],
  ['Em conversão','11','Snapshot demonstrativo',TrendingUp],
] as const

export function ContactsPage(){
  const [tab,setTab]=useState<CrmTab>('contacts')
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<string>('Todos')
  const [openMenu,setOpenMenu]=useState<string|null>(null)
  const [selected,setSelected]=useState<CrmContact|null>(null)
  const [dialogMode,setDialogMode]=useState<DialogMode>(null)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const isLeads=tab==='leads'
  const statuses=isLeads?leadStatuses:contactStatuses
  const kpis=isLeads?leadKpis:contactKpis

  const baseRecords=useMemo(()=>crmReadModel.contacts.filter(contact=>isLeads
    ? contact.status==='Lead'||contact.status==='Negociação'
    : contact.status==='Cliente'||contact.status==='Contato'
  ),[isLeads])

  const records=useMemo(()=>baseRecords.filter(contact=>{
    const matchesQuery=!normalized||[contact.name,contact.company,contact.owner].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesStatus=status==='Todos'||contact.status===status
    return matchesQuery&&matchesStatus
  }),[baseRecords,normalized,status])

  const changeTab=(next:CrmTab)=>{setTab(next);setStatus('Todos');setQuery('');setOpenMenu(null)}
  const openDialog=(record:CrmContact,mode:Exclude<DialogMode,null>)=>{setSelected(record);setDialogMode(mode);setOpenMenu(null)}
  const closeDialog=()=>{setSelected(null);setDialogMode(null)}

  return <AdminShell
    area="crm"
    items={CRM_NAV}
    header={{title:'CRM',description:'Gestão operacional de contatos e leads do Portal Lander.'}}
    headerAction={{label:'Novo contato',disabled:true,disabledReason:ADMIN_CAPABILITIES.crmPersistence.description}}
  >
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>

    <div className="admin-kpi-grid crm-kpi-grid">
      {kpis.map(([label,value,detail,Icon])=><AdminKpi key={label} label={label} value={value} detail={detail} icon={<Icon size={16}/>}/>)}
    </div>

    <div className="crm-tabs" role="tablist" aria-label="Visões do CRM">
      <button type="button" role="tab" aria-selected={!isLeads} className={!isLeads?'active':''} onClick={()=>changeTab('contacts')}>Contatos</button>
      <button type="button" role="tab" aria-selected={isLeads} className={isLeads?'active':''} onClick={()=>changeTab('leads')}>Leads</button>
    </div>

    <div className="crm-toolbar">
      <label className="searchbox crm-searchbox">
        <span className="sr-only">Buscar {isLeads?'leads':'contatos'}</span>
        <Search size={16} aria-hidden="true"/>
        <input value={query} onChange={event=>setQuery(event.target.value)} placeholder={`Buscar ${isLeads?'lead':'contato'} por nome, empresa ou responsável...`}/>
      </label>
      <label className="sr-only" htmlFor="crm-status">Filtrar por status</label>
      <select id="crm-status" className="admin-filter crm-filter" value={status} onChange={event=>setStatus(event.target.value)}>{statuses.map(value=><option key={value}>{value}</option>)}</select>
    </div>

    <div className="crm-results-meta"><span>{records.length} resultado{records.length===1?'':'s'} nesta visão</span><span>{isLeads?'Leads':'Contatos'}</span></div>

    <section className="table-card crm-table-card">
      <table>
        <thead><tr><th>{isLeads?'Lead':'Contato'}</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th><th className="crm-actions-column">Ações</th></tr></thead>
        <tbody>{records.map(record=><tr key={record.id}>
          <td><div className="table-primary"><span className="table-avatar">{record.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{record.name}</b><small>{isLeads?'Lead comercial':'Contato comercial'}</small></div></div></td>
          <td>{record.company}</td>
          <td><span className={`status ${statusClass(record.status)}`}>{record.status}</span></td>
          <td>{record.owner}</td>
          <td><strong>{formatCurrency(record.relatedValue)}</strong></td>
          <td className="crm-actions-cell">
            <div className="crm-row-menu-wrap">
              <button className="crm-row-menu-button" type="button" aria-label={`Ações de ${record.name}`} aria-expanded={openMenu===record.id} onClick={()=>setOpenMenu(value=>value===record.id?null:record.id)}><MoreHorizontal size={18}/></button>
              {openMenu===record.id&&<div className="crm-row-menu" role="menu">
                <button type="button" role="menuitem" onClick={()=>openDialog(record,'view')}>Ver</button>
                <button type="button" role="menuitem" onClick={()=>openDialog(record,'edit')}>Editar</button>
                <button type="button" role="menuitem" className="danger" onClick={()=>openDialog(record,'delete')}>Excluir</button>
              </div>}
            </div>
          </td>
        </tr>)}</tbody>
      </table>
      {records.length===0&&<div className="table-empty-row">Nenhum {isLeads?'lead':'contato'} corresponde aos filtros atuais.</div>}
    </section>

    {selected&&dialogMode&&<div className="crm-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)closeDialog()}}>
      <section className="crm-dialog" role="dialog" aria-modal="true" aria-labelledby="crm-dialog-title">
        <div className="crm-dialog-head"><div><span>{isLeads?'Lead':'Contato'}</span><h2 id="crm-dialog-title">{dialogMode==='view'?'Detalhes do registro':dialogMode==='edit'?'Editar registro':'Confirmar exclusão'}</h2></div><button type="button" className="crm-dialog-close" aria-label="Fechar" onClick={closeDialog}><X size={18}/></button></div>

        {dialogMode==='view'&&<div className="crm-detail-grid">
          <div><span>Nome</span><strong>{selected.name}</strong></div><div><span>Empresa</span><strong>{selected.company}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Responsável</span><strong>{selected.owner}</strong></div><div><span>Valor relacionado</span><strong>{formatCurrency(selected.relatedValue)}</strong></div>
        </div>}

        {dialogMode==='edit'&&<form className="crm-edit-form" onSubmit={event=>event.preventDefault()}>
          <label><span>Nome</span><input defaultValue={selected.name}/></label>
          <label><span>Empresa</span><input defaultValue={selected.company}/></label>
          <label><span>Status</span><input defaultValue={selected.status}/></label>
          <label><span>Responsável</span><input defaultValue={selected.owner}/></label>
          <label><span>Valor relacionado</span><input defaultValue={String(selected.relatedValue)}/></label>
          <div className="crm-dialog-note">Os campos estão disponíveis para revisão local, mas a gravação permanece bloqueada até existir backend persistente.</div>
          <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Salvar alterações</button></div>
        </form>}

        {dialogMode==='delete'&&<div className="crm-delete-confirmation"><p>Você está prestes a excluir <strong>{selected.name}</strong>. A exclusão definitiva exige confirmação e uma camada persistente conectada.</p><div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="button" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Confirmar exclusão</button></div></div>}
      </section>
    </div>}
  </AdminShell>
}
