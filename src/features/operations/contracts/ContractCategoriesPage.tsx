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
  const [deleteTarget,setDeleteTarget]=useState<Category|null>(null)
  const [draft,setDraft]=useState({label:'',value:'',description:''})
  const [autoSlug,setAutoSlug]=useState(true)
  const fileRef=useRef<HTMLInputElement>(null)
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return categories.filter(c=>!q||`${c.label} ${c.value} ${c.description}`.toLocaleLowerCase('pt-BR').includes(q))},[categories,query])
  const reset=()=>{setCreating(false);setEditing(null);setDraft({label:'',value:'',description:''});setAutoSlug(true)}
  const startCreate=()=>{setEditing(null);setCreating(true);setAutoSlug(true);setDraft({label:'',value:'',description:''})}
  const startEdit=(category:Category)=>{setCreating(false);setEditing(category);setAutoSlug(false);setDraft({label:category.label,value:category.value,description:category.description})}
  const save=()=>{const label=draft.label.trim();if(!label)return;const value=slug(draft.value||label);if(categories.some(c=>c.value===value&&c.id!==editing?.id))return;if(editing){setCategories(items=>items.map(c=>c.id===editing.id?{...c,label,value,description:draft.description.trim()}:c))}else{setCategories(items=>[{id:`cat-${Date.now()}`,label,value,description:draft.description.trim()},...items])}reset()}
  const exportCsv=()=>{const body=['Nome,Slug,Descrição',...categories.map(c=>`"${c.label.replaceAll('"','""')}","${c.value}","${c.description.replaceAll('"','""')}"`)].join('\n');const url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='categorias_contratos.csv';a.click();URL.revokeObjectURL(url)}
  const importCsv=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;const reader=new FileReader();reader.onload=()=>{const lines=String(reader.result||'').split(/\r?\n/).slice(1).filter(Boolean);const next=[...categories];for(const line of lines){const [rawLabel,rawSlug,rawDescription]=line.split(',').map(value=>value.replace(/^"|"$/g,'').replaceAll('""','"').trim());if(!rawLabel)continue;const value=slug(rawSlug||rawLabel);if(next.some(c=>c.value===value))continue;next.push({id:`cat-${Date.now()}-${next.length}`,label:rawLabel,value,description:rawDescription||''})}setCategories(next)};reader.readAsText(file)}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Categorias de Contratos',description:'Registo de categorias utilizadas nos contratos e templates.'}}>
    <div className="contracts-category-registry">
      <input ref={fileRef} type="file" accept=".csv,.xlsx" hidden onChange={importCsv}/>
      <div className="contracts-category-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar categorias…"/></label>
        <div className="contracts-inline-actions">
          <button type="button" className="zip-button secondary" onClick={()=>fileRef.current?.click()}><Upload size={14}/> Importar</button>
          <button type="button" className="zip-button secondary" onClick={exportCsv}><Download size={14}/> Exportar</button>
          <button type="button" className="zip-button" onClick={startCreate} disabled={creating}><Plus size={14}/> Nova Categoria</button>
        </div>
      </div>

      {creating&&<section className="contracts-category-editor">
        <strong>Nova categoria</strong>
        <div className="reference-form-grid">
          <label><span>Nome *</span><input autoFocus value={draft.label} onChange={e=>{const label=e.target.value;setDraft(v=>({...v,label,value:autoSlug?slug(label):v.value}))}} placeholder="ex: Licenciamento Sync"/></label>
          <label><span>Slug <small>(gerado auto)</small></span><input value={draft.value} onChange={e=>{setAutoSlug(false);setDraft(v=>({...v,value:slug(e.target.value)}))}} placeholder="licenciamento_sync"/></label>
          <label className="wide"><span>Descrição (opcional)</span><input value={draft.description} onChange={e=>setDraft(v=>({...v,description:e.target.value}))} placeholder="Breve descrição da categoria…"/></label>
        </div>
        <div className="contracts-category-editor-actions"><button className="zip-button secondary" type="button" onClick={reset}>Cancelar</button><button className="zip-button" type="button" onClick={save}>Criar</button></div>
      </section>}

      <p className="contracts-category-count">{filtered.length} categoria{filtered.length!==1?'s':''}{query?` para “${query}”`:' no registo'}</p>

      <div className="contracts-category-list">
        {filtered.length===0?<div className="contracts-category-empty"><Tag size={30}/><span>{query?'Nenhuma categoria encontrada':'Nenhuma categoria criada ainda'}</span></div>:filtered.map(category=>editing?.id===category.id?<section className="contracts-category-editor" key={category.id}>
          <div className="reference-form-grid"><label><span>Nome</span><input autoFocus value={draft.label} onChange={e=>setDraft(v=>({...v,label:e.target.value}))}/></label><label><span>Slug</span><input value={draft.value} onChange={e=>setDraft(v=>({...v,value:slug(e.target.value)}))}/></label><label className="wide"><span>Descrição</span><input value={draft.description} onChange={e=>setDraft(v=>({...v,description:e.target.value}))}/></label></div>
          <div className="contracts-category-editor-actions"><button className="zip-button secondary" type="button" onClick={reset}><X size={13}/> Cancelar</button><button className="zip-button" type="button" onClick={save}>Guardar</button></div>
        </section>:<article className="contracts-category-row" key={category.id}><Tag size={14}/><div><div><strong>{category.label}</strong><code>{category.value}</code></div>{category.description&&<p>{category.description}</p>}</div><div className="contracts-category-row-actions"><button className="zip-icon" type="button" onClick={()=>startEdit(category)} title="Editar"><Pencil size={13}/></button><button className="zip-icon" type="button" onClick={()=>setDeleteTarget(category)} title="Eliminar"><Trash2 size={13}/></button></div></article>)}
      </div>
    </div>
    {deleteTarget&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setDeleteTarget(null)}><section className="reference-modal"><header className="reference-modal-head"><div><span>CATEGORIAS</span><h2>Eliminar categoria</h2></div><button className="reference-modal-close" onClick={()=>setDeleteTarget(null)}><X size={17}/></button></header><div className="reference-modal-body"><p>Tem a certeza que quer eliminar <strong>“{deleteTarget.label}”</strong>? Os templates que usam esta categoria não serão afectados, mas ela deixará de aparecer nos formulários.</p></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setDeleteTarget(null)}>Cancelar</button><button className="zip-button" onClick={()=>{setCategories(items=>items.filter(c=>c.id!==deleteTarget.id));setDeleteTarget(null)}}>Eliminar</button></footer></section></div>}
  </AdminShell>
}
