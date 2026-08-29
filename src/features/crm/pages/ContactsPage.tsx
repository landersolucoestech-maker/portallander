import { BadgeCheck, ChevronLeft, ChevronRight, Flame, MoreHorizontal, Search, Target, UserCheck, UserPlus, Users, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { formatCurrency, statusClass, type CrmContact, type CrmLead } from '../model'
import { crmReadModel } from '../repository'

type CrmTab='contacts'|'leads'
type DialogMode='create'|'view'|'edit'|'delete'|null
type DetailTab='overview'|'relationship'|'history'
type CrmRecord=CrmContact|CrmLead

const PAGE_SIZE=10
const contactStatuses=['Todos','Contato','Cliente','Parceiro','Inativo'] as const
const leadStatuses=['Todos','Novo','Contatado','Qualificado','Proposta','Negociação','Convertido','Perdido'] as const
const contactCategories=['Artista / Banda','Empresário / Manager','Gravadora / Selo','Assessoria','Agência','Marca / Empresa','Anunciante','Produtora','Influenciador / Criador','Imprensa / Veículo','Fotógrafo / Videomaker','Evento / Festival','Parceiro','Fornecedor','Outro'] as const
const leadTypes=['Anunciante','Marca / Empresa','Artista / Banda','Gravadora / Selo','Assessoria','Agência','Produtora','Parceiro','Evento / Festival','Outro'] as const
const leadInterests=['Anunciar no Portal Lander','Publieditorial','Banner / mídia display','Divulgação de lançamento','Divulgação de evento','Cobertura de evento','Entrevista','Parceria','Mídia Kit','Patrocínio','Produção de conteúdo','Outro'] as const
const sources=['Anuncie Aqui','Colabore','Site','WhatsApp','Instagram','Facebook','E-mail','Indicação','Evento','Google','Meta Ads','Prospecção','Outro'] as const
const demoDescription='A estrutura abaixo já está adaptada ao fluxo do Portal Lander. Busca, filtros, visualização e formulários funcionam sobre dados demonstrativos; criação, edição e exclusão continuam bloqueadas até existir backend real.'

function FormField({label,children,wide=false}:{label:string;children:ReactNode;wide?:boolean}){
  return <label className={wide?'crm-form-field crm-form-field-wide':'crm-form-field'}><span>{label}</span>{children}</label>
}

function CreateContactForm({onCancel}:{onCancel:()=>void}){
  return <form className="crm-create-form" onSubmit={event=>event.preventDefault()}>
    <fieldset className="crm-form-section"><legend>Identificação</legend><div className="crm-form-grid">
      <FormField label="Nome / razão social"><input required placeholder="Nome do contato ou organização"/></FormField>
      <FormField label="Tipo de pessoa"><select defaultValue="PF"><option>PF</option><option>PJ</option></select></FormField>
      <FormField label="Empresa / organização"><input placeholder="Empresa relacionada"/></FormField>
      <FormField label="Cargo / função"><input placeholder="Ex.: Artista, assessor, diretor"/></FormField>
      <FormField label="Categoria"><select defaultValue="Artista / Banda">{contactCategories.map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="Status"><select defaultValue="Contato"><option>Contato</option><option>Cliente</option><option>Parceiro</option><option>Inativo</option></select></FormField>
    </div></fieldset>

    <fieldset className="crm-form-section"><legend>Contato e relacionamento</legend><div className="crm-form-grid">
      <FormField label="E-mail"><input type="email" placeholder="nome@empresa.com"/></FormField>
      <FormField label="Telefone / WhatsApp"><input type="tel" placeholder="(00) 00000-0000"/></FormField>
      <FormField label="Cidade / Estado"><input placeholder="Cidade / UF"/></FormField>
      <FormField label="Origem"><select defaultValue="Indicação">{sources.map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="Responsável interno"><input placeholder="Responsável pelo relacionamento"/></FormField>
      <FormField label="Próximo follow-up"><input type="datetime-local"/></FormField>
      <FormField label="Tags" wide><input placeholder="Ex.: Funk, Assessoria, VIP, São Paulo"/></FormField>
    </div></fieldset>

    <details className="crm-form-more"><summary>Mais informações</summary><div className="crm-form-grid">
      <FormField label="Site"><input type="url" placeholder="https://"/></FormField>
      <FormField label="Instagram / rede social"><input placeholder="@usuario ou URL"/></FormField>
      <FormField label="CPF / CNPJ"><input placeholder="Opcional"/></FormField>
      <FormField label="Endereço"><input placeholder="Endereço"/></FormField>
    </div></details>

    <FormField label="Observações" wide><textarea rows={4} placeholder="Contexto editorial, comercial ou institucional relevante."/></FormField>
    <div className="crm-dialog-note">A modelagem já está preparada para relacionamento editorial e comercial. O salvamento permanece desabilitado até existir persistência real.</div>
    <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={onCancel}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Adicionar contato</button></div>
  </form>
}

function CreateLeadForm({onCancel}:{onCancel:()=>void}){
  return <form className="crm-create-form" onSubmit={event=>event.preventDefault()}>
    <fieldset className="crm-form-section"><legend>Identificação</legend><div className="crm-form-grid">
      <FormField label="Nome"><input required placeholder="Nome do lead"/></FormField>
      <FormField label="Empresa / organização"><input placeholder="Empresa ou organização"/></FormField>
      <FormField label="Cargo / função"><input placeholder="Ex.: Marketing, assessoria, direção"/></FormField>
      <FormField label="Tipo de lead"><select defaultValue="Anunciante">{leadTypes.map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="E-mail"><input type="email" placeholder="nome@empresa.com"/></FormField>
      <FormField label="Telefone / WhatsApp"><input type="tel" placeholder="(00) 00000-0000"/></FormField>
      <FormField label="Cidade / Estado"><input placeholder="Cidade / UF"/></FormField>
    </div></fieldset>

    <fieldset className="crm-form-section"><legend>Oportunidade</legend><div className="crm-form-grid">
      <FormField label="Interesse"><select defaultValue="Anunciar no Portal Lander">{leadInterests.map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="Status"><select defaultValue="Novo">{leadStatuses.filter(value=>value!=='Todos').map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="Temperatura"><select defaultValue="Morno"><option>Frio</option><option>Morno</option><option>Quente</option></select></FormField>
      <FormField label="Valor potencial"><input type="number" min="0" inputMode="decimal" placeholder="0"/></FormField>
      <FormField label="Próxima ação"><input placeholder="Ex.: enviar proposta de mídia"/></FormField>
      <FormField label="Próximo follow-up"><input type="datetime-local"/></FormField>
    </div></fieldset>

    <fieldset className="crm-form-section"><legend>Origem e atribuição</legend><div className="crm-form-grid">
      <FormField label="Origem"><select defaultValue="Anuncie Aqui">{sources.map(value=><option key={value}>{value}</option>)}</select></FormField>
      <FormField label="Responsável"><input placeholder="Responsável pelo lead"/></FormField>
      <FormField label="Campanha"><input placeholder="Campanha ou ação de origem"/></FormField>
      <FormField label="UTM source"><input placeholder="utm_source"/></FormField>
      <FormField label="Tags" wide><input placeholder="Ex.: Publicidade, Evento, Prioridade"/></FormField>
    </div></fieldset>

    <FormField label="Observações" wide><textarea rows={4} placeholder="Necessidade, contexto, objeções e informações relevantes."/></FormField>
    <div className="crm-dialog-note">O lead está preparado para origem, interesse, temperatura, follow-up e futura conversão em contato sem criar um módulo separado de pipeline.</div>
    <div className="crm-dialog-actions"><button type="button" className="button outline" onClick={onCancel}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Adicionar lead</button></div>
  </form>
}

function DetailValue({label,value}:{label:string;value:ReactNode}){
  return <div><span>{label}</span><strong>{value||'—'}</strong></div>
}

function RecordDetails({record,isLead}:{record:CrmRecord;isLead:boolean}){
  const [detailTab,setDetailTab]=useState<DetailTab>('overview')
  const lead=isLead?record as CrmLead:null
  const contact=!isLead?record as CrmContact:null
  const tags=isLead?(lead?.tags||[]):(contact?.tags||[])

  return <>
    <div className="crm-detail-tabs" role="tablist" aria-label="Detalhes do relacionamento">
      <button type="button" className={detailTab==='overview'?'active':''} onClick={()=>setDetailTab('overview')}>Visão geral</button>
      <button type="button" className={detailTab==='relationship'?'active':''} onClick={()=>setDetailTab('relationship')}>Relacionamento</button>
      <button type="button" className={detailTab==='history'?'active':''} onClick={()=>setDetailTab('history')}>Histórico</button>
    </div>

    {detailTab==='overview'&&<div className="crm-detail-grid">
      <DetailValue label="Nome" value={record.name}/><DetailValue label="Empresa" value={record.company}/>
      <DetailValue label="Cargo / função" value={record.role}/><DetailValue label="Localização" value={record.location}/>
      <DetailValue label="E-mail" value={record.email}/><DetailValue label="Telefone / WhatsApp" value={record.phone}/>
      <DetailValue label={isLead?'Tipo de lead':'Categoria'} value={isLead?lead?.leadType:contact?.category}/>
      <DetailValue label="Status" value={<span className={`status ${statusClass(isLead?lead!.status:contact!.status)}`}>{isLead?lead!.status:contact!.status}</span>}/>
    </div>}

    {detailTab==='relationship'&&<div className="crm-detail-grid">
      <DetailValue label="Origem" value={isLead?lead?.source:contact?.source}/><DetailValue label="Responsável" value={isLead?lead?.owner:contact?.owner}/>
      {isLead&&<><DetailValue label="Interesse" value={lead?.interest}/><DetailValue label="Temperatura" value={lead?.temperature}/><DetailValue label="Valor potencial" value={formatCurrency(lead?.potentialValue||0)}/><DetailValue label="Próxima ação" value={lead?.nextAction}/></>}
      {!isLead&&<><DetailValue label="Tipo de pessoa" value={contact?.personType}/><DetailValue label="Valor relacionado" value={formatCurrency(contact?.relatedValue||0)}/></>}
      <div className="crm-detail-wide"><span>Tags</span><div className="crm-tag-list">{tags.length?tags.map(tag=><b key={tag}>{tag}</b>):'—'}</div></div>
    </div>}

    {detailTab==='history'&&<div className="crm-history-panel">
      <div><span>Última interação</span><strong>{isLead?'Ainda não registrada no snapshot':contact?.lastInteraction||'—'}</strong></div>
      <div><span>Próximo follow-up</span><strong>{isLead?lead?.nextFollowUp:contact?.nextFollowUp||'—'}</strong></div>
      {isLead&&lead?.campaign&&<div><span>Campanha de origem</span><strong>{lead.campaign}</strong></div>}
      {isLead&&lead?.utmSource&&<div><span>UTM source</span><strong>{lead.utmSource}</strong></div>}
      <p>Mensagens, conteúdos relacionados, notas e mudanças de status poderão compor esta linha do tempo quando as integrações e o backend estiverem conectados.</p>
    </div>}
  </>
}

export function ContactsPage(){
  const [tab,setTab]=useState<CrmTab>('contacts')
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<string>('Todos')
  const [page,setPage]=useState(1)
  const [openMenu,setOpenMenu]=useState<string|null>(null)
  const [selected,setSelected]=useState<CrmRecord|null>(null)
  const [dialogMode,setDialogMode]=useState<DialogMode>(null)
  const isLeads=tab==='leads'
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const metrics=crmReadModel.metrics
  const statuses=isLeads?leadStatuses:contactStatuses
  const kpis=isLeads
    ? [['Total de leads',String(metrics.leads),'Base demonstrativa',Target],['Qualificados',String(metrics.qualifiedLeads),'Proposta ou negociação',BadgeCheck],['Leads quentes',String(metrics.hotLeads),'Prioridade comercial',Flame],['Convertidos',String(metrics.convertedLeads),'Relacionamento convertido',UserCheck]] as const
    : [['Total de contatos',String(metrics.contacts),'Base demonstrativa',Users],['Clientes',String(metrics.clients),'Relacionamento comercial',UserCheck],['Parceiros',String(crmReadModel.contacts.filter(item=>item.status==='Parceiro').length),'Rede de relacionamento',Users],['Com follow-up',String(crmReadModel.contacts.filter(item=>item.nextFollowUp).length),'Acompanhamento previsto',UserPlus]] as const

  const baseRecords=useMemo<readonly CrmRecord[]>(()=>isLeads?crmReadModel.leads:crmReadModel.contacts,[isLeads])
  const records=useMemo(()=>baseRecords.filter(record=>{
    const searchable=isLeads
      ? [record.name,record.company,(record as CrmLead).leadType,(record as CrmLead).interest,(record as CrmLead).source,(record as CrmLead).owner]
      : [record.name,record.company,(record as CrmContact).category,(record as CrmContact).source,(record as CrmContact).owner]
    const matchesQuery=!normalized||searchable.some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesStatus=status==='Todos'||record.status===status
    return matchesQuery&&matchesStatus
  }),[baseRecords,isLeads,normalized,status])

  const totalPages=Math.max(1,Math.ceil(records.length/PAGE_SIZE))
  const currentPage=Math.min(page,totalPages)
  const pagedRecords=records.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE)
  const changeTab=(next:CrmTab)=>{setTab(next);setStatus('Todos');setQuery('');setPage(1);setOpenMenu(null);setDialogMode(null);setSelected(null)}
  const openDialog=(record:CrmRecord,mode:Exclude<DialogMode,'create'|null>)=>{setSelected(record);setDialogMode(mode);setOpenMenu(null)}
  const closeDialog=()=>{setSelected(null);setDialogMode(null)}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'CRM',description:'Relacionamentos editoriais, comerciais e institucionais do Portal Lander.'}} headerAction={{label:isLeads?'Novo lead':'Novo contato',onClick:()=>{setSelected(null);setDialogMode('create');setOpenMenu(null)}}}>
    <AdminNotice title="Dados de demonstração" description={demoDescription}/>

    <div className="admin-kpi-grid crm-kpi-grid">{kpis.map(([label,value,detail,Icon])=><AdminKpi key={label} label={label} value={value} detail={detail} icon={<Icon size={16}/>}/>)}</div>

    <div className="crm-tabs" role="tablist" aria-label="Visões do CRM"><button type="button" role="tab" aria-selected={!isLeads} className={!isLeads?'active':''} onClick={()=>changeTab('contacts')}>Contatos</button><button type="button" role="tab" aria-selected={isLeads} className={isLeads?'active':''} onClick={()=>changeTab('leads')}>Leads</button></div>

    <div className="crm-toolbar">
      <label className="searchbox crm-searchbox"><span className="sr-only">Buscar {isLeads?'leads':'contatos'}</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder={`Buscar ${isLeads?'lead, interesse, origem':'contato, categoria, origem'}...`}/></label>
      <label className="sr-only" htmlFor="crm-status">Filtrar por status</label><select id="crm-status" className="admin-filter crm-filter" value={status} onChange={event=>{setStatus(event.target.value);setPage(1)}}>{statuses.map(value=><option key={value}>{value}</option>)}</select>
    </div>

    <section className="table-card crm-table-card"><table><thead><tr>{isLeads?<><th>Lead</th><th>Interesse</th><th>Origem</th><th>Status</th><th>Temperatura</th><th>Valor potencial</th></>:<><th>Contato</th><th>Categoria</th><th>Origem</th><th>Status</th><th>Responsável</th></>}<th className="crm-actions-column">Ações</th></tr></thead><tbody>{pagedRecords.map(record=>{
      const lead=isLeads?record as CrmLead:null
      const contact=!isLeads?record as CrmContact:null
      return <tr key={record.id}>
        <td><div className="table-primary"><span className="table-avatar">{record.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{record.name}</b><small>{record.company||record.role}</small></div></div></td>
        {isLeads?<><td>{lead!.interest}</td><td>{lead!.source}</td><td><span className={`status ${statusClass(lead!.status)}`}>{lead!.status}</span></td><td><span className={`crm-temperature ${lead!.temperature.toLowerCase()}`}>{lead!.temperature}</span></td><td><strong>{formatCurrency(lead!.potentialValue)}</strong></td></>:<><td>{contact!.category}</td><td>{contact!.source}</td><td><span className={`status ${statusClass(contact!.status)}`}>{contact!.status}</span></td><td>{contact!.owner}</td></>}
        <td className="crm-actions-cell"><div className="crm-row-menu-wrap"><button className="crm-row-menu-button" type="button" aria-label={`Ações de ${record.name}`} aria-expanded={openMenu===record.id} onClick={()=>setOpenMenu(value=>value===record.id?null:record.id)}><MoreHorizontal size={18}/></button>{openMenu===record.id&&<div className="crm-row-menu" role="menu"><button type="button" role="menuitem" onClick={()=>openDialog(record,'view')}>Ver</button><button type="button" role="menuitem" onClick={()=>openDialog(record,'edit')}>Editar</button><button type="button" role="menuitem" className="danger" onClick={()=>openDialog(record,'delete')}>Excluir</button></div>}</div></td>
      </tr>})}</tbody></table>{records.length===0&&<div className="table-empty-row">Nenhum {isLeads?'lead':'contato'} corresponde aos filtros atuais.</div>}</section>

    <nav className="crm-pagination" aria-label={`Paginação de ${isLeads?'leads':'contatos'}`}><button type="button" className="crm-pagination-button" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={currentPage===1} aria-label="Página anterior"><ChevronLeft size={16}/></button><span>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span><button type="button" className="crm-pagination-button" onClick={()=>setPage(value=>Math.min(totalPages,value+1))} disabled={currentPage===totalPages} aria-label="Próxima página"><ChevronRight size={16}/></button></nav>

    {dialogMode&&<div className="crm-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)closeDialog()}}><section className={`crm-dialog${dialogMode==='create'||dialogMode==='view'?' crm-dialog-create':''}`} role="dialog" aria-modal="true" aria-labelledby="crm-dialog-title"><div className="crm-dialog-head"><div><span>{isLeads?'Lead':'Contato'}</span><h2 id="crm-dialog-title">{dialogMode==='create'?(isLeads?'Novo lead':'Novo contato'):dialogMode==='view'?'Perfil do relacionamento':dialogMode==='edit'?'Editar registro':'Confirmar exclusão'}</h2></div><button type="button" className="crm-dialog-close" aria-label="Fechar" onClick={closeDialog}><X size={18}/></button></div>
      {dialogMode==='create'&&(isLeads?<CreateLeadForm onCancel={closeDialog}/>:<CreateContactForm onCancel={closeDialog}/>)}
      {selected&&dialogMode==='view'&&<RecordDetails record={selected} isLead={isLeads}/>} 
      {selected&&dialogMode==='edit'&&<form className="crm-edit-form" onSubmit={event=>event.preventDefault()}><label><span>Nome</span><input defaultValue={selected.name}/></label><label><span>Empresa</span><input defaultValue={selected.company}/></label><label><span>Status</span><input defaultValue={selected.status}/></label><label><span>Responsável</span><input defaultValue={isLeads?(selected as CrmLead).owner:(selected as CrmContact).owner}/></label><div className="crm-dialog-note">A edição está preparada na interface, mas a gravação permanece bloqueada até existir backend persistente.</div><div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="submit" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Salvar alterações</button></div></form>}
      {selected&&dialogMode==='delete'&&<div className="crm-delete-confirmation"><p>Você está prestes a excluir <strong>{selected.name}</strong>. A exclusão definitiva exige uma camada persistente conectada.</p><div className="crm-dialog-actions"><button type="button" className="button outline" onClick={closeDialog}>Cancelar</button><button type="button" className="button dark" disabled title={ADMIN_CAPABILITIES.crmPersistence.description}>Confirmar exclusão</button></div></div>}
    </section></div>}
  </AdminShell>
}
