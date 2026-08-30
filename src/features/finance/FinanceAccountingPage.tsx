import {BookOpen,DollarSign,Landmark,Search,TrendingDown,TrendingUp} from 'lucide-react'
import {useMemo,useState,type ReactNode} from 'react'
import {AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import {money,type FinanceTransaction} from './domain'
import {financeTransactionsMock} from './mocks'

const readTransactions=():FinanceTransaction[]=>{try{const raw=localStorage.getItem('portal-lander:finance:transactions');return raw?JSON.parse(raw) as FinanceTransaction[]:financeTransactionsMock}catch{return financeTransactionsMock}}
type Tab='all'|'company'|'contracts'|'clients'

export default function FinanceAccountingPage(){
 const [transactions]=useState(readTransactions),[tab,setTab]=useState<Tab>('all'),[search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[start,setStart]=useState(''),[end,setEnd]=useState('')
 const paid=useMemo(()=>transactions.filter(x=>x.status==='pago'&&(!start||x.date>=start)&&(!end||x.date<=end)&&(!search||[x.description,x.category,x.counterparty,x.contractRef].some(v=>v.toLowerCase().includes(search.toLowerCase())))&&(filter==='all'||filter==='revenue'&&x.type==='receita'||filter==='expenses'&&x.type==='despesa'||filter==='profit')),[transactions,start,end,search,filter])
 const revenues=paid.filter(x=>x.type==='receita'),expenses=paid.filter(x=>x.type==='despesa'),rev=revenues.reduce((s,x)=>s+x.amount,0),exp=expenses.reduce((s,x)=>s+x.amount,0),profit=rev-exp,margin=rev?profit/rev*100:0
 const categoryRows=group(paid,x=>x.category),contractRows=group(paid,x=>x.contractRef||'Sem contrato'),clientRows=group(paid,x=>x.counterparty||'Sem contraparte')
 return <AdminShell area="finance" items={CRM_WORKSPACE_NAV} header={{title:'Contabilidade',description:'Demonstrativos e visão contábil gerencial'}}>
  <section className="finance-page">
   <div className="finance-filters"><input type="date" value={start} onChange={e=>setStart(e.target.value)}/><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/><label className="finance-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por descrição ou categoria…"/></label><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos</option><option value="revenue">Receitas</option><option value="expenses">Despesas</option><option value="profit">Lucro</option></select></div>
   <div className="finance-kpis accounting-original-kpis"><Kpi title="Receita Total" value={money(rev)} icon={<TrendingUp/>}/><Kpi title="Despesa Total" value={money(-exp)} icon={<TrendingDown/>}/><Kpi title="Lucro Líquido" value={money(profit)} icon={<DollarSign/>}/><Kpi title="Margem Líquida" value={`${margin.toFixed(1)}%`} icon={<BookOpen/>}/></div>
   <div className="finance-tabs finance-accounting-tabs"><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>Todos</button><button className={tab==='company'?'active':''} onClick={()=>setTab('company')}>P&amp;L Empresa</button><button className={tab==='contracts'?'active':''} onClick={()=>setTab('contracts')}>P&amp;L Contratos</button><button className={tab==='clients'?'active':''} onClick={()=>setTab('clients')}>P&amp;L Clientes</button></div>
   {(tab==='all'||tab==='company')&&<ResultTable title="Demonstrativo de Resultado (P&L)" description="Receitas e despesas por categoria no período" rows={categoryRows} totalRevenue={rev}/>} 
   {(tab==='all'||tab==='contracts')&&<ResultTable title="P&L por Contrato" description="Resultado financeiro por contrato e operação" rows={contractRows} totalRevenue={rev}/>} 
   {(tab==='all'||tab==='clients')&&<ResultTable title="P&L por Cliente" description="Receitas, despesas e resultado por cliente" rows={clientRows} totalRevenue={rev}/>} 
  </section>
 </AdminShell>
}
function group(items:FinanceTransaction[],key:(x:FinanceTransaction)=>string){const out:Record<string,{revenue:number;expense:number}>={};for(const x of items){const name=key(x);out[name]??={revenue:0,expense:0};out[name][x.type==='receita'?'revenue':'expense']+=x.amount}return Object.entries(out).map(([name,value])=>({name,...value}))}
function ResultTable({title,description,rows,totalRevenue}:{title:string;description:string;rows:{name:string;revenue:number;expense:number}[];totalRevenue:number}){return <section className="finance-table-card"><header><div><h3>{title}</h3><p>{description} · {rows.length} registro(s)</p></div></header><div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Categoria</th><th>Receitas</th><th>Despesas</th><th>Resultado</th><th>% Receita</th></tr></thead><tbody>{rows.map(x=><tr key={x.name}><td><strong>{x.name}</strong></td><td className="positive">{money(x.revenue)}</td><td className="negative">{money(-x.expense)}</td><td>{money(x.revenue-x.expense)}</td><td>{totalRevenue?`${(x.revenue/totalRevenue*100).toFixed(1)}%`:'0.0%'}</td></tr>)}</tbody></table></div></section>}
function Kpi({title,value,icon}:{title:string;value:string;icon:ReactNode}){return <article className="finance-kpi"><div><span>{title}</span><strong>{value}</strong></div><i>{icon}</i></article>}
