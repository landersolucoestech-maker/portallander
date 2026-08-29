import { AlertCircle, CalendarClock, CheckCircle2, CircleDollarSign, FileEdit, FileStack, PenLine, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell, type AdminShellAction } from '../../shared/internal/AdminUi'

type Tone='neutral'|'success'|'warning'|'danger'|'accent'|'info'

const Metric=({title,value,description,icon,tone='neutral'}:{title:string;value:string;description:string;icon:ReactNode;tone?:Tone})=><article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>
const Badge=({children,tone='neutral'}:{children:ReactNode;tone?:Tone})=><span className={`zip-badge zip-badge-${tone}`}>{children}</span>
const DataTable=({headers,rows}:{headers:string[];rows:ReactNode[][]})=><div className="zip-table-wrap"><table className="zip-table"><thead><tr>{headers.map((header,index)=><th key={header} className={index===headers.length-1?'right':''}>{header}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={index}>{row.map((cell,cellIndex)=><td key={cellIndex} className={cellIndex===row.length-1?'right':''}>{cell}</td>)}</tr>)}</tbody></table></div>

const unavailable='Disponível quando a camada persistente do módulo Contratos estiver conectada.'
const contractHeaderActions:readonly AdminShellAction[]=[
  {label:'Templates',variant:'secondary',disabled:true,disabledReason:unavailable},
  {label:'Categorias',variant:'secondary',disabled:true,disabledReason:unavailable},
  {label:'Variáveis',variant:'secondary',disabled:true,disabledReason:unavailable},
  {label:'Novo contrato',variant:'primary',disabled:true,disabledReason:unavailable},
]

export function ContractsPage(){
  const rows=[
    ['Pacote de mídia · Norte Produções','Publicidade','Em assinatura','Autentique','R$ 18.000'],
    ['Cobertura · Festival Órbita','Evento','Rascunho','—','R$ 12.000'],
    ['Parceria · Studio Sul','Parceria','Vigente','Clicksign','R$ 9.000'],
    ['Publieditorial · Agência Ponto','Publicidade','Em análise','—','R$ 15.000'],
  ]

  return <AdminShell area="crm" items={CRM_NAV} headerActions={contractHeaderActions}>
    <AdminPageHeader eyebrow="CRM / CONTRATOS" title="Contratos" description="Gestão de documentos, vigência, assinatura e valores contratuais."/>
    <div className="zip-stack">
      <div className="zip-kpi-grid contracts">
        <Metric title="Total de Contratos" value="12" description="na base" icon={<FileStack size={18}/>} tone="accent"/>
        <Metric title="Vigentes" value="7" description="em vigor" icon={<CheckCircle2 size={18}/>} tone="success"/>
        <Metric title="Assinados" value="2" description="aguardando vigência" icon={<PenLine size={18}/>} tone="accent"/>
        <Metric title="Aguardando Assinatura" value="3" description="pendentes de assinar" icon={<CalendarClock size={18}/>} tone="warning"/>
        <Metric title="Em Análise" value="2" description="rascunho / negociação" icon={<FileEdit size={18}/>}/>
        <Metric title="Encerrados" value="1" description="expirados / cancelados" icon={<AlertCircle size={18}/>} tone="warning"/>
        <Metric title="Valor Total" value="R$ 54.000" description="vigentes + assinados" icon={<CircleDollarSign size={18}/>} tone="accent"/>
      </div>

      <div className="zip-toolbar">
        <label className="zip-search"><Search size={14}/><input placeholder="Buscar por parceiro, tipo ou título…"/></label>
        <select><option>Todos os tipos</option></select>
        <select><option>Todos os status</option></select>
      </div>

      <section className="zip-panel">
        <header className="zip-panel-head"><div><h2>Contratos</h2><p>Documentos, status, assinatura e valor</p></div></header>
        <DataTable headers={['Contrato','Tipo','Status','Assinatura','Valor']} rows={rows.map(row=>[
          <strong>{row[0]}</strong>,
          row[1],
          <Badge tone={row[2]==='Vigente'?'success':row[2]==='Rascunho'?'neutral':'warning'}>{row[2]}</Badge>,
          row[3],
          <strong>{row[4]}</strong>,
        ])}/>
      </section>
    </div>
  </AdminShell>
}
