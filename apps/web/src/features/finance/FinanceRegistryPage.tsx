import {FileText,Plus,Tags,Trash2} from 'lucide-react'
import {useState,type FormEvent} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import {uid,type FinanceCategory,type FinanceRule,type FinanceRuleEvent,type FinanceTransactionType} from './domain'
import {financeRepository} from './repository'

type RegistryMode='categories'|'rules'
const modeFromPath=(pathname:string):RegistryMode=>pathname.endsWith('/rules')?'rules':'categories'

export default function FinanceRegistryPage(){
 const location=useLocation(),navigate=useNavigate(),mode=modeFromPath(location.pathname)
 const [categories,setCategories]=useState(financeRepository.listCategories)
 const [rules,setRules]=useState(financeRepository.listRules)
 const [categoryModal,setCategoryModal]=useState<FinanceCategory|null|undefined>(undefined)
 const [ruleModal,setRuleModal]=useState<FinanceRule|null|undefined>(undefined)
 const updateCategories=(next:FinanceCategory[])=>{setCategories(next);financeRepository.saveCategories(next)}
 const updateRules=(next:FinanceRule[])=>{setRules(next);financeRepository.saveRules(next)}
 const categoriesMode=mode==='categories'
 return <AdminShell area="finance" items={CRM_WORKSPACE_NAV} header={categoriesMode?{title:'Categorias Financeiras',description:'Categorias e subcategorias para receitas e despesas.'}:{title:'Regras Financeiras',description:'Regras de classificação e comportamento financeiro.'}} headerActions={[{label:'Financeiro',variant:'secondary',onClick:()=>navigate('/app/finance')},{label:categoriesMode?'Nova Categoria':'Nova Regra',icon:Plus,onClick:()=>categoriesMode?setCategoryModal(null):setRuleModal(null)}]}>
  <section className="finance-page">
   <section className="finance-table-card"><header><div><h3>{categoriesMode?'Lista de Categorias Financeiras':'Regras Financeiras'}</h3><p>{categoriesMode?`${categories.length} categoria(s) disponível(is)`:`${rules.length} regra(s) disponível(is)`}</p></div></header>
    <div className="finance-table-wrap">{categoriesMode?<table className="finance-table"><thead><tr><th>Categoria</th><th>Subcategoria</th><th>Tipo</th><th>Contraparte</th><th>Status</th><th>Ações</th></tr></thead><tbody>{categories.map(item=><tr key={item.id}><td><strong>{item.category}</strong></td><td>{item.subcategory}</td><td>{item.type==='receita'?'Receita':'Despesa'}</td><td>{item.counterparty}</td><td><span className={`finance-status ${item.active?'pago':'cancelado'}`}>{item.active?'Ativa':'Inativa'}</span></td><td><div className="crm-row-actions"><button className="crm-btn secondary small" onClick={()=>setCategoryModal(item)}>Editar</button><button className="crm-icon-btn" aria-label={`Excluir ${item.category}`} onClick={()=>updateCategories(categories.filter(value=>value.id!==item.id))}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>:<table className="finance-table"><thead><tr><th>Regra</th><th>Evento</th><th>Condição</th><th>Ação</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rules.map(item=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{eventLabel(item.event)}</td><td>{item.condition}</td><td>{item.action}</td><td><span className={`finance-status ${item.active?'pago':'cancelado'}`}>{item.active?'Ativa':'Inativa'}</span></td><td><div className="crm-row-actions"><button className="crm-btn secondary small" onClick={()=>setRuleModal(item)}>Editar</button><button className="crm-icon-btn" aria-label={`Excluir ${item.name}`} onClick={()=>updateRules(rules.filter(value=>value.id!==item.id))}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>}</div>
   </section>
  </section>
  {categoryModal!==undefined&&<CategoryModal initial={categoryModal} onClose={()=>setCategoryModal(undefined)} onSave={item=>{const next=item.id?categories.map(value=>value.id===item.id?item:value):[{...item,id:uid('category')},...categories];updateCategories(next);setCategoryModal(undefined)}}/>}
  {ruleModal!==undefined&&<RuleModal initial={ruleModal} onClose={()=>setRuleModal(undefined)} onSave={item=>{const next=item.id?rules.map(value=>value.id===item.id?item:value):[{...item,id:uid('rule')},...rules];updateRules(next);setRuleModal(undefined)}}/>}
 </AdminShell>
}

function CategoryModal({initial,onClose,onSave}:{initial:FinanceCategory|null;onClose:()=>void;onSave:(item:FinanceCategory)=>void}){
 const [form,setForm]=useState<FinanceCategory>(initial?{...initial}:{id:'',category:'',subcategory:'',type:'receita',counterparty:'Cliente',active:true})
 const submit=(event:FormEvent)=>{event.preventDefault();if(form.category.trim()&&form.subcategory.trim())onSave(form)}
 return <div className="crm-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="finance-modal" role="dialog" aria-modal="true"><header><div><span><Tags size={14}/> Financeiro</span><h2>{initial?'Editar Categoria':'Nova Categoria Financeira'}</h2></div></header><form onSubmit={submit}><div className="finance-modal-body"><div className="finance-form-grid"><Field label="Categoria" value={form.category} onChange={value=>setForm(current=>({...current,category:value}))}/><Field label="Subcategoria" value={form.subcategory} onChange={value=>setForm(current=>({...current,subcategory:value}))}/><label className="finance-field"><span>Tipo</span><select value={form.type} onChange={event=>setForm(current=>({...current,type:event.target.value as FinanceTransactionType}))}><option value="receita">Receita</option><option value="despesa">Despesa</option></select></label><Field label="Contraparte" value={form.counterparty} onChange={value=>setForm(current=>({...current,counterparty:value}))}/><label className="finance-field"><span>Status</span><select value={form.active?'1':'0'} onChange={event=>setForm(current=>({...current,active:event.target.value==='1'}))}><option value="1">Ativa</option><option value="0">Inativa</option></select></label></div></div><footer className="finance-modal-foot"><button type="button" className="crm-btn secondary" onClick={onClose}>Cancelar</button><button className="crm-btn primary" type="submit">Salvar</button></footer></form></section></div>
}

function RuleModal({initial,onClose,onSave}:{initial:FinanceRule|null;onClose:()=>void;onSave:(item:FinanceRule)=>void}){
 const [form,setForm]=useState<FinanceRule>(initial?{...initial}:{id:'',name:'',event:'transaction.created',condition:'',action:'',active:true})
 const submit=(event:FormEvent)=>{event.preventDefault();if(form.name.trim()&&form.condition.trim()&&form.action.trim())onSave(form)}
 return <div className="crm-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="finance-modal" role="dialog" aria-modal="true"><header><div><span><FileText size={14}/> Financeiro</span><h2>{initial?'Editar Regra':'Nova Regra Financeira'}</h2></div></header><form onSubmit={submit}><div className="finance-modal-body"><div className="finance-form-grid"><Field label="Nome" value={form.name} onChange={value=>setForm(current=>({...current,name:value}))}/><label className="finance-field"><span>Evento</span><select value={form.event} onChange={event=>setForm(current=>({...current,event:event.target.value as FinanceRuleEvent}))}><option value="transaction.created">Transação criada</option><option value="transaction.paid">Transação paga</option><option value="invoice.due">Nota fiscal vencida</option><option value="contract.signed">Contrato assinado</option></select></label></div><label className="finance-field wide"><span>Condição</span><textarea rows={3} value={form.condition} onChange={event=>setForm(current=>({...current,condition:event.target.value}))}/></label><label className="finance-field wide"><span>Ação</span><textarea rows={3} value={form.action} onChange={event=>setForm(current=>({...current,action:event.target.value}))}/></label><label className="finance-field"><span>Status</span><select value={form.active?'1':'0'} onChange={event=>setForm(current=>({...current,active:event.target.value==='1'}))}><option value="1">Ativa</option><option value="0">Inativa</option></select></label></div><footer className="finance-modal-foot"><button type="button" className="crm-btn secondary" onClick={onClose}>Cancelar</button><button className="crm-btn primary" type="submit">Salvar</button></footer></form></section></div>
}

function Field({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="finance-field"><span>{label}</span><input value={value} onChange={event=>onChange(event.target.value)}/></label>}
const eventLabel=(event:FinanceRuleEvent)=>({'transaction.created':'Transação criada','transaction.paid':'Transação paga','invoice.due':'Nota fiscal vencida','contract.signed':'Contrato assinado'}[event])
