import { FileText, MoreHorizontal, Plus, Search, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

type Template={id:string;name:string;description:string;type:'semantico'|'padrao';active:boolean;variables:number;createdAt:string}
const INITIAL:Template[]=[
  {id:'tpl-1',name:'Contrato de Publicidade',description:'Modelo para campanhas e entregas publicitárias.',type:'semantico',active:true,variables:12,createdAt:'2026-08-20'},
  {id:'tpl-2',name:'Prestação de Serviços',description:'Modelo padrão para prestação de serviços.',type:'padrao',active:true,variables:8,createdAt:'2026-08-18'},
  {id:'tpl-3',name:'Parceria Comercial',description:'Modelo para parcerias e permutas.',type:'semantico',active:false,variables:10,createdAt:'2026-08-11'},
]

export function TemplatesContractsPage(){
  const [templates,setTemplates]=useState<Template[]>(INITIAL)
  const [query,setQuery]=useState('')
  const [type,setType]=useState<'all'|'semantico'|'padrao'>('all')
  const [status,setStatus]=useState<'all'|'ativo'|'inativo'>('all')
  const [creating,setCreating]=useState(false)
  const [draft,setDraft]=useState({name:'',description:'',type:'semantico' as 'semantico'|'padrao',active:true})
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return templates.filter(t=>(!q||`${t.name} ${t.description}`.toLocaleLowerCase('pt-BR').includes(q))&&(type==='all'||t.type===type)&&(status==='all'||(status==='ativo'?t.active:!t.active)))},[templates,query,type,status])
  const semanticCount=templates.filter(t=>t.type==='semantico').length
  const activeCount=templates.filter(t=>t.active).length
  const mapped=templates.reduce((sum,t)=>sum+t.variables,0)
  const save=()=>{if(!draft.name.trim())return;setTemplates(items=>[{id:`tpl-${Date.now()}`,name:draft.name.trim(),description:draft.description.trim(),type:draft.type,active:draft.active,variables:0,createdAt:new Date().toISOString()},...items]);setCreating(false);setDraft({name:'',description:'',type:'semantico',active:true})}

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Templates de Contrato',description:'Transforme contratos em templates reutilizáveis com estrutura e variáveis mapeadas.'}}>
    <div className="zip-stack contracts-page">
      <div className="zip-kpi-grid four">
        <article className="zip-metric"><div className="zip-metric-icon"><FileText size={18}/></div><div><span>Total de Templates</span><strong>{templates.length}</strong><small>todos os tipos</small></div></article>
        <article className="zip-metric"><div className="zip-metric-icon"><Sparkles size={18}/></div><div><span>Semânticos (IA)</span><strong>{semanticCount}</strong><small>gerados por IA</small></div></article>
        <article className="zip-metric"><div className="zip-metric-icon"><FileText size={18}/></div><div><span>Ativos</span><strong>{activeCount}</strong><small>disponíveis</small></div></article>
        <article className="zip-metric"><div className="zip-metric-icon"><Sparkles size={18}/></div><div><span>Variáveis Mapeadas</span><strong>{mapped}</strong><small>em todos os templates</small></div></article>
      </div>
      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome ou descrição…"/></label>
        <select value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="all">Todos os tipos</option><option value="semantico">Semântico IA</option><option value="padrao">Padrão</option></select>
        <select value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="all">Todos os status</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
        <button type="button" className="zip-button" onClick={()=>setCreating(true)}><Plus size={14}/> Novo Template</button>
      </div>
      <section className="zip-panel contracts-table-panel"><header className="zip-panel-head"><div><h2>Templates de Contrato</h2><p>Modelos contratuais reutilizáveis e versionados</p></div></header><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Nome</th><th>Categoria</th><th>Status</th><th>Variáveis</th><th>Criado em</th><th>Ações</th></tr></thead><tbody>{filtered.length?filtered.map(t=><tr key={t.id}><td><strong>{t.name}</strong><small className="contracts-table-sub">{t.description}</small></td><td>{t.type==='semantico'?'Semântico IA':'Padrão'}</td><td><span className={`zip-badge ${t.active?'zip-badge-success':''}`}>{t.active?'Ativo':'Inativo'}</span></td><td>{t.variables}</td><td>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td><td><button type="button" className="zip-icon" title="Mais ações"><MoreHorizontal size={15}/></button></td></tr>):<tr><td colSpan={6} className="contracts-empty-row">Nenhum template encontrado.</td></tr>}</tbody></table></div></section>
    </div>
    {creating&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setCreating(false)}><section className="reference-modal"><header className="reference-modal-head"><div><span>TEMPLATES</span><h2>Novo Template</h2></div><button className="reference-modal-close" onClick={()=>setCreating(false)}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label className="wide"><span>Nome *</span><input value={draft.name} onChange={e=>setDraft(v=>({...v,name:e.target.value}))} placeholder="Nome do template"/></label><label className="wide"><span>Descrição</span><textarea rows={3} value={draft.description} onChange={e=>setDraft(v=>({...v,description:e.target.value}))}/></label><label><span>Tipo</span><select value={draft.type} onChange={e=>setDraft(v=>({...v,type:e.target.value as 'semantico'|'padrao'}))}><option value="semantico">Semântico IA</option><option value="padrao">Padrão</option></select></label><label><span>Status</span><select value={draft.active?'ativo':'inativo'} onChange={e=>setDraft(v=>({...v,active:e.target.value==='ativo'}))}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setCreating(false)}>Cancelar</button><button className="zip-button" onClick={save}>Criar Template</button></footer></section></div>}
  </AdminShell>
}
