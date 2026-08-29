import { ChevronLeft, ChevronRight, CircleDollarSign, FileText, MoreHorizontal, Plus, Search, TrendingDown, TrendingUp, Upload } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'

const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value)
type Tone='neutral'|'success'|'warning'|'danger'|'accent'
type FinanceRow=readonly [string,string,string,string,string,number]
function Metric({title,value,description,icon,tone='neutral'}:{title:string;value:string;description:string;icon:ReactNode;tone?:Tone}){return <article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>}
function Badge({children,tone='neutral'}:{children:ReactNode;tone?:Tone}){return <span className={`zip-badge zip-badge-${tone}`}>{children}</span>}

const FINANCE_ROWS:readonly FinanceRow[]=[
  ['Receita','Publicidade Portal Lander','Publicidade','Recebido','29/08/2026',8500],['Receita','Cobertura Festival Órbita','Cobertura','Pendente','31/08/2026',12000],['Despesa','Ferramentas SaaS','Software','Pago','27/08/2026',-2480],['Despesa','Produção editorial','Produção','Pago','26/08/2026',-3200],['Receita','Publieditorial Agência Ponto','Publicidade','Recebido','24/08/2026',7200],['Despesa','Banco de imagens','Conteúdo','Pago','23/08/2026',-890],['Receita','Banner institucional','Publicidade','Recebido','22/08/2026',4600],['Despesa','Cobertura audiovisual','Produção','Pendente','21/08/2026',-2100],['Receita','Patrocínio editorial','Patrocínio','Pendente','20/08/2026',9800],['Despesa','Hospedagem e infraestrutura','Software','Pago','19/08/2026',-1340],['Receita','Mídia Kit Premium','Publicidade','Recebido','18/08/2026',5800],['Despesa','Freelancer editorial','Produção','Pago','17/08/2026',-1700],
]

export function FinancePage(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos os tipos')
  const [status,setStatus]=useState('Todos os status')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(5)
  const [sortDirection,setSortDirection]=useState<'desc'|'asc'>('desc')
  const filtered=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase('pt-BR')
    return FINANCE_ROWS.filter(row=>(!normalized||`${row[1]} ${row[2]} ${row[3]}`.toLocaleLowerCase('pt-BR').includes(normalized))&&(type==='Todos os tipos'||row[0]===type)&&(status==='Todos os status'||row[3]===status)).sort((a,b)=>sortDirection==='desc'?b[5]-a[5]:a[5]-b[5])
  },[query,type,status,sortDirection])
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize))
  const safePage=Math.min(page,totalPages)
  const rows=filtered.slice((safePage-1)*pageSize,safePage*pageSize)
  const resetPage=()=>setPage(1)
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / FINANCEIRO" title="Financeiro" description="Controle financeiro e fluxo de caixa."/>
    <div className="zip-stack">
      <div className="zip-page-actions finance-actions"><button className="zip-button secondary" disabled><Upload size={14}/> Importar OFX</button><button className="zip-button secondary" disabled><FileText size={14}/> Regras</button><button className="zip-button" disabled><Plus size={14}/> Nova Transação</button></div>
      <div className="zip-kpi-grid five"><Metric title="Receita Mensal" value="R$ 20.500" description="receitas pagas" icon={<TrendingUp size={18}/>} tone="success"/><Metric title="Despesas Mensais" value="R$ 5.680" description="despesas pagas" icon={<TrendingDown size={18}/>} tone="danger"/><Metric title="Lucro Líquido" value="R$ 14.820" description="margem 72%" icon={<CircleDollarSign size={18}/>} tone="success"/><Metric title="Contas a Receber" value="R$ 12.000" description="1 pendente" icon={<ChevronRight size={18}/>} tone="warning"/><Metric title="Contas a Pagar" value="R$ 2.100" description="obrigações futuras" icon={<ChevronLeft size={18}/>} tone="warning"/></div>
      <div className="zip-toolbar"><input type="date"/><input type="date"/><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>{setQuery(event.target.value);resetPage()}} placeholder="Buscar transações…"/></label><select value={type} onChange={event=>{setType(event.target.value);resetPage()}}><option>Todos os tipos</option><option>Receita</option><option>Despesa</option></select><select value={status} onChange={event=>{setStatus(event.target.value);resetPage()}}><option>Todos os status</option><option>Pago</option><option>Recebido</option><option>Pendente</option></select><select><option>Todas as categorias</option></select></div>
      <section className="zip-panel"><header className="zip-panel-head"><div><h2>Transações</h2><p>Fluxo de receitas e despesas · {filtered.length} registros</p></div></header><div className="tableview-surface"><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Status</th><th>Data</th><th className="right"><button className="tableview-sort" type="button" onClick={()=>setSortDirection(value=>value==='desc'?'asc':'desc')}>Valor {sortDirection==='desc'?'↓':'↑'}</button></th><th></th></tr></thead><tbody>{rows.map(row=><tr key={`${row[1]}-${row[4]}`}><td><Badge tone={row[0]==='Receita'?'success':'danger'}>{row[0]}</Badge></td><td><strong>{row[1]}</strong></td><td>{row[2]}</td><td><Badge tone={row[3]==='Pendente'?'warning':'success'}>{row[3]}</Badge></td><td>{row[4]}</td><td className={`right ${row[5]>0?'zip-positive':'zip-negative'}`}><strong>{money(row[5])}</strong></td><td className="right"><MoreHorizontal size={16}/></td></tr>)}</tbody></table></div><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div></section>
    </div>
  </AdminShell>
}
