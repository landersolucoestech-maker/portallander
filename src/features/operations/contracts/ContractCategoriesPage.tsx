import { Download, Pencil, Plus, Search, Tag, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import * as XLSX from 'xlsx'
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
  const [categories,setCategories]=useState(INITIAL)
  const [query,setQuery]=useState('')
  const [creating,setCreating]=useState(false)
  const [editing,setEditing]=useState<Category|null>(null)
  const [draft,setDraft]=useState({label:'',value:'',description:''})
  const inputRef=useRef<HTMLInputElement>(null)
  const filtered=useMemo(()=>categories.filter(category=>`${category.label} ${category.value} ${category.description}`.toLowerCase().includes(query.toLowerCase())),[categories,query])
  const startCreate=()=>{setEditing(null);setCreating(true);setDraft({label:'',value:'',description:''})}
  const save=()=>{const value=slug(draft.value||draft.label);const category={id:editing?.id??`cat-${Date.now()}`,label:draft.label||value,value,description:draft.description};setCategories(items=>editing?items.map(item=>item.id===editing.id?category:item):[category,...items]);setCreating(false);setEditing(null)}
  const exportXlsx=()=>{const sheet=XLSX.utils.json_to_sheet(categories.map(category=>({Nome:category.label,Slug:category.value,'Descrição':category.description})));const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'Categorias');XLSX.writeFile(book,'categorias-contratos.xlsx')}
  const importXlsx=async(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const buffer=await file.arrayBuffer();const workbook=XLSX.read(buffer);const sheet=workbook.Sheets[workbook.SheetNames[0]];const rows=XLSX.utils.sheet_to_json<Record<string,string>>(sheet);const imported=rows.map((row,index)=>{const label=row.Nome||row.name||`Categoria ${index+1}`;return{id:`cat-import-${Date.now()}-${index}`,label,value:slug(row.Slug||row.slug||label),description:row['Descrição']||row.Descricao||row.description||''}});setCategories(items=>[...imported,...items]);event.target.value=''}
  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Categorias de Contrato',description:'Organize as categorias utilizadas em contratos e templates'}} headerAction={{label:'Nova Categoria',onClick:startCreate}}>
    <div className="contracts-category-registry">
      <div className="contracts-category-toolbar"><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Pesquisar categorias…"/></label><div className="contracts-inline-actions"><input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={importXlsx}/><button className="zip-button secondary" type="button" onClick={()=>inputRef.current?.click()}><Upload size={14}/> Importar</button><button className="zip-button secondary" type="button" onClick={exportXlsx}><Download size={14}/> Exportar</button><button className="zip-button" type="button" onClick={startCreate}><Plus size={14}/> Nova Categoria</button></div></div>
      {creating&&<section className="contracts-category-editor"><strong>{editing?'Editar Categoria':'Nova Categoria'}</strong><div className="reference-form-grid"><label><span>Nome *</span><input value={draft.label} onChange={event=>setDraft(value=>({...value,label:event.target.value,value:editing?value.value:slug(event.target.value)}))}/></label><label><span>Slug</span><input value={draft.value} onChange={event=>setDraft(value=>({...value,value:slug(event.target.value)}))}/></label><label className="wide"><span>Descrição opcional</span><textarea rows={3} value={draft.description} onChange={event=>setDraft(value=>({...value,description:event.target.value}))}/></label></div><div className="contracts-category-editor-actions"><button className="zip-button secondary" type="button" onClick={()=>{setCreating(false);setEditing(null)}}>Cancelar</button><button className="zip-button" type="button" onClick={save}>{editing?'Salvar':'Criar'}</button></div></section>}
      <p className="contracts-category-count">{filtered.length} categoria(s)</p>
      <div className="contracts-category-list">{filtered.length?filtered.map(category=><article className="contracts-category-row" key={category.id}><Tag size={15}/><div><div><strong>{category.label}</strong><code>{category.value}</code></div>{category.description&&<p>{category.description}</p>}</div><div className="contracts-category-row-actions"><button type="button" title="Editar" onClick={()=>{setEditing(category);setCreating(true);setDraft({label:category.label,value:category.value,description:category.description})}}><Pencil size={14}/></button><button type="button" title="Excluir" onClick={()=>setCategories(items=>items.filter(item=>item.id!==category.id))}><Trash2 size={14}/></button></div></article>):<div className="contracts-category-empty"><Tag size={24}/><span>Nenhuma categoria encontrada.</span></div>}</div>
    </div>
  </AdminShell>
}
