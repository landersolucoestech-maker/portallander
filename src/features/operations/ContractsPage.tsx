import { AlertCircle, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Copy, FileEdit, FileStack, PenLine, Plus, Search, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminShell, type AdminShellAction } from '../../shared/internal/AdminUi'

type Tone='neutral'|'success'|'warning'|'danger'|'accent'|'info'
type ContractModal='templates'|'categories'|'variables'|'new'|null
type ContractRecord={id:number;title:string;type:string;status:string;signature:string;value:number}

const Metric=({title,value,description,icon,tone='neutral'}:{title:string;value:string;description:string;icon:ReactNode;tone?:Tone})=><article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>
const Badge=({children,tone='neutral'}:{children:ReactNode;tone?:Tone})=><span className={`zip-badge zip-badge-${tone}`}>{children}</span>
const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value)

const INITIAL_CONTRACTS:ContractRecord[]=[
  {id:1,title:'Pacote de mídia · Norte Produções',type:'Publicidade',status:'Em assinatura',signature:'Autentique',value:18000},
  {id:2,title:'Cobertura · Festival Órbita',type:'Evento',status:'Rascunho',signature:'—',value:12000},
  {id:3,title:'Parceria · Studio Sul',type:'Parceria',status:'Vigente',signature:'Clicksign',value:9000},
  {id:4,title:'Publieditorial · Agência Ponto',type:'Publicidade',status:'Em análise',signature:'—',value:15000},
  {id:5,title:'Entrevista patrocinada · Marca Nova',type:'Publicidade',status:'Vigente',signature:'Autentique',value:7200},
  {id:6,title:'Cobertura especial · Expo Music',type:'Evento',status:'Aguardando assinatura',signature:'Autentique',value:13500},
  {id:7,title:'Parceria editorial · Selo Azul',type:'Parceria',status:'Assinado',signature:'Clicksign',value:6500},
  {id:8,title:'Banner premium · Aurora Music',type:'Publicidade',status:'Encerrado',signature:'Autentique',value:4800},
  {id:9,title:'Cobertura · Festival Horizonte',type:'Evento',status:'Em análise',signature:'—',value:11000},
  {id:10,title:'Publieditorial · PressLab',type:'Publicidade',status:'Rascunho',signature:'—',value:5800},
  {id:11,title:'Parceria institucional · BL Eventos',type:'Parceria',status:'Vigente',signature:'Clicksign',value:8400},
  {id:12,title:'Pacote de lançamento · Norte Produções',type:'Publicidade',status:'Aguardando assinatura',signature:'Autentique',value:9600},
]

const INITIAL_CATEGORIES=['Publicidade','Evento','Parceria']
const TEMPLATE_OPTIONS=[
  {name:'Publicidade / Mídia',description:'Modelo para banners, publieditoriais, mídia kit e campanhas comerciais.',type:'Publicidade'},
  {name:'Cobertura de Evento',description:'Modelo para cobertura editorial, presença de equipe e entregáveis.',type:'Evento'},
  {name:'Parceria Institucional',description:'Modelo para cooperação comercial, editorial ou institucional.',type:'Parceria'},
]
const VARIABLE_OPTIONS=[
  ['{{contratante_nome}}','Nome ou razão social do contratante'],
  ['{{contratante_documento}}','CPF ou CNPJ do contratante'],
  ['{{valor_total}}','Valor total acordado no contrato'],
  ['{{data_inicio}}','Data de início da vigência'],
  ['{{data_fim}}','Data de encerramento da vigência'],
  ['{{responsavel_interno}}','Responsável interno pelo contrato'],
]

function ModalShell({title,description,onClose,children}:{title:string;description:string;onClose:()=>void;children:ReactNode}){
  return <div className="contracts-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="contracts-modal" role="dialog" aria-modal="true" aria-label={title}>
      <header><div><h2>{title}</h2><p>{description}</p></div><button type="button" className="zip-icon" onClick={onClose} aria-label="Fechar"><X size={16}/></button></header>
      <div className="contracts-modal-body">{children}</div>
    </section>
  </div>
}

export function ContractsPage(){
  const [contracts,setContracts]=useState<ContractRecord[]>(INITIAL_CONTRACTS)
  const [modal,setModal]=useState<ContractModal>(null)
  const [query,setQuery]=useState('')
  const [typeFilter,setTypeFilter]=useState('Todos')
  const [statusFilter,setStatusFilter]=useState('Todos')
  const [sort,setSort]=useState('recent')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState(5)
  const [categories,setCategories]=useState(INITIAL_CATEGORIES)
  const [categoryDraft,setCategoryDraft]=useState('')
  const [copiedVariable,setCopiedVariable]=useState('')
  const [selectedTemplate,setSelectedTemplate]=useState('')
  const [draft,setDraft]=useState({title:'',type:'Publicidade',status:'Rascunho',signature:'—',value:''})

  const types=useMemo(()=>Array.from(new Set(contracts.map(item=>item.type))),[contracts])
  const statuses=useMemo(()=>Array.from(new Set(contracts.map(item=>item.status))),[contracts])
  const filtered=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase('pt-BR')
    const list=contracts.filter(item=>(!normalized||`${item.title} ${item.type} ${item.status}`.toLocaleLowerCase('pt-BR').includes(normalized))&&(typeFilter==='Todos'||item.type===typeFilter)&&(statusFilter==='Todos'||item.status===statusFilter))
    return [...list].sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'pt-BR'):sort==='value-desc'?b.value-a.value:sort==='value-asc'?a.value-b.value:b.id-a.id)
  },[contracts,query,typeFilter,statusFilter,sort])
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize))
  const currentPage=Math.min(page,totalPages)
  const pageRows=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize)
  const start=filtered.length?(currentPage-1)*pageSize+1:0
  const end=Math.min(currentPage*pageSize,filtered.length)

  const open=(target:ContractModal)=>setModal(target)
  const headerActions:readonly AdminShellAction[]=[
    {label:'Templates',variant:'secondary',onClick:()=>open('templates')},
    {label:'Categorias',variant:'secondary',onClick:()=>open('categories')},
    {label:'Variáveis',variant:'secondary',onClick:()=>open('variables')},
    {label:'Novo contrato',variant:'primary',onClick:()=>open('new')},
  ]

  const chooseTemplate=(name:string,type:string)=>{
    setSelectedTemplate(name)
    setDraft(current=>({...current,type,title:current.title||`${name} · `}))
    setModal('new')
  }

  const addCategory=(event:FormEvent)=>{
    event.preventDefault()
    const value=categoryDraft.trim()
    if(!value||categories.some(item=>item.toLocaleLowerCase('pt-BR')===value.toLocaleLowerCase('pt-BR')))return
    setCategories(items=>[...items,value])
    setCategoryDraft('')
  }

  const copyVariable=async(token:string)=>{
    try{await navigator.clipboard.writeText(token)}catch{void 0}
    setCopiedVariable(token)
    window.setTimeout(()=>setCopiedVariable(current=>current===token?'':current),1400)
  }

  const createContract=(event:FormEvent)=>{
    event.preventDefault()
    const title=draft.title.trim()
    const numericValue=Number(draft.value.replace(/[^0-9.,]/g,'').replace('.','').replace(',','.'))||0
    if(!title)return
    setContracts(items=>[...items,{id:Math.max(...items.map(item=>item.id),0)+1,title,type:draft.type,status:draft.status,signature:draft.signature,value:numericValue}])
    setDraft({title:'',type:categories[0]??'Publicidade',status:'Rascunho',signature:'—',value:''})
    setSelectedTemplate('')
    setQuery('');setTypeFilter('Todos');setStatusFilter('Todos');setSort('recent');setPage(1)
    setModal(null)
  }

  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Contratos',description:'Gestão de documentos, vigência, assinatura e valores contratuais.'}} headerActions={headerActions}>
    <div className="zip-stack contracts-page">
      <div className="zip-kpi-grid contracts">
        <Metric title="Total de Contratos" value={String(contracts.length)} description="na base da sessão" icon={<FileStack size={18}/>} tone="accent"/>
        <Metric title="Vigentes" value={String(contracts.filter(item=>item.status==='Vigente').length)} description="em vigor" icon={<CheckCircle2 size={18}/>} tone="success"/>
        <Metric title="Assinados" value={String(contracts.filter(item=>item.status==='Assinado').length)} description="aguardando vigência" icon={<PenLine size={18}/>} tone="accent"/>
        <Metric title="Aguardando Assinatura" value={String(contracts.filter(item=>item.status==='Aguardando assinatura'||item.status==='Em assinatura').length)} description="pendentes de assinar" icon={<CalendarClock size={18}/>} tone="warning"/>
        <Metric title="Em Análise" value={String(contracts.filter(item=>item.status==='Em análise'||item.status==='Rascunho').length)} description="rascunho / negociação" icon={<FileEdit size={18}/>}/>
        <Metric title="Encerrados" value={String(contracts.filter(item=>item.status==='Encerrado').length)} description="expirados / cancelados" icon={<AlertCircle size={18}/>} tone="warning"/>
        <Metric title="Valor Total" value={money(contracts.filter(item=>['Vigente','Assinado'].includes(item.status)).reduce((sum,item)=>sum+item.value,0))} description="vigentes + assinados" icon={<CircleDollarSign size={18}/>} tone="accent"/>
      </div>

      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar por parceiro, tipo ou título…"/></label>
        <select value={typeFilter} onChange={event=>{setTypeFilter(event.target.value);setPage(1)}}><option>Todos</option>{types.map(type=><option key={type}>{type}</option>)}</select>
        <select value={statusFilter} onChange={event=>{setStatusFilter(event.target.value);setPage(1)}}><option>Todos</option>{statuses.map(status=><option key={status}>{status}</option>)}</select>
        <select value={sort} onChange={event=>setSort(event.target.value)} aria-label="Ordenar contratos"><option value="recent">Mais recentes</option><option value="title">Título A–Z</option><option value="value-desc">Maior valor</option><option value="value-asc">Menor valor</option></select>
      </div>

      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>Contratos</h2><p>Documentos, status, assinatura e valor</p></div></header>
        <div className="zip-table-wrap"><table className="zip-table"><thead><tr><th>Contrato</th><th>Tipo</th><th>Status</th><th>Assinatura</th><th className="right">Valor</th></tr></thead><tbody>{pageRows.length?pageRows.map(row=><tr key={row.id}><td><strong>{row.title}</strong></td><td>{row.type}</td><td><Badge tone={row.status==='Vigente'||row.status==='Assinado'?'success':row.status==='Rascunho'?'neutral':row.status==='Encerrado'?'danger':'warning'}>{row.status}</Badge></td><td>{row.signature}</td><td className="right"><strong>{money(row.value)}</strong></td></tr>):<tr><td colSpan={5} className="contracts-empty-row">Nenhum contrato encontrado com os filtros atuais.</td></tr>}</tbody></table></div>
        <footer className="contracts-pagination">
          <div className="contracts-pagination-summary">Mostrando <strong>{start}–{end}</strong> de <strong>{filtered.length}</strong> registros</div>
          <label>Por página<select value={pageSize} onChange={event=>{setPageSize(Number(event.target.value));setPage(1)}}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label>
          <div className="contracts-pagination-nav">
            <button type="button" className="zip-icon" onClick={()=>setPage(1)} disabled={currentPage===1} aria-label="Primeira página">«</button>
            <button type="button" className="zip-icon" onClick={()=>setPage(value=>Math.max(1,value-1))} disabled={currentPage===1} aria-label="Página anterior"><ChevronLeft size={15}/></button>
            <span>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
            <button type="button" className="zip-icon" onClick={()=>setPage(value=>Math.min(totalPages,value+1))} disabled={currentPage===totalPages} aria-label="Próxima página"><ChevronRight size={15}/></button>
            <button type="button" className="zip-icon" onClick={()=>setPage(totalPages)} disabled={currentPage===totalPages} aria-label="Última página">»</button>
          </div>
        </footer>
      </section>
    </div>

    {modal==='templates'&&<ModalShell title="Templates" description="Escolha um modelo para iniciar um novo contrato." onClose={()=>setModal(null)}><div className="contracts-template-grid">{TEMPLATE_OPTIONS.map(template=><article key={template.name}><FileStack size={18}/><div><h3>{template.name}</h3><p>{template.description}</p></div><button type="button" className="button outline" onClick={()=>chooseTemplate(template.name,template.type)}>Usar template</button></article>)}</div></ModalShell>}

    {modal==='categories'&&<ModalShell title="Categorias" description="Organize os tipos utilizados nos contratos desta sessão." onClose={()=>setModal(null)}><form className="contracts-inline-form" onSubmit={addCategory}><input value={categoryDraft} onChange={event=>setCategoryDraft(event.target.value)} placeholder="Nova categoria"/><button className="button dark" type="submit"><Plus size={14}/> Adicionar</button></form><div className="contracts-category-list">{categories.map(category=><div key={category}><strong>{category}</strong><span>{contracts.filter(item=>item.type===category).length} contratos</span></div>)}</div><p className="contracts-session-note">Alterações permanecem somente nesta sessão enquanto não houver persistência server-side.</p></ModalShell>}

    {modal==='variables'&&<ModalShell title="Variáveis" description="Tokens disponíveis para composição de templates contratuais." onClose={()=>setModal(null)}><div className="contracts-variable-list">{VARIABLE_OPTIONS.map(([token,description])=><article key={token}><div><code>{token}</code><p>{description}</p></div><button type="button" className="button outline" onClick={()=>copyVariable(token)}><Copy size={13}/>{copiedVariable===token?'Copiado':'Copiar'}</button></article>)}</div></ModalShell>}

    {modal==='new'&&<ModalShell title="Novo contrato" description={selectedTemplate?`Rascunho iniciado com o template “${selectedTemplate}”.`:'Crie um rascunho contratual para a sessão atual.'} onClose={()=>setModal(null)}><form className="contracts-form" onSubmit={createContract}><label className="wide"><span>Título do contrato</span><input value={draft.title} onChange={event=>setDraft(current=>({...current,title:event.target.value}))} placeholder="Ex.: Pacote de mídia · Empresa" required/></label><label><span>Categoria</span><select value={draft.type} onChange={event=>setDraft(current=>({...current,type:event.target.value}))}>{categories.map(category=><option key={category}>{category}</option>)}</select></label><label><span>Status inicial</span><select value={draft.status} onChange={event=>setDraft(current=>({...current,status:event.target.value}))}><option>Rascunho</option><option>Em análise</option><option>Aguardando assinatura</option></select></label><label><span>Assinatura</span><select value={draft.signature} onChange={event=>setDraft(current=>({...current,signature:event.target.value}))}><option>—</option><option>Autentique</option><option>Clicksign</option></select></label><label><span>Valor</span><input value={draft.value} onChange={event=>setDraft(current=>({...current,value:event.target.value}))} placeholder="R$ 0,00" inputMode="decimal"/></label><div className="contracts-form-actions wide"><button type="button" className="button outline" onClick={()=>setModal(null)}>Cancelar</button><button type="submit" className="button dark">Criar rascunho</button></div></form><p className="contracts-session-note">O rascunho é adicionado à tabela imediatamente, mas permanece somente na memória desta sessão até existir backend para persistência real.</p></ModalShell>}
  </AdminShell>
}
