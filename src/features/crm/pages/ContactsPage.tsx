import { BadgeCheck, ChevronLeft, ChevronRight, MoreHorizontal, Search, Target, TrendingUp, UserCheck, UserPlus, Users, UserX, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass, type CrmContact, type CrmContactStatus } from '../model'
import { crmReadModel } from '../repository'

type CrmTab='contacts'|'leads'
type DialogMode='create'|'view'|'edit'|'delete'|null

const PAGE_SIZE=10
const contactStatuses: readonly ('Todos'|CrmContactStatus)[]=['Todos','Cliente','Contato']
const leadStatuses: readonly ('Todos'|CrmContactStatus)[]=['Todos','Lead','Negociação']
const demoDescription='Busca, filtros, abas, paginação e visualização funcionam localmente sobre o snapshot demonstrativo. Os formulários de novo contato e novo lead podem ser preenchidos, mas criação, gravação de edição e exclusão definitiva continuam indisponíveis até existir backend real.'

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

function FormField({label,children,wide=false}:{label:string;children:ReactNode;wide?:boolean}){
  return <label className={wide?'crm-form-field crm-form-field-wide':'crm-form-field'}><span>{label}</span>{children}</label>
}

function CreateContactForm({onCancel}:{onCancel:()=>void}){
  return <form className="crm-create-form" onSubmit={event=>event.preventDefault()}>
    <fieldset className="crm-form-section">
      <legend>Informações básicas</legend>
      <div className="crm-form-grid">
        <FormField label="Nome completo"><input required placeholder="Nome do contato"/></FormField>
        <FormField label="Empresa"><input placeholder="Empresa ou organização"/></FormField>
        <FormField label="Cargo / função"><input placeholder="Ex.: Gerente comercial"/></FormField>
        <FormField label="Tipo de contato"><select defaultValue="Contato"><option>Contato</option><option>Cliente</option><option>Parceiro</option><option>Fornecedor</option><option>Imprensa</option><option>Artista</option><option>Agência</option><option>Outro</option></select></FormField>
        <FormField label="E-mail"><input type="email" placeholder="nome@empresa.com"/></FormField>
        <FormField label="Telefone / WhatsApp"><input type="tel" placeholder="(00) 00000-0000"/></FormField>
        <FormField label="Cidade"><input placeholder="Cidade"/></FormField>
        <FormField label="Estado"><input placeholder="UF" maxLength={2}/></FormField>
      </div>
    </fieldset>

    <fieldset className="crm-form-section">
      <legend>Responsabilidade e origem</legend>
      <div className="crm-form-grid">
        <FormField label="Responsável interno"><input placeholder="Responsável pelo relacionamento"/></FormField>
        <FormField label="Origem do contato"><select defaultValue="Indicação"><option>Indicação</option><option>Site</option><option>Instagram</option><option>Facebook</option><option>WhatsApp</option><option>Evento</option><option>Campanha</option><option>Prospecção</option><option>Outro</option></select></FormField>
        <FormField label="Status"><select defaultValue="Contato"><option>Contato</option><option>Cliente</option></select></FormField>
        <FormField label="Preferência de contato"><select defaultValue="WhatsApp"><option>WhatsApp</option><option>Telefone</option><option>E-mail</option><option>Instagram</option></select></FormField>
      </div>
    </fieldset>

    <details className="crm-form-more">
      <summary>Mais informações</summary>
      <div className="crm-form-grid">
        <FormField label="Site"><input type="url" placeholder="https://"/></FormField>
        <FormField label="Instagram / rede social"><input placeholder="@usuario ou URL"/></FormField>
        <FormField label="CPF / CNPJ"><input placeholder="Opcional"/></FormField>
        <FormField label="Tags"><input placeholder="Separe por vírgulas"/></FormField>
        <FormField label="Data de aniversário"><input type="date"/></FormField>
        <FormField label="Endereço"><input placeholder="Endereço comercial"/></FormField>
      </div>
    </details>

    <FormField label="Observações" wide><textarea rows={4} placeholder="Contexto, histórico ou informações relevantes sobre o contato."/></FormField>
    <div className="crm-dialog-note">O formulário está habilitado para preenchimento, mas a criação definitiva permanece bloqueada até existir backend persistente.</div>
    <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={onCancel}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Adicionar contato</button></div>
  </form>
}

function CreateLeadForm({onCancel}:{onCancel:()=>void}){
  return <form className="crm-create-form" onSubmit={event=>event.preventDefault()}>
    <fieldset className="crm-form-section">
      <legend>Informações básicas</legend>
      <div className="crm-form-grid">
        <FormField label="Nome"><input required placeholder="Nome do lead"/></FormField>
        <FormField label="Empresa"><input placeholder="Empresa ou organização"/></FormField>
        <FormField label="Cargo / função"><input placeholder="Ex.: Diretor de marketing"/></FormField>
        <FormField label="E-mail"><input type="email" placeholder="nome@empresa.com"/></FormField>
        <FormField label="Telefone / WhatsApp"><input type="tel" placeholder="(00) 00000-0000"/></FormField>
        <FormField label="Cidade / Estado"><input placeholder="Cidade / UF"/></FormField>
      </div>
    </fieldset>

    <fieldset className="crm-form-section">
      <legend>Comercial</legend>
      <div className="crm-form-grid">
        <FormField label="Interesse / serviço"><input required placeholder="Produto, serviço ou oportunidade"/></FormField>
        <FormField label="Etapa"><select defaultValue="Novo"><option>Novo</option><option>Contatado</option><option>Qualificado</option><option>Proposta</option><option>Negociação</option></select></FormField>
        <FormField label="Temperatura"><select defaultValue="Morno"><option>Frio</option><option>Morno</option><option>Quente</option></select></FormField>
        <FormField label="Valor potencial"><input type="number" min="0" inputMode="decimal" placeholder="0"/></FormField>
        <FormField label="Probabilidade de conversão"><input type="number" min="0" max="100" inputMode="numeric" placeholder="0 a 100"/></FormField>
        <FormField label="Prazo esperado"><input type="date"/></FormField>
        <FormField label="Próxima ação"><input placeholder="Ex.: enviar proposta"/></FormField>
        <FormField label="Data da próxima ação"><input type="datetime-local"/></FormField>
      </div>
    </fieldset>

    <fieldset className="crm-form-section">
      <legend>Responsabilidade e origem</legend>
      <div className="crm-form-grid">
        <FormField label="Responsável comercial"><input placeholder="Responsável pelo lead"/></FormField>
        <FormField label="Origem do lead"><select defaultValue="Site"><option>Site</option><option>Indicação</option><option>Instagram</option><option>Facebook</option><option>WhatsApp</option><option>Evento</option><option>Campanha</option><option>Prospecção</option><option>Outro</option></select></FormField>
        <FormField label="Campanha de origem"><input placeholder="Campanha, anúncio ou ação"/></FormField>
        <FormField label="Canal preferencial"><select defaultValue="WhatsApp"><option>WhatsApp</option><option>Telefone</option><option>E-mail</option><option>Instagram</option></select></FormField>
      </div>
    </fieldset>

    <details className="crm-form-more">
      <summary>Mais informações</summary>
      <div className="crm-form-grid">
        <FormField label="UTM / source"><input placeholder="utm_source ou referência"/></FormField>
        <FormField label="Site / Instagram"><input placeholder="URL ou @usuario"/></FormField>
        <FormField label="Orçamento disponível"><input type="number" min="0" inputMode="decimal" placeholder="0"/></FormField>
        <FormField label="Concorrente atual"><input placeholder="Fornecedor ou solução atual"/></FormField>
        <FormField label="Tags"><input placeholder="Separe por vírgulas"/></FormField>
        <FormField label="Motivo da oportunidade"><input placeholder="Necessidade identificada"/></FormField>
      </div>
    </details>

    <FormField label="Observações" wide><textarea rows={4} placeholder="Contexto comercial, dores, objeções e informações relevantes do lead."/></FormField>
    <div className="crm-dialog-note">O formulário está habilitado para preenchimento, mas a criação definitiva permanece bloqueada até existir backend persistente.</div>
    <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={onCancel}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Adicionar lead</button></div>
  </form>
}

export function ContactsPage(){
  const [tab,setTab]=useState<CrmTab>('contacts')
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<string>('Todos')
  const [page,setPage]=useState(1)
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

  const totalPages=Math.max(1,Math.ceil(records.length/PAGE_SIZE))
  const currentPage=Math.min(page,totalPages)
  const pagedRecords=records.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE)

  const changeTab=(next:CrmTab)=>{setTab(next);setStatus('Todos');setQuery('');setPage(1);setOpenMenu(null);setDialogMode(null);setSelected(null)}
  const changeQuery=(value:string)=>{setQuery(value);setPage(1)}
  const changeStatus=(value:string)=>{setStatus(value);setPage(1)}
  const openDialog=(record:CrmContact,mode:Exclude<DialogMode,'create'|null>)=>{setSelected(record);setDialogMode(mode);setOpenMenu(null)}
  const openCreate=()=>{setSelected(null);setDialogMode('create');setOpenMenu(null)}
  const closeDialog=()=>{setSelected(null);setDialogMode(null)}

  return <AdminShell
    area="crm"
    items={CRM_NAV}
    header={{title:'CRM',description:'Gestão operacional de contatos e leads do Portal Lander.'}}
    headerAction={{label:isLeads?'Novo lead':'Novo contato',onClick:openCreate}}
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
        <input value={query} onChange={event=>changeQuery(event.target.value)} placeholder={`Buscar ${isLeads?'lead':'contato'} por nome, empresa ou responsável...`}/>
      </label>
      <label className="sr-only" htmlFor="crm-status">Filtrar por status</label>
      <select id="crm-status" className="admin-filter crm-filter" value={status} onChange={event=>changeStatus(event.target.value)}>{statuses.map(value=><option key={value}>{value}</option>)}</select>
    </div>

    <section className="table-card crm-table-card">
      <table>
        <thead><tr><th>{isLeads?'Lead':'Contato'}</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th><th className="crm-actions-column">Ações</th></tr></thead>
        <tbody>{pagedRecords.map(record=><tr key={record.id}>
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

    <nav className="crm-pagination" aria-label={`Paginação de ${isLeads?'leads':'contatos'}`}>
      <button type="button" className="crm-pagination-button" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={currentPage===1} aria-label="Página anterior"><ChevronLeft size={16}/></button>
      <span>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
      <button type="button" className="crm-pagination-button" onClick={()=>setPage(value=>Math.min(totalPages,value+1))} disabled={currentPage===totalPages} aria-label="Próxima página"><ChevronRight size={16}/></button>
    </nav>

    {dialogMode&&<div className="crm-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)closeDialog()}}>
      <section className={`crm-dialog${dialogMode==='create'?' crm-dialog-create':''}`} role="dialog" aria-modal="true" aria-labelledby="crm-dialog-title">
        <div className="crm-dialog-head"><div><span>{isLeads?'Lead':'Contato'}</span><h2 id="crm-dialog-title">{dialogMode==='create'?(isLeads?'Novo lead':'Novo contato'):dialogMode==='view'?'Detalhes do registro':dialogMode==='edit'?'Editar registro':'Confirmar exclusão'}</h2></div><button type="button" className="crm-dialog-close" aria-label="Fechar" onClick={closeDialog}><X size={18}/></button></div>

        {dialogMode==='create'&&(isLeads?<CreateLeadForm onCancel={closeDialog}/>:<CreateContactForm onCancel={closeDialog}/>)}

        {selected&&dialogMode==='view'&&<div className="crm-detail-grid">
          <div><span>Nome</span><strong>{selected.name}</strong></div><div><span>Empresa</span><strong>{selected.company}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Responsável</span><strong>{selected.owner}</strong></div><div><span>Valor relacionado</span><strong>{formatCurrency(selected.relatedValue)}</strong></div>
        </div>}

        {selected&&dialogMode==='edit'&&<form className="crm-edit-form" onSubmit={event=>event.preventDefault()}>
          <label><span>Nome</span><input defaultValue={selected.name}/></label>
          <label><span>Empresa</span><input defaultValue={selected.company}/></label>
          <label><span>Status</span><input defaultValue={selected.status}/></label>
          <label><span>Responsável</span><input defaultValue={selected.owner}/></label>
          <label><span>Valor relacionado</span><input defaultValue={String(selected.relatedValue)}/></label>
          <div className="crm-dialog-note">Os campos estão disponíveis para revisão local, mas a gravação permanece bloqueada até existir backend persistente.</div>
          <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Salvar alterações</button></div>
        </form>}

        {selected&&dialogMode==='delete'&&<div className="crm-delete-confirmation"><p>Você está prestes a excluir <strong>{selected.name}</strong>. A exclusão definitiva exige confirmação e uma camada persistente conectada.</p><div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="button" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Confirmar exclusão</button></div></div>}
      </section>
    </div>}
  </AdminShell>
}
