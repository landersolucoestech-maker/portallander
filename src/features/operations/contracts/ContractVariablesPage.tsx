import { Download, MoreHorizontal, Plus, Search, Upload, X } from 'lucide-react'
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
  const [creating,setCreating]=useState(false)
  const [editing,setEditing]=useState<Variable|null>(null)
  const [draft,setDraft]=useState({name:'',group:'',internalGroup:'',field:''})
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return variables.filter(v=>!q||`${v.name} ${v.group} ${v.internalGroup} ${v.field}`.toLocaleLowerCase('pt-BR').includes(q))},[variables,query])
  const reset=()=>{setCreating(false);setEditing(null);setDraft({name:'',group:'',internalGroup:'',field:''})}
  const startCreate=()=>{setCreating(true);setEditing(null);setDraft({name:'',group:'',internalGroup:'',field:''})}
  const startEdit=(v:Variable)=>{setEditing(v);setCreating(false);setDraft({name:v.name,group:v.group,internalGroup:v.internalGroup,field:v.field})}
  const save=()=>{const name=draft.name.trim();const group=normalize(draft.group);const field=normalize(draft.field);if(!name||group.length<2||field.length<2)return;if(editing){setVariables(items=>items.map(v=>v.id===editing.id?{...v,name,group,internalGroup:draft.internalGroup.trim(),field}:v))}else{setVariables(items=>[{id:`var-${Date.now()}`,name,group,internalGroup:draft.internalGroup.trim(),field},...items])}reset()}
  const exportCsv=()=>{const body=['Nome,Alias,Nomenclatura Interna,Campo,Placeholder',...variables.map(v=>`"${v.name}","${v.group}","${v.internalGroup}","${v.field}","{{${v.group}.${v.field}}}"`)].join('\n');const url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='variaveis_contratos.csv';a.click();URL.revokeObjectURL(url)}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Variáveis de Contrato',description:'Registro de placeholders reutilizáveis para preenchimento automático dos templates contratuais.'}}>
    <div className="zip-stack contracts-page">
      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar variável…"/></label>
        <button type="button" className="zip-button secondary" disabled title="Importação será conectada à persistência"><Upload size={14}/> Importar</button>
        <button type="button" className="zip-button secondary" onClick={exportCsv}><Download size={14}/> Exportar</button>
        <button type="button" className="zip-button" onClick={startCreate}><Plus size={14}/> Nova Variável</button>
      </div>
      <section className="zip-panel contracts-table-panel"><header className="zip-panel-head"><div><h2>Variáveis de Contrato</h2><p>Placeholders registrados e disponíveis para templates</p></div></header><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Nome</th><th>Alias</th><th>Nomenclatura Interna</th><th>Campo</th><th>Placeholder</th><th>Ações</th></tr></thead><tbody>{filtered.length?filtered.map(v=><tr key={v.id}><td><strong>{v.name}</strong></td><td>{v.group}</td><td>{v.internalGroup||'—'}</td><td>{v.field}</td><td><code>{`{{${v.group}.${v.field}}}`}</code></td><td><button type="button" className="zip-icon" onClick={()=>startEdit(v)} title="Editar"><MoreHorizontal size={15}/></button></td></tr>):<tr><td colSpan={6} className="contracts-empty-row">Nenhuma variável encontrada.</td></tr>}</tbody></table></div></section>
    </div>
    {(creating||editing)&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&reset()}><section className="reference-modal"><header className="reference-modal-head"><div><span>VARIÁVEIS</span><h2>{editing?'Editar Variável':'Nova Variável'}</h2></div><button className="reference-modal-close" onClick={reset}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label className="wide"><span>Nome amigável *</span><input value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))} placeholder="Ex: Nome do Artista"/></label><label><span>Alias Visual / Jurídico *</span><input value={draft.group} onChange={e=>setDraft(v=>({...v,group:normalize(e.target.value)}))} placeholder="ARTISTA"/></label><label><span>Nomenclatura Interna</span><input value={draft.internalGroup} onChange={e=>setDraft(v=>({...v,internalGroup:e.target.value}))} placeholder="artista"/></label><label className="wide"><span>Campo *</span><input value={draft.field} onChange={e=>setDraft(v=>({...v,field:normalize(e.target.value)}))} placeholder="NOME"/></label><label className="wide"><span>Placeholder gerado</span><input readOnly value={draft.group&&draft.field?`{{${normalize(draft.group)}.${normalize(draft.field)}}}`:'{{ALIAS.CAMPO}}'}/></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={reset}>Cancelar</button><button className="zip-button" onClick={save}>{editing?'Salvar Alterações':'Criar Variável'}</button></footer></section></div>}
  </AdminShell>
}
