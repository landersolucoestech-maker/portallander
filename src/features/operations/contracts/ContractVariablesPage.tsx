import { Copy, Download, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

type Variable={id:string;name:string;group:string;internalGroup:string;field:string}
const INITIAL:Variable[]=[
  {id:'var-1',name:'Razão Social da Empresa',group:'EMPRESA',internalGroup:'empresa',field:'RAZAO_SOCIAL'},
  {id:'var-2',name:'Nome do Cliente',group:'CLIENTE',internalGroup:'cliente',field:'NOME'},
  {id:'var-3',name:'Número do Contrato',group:'CONTRATO',internalGroup:'contrato',field:'NUMERO'},
  {id:'var-4',name:'Valor do Contrato',group:'CONTRATO',internalGroup:'contrato',field:'VALOR'},
]
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'')

export function ContractVariablesPage(){
  const [variables,setVariables]=useState<Variable[]>(INITIAL)
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState<string[]>([])
  const [creating,setCreating]=useState(false)
  const [editing,setEditing]=useState<Variable|null>(null)
  const [draft,setDraft]=useState({name:'',group:'',internalGroup:'',field:''})
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return variables.filter(v=>!q||`${v.name} ${v.group} ${v.internalGroup} ${v.field}`.toLocaleLowerCase('pt-BR').includes(q))},[variables,query])
  const allSelected=filtered.length>0&&selected.length===filtered.length
  const reset=()=>{setCreating(false);setEditing(null);setDraft({name:'',group:'',internalGroup:'',field:''})}
  const startCreate=()=>{setCreating(true);setEditing(null);setDraft({name:'',group:'',internalGroup:'',field:''})}
  const startEdit=(v:Variable)=>{setEditing(v);setCreating(false);setDraft({name:v.name,group:v.group,internalGroup:v.internalGroup,field:v.field})}
  const save=()=>{const name=draft.name.trim();const group=normalize(draft.group);const field=normalize(draft.field);if(!name||group.length<2||field.length<2)return;if(editing){setVariables(items=>items.map(v=>v.id===editing.id?{...v,name,group,internalGroup:draft.internalGroup.trim(),field}:v))}else{setVariables(items=>[{id:`var-${Date.now()}`,name,group,internalGroup:draft.internalGroup.trim(),field},...items])}reset()}
  const exportCsv=()=>{const body=['Nome,Alias,Nomenclatura Interna,Campo,Placeholder',...variables.map(v=>`"${v.name}","${v.group}","${v.internalGroup}","${v.field}","{{${v.group}.${v.field}}}"`)].join('\n');const url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='variaveis_contratos.csv';a.click();URL.revokeObjectURL(url)}
  const remove=(id:string)=>{setVariables(items=>items.filter(v=>v.id!==id));setSelected(ids=>ids.filter(x=>x!==id))}
  const removeSelected=()=>{setVariables(items=>items.filter(v=>!selected.includes(v.id)));setSelected([])}
  const copy=async(value:string)=>{try{await navigator.clipboard.writeText(value)}catch{void 0}}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Variáveis de Template',description:'Crie, organize e reutilize placeholders em qualquer contrato'}}>
    <div className="zip-stack contracts-page">
      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>{setQuery(e.target.value);setSelected([])}} placeholder="Pesquisar variáveis..."/></label>
        {selected.length>0&&<><span>{selected.length} selecionada(s)</span><button type="button" className="zip-button secondary" onClick={removeSelected}><Trash2 size={14}/> Eliminar selecionadas</button><button type="button" className="zip-button secondary" onClick={()=>setSelected([])}>Cancelar</button></>}
        <button type="button" className="zip-button secondary" disabled title="Importação XLSX será ligada à persistência"><Upload size={14}/> Importar</button>
        <button type="button" className="zip-button secondary" onClick={exportCsv}><Download size={14}/> Exportar</button>
        <button type="button" className="zip-button" onClick={startCreate}><Plus size={14}/> Nova Variável</button>
      </div>

      <section className="zip-panel contracts-table-panel"><header className="zip-panel-head"><div><h2>Lista de Variáveis</h2><p>Acompanhe placeholders, aliases, nomenclatura interna e campos reutilizáveis · {filtered.length} registro(s)</p></div><label><input type="checkbox" checked={allSelected} onChange={()=>setSelected(allSelected?[]:filtered.map(v=>v.id))}/> {selected.length?`${selected.length} selecionada(s)`:'Selecionar todos'}</label></header><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th></th><th>Nome</th><th>Alias</th><th>Nomenclatura Interna</th><th>Campo</th><th>Placeholder</th><th>Ações</th></tr></thead><tbody>{filtered.length?filtered.map(v=>{const placeholder=`{{${v.group}.${v.field}}}`;return <tr key={v.id}><td><input type="checkbox" checked={selected.includes(v.id)} onChange={()=>setSelected(ids=>ids.includes(v.id)?ids.filter(id=>id!==v.id):[...ids,v.id])}/></td><td><strong>{v.name}</strong></td><td><span className="zip-badge">{v.group}</span></td><td>{v.internalGroup||'—'}</td><td>{v.field}</td><td><code>{placeholder}</code></td><td><div className="contracts-inline-actions"><button type="button" className="zip-icon" onClick={()=>copy(placeholder)} title="Copiar placeholder"><Copy size={14}/></button><button type="button" className="zip-icon" onClick={()=>startEdit(v)} title="Editar"><Pencil size={14}/></button><button type="button" className="zip-icon" onClick={()=>remove(v.id)} title="Remover"><Trash2 size={14}/></button></div></td></tr>}) : <tr><td colSpan={7} className="contracts-empty-row">{query?`Nenhuma variável encontrada para “${query}”`:'Nenhuma variável criada'}</td></tr>}</tbody></table></div></section>
    </div>

    {(creating||editing)&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&reset()}><section className="reference-modal"><header className="reference-modal-head"><div><span>VARIÁVEIS</span><h2>{editing?'Editar Variável':'Nova Variável'}</h2></div><button className="reference-modal-close" onClick={reset}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label className="wide"><span>Nome amigável *</span><input value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))} placeholder="Ex: Nome do Artista"/></label><label><span>Alias *</span><input value={draft.group} onChange={e=>setDraft(v=>({...v,group:normalize(e.target.value)}))} placeholder="ARTISTA"/></label><label><span>Nomenclatura Interna</span><input value={draft.internalGroup} onChange={e=>setDraft(v=>({...v,internalGroup:e.target.value}))} placeholder="artista"/></label><label className="wide"><span>Campo *</span><input value={draft.field} onChange={e=>setDraft(v=>({...v,field:normalize(e.target.value)}))} placeholder="NOME"/></label><label className="wide"><span>Placeholder</span><input readOnly value={draft.group&&draft.field?`{{${normalize(draft.group)}.${normalize(draft.field)}}}`:'{{ALIAS.CAMPO}}'}/></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={reset}>Cancelar</button><button className="zip-button" onClick={save}>{editing?'Guardar Alterações':'Criar Variável'}</button></footer></section></div>}
  </AdminShell>
}
