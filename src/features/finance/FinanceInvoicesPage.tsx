import {ArrowDownLeft,ArrowLeftRight,ArrowUpRight,Download,FileText,Plus,Scale,Search} from 'lucide-react'
import {useMemo,useState,type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import {money,type FinanceInvoice} from './domain'
import {financeInvoicesMock} from './mocks'

const readInvoices=():FinanceInvoice[]=>{try{const raw=localStorage.getItem('portal-lander:finance:invoices');return raw?JSON.parse(raw) as FinanceInvoice[]:financeInvoicesMock}catch{return financeInvoicesMock}}
const dateLabel=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'):'—'

export default function FinanceInvoicesPage(){
 const navigate=useNavigate()
 const [invoices]=useState(readInvoices),[search,setSearch]=useState(''),[type,setType]=useState('all'),[status,setStatus]=useState('all'),[start,setStart]=useState(''),[end,setEnd]=useState(''),[page,setPage]=useState(1)
 const filtered=useMemo(()=>invoices.filter(x=>(!search||[x.number,x.party,x.document].some(v=>v.toLowerCase().includes(search.toLowerCase())))&&(type==='all'||x.type===type)&&(status==='all'||x.status===status)&&(!start||x.issueDate>=start)&&(!end||x.issueDate<=end)),[invoices,search,type,status,start,end])
 const pages=Math.max(1,Math.ceil(filtered.length/10)),items=filtered.slice((Math.min(page,pages)-1)*10,Math.min(page,pages)*10)
 const outputs=invoices.filter(x=>x.type==='saida'),inputs=invoices.filter(x=>x.type==='entrada'),outValue=outputs.reduce((s,x)=>s+x.amount,0),inValue=inputs.reduce((s,x)=>s+x.amount,0),balance=outValue-inValue
 return <AdminShell area="finance" items={CRM_WORKSPACE_NAV} header={{title:'Notas Fiscais',description:'Registro e controle de notas fiscais de entrada e saída'}} headerActions={[{label:'Financeiro',variant:'secondary',icon:ArrowLeftRight,onClick:()=>navigate('/app/finance')},{label:'Registrar Nota',icon:Plus,onClick:()=>navigate('/app/finance?newInvoice=1')}]}>
  <section className="finance-page">
   <div className="finance-kpis finance-invoice-six">
    <Kpi title="Total" value={String(invoices.length)} icon={<FileText/>}/><Kpi title="Saídas" value={String(outputs.length)} icon={<ArrowUpRight/>}/><Kpi title="Entradas" value={String(inputs.length)} icon={<ArrowDownLeft/>}/><Kpi title="Valor Saídas" value={money(outValue)} icon={<ArrowUpRight/>}/><Kpi title="Valor Entradas" value={money(-inValue)} icon={<ArrowDownLeft/>}/><Kpi title="Saldo" value={`${balance>=0?'+':''}${money(balance)}`} icon={<Scale/>}/>
   </div>
   <div className="finance-filters"><input type="date" value={start} onChange={e=>{setStart(e.target.value);setPage(1)}}/><input type="date" value={end} onChange={e=>{setEnd(e.target.value);setPage(1)}}/><label className="finance-search"><Search size={15}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Buscar por número, cliente ou fornecedor…"/></label><select value={type} onChange={e=>{setType(e.target.value);setPage(1)}}><option value="all">Todas</option><option value="saida">Saída</option><option value="entrada">Entrada</option></select><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="all">Todos</option><option value="emitida">Emitida</option><option value="pendente">Pendente</option><option value="paga">Paga</option><option value="cancelada">Cancelada</option></select></div>
   <section className="finance-table-card"><header><div><h3>Lista de Notas Fiscais</h3><p>Registro de notas de entrada e saída · {filtered.length} registro(s)</p></div></header><div className="finance-table-wrap"><table className="finance-table"><thead><tr><th></th><th>Número</th><th>Tipo</th><th>Cliente / Fornecedor</th><th>Valor</th><th>Data Emissão</th><th>Status</th><th>PDF</th><th>Ações</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><input type="checkbox"/></td><td><strong>{x.number}/{x.series}</strong></td><td>{x.type==='saida'?'Saída':'Entrada'}</td><td>{x.party}<small className="finance-cell-sub">{x.document}</small></td><td>{money(x.amount)}</td><td>{dateLabel(x.issueDate)}</td><td><span className={`finance-status ${x.status}`}>{x.status[0].toUpperCase()+x.status.slice(1)}</span></td><td>{x.pdfUrl?<button className="crm-icon-btn" onClick={()=>window.open(x.pdfUrl,'_blank')}><Download size={15}/></button>:'—'}</td><td>•••</td></tr>)}</tbody></table></div><footer className="finance-pagination"><span>Página {Math.min(page,pages)} de {pages}</span><div><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Anterior</button><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Próxima</button></div></footer></section>
  </section>
 </AdminShell>
}
function Kpi({title,value,icon}:{title:string;value:string;icon:ReactNode}){return <article className="finance-kpi"><div><span>{title}</span><strong>{value}</strong></div><i>{icon}</i></article>}
