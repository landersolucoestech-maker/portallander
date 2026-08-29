import { ChevronLeft, ChevronRight, CircleDollarSign, FileText, MoreHorizontal, Plus, Search, TrendingDown, TrendingUp, Upload } from 'lucide-react'
import type { ReactNode } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'

const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value)
type Tone='neutral'|'success'|'warning'|'danger'|'accent'
function Metric({title,value,description,icon,tone='neutral'}:{title:string;value:string;description:string;icon:ReactNode;tone?:Tone}){return <article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>}
function Badge({children,tone='neutral'}:{children:ReactNode;tone?:Tone}){return <span className={`zip-badge zip-badge-${tone}`}>{children}</span>}

export function FinancePage(){
  const rows=[
    ['Receita','Publicidade Portal Lander','Publicidade','Recebido','29/08/2026',8500],
    ['Receita','Cobertura Festival Órbita','Cobertura','Pendente','31/08/2026',12000],
    ['Despesa','Ferramentas SaaS','Software','Pago','27/08/2026',-2480],
    ['Despesa','Produção editorial','Produção','Pago','26/08/2026',-3200],
  ] as const
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / FINANCEIRO" title="Financeiro" description="Controle financeiro e fluxo de caixa."/>
    <div className="zip-stack">
      <div className="zip-page-actions finance-actions"><button className="zip-button secondary" disabled><Upload size={14}/> Importar OFX</button><button className="zip-button secondary" disabled><FileText size={14}/> Regras</button><button className="zip-button" disabled><Plus size={14}/> Nova Transação</button></div>
      <div className="zip-kpi-grid five">
        <Metric title="Receita Mensal" value="R$ 20.500" description="receitas pagas" icon={<TrendingUp size={18}/>} tone="success"/>
        <Metric title="Despesas Mensais" value="R$ 5.680" description="despesas pagas" icon={<TrendingDown size={18}/>} tone="danger"/>
        <Metric title="Lucro Líquido" value="R$ 14.820" description="margem 72%" icon={<CircleDollarSign size={18}/>} tone="success"/>
        <Metric title="Contas a Receber" value="R$ 12.000" description="1 pendente" icon={<ChevronRight size={18}/>} tone="warning"/>
        <Metric title="Contas a Pagar" value="R$ 2.100" description="obrigações futuras" icon={<ChevronLeft size={18}/>} tone="warning"/>
      </div>
      <div className="zip-toolbar"><input type="date"/><input type="date"/><label className="zip-search"><Search size={14}/><input placeholder="Buscar transações…"/></label><select><option>Todos os tipos</option><option>Receita</option><option>Despesa</option></select><select><option>Todos os status</option><option>Pago</option><option>Pendente</option></select><select><option>Todas as categorias</option></select></div>
      <section className="zip-panel"><header className="zip-panel-head"><div><h2>Transações</h2><p>Fluxo de receitas e despesas · 4 registros</p></div></header><div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Status</th><th>Data</th><th className="right">Valor</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r[1]}><td><Badge tone={r[0]==='Receita'?'success':'danger'}>{r[0]}</Badge></td><td><strong>{r[1]}</strong></td><td>{r[2]}</td><td><Badge tone={r[3]==='Pendente'?'warning':'success'}>{r[3]}</Badge></td><td>{r[4]}</td><td className={`right ${r[5]>0?'zip-positive':'zip-negative'}`}><strong>{money(r[5])}</strong></td><td className="right"><MoreHorizontal size={16}/></td></tr>)}</tbody></table></div></section>
    </div>
  </AdminShell>
}
