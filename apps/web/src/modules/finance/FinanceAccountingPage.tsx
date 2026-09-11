import {BookOpen,DollarSign,Search,TrendingDown,TrendingUp} from 'lucide-react'
import {useMemo,useState,type ReactNode} from 'react'
import {AdminShell} from '../../shared/internal/AdminUi'
import {TableSortHeader,type TableSortDirection,type TableSortState} from '../../shared/internal/TableSortHeader'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {money,type FinanceTransaction} from './domain'
import {useFinanceTransactions} from './hooks'

type ResultSortKey='name'|'revenue'|'expense'|'result'|'share'
type SortState=TableSortState<ResultSortKey>
const compare=(a:string|number,b:string|number,direction:TableSortDirection)=>{const result=typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b),'pt-BR',{numeric:true,sensitivity:'base'});return direction==='asc'?result:-result}
const filterControlStyle={flex:'0 0 auto'} as const
const searchStyle={flex:'1 1 320px',minWidth:0,width:'auto'} as const
const tableHeaderStyle={textAlign:'left' as const,verticalAlign:'middle' as const}
const tableCellStyle={textAlign:'left' as const,verticalAlign:'middle' as const}
const categoryCellContentStyle={display:'block',width:'100%',margin:0,textAlign:'left' as const}

export default function FinanceAccountingPage(){
 const transactionsQuery=useFinanceTransactions(),transactions=useMemo(()=>transactionsQuery.data??[],[transactionsQuery.data])
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[start,setStart]=useState(''),[end,setEnd]=useState('')
 const paid=useMemo(()=>transactions.filter(x=>x.status==='pago'&&(!start||x.date>=start)&&(!end||x.date<=end)&&(!search||[x.description,x.category,x.counterparty,x.contractRef].some(v=>v.toLowerCase().includes(search.toLowerCase())))&&(filter==='all'||filter==='revenue'&&x.type==='receita'||filter==='expenses'&&x.type==='despesa'||filter==='profit')),[transactions,start,end,search,filter])
 const revenues=paid.filter(x=>x.type==='receita'),expenses=paid.filter(x=>x.type==='despesa'),rev=revenues.reduce((s,x)=>s+x.amount,0),exp=expenses.reduce((s,x)=>s+x.amount,0),profit=rev-exp,margin=rev?profit/rev*100:0
 const categoryRows=group(paid,x=>x.category)
 return <AdminShell area="finance" items={UNIFIED_ADMIN_NAV} header={{title:'Contabilidade',description:'Demonstrativos e visão contábil gerencial'}}>
  <section className="finance-page">
   {transactionsQuery.isLoading?<section className="finance-table-card"><header><div><h3>Carregando Contabilidade</h3><p>Consultando transações na fonte canônica…</p></div></header></section>:transactionsQuery.isError?<section className="finance-table-card" role="alert"><header><div><h3>Não foi possível carregar a Contabilidade</h3><p>{transactionsQuery.error instanceof Error?transactionsQuery.error.message:'A API financeira está indisponível.'}</p></div><button className="crm-btn secondary" onClick={()=>{void transactionsQuery.refetch()}}>Tentar novamente</button></header></section>:<>
   <div className="finance-kpis accounting-original-kpis"><Kpi title="Receita Total" value={money(rev)} icon={<TrendingUp/>}/><Kpi title="Despesa Total" value={money(-exp)} icon={<TrendingDown/>}/><Kpi title="Lucro Líquido" value={money(profit)} icon={<DollarSign/>}/><Kpi title="Margem Líquida" value={`${margin.toFixed(1)}%`} icon={<BookOpen/>}/></div>
   <div className="finance-filters accounting-filters"><input style={filterControlStyle} type="date" value={start} onChange={e=>setStart(e.target.value)}/><input style={filterControlStyle} type="date" value={end} onChange={e=>setEnd(e.target.value)}/><label className="finance-search" style={searchStyle}><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por descrição ou categoria…"/></label><select style={filterControlStyle} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos</option><option value="revenue">Receitas</option><option value="expenses">Despesas</option><option value="profit">Lucro</option></select></div>
   <ResultTable title="Demonstrativo de Resultado" description="Receitas e despesas por categoria no período" firstColumn="Categoria" rows={categoryRows} totalRevenue={rev}/>
   </>}
  </section>
 </AdminShell>
}
function group(items:FinanceTransaction[],key:(x:FinanceTransaction)=>string){const out:Record<string,{revenue:number;expense:number}>={};for(const x of items){const name=key(x);out[name]??={revenue:0,expense:0};out[name][x.type==='receita'?'revenue':'expense']+=x.amount}return Object.entries(out).map(([name,value])=>({name,...value}))}
function ResultTable({title,description,firstColumn,rows,totalRevenue}:{title:string;description:string;firstColumn:string;rows:{name:string;revenue:number;expense:number}[];totalRevenue:number}){const [sort,setSort]=useState<SortState>(null);const sorted=useMemo(()=>{if(!sort)return rows;const value=(x:{name:string;revenue:number;expense:number}):string|number=>sort.key==='name'?x.name:sort.key==='revenue'?x.revenue:sort.key==='expense'?x.expense:sort.key==='result'?x.revenue-x.expense:(totalRevenue?x.revenue/totalRevenue:0);return [...rows].sort((a,b)=>compare(value(a),value(b),sort.direction))},[rows,sort,totalRevenue]);return <section className="finance-table-card"><header><div><h3>{title}</h3><p>{description} · {rows.length} registro(s)</p></div></header><div className="finance-table-wrap"><table className="finance-table accounting-result-table"><thead><tr><th style={tableHeaderStyle}><TableSortHeader label={firstColumn} column="name" sort={sort} onSort={setSort}/></th><th style={tableHeaderStyle}><TableSortHeader label="Receitas" column="revenue" sort={sort} onSort={setSort}/></th><th style={tableHeaderStyle}><TableSortHeader label="Despesas" column="expense" sort={sort} onSort={setSort}/></th><th style={tableHeaderStyle}><TableSortHeader label="Resultado" column="result" sort={sort} onSort={setSort}/></th><th style={tableHeaderStyle}><TableSortHeader label="% Receita" column="share" sort={sort} onSort={setSort}/></th></tr></thead><tbody>{sorted.map(x=><tr key={x.name}><td style={tableCellStyle}><strong style={categoryCellContentStyle}>{x.name}</strong></td><td className="positive" style={tableCellStyle}>{money(x.revenue)}</td><td className="negative" style={tableCellStyle}>{money(-x.expense)}</td><td style={tableCellStyle}>{money(x.revenue-x.expense)}</td><td style={tableCellStyle}>{totalRevenue?`${(x.revenue/totalRevenue*100).toFixed(1)}%`:'0.0%'}</td></tr>)}</tbody></table></div></section>}
function Kpi({title,value,icon}:{title:string;value:string;icon:ReactNode}){return <article className="finance-kpi"><div><span>{title}</span><strong>{value}</strong></div><i>{icon}</i></article>}
