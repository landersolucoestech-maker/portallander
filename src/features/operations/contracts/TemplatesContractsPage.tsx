import { Eye, FileText, MoreHorizontal, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { ContractImportWorkspace } from './ContractImportWorkspace'
import { ContractA4Preview } from './ContractA4Preview'

type Template={id:string;name:string;category:string;type:'semantico'|'padrao';active:boolean;variables:number;createdAt:string;content:string}
const INITIAL:Template[]=[
  {id:'tpl-001',name:'Contrato de Agenciamento',category:'Agenciamento',type:'semantico',active:true,variables:18,createdAt:'2026-08-20',content:'CONTRATO DE AGENCIAMENTO\n\n{{EMPRESA.RAZAO_SOCIAL}} e {{CLIENTE.NOME}} celebram o presente contrato.'},
  {id:'tpl-002',name:'Contrato de Distribuição',category:'Distribuição',type:'semantico',active:true,variables:14,createdAt:'2026-08-18',content:'CONTRATO DE DISTRIBUIÇÃO\n\nPartes: {{EMPRESA.RAZAO_SOCIAL}} e {{CLIENTE.NOME}}.'},
  {id:'tpl-003',name:'Contrato Padrão de Licenciamento',category:'Licenciamento',type:'padrao',active:false,variables:9,createdAt:'2026-08-12',content:'CONTRATO DE LICENCIAMENTO\n\nObjeto e condições a preencher.'},
]
const date=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

function TemplateActions({template,onView,onEdit,onDelete}:{template:Template;onView:()=>void;onEdit:()=>void;onDelete:()=>void}){
  const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null)
  return <div className="table-row-actions contracts-row-action-menu" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false)}}><button type="button" className="table-row-actions-trigger" onClick={()=>setOpen(value=>!value)} aria-label={`Ações de ${template.name}`}><MoreHorizontal size={16}/></button>{open&&<div className="table-row-actions-menu"><button type="button" onClick={()=>{setOpen(false);onView()}}><Eye size={14}/> Ver</button><button type="button" onClick={()=>{setOpen(false);onEdit()}}><Pencil size={14}/> Editar</button><button type="button" className="danger" onClick={()=>{setOpen(false);onDelete()}}><Trash2 size={14}/> Excluir</button></div>}</div>
}

export function TemplatesContractsPage(){
  const [templates,setTemplates]=useState(INITIAL)
  const [selected,setSelected]=useState<string[]>([])
  const [search,setSearch]=useState('')
  const [filterType,setFilterType]=useState<'all'|'semantico'|'padrao'>('all')
  const [filterStatus,setFilterStatus]=useState<'all'|'ativo'|'inativo'>('all')
  const [workspaceOpen,setWorkspaceOpen]=useState(false)
  const [editing,setEditing]=useState<Template|null>(null)
  const [viewing,setViewing]=useState<Template|null>(null)
  const [deleting,setDeleting]=useState<Template|null>(null)
  const filtered=useMemo(()=>templates.filter(template=>(!search||`${template.name} ${template.category}`.toLowerCase().includes(search.toLowerCase()))&&(filterType==='all'||template.type===filterType)&&(filterStatus==='all'||(filterStatus==='ativo'?template.active:!template.active))),[templates,search,filterType,filterStatus])
  const semantic=templates.filter(template=>template.type==='semantico').length
  const active=templates.filter(template=>template.active).length
  const variables=templates.reduce((sum,template)=>sum+template.variables,0)
  const allSelected=filtered.length>0&&filtered.every(template=>selected.includes(template.id))
  const hasFilters=Boolean(search)||filterType!=='all'||filterStatus!=='all'
  const saveTemplate=(draft:{name:string;category:string;content:string;active:boolean})=>{if(editing){setTemplates(items=>items.map(template=>template.id===editing.id?{...template,name:draft.name,category:draft.category,content:draft.content,active:draft.active}:template));setEditing(null)}else{setTemplates(items=>[{id:`tpl-${String(items.length+1).padStart(3,'0')}`,name:draft.name,category:draft.category,type:draft.category==='Semântico IA'?'semantico':'padrao',active:draft.active,variables:(draft.content.match(/{{[^}]+}}/g)||[]).length,createdAt:'2026-08-29',content:draft.content},...items])}setWorkspaceOpen(false)}
  const confirmDelete=()=>{if(!deleting)return;setTemplates(items=>items.filter(template=>template.id!==deleting.id));setSelected(ids=>ids.filter(id=>id!==deleting.id));setDeleting(null)}
  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Templates de Contrato',description:'Motor semântico de templates contratuais'}} headerAction={{label:'Novo Template',onClick:()=>{setEditing(null);setWorkspaceOpen(true)}}}>
    <div className="zip-stack contracts-templates-page">
      <div className="zip-kpi-grid four">{[
        ['Total de Templates',String(templates.length),'modelos cadastrados',<FileText size={18}/>],['Semânticos (IA)',String(semantic),'com manifesto semântico',<Sparkles size={18}/>],['Ativos',String(active),'disponíveis para uso',<FileText size={18}/>],['Variáveis Mapeadas',String(variables),'placeholders registrados',<Sparkles size={18}/>],
      ].map(([title,value,description,icon])=><article className="zip-metric" key={String(title)}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>)}</div>
      <div className="zip-toolbar"><label className="zip-search"><Search size={14}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar por nome ou descrição..."/></label><select value={filterType} onChange={event=>setFilterType(event.target.value as typeof filterType)}><option value="all">Todos os tipos</option><option value="semantico">Semântico (IA)</option><option value="padrao">Padrão</option></select><select value={filterStatus} onChange={event=>setFilterStatus(event.target.value as typeof filterStatus)}><option value="all">Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>{hasFilters&&<button className="zip-button secondary" type="button" onClick={()=>{setSearch('');setFilterType('all');setFilterStatus('all')}}><X size={14}/> Limpar</button>}</div>
      <section className="zip-panel"><header className="zip-panel-head"><div><h2>Lista de Templates</h2><p>Gerencie modelos contratuais reutilizáveis.</p></div>{selected.length>0&&<button className="zip-button danger" type="button" onClick={()=>{setTemplates(items=>items.filter(template=>!selected.includes(template.id)));setSelected([])}}><Trash2 size={14}/> Excluir ({selected.length})</button>}</header><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th><input type="checkbox" checked={allSelected} onChange={()=>setSelected(allSelected?[]:filtered.map(template=>template.id))}/></th><th>Nome</th><th>Categoria</th><th>Status</th><th>Data de Criação</th><th className="actions-col">Ações</th></tr></thead><tbody>{filtered.length?filtered.map(template=><tr key={template.id}><td><input type="checkbox" checked={selected.includes(template.id)} onChange={()=>setSelected(ids=>ids.includes(template.id)?ids.filter(id=>id!==template.id):[...ids,template.id])}/></td><td><strong>{template.name}</strong><div className="contracts-template-tags"><span className="zip-badge">{template.type==='semantico'?'Semântico IA':'Padrão'}</span>{template.type==='semantico'&&<span className="zip-badge contracts-ai-badge"><Sparkles size={10}/> IA</span>}</div></td><td>{template.category}</td><td><span className={`zip-badge ${template.active?'zip-badge-success':''}`}>{template.active?'Ativo':'Inativo'}</span></td><td>{date(template.createdAt)}</td><td className="actions-col"><TemplateActions template={template} onView={()=>setViewing(template)} onEdit={()=>{setEditing(template);setWorkspaceOpen(true)}} onDelete={()=>setDeleting(template)}/></td></tr>):<tr><td colSpan={6} className="contracts-empty-row">Nenhum template encontrado.</td></tr>}</tbody></table></div></section>
    </div>
    <ContractImportWorkspace key={`${editing?.id??'new'}-${workspaceOpen}`} open={workspaceOpen} initial={editing?{name:editing.name,category:editing.category,content:editing.content,active:editing.active}:null} onClose={()=>{setWorkspaceOpen(false);setEditing(null)}} onSave={saveTemplate}/>
    {viewing&&<div className="reference-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setViewing(null)}><section className="reference-modal contracts-template-view"><header className="reference-modal-head"><div><span>TEMPLATE</span><h2>{viewing.name}</h2><p>{viewing.category}</p></div><button className="reference-modal-close" type="button" onClick={()=>setViewing(null)}><X size={17}/></button></header><div className="reference-modal-body"><ContractA4Preview title={viewing.name}><p>{viewing.content}</p></ContractA4Preview></div><footer className="reference-modal-footer"><button className="zip-button secondary" type="button" onClick={()=>setViewing(null)}>Fechar</button><button className="zip-button" type="button" onClick={()=>{setEditing(viewing);setViewing(null);setWorkspaceOpen(true)}}><Pencil size={14}/> Editar</button></footer></section></div>}
    {deleting&&<div className="reference-modal-backdrop"><section className="reference-modal contracts-delete-modal"><header className="reference-modal-head"><div><span>TEMPLATES</span><h2>Excluir Template</h2></div><button className="reference-modal-close" type="button" onClick={()=>setDeleting(null)}><X size={17}/></button></header><div className="reference-modal-body"><p>Excluir <strong>{deleting.name}</strong>?</p><p>Esta ação não pode ser desfeita.</p></div><footer className="reference-modal-footer"><button className="zip-button secondary" type="button" onClick={()=>setDeleting(null)}>Cancelar</button><button className="zip-button danger" type="button" onClick={confirmDelete}><Trash2 size={14}/> Excluir</button></footer></section></div>}
  </AdminShell>
}
