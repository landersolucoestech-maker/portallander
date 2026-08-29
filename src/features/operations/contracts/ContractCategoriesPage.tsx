import { Download, Pencil, Plus, Search, Tag, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

type Category={id:string;label:string;value:string;description:string}
const INITIAL:Category[]=[
  {id:'cat-commercial',label:'Comercial',value:'comercial',description:'Contratos comerciais, publicidade e parcerias.'},
  {id:'cat-services',label:'Prestação de Serviços',value:'prestacao_de_servicos',description:'Prestação de serviços profissionais e operacionais.'},
  {id:'cat-events',label:'Eventos',value:'eventos',description:'Shows, coberturas, produções e participações em eventos.'},
]
const slug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')

export function ContractCategoriesPage(){
  const [categories,setCategories]=useState<Category[]>(INITIAL)
  const [query,setQuery]=useState('')
  const [creating,setCreating]=useState(false)
  const [editing,setEditing]=useState<Category|null>(null)
  const [draft,setDraft]=useState({label:'',value:'',description:''})
  const fileRef=useRef<HTMLInputElement>(null)
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return categories.filter(c=>!q||`${c.label} ${c.value} ${c.description}`.toLocaleLowerCase('pt-BR').includes(q))},[categories,query])
  const reset=()=>{setCreating(false);setEditing(null);setDraft({label:'',value:'',description:''})}
  const startCreate=()=>{setEditing(null);setCreating(true);setDraft({label:'',value:'',description:''})}
  const startEdit=(category:Category)=>{setCreating(false);setEditing(category);setDraft({label:category.label,value:category.value,description:category.description})}
  const save=()=>{const label=draft.label.trim();if(!label)return;const value=slug(draft.value||label);if(categories.some(c=>c.value===value&&c.id!==editing?.id))return;if(editing){setCategories(items=>items.map(c=>c.id===editing.id?{...c,label,value,description:draft.description.trim()}:c))}else{setCategories(items=>[{id:`cat-${Date.now()}`,label,value,description:draft.description.trim()},...items])}reset()}
  const remove=(id:string)=>setCategories(items=>items.filter(c=>c.id!==id))
  const exportCsv=()=>{const body=['Nome,Slug,Descrição',...categories.map(c=>`"${c.label.replaceAll('"','""')}","${c.value}","${c.description.replaceAll('"','""')}"`)].join('\n');const url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='categorias_contratos.csv';a.click();URL.revokeObjectURL(url)}
  const importCsv=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;const reader=new FileReader();reader.onload=()=>{const lines=String(reader.result||'').split(/\r?\n/).slice(1).filter(Boolean);const next=[...categories];for(const line of lines){const cols=line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]+))(?:,|$)/g)?.map(x=>x.replace(/,$/,'').replace(/^"|"$/g,'').replaceAll('""','"'))||[];const label=(cols[0]||'').trim();if(!label)continue;const value=slug(cols[1]||label);if(next.some(c=>c.value===value))continue;next.push({id:`cat-${Date.now()}-${next.length}`,label,value,description:(cols[2]||'').trim()})}setCategories(next)};reader.readAsText(file)}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Categorias de Contratos',description:'Cadastro e manutenção das categorias utilizadas na classificação dos contratos.'}}>
    <div className="zip-stack contracts-page">
      <input ref={fileRef} type="file" accept=".csv" hidden onChange={importCsv}/>
      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar categoria, slug ou descrição…"/></label>
        <button type="button" className="zip-button secondary" onClick={()=>fileRef.current?.click()}><Upload size={14}/> Importar</button>
        <button type="button" className="zip-button secondary" onClick={exportCsv}><Download size={14}/> Exportar</button>
        <button type="button" className="zip-button" onClick={startCreate}><Plus size={14}/> Nova Categoria</button>
      </div>

      {(creating||editing)&&<section className="zip-panel">
        <header className="zip-panel-head"><div><h2>{editing?'Editar Categoria':'Nova Categoria'}</h2><p>Defina o nome, slug e descrição da categoria contratual.</p></div><button type="button" className="zip-icon" onClick={reset} aria-label="Fechar"><X size={15}/></button></header>
        <div className="reference-form reference-form-grid">
          <label><span>Nome da Categoria *</span><input value={draft.label} onChange={e=>setDraft(v=>({...v,label:e.target.value,value:editing?v.value:slug(e.target.value)}))} placeholder="Ex: Licenciamento"/></label>
          <label><span>Slug</span><input value={draft.value} onChange={e=>setDraft(v=>({...v,value:slug(e.target.value)}))} placeholder="licenciamento"/></label>
          <label className="wide"><span>Descrição</span><textarea rows={3} value={draft.description} onChange={e=>setDraft(v=>({...v,description:e.target.value}))} placeholder="Descreva quando esta categoria deve ser usada."/></label>
        </div>
        <footer className="reference-modal-footer"><button type="button" className="zip-button secondary" onClick={reset}>Cancelar</button><button type="button" className="zip-button" onClick={save}>Salvar Categoria</button></footer>
      </section>}

      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>Categorias de Contratos</h2><p>{filtered.length} categoria(s) cadastrada(s)</p></div></header>
        <div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Categoria</th><th>Slug</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>{filtered.length?filtered.map(category=><tr key={category.id}><td><strong><Tag size={14} style={{verticalAlign:'-2px',marginRight:6}}/>{category.label}</strong></td><td><code>{category.value}</code></td><td>{category.description||'—'}</td><td><div className="contracts-inline-actions"><button type="button" className="zip-icon" onClick={()=>startEdit(category)} title="Editar"><Pencil size={14}/></button><button type="button" className="zip-icon" onClick={()=>remove(category.id)} title="Excluir"><Trash2 size={14}/></button></div></td></tr>):<tr><td colSpan={4} className="contracts-empty-row">Nenhuma categoria encontrada.</td></tr>}</tbody></table></div>
      </section>
    </div>
  </AdminShell>
}
