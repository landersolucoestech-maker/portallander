import { AlertCircle, CircleDollarSign, Gauge, Palmtree, Search, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../shared/internal/TableViewPagination'
import { OperationsPage as LegacyOperationsPage } from './OperationsPage'

type Tone='neutral'|'success'|'warning'|'danger'|'accent'|'info'
const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value)
const Metric=({title,value,description,icon,tone='neutral'}:{title:string;value:string;description:string;icon:ReactNode;tone?:Tone})=><article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>
const Badge=({children,tone='neutral'}:{children:ReactNode;tone?:Tone})=><span className={`zip-badge zip-badge-${tone}`}>{children}</span>

function PaginatedTable({headers,rows}:{headers:string[];rows:ReactNode[][]}){
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(5)
  const totalPages=Math.max(1,Math.ceil(rows.length/pageSize))
  const safePage=Math.min(page,totalPages)
  const visible=rows.slice((safePage-1)*pageSize,safePage*pageSize)
  return <div className="tableview-surface"><div className="zip-table-wrap"><table className="zip-table"><thead><tr>{headers.map((header,index)=><th key={header} className={index===headers.length-1?'right':''}>{header}</th>)}</tr></thead><tbody>{visible.map((row,index)=><tr key={`${safePage}-${index}`}>{row.map((cell,cellIndex)=><td key={cellIndex} className={cellIndex===row.length-1?'right':''}>{cell}</td>)}</tr>)}</tbody></table></div><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={rows.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>
}

const ACCOUNTING_ROWS=[
  ['Publicidade Portal Lander','Receita','Recebido',8500],['Cobertura Festival Órbita','Receita','Previsto',12000],['Ferramentas SaaS','Despesa','Pago',-2480],['Produção editorial','Despesa','Pago',-3200],['Publieditorial Agência Ponto','Receita','Recebido',7200],['Banco de imagens','Despesa','Pago',-890],['Banner institucional','Receita','Recebido',4600],['Cobertura audiovisual','Despesa','Previsto',-2100],['Patrocínio editorial','Receita','Previsto',9800],['Hospedagem','Despesa','Pago',-1340],['Mídia Kit Premium','Receita','Recebido',5800],['Freelancer editorial','Despesa','Pago',-1700],
] as const

function AccountingPage(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos')
  const [sort,setSort]=useState<'desc'|'asc'>('desc')
  const rows=useMemo(()=>ACCOUNTING_ROWS.filter(row=>(!query||row[0].toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))&&(type==='Todos'||row[1]===type)).sort((a,b)=>sort==='desc'?b[3]-a[3]:a[3]-b[3]),[query,type,sort])
  return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / FINANCEIRO / CONTABILIDADE" title="Contabilidade" description="Demonstrativos, receitas, despesas e resultado operacional."/><div className="zip-stack"><div className="zip-kpi-grid four"><Metric title="Receita Total" value={money(20500)} description="receitas no período" icon={<TrendingUp size={18}/>} tone="success"/><Metric title="Despesa Total" value={money(5680)} description="despesas no período" icon={<TrendingDown size={18}/>} tone="danger"/><Metric title="Lucro Líquido" value={money(14820)} description="resultado consolidado" icon={<CircleDollarSign size={18}/>} tone="accent"/><Metric title="Margem Líquida" value="72%" description="resultado sobre receita" icon={<Gauge size={18}/>} tone="success"/></div><div className="zip-toolbar"><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar lançamento…"/></label><select value={type} onChange={event=>setType(event.target.value)}><option>Todos</option><option>Receita</option><option>Despesa</option></select><button className="zip-button secondary" type="button" onClick={()=>setSort(value=>value==='desc'?'asc':'desc')}>Valor {sort==='desc'?'↓':'↑'}</button></div><section className="zip-panel"><header className="zip-panel-head"><div><h2>P&amp;L Empresa</h2><p>Demonstrativo de receitas, despesas e resultado</p></div></header><PaginatedTable headers={['Descrição','Tipo','Status','Valor']} rows={rows.map(row=>[<strong>{row[0]}</strong>,row[1],<Badge tone={row[2]==='Previsto'?'warning':'success'}>{row[2]}</Badge>,<strong className={row[3]>0?'zip-positive':'zip-negative'}>{money(row[3])}</strong>])}/></section></div></AdminShell>
}

const RH_ROWS=[['Equipe Editorial','Editorial','Colaborador','Ativo','3 pessoas'],['Equipe Comercial','Comercial','Colaborador','Ativo','2 pessoas'],['Administração','Operação','Administrativo','Ativo','3 pessoas'],['Social Media','Marketing','Prestador','Ativo','1 pessoa'],['Fotografia','Editorial','Prestador','Ativo','2 pessoas'],['Audiovisual','Produção','Prestador','Ativo','2 pessoas'],['Financeiro','Administração','Colaborador','Ativo','1 pessoa'],['Atendimento','Comercial','Colaborador','Ativo','2 pessoas'],['Design','Marketing','Prestador','Férias','1 pessoa'],['Tecnologia','Operação','Prestador','Ativo','1 pessoa']]
function RhPage(){
  const [query,setQuery]=useState('')
  const rows=RH_ROWS.filter(row=>!query||row.join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))
  return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / RH" title="RH" description="Colaboradores, vínculos, férias, ausências e documentação."/><div className="zip-stack"><div className="zip-kpi-grid four"><Metric title="Total" value="10" description="registros" icon={<Users size={18}/>} tone="accent"/><Metric title="Ativos" value="9" description="vínculos ativos" icon={<UserCheck size={18}/>} tone="success"/><Metric title="Férias" value="1" description="no período" icon={<Palmtree size={18}/>} tone="info"/><Metric title="Afastados" value="0" description="no período" icon={<AlertCircle size={18}/>} tone="warning"/></div><div className="zip-toolbar"><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por nome, área ou vínculo…"/></label></div><section className="zip-panel"><header className="zip-panel-head"><div><h2>Funcionários e colaboradores</h2><p>Equipe e vínculos operacionais</p></div></header><PaginatedTable headers={['Nome / Equipe','Área','Vínculo','Status','Referência']} rows={rows.map(row=>[<strong>{row[0]}</strong>,row[1],row[2],<Badge tone={row[3]==='Ativo'?'success':'warning'}>{row[3]}</Badge>,row[4]])}/></section></div></AdminShell>
}

export function PaginatedOperationsPage({moduleKey}:{moduleKey:string}){
  if(moduleKey==='accounting')return <AccountingPage/>
  if(moduleKey==='rh')return <RhPage/>
  return <LegacyOperationsPage moduleKey={moduleKey}/>
}
