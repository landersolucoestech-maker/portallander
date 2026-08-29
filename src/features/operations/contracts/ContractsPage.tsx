import { AlertCircle, CheckCircle, Clock, DollarSign, Eye, FileStack, FileText, MoreHorizontal, Pencil, PenLine, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { ContratoViewModal, type ViewContract } from './ContratoViewModal'
import { ContratoWizard, type ContractWizardPayload } from './ContratoWizard'
import { SigningPlatformBadge } from './SigningPlatformBadge'

type Contract=ViewContract

const TODAY_MS=new Date('2026-08-29T00:00:00-03:00').getTime()
const PAGE_SIZE=10
const INITIAL:Contract[]=[
  {id:'ctr-001',title:'Pacote de mídia · Norte Produções',client:'Norte Produções',type:'Agenciamento',platform:'Autentique',status:'Aguardando Assinatura',start:'2026-09-01',end:'2026-09-30',value:18000,signers:[{name:'Norte Produções',email:'contato@norte.com',order:1,platform:'Autentique'}]},
  {id:'ctr-002',title:'Cobertura · Festival Órbita',client:'Festival Órbita',type:'Licenciamento',platform:'Sem plataforma',status:'Rascunho',start:'2026-09-10',end:'2026-09-12',value:12000,signers:[]},
  {id:'ctr-003',title:'Parceria · Studio Sul',client:'Studio Sul',type:'Distribuição',platform:'Autentique',status:'Vigente',start:'2026-08-01',end:'2027-07-31',value:9000,signers:[{name:'Studio Sul',email:'studio@sul.com',order:1,platform:'Autentique'}]},
]

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const formatDate=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

function ActionMenu({contract,onView,onEdit,onDelete}:{contract:Contract;onView:()=>void;onEdit:()=>void;onDelete:()=>void}){
  const [open,setOpen]=useState(false)
  const root=useRef<HTMLDivElement>(null)
  return <div className="table-row-actions contracts-row-action-menu" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false)}}>
    <button type="button" className="table-row-actions-trigger" aria-label={`Ações de ${contract.title}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><MoreHorizontal size={16}/></button>
    {open&&<div className="table-row-actions-menu" role="menu">
      <button type="button" role="menuitem" onClick={()=>{setOpen(false);onView()}}><Eye size={14}/> Ver</button>
      <button type="button" role="menuitem" onClick={()=>{setOpen(false);onEdit()}}><Pencil size={14}/> Editar</button>
      <button type="button" role="menuitem" className="danger" onClick={()=>{setOpen(false);onDelete()}}><Trash2 size={14}/> Excluir</button>
    </div>}
  </div>
}

export function ContractsPage(){
  const [contracts,setContracts]=useState<Contract[]>(INITIAL)
  const [selectedIds,setSelectedIds]=useState<string[]>([])
  const [wizardOpen,setWizardOpen]=useState(false)
  const [viewing,setViewing]=useState<Contract|null>(null)
  const [editing,setEditing]=useState<Contract|null>(null)
  const [deleting,setDeleting]=useState<Contract|null>(null)
  const [searchTerm,setSearchTerm]=useState('')
  const [typeFilter,setTypeFilter]=useState('all-type')
  const [statusFilter,setStatusFilter]=useState('all-status')
  const [platformFilter,setPlatformFilter]=useState('all-platform')
  const [page,setPage]=useState(0)

  const filtered=useMemo(()=>{
    const q=searchTerm.trim().toLocaleLowerCase('pt-BR')
    return contracts.filter(contract=>(!q||`${contract.title} ${contract.client} ${contract.type}`.toLocaleLowerCase('pt-BR').includes(q))&&(typeFilter==='all-type'||contract.type===typeFilter)&&(statusFilter==='all-status'||contract.status===statusFilter)&&(platformFilter==='all-platform'||contract.platform===platformFilter))
  },[contracts,searchTerm,typeFilter,statusFilter,platformFilter])

  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const safePage=Math.min(page,pageCount-1)
  const pageItems=filtered.slice(safePage*PAGE_SIZE,safePage*PAGE_SIZE+PAGE_SIZE)
  const hasActiveFilters=searchTerm!==''||typeFilter!=='all-type'||statusFilter!=='all-status'||platformFilter!=='all-platform'
  const allPageSelected=pageItems.length>0&&pageItems.every(contract=>selectedIds.includes(contract.id))
  const counts={
    vigentes:contracts.filter(contract=>['Vigente','Ativo'].includes(contract.status)).length,
    assinados:contracts.filter(contract=>contract.status==='Assinado').length,
    aguardando:contracts.filter(contract=>contract.status==='Aguardando Assinatura').length,
    analise:contracts.filter(contract=>['Pendente','Rascunho'].includes(contract.status)).length,
    encerrados:contracts.filter(contract=>['Expirado','Rescindido','Cancelado'].includes(contract.status)).length,
  }
  const totalValue=contracts.filter(contract=>['Vigente','Ativo','Assinado'].includes(contract.status)).reduce((sum,contract)=>sum+contract.value,0)

  const resetFilters=()=>{setSearchTerm('');setTypeFilter('all-type');setStatusFilter('all-status');setPlatformFilter('all-platform');setPage(0)}
  const toggleAll=()=>setSelectedIds(allPageSelected?selectedIds.filter(id=>!pageItems.some(contract=>contract.id===id)):[...new Set([...selectedIds,...pageItems.map(contract=>contract.id)])])
  const deleteSelected=()=>{setContracts(items=>items.filter(contract=>!selectedIds.includes(contract.id)));setSelectedIds([])}
  const confirmDelete=()=>{if(!deleting)return;setContracts(items=>items.filter(contract=>contract.id!==deleting.id));setSelectedIds(ids=>ids.filter(id=>id!==deleting.id));setDeleting(null)}
  const saveNew=(payload:ContractWizardPayload)=>{setContracts(items=>[{id:`ctr-${String(items.length+1).padStart(3,'0')}`, ...payload},...items]);setWizardOpen(false);setPage(0)}
  const saveEdit=()=>{if(!editing)return;setContracts(items=>items.map(contract=>contract.id===editing.id?editing:contract));setEditing(null)}
  const updateSigning=(provider:string)=>{if(!viewing)return;const updated={...viewing,platform:provider,status:'Aguardando Assinatura'};setContracts(items=>items.map(contract=>contract.id===updated.id?updated:contract));setViewing(updated)}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Contratos',description:'Gerencie contratos e documentação legal'}} headerAction={{label:'Novo Contrato',onClick:()=>setWizardOpen(true)}}>
    <div className="zip-stack contracts-page contracts-cloned-module">
      <div className="zip-kpi-grid four">
        {[
          ['Total de Contratos',String(contracts.length),'na base',<FileStack size={18}/>],
          ['Vigentes',String(counts.vigentes),'em vigor',<CheckCircle size={18}/>],
          ['Assinados',String(counts.assinados),'assinados',<PenLine size={18}/>],
          ['Aguardando Assinatura',String(counts.aguardando),'pendentes de assinar',<Clock size={18}/>],
          ['Em Análise',String(counts.analise),'pendente / rascunho',<FileText size={18}/>],
          ['Encerrados',String(counts.encerrados),'expirados / rescindidos / cancelados',<AlertCircle size={18}/>],
          ['Valor Total',money(totalValue),'vigentes + assinados',<DollarSign size={18}/>],
        ].map(([title,value,description,icon])=><article className="zip-metric" key={String(title)}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>)}
      </div>

      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={searchTerm} onChange={event=>{setSearchTerm(event.target.value);setPage(0)}} placeholder="Buscar por artista, tipo ou título…"/></label>
        <select value={typeFilter} onChange={event=>{setTypeFilter(event.target.value);setPage(0)}}><option value="all-type">Todos os tipos</option><option>Agenciamento</option><option>Distribuição</option><option>Licenciamento</option><option>Edição</option></select>
        <select value={statusFilter} onChange={event=>{setStatusFilter(event.target.value);setPage(0)}}><option value="all-status">Todos os status</option><option>Assinado</option><option>Vigente</option><option>Ativo</option><option>Aguardando Assinatura</option><option>Pendente</option><option>Rascunho</option><option>Expirado</option><option>Rescindido</option><option>Cancelado</option></select>
        <select value={platformFilter} onChange={event=>{setPlatformFilter(event.target.value);setPage(0)}}><option value="all-platform">Todas as plataformas</option><option>Autentique</option><option>Clicksign</option><option>DocuSign</option><option>Sem plataforma</option></select>
        {hasActiveFilters&&<button className="zip-button secondary" type="button" onClick={resetFilters}><X size={14}/> Limpar</button>}
      </div>

      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>Lista de Contratos</h2><p>Acompanhe todos os contratos e seus vencimentos</p></div><div className="contracts-inline-actions">{selectedIds.length>0&&<button className="zip-button danger" type="button" onClick={deleteSelected}><Trash2 size={14}/> Excluir ({selectedIds.length})</button>}</div></header>
        <div className="zip-table-wrap"><table className="zip-table"><thead><tr><th><input type="checkbox" checked={allPageSelected} onChange={toggleAll}/></th><th>Título</th><th>Artista / Cliente</th><th>Tipo</th><th>Plataforma</th><th>Status</th><th>Período</th><th>Valor</th><th className="actions-col">Ações</th></tr></thead><tbody>
          {pageItems.length?pageItems.map(contract=>{const days=Math.ceil((new Date(`${contract.end}T12:00:00`).getTime()-TODAY_MS)/86400000);const nearExpiry=days>=0&&days<=30;return <tr key={contract.id}><td><input type="checkbox" checked={selectedIds.includes(contract.id)} onChange={()=>setSelectedIds(ids=>ids.includes(contract.id)?ids.filter(id=>id!==contract.id):[...ids,contract.id])}/></td><td><strong>{contract.title}</strong></td><td>{contract.client}</td><td>{contract.type}</td><td><SigningPlatformBadge platform={contract.platform}/></td><td><div className="contracts-status-cell"><span className={`zip-badge ${['Vigente','Ativo','Assinado'].includes(contract.status)?'zip-badge-success':contract.status==='Aguardando Assinatura'?'zip-badge-warning':''}`}>{contract.status}</span>{nearExpiry&&<small className="contracts-expiry-badge"><AlertCircle size={11}/>{days}d</small>}</div></td><td>{formatDate(contract.start)} – {formatDate(contract.end)}</td><td>{contract.value?money(contract.value):'—'}</td><td className="actions-col"><ActionMenu contract={contract} onView={()=>setViewing(contract)} onEdit={()=>setEditing({...contract})} onDelete={()=>setDeleting(contract)}/></td></tr>})
          :<tr><td colSpan={9} className="contracts-empty-row">{hasActiveFilters?'Nenhum contrato corresponde aos filtros aplicados.':'Nenhum contrato cadastrado.'}</td></tr>}
        </tbody></table></div>
        {!pageItems.length&&!hasActiveFilters&&<div className="contracts-empty-action"><FileText size={28}/><strong>Nenhum contrato cadastrado</strong><p>Crie o primeiro contrato para começar.</p><button className="zip-button" type="button" onClick={()=>setWizardOpen(true)}><Plus size={14}/> Novo Contrato</button></div>}
        {filtered.length>0&&<footer className="contracts-pagination"><span>Página {safePage+1} de {pageCount} · {filtered.length} registro(s)</span><button type="button" className="zip-button secondary" disabled={safePage===0} onClick={()=>setPage(value=>Math.max(0,value-1))}>Anterior</button><button type="button" className="zip-button secondary" disabled={safePage>=pageCount-1} onClick={()=>setPage(value=>Math.min(pageCount-1,value+1))}>Próxima</button></footer>}
      </section>
    </div>

    <ContratoWizard open={wizardOpen} onClose={()=>setWizardOpen(false)} onSave={saveNew}/>
    <ContratoViewModal open={Boolean(viewing)} contract={viewing} onClose={()=>setViewing(null)} onEdit={()=>{if(viewing){setEditing({...viewing});setViewing(null)}}} onSigningUpdate={updateSigning}/>

    {deleting&&<div className="reference-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setDeleting(null)}><section className="reference-modal contracts-delete-modal"><header className="reference-modal-head"><div><span>CONTRATOS</span><h2>Excluir Contrato</h2></div><button className="reference-modal-close" type="button" onClick={()=>setDeleting(null)}><X size={17}/></button></header><div className="reference-modal-body"><p>Tem certeza que deseja excluir o contrato <strong>“{deleting.title}”</strong>?</p><p>Esta ação não pode ser desfeita.</p></div><footer className="reference-modal-footer"><button className="zip-button secondary" type="button" onClick={()=>setDeleting(null)}>Cancelar</button><button className="zip-button danger" type="button" onClick={confirmDelete}><Trash2 size={14}/> Excluir</button></footer></section></div>}

    {editing&&<div className="reference-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setEditing(null)}><section className="reference-modal"><header className="reference-modal-head"><div><span>CONTRATOS</span><h2>Editar Contrato</h2></div><button className="reference-modal-close" type="button" onClick={()=>setEditing(null)}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label className="wide"><span>Título</span><input value={editing.title} onChange={event=>setEditing(value=>value?{...value,title:event.target.value}:value)}/></label><label><span>Artista / Cliente</span><input value={editing.client} onChange={event=>setEditing(value=>value?{...value,client:event.target.value}:value)}/></label><label><span>Tipo</span><select value={editing.type} onChange={event=>setEditing(value=>value?{...value,type:event.target.value}:value)}><option>Agenciamento</option><option>Distribuição</option><option>Licenciamento</option><option>Edição</option></select></label><label><span>Status</span><select value={editing.status} onChange={event=>setEditing(value=>value?{...value,status:event.target.value}:value)}><option>Rascunho</option><option>Pendente</option><option>Aguardando Assinatura</option><option>Assinado</option><option>Vigente</option><option>Ativo</option><option>Expirado</option><option>Rescindido</option><option>Cancelado</option></select></label><label><span>Plataforma</span><select value={editing.platform} onChange={event=>setEditing(value=>value?{...value,platform:event.target.value}:value)}><option>Sem plataforma</option><option>Autentique</option><option>Clicksign</option><option>DocuSign</option></select></label><label><span>Início</span><input type="date" value={editing.start} onChange={event=>setEditing(value=>value?{...value,start:event.target.value}:value)}/></label><label><span>Fim</span><input type="date" value={editing.end} onChange={event=>setEditing(value=>value?{...value,end:event.target.value}:value)}/></label><label><span>Valor</span><input type="number" value={editing.value} onChange={event=>setEditing(value=>value?{...value,value:Number(event.target.value)}:value)}/></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" type="button" onClick={()=>setEditing(null)}>Cancelar</button><button className="zip-button" type="button" onClick={saveEdit}>Salvar Alterações</button></footer></section></div>}
  </AdminShell>
}
