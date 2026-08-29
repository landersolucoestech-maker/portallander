import { Copy, Plus, Search, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminShell, type AdminShellAction } from '../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../shared/internal/TableViewPagination'

type RegistryRow={id:string;cells:ReactNode[];search:string}
type FieldOption={label:string;value:string}
type RegistryField={name:string;label:string;placeholder?:string;type?:'text'|'number'|'select'|'textarea';options?:FieldOption[];required?:boolean}
type RegistryCreateConfig={title:string;description:string;fields:RegistryField[];initial:Record<string,string>;submitLabel:string;buildRow:(values:Record<string,string>,id:string)=>RegistryRow}

type RegistryPageProps={
  title:string
  description:string
  headers:string[]
  initialRows:RegistryRow[]
  searchPlaceholder:string
  actionLabel:string
  createConfig:RegistryCreateConfig
}

function RegistryModal({config,onClose,onCreate}:{config:RegistryCreateConfig;onClose:()=>void;onCreate:(row:RegistryRow)=>void}){
  const [values,setValues]=useState<Record<string,string>>(config.initial)
  const submit=(event:FormEvent)=>{
    event.preventDefault()
    if(config.fields.some(field=>field.required&&!String(values[field.name]??'').trim()))return
    const id=`session-${Date.now()}`
    onCreate(config.buildRow(values,id))
    onClose()
  }
  return <div className="contracts-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="contracts-modal" role="dialog" aria-modal="true" aria-label={config.title}>
      <header><div><h2>{config.title}</h2><p>{config.description}</p></div><button type="button" className="zip-icon" onClick={onClose} aria-label="Fechar"><X size={16}/></button></header>
      <div className="contracts-modal-body">
        <form className="contracts-form" onSubmit={submit}>
          {config.fields.map(field=><label key={field.name} className={field.type==='textarea'?'wide':undefined}><span>{field.label}</span>{field.type==='select'?<select value={values[field.name]??''} onChange={event=>setValues(current=>({...current,[field.name]:event.target.value}))} required={field.required}>{field.options?.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:field.type==='textarea'?<textarea value={values[field.name]??''} onChange={event=>setValues(current=>({...current,[field.name]:event.target.value}))} placeholder={field.placeholder} required={field.required}/>:<input type={field.type==='number'?'number':'text'} value={values[field.name]??''} onChange={event=>setValues(current=>({...current,[field.name]:event.target.value}))} placeholder={field.placeholder} required={field.required}/>}</label>)}
          <div className="contracts-form-actions wide"><button type="button" className="button outline" onClick={onClose}>Cancelar</button><button type="submit" className="button dark"><Plus size={14}/>{config.submitLabel}</button></div>
        </form>
        <p className="contracts-session-note">O novo registro será adicionado à TableView desta sessão. Persistência compartilhada depende de backend.</p>
      </div>
    </section>
  </div>
}

function RegistryTablePage({title,description,headers,initialRows,searchPlaceholder,actionLabel,createConfig}:RegistryPageProps){
  const navigate=useNavigate()
  const [rows,setRows]=useState<RegistryRow[]>(initialRows)
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(5)
  const [creating,setCreating]=useState(false)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const filtered=useMemo(()=>rows.filter(row=>!normalized||row.search.toLocaleLowerCase('pt-BR').includes(normalized)),[rows,normalized])
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize))
  const currentPage=Math.min(page,totalPages)
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize)
  const headerActions:readonly AdminShellAction[]=[
    {label:'Contratos',variant:'secondary',onClick:()=>navigate('/app/crm/contracts')},
    {label:actionLabel,variant:'primary',onClick:()=>setCreating(true)},
  ]
  const create=(row:RegistryRow)=>{setRows(current=>[row,...current]);setQuery('');setPage(1)}
  return <AdminShell area="crm" items={CRM_NAV} header={{title,description}} headerActions={headerActions}>
    <div className="zip-stack contracts-page">
      <div className="zip-toolbar contracts-toolbar"><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder={searchPlaceholder}/></label></div>
      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>{title}</h2><p>{filtered.length} registros encontrados</p></div></header>
        <div className="tableview-surface"><div className="zip-table-wrap"><table className="zip-table"><thead><tr>{headers.map((header,index)=><th key={header} className={index===headers.length-1?'right':''}>{header}</th>)}</tr></thead><tbody>{visible.length?visible.map(row=><tr key={row.id}>{row.cells.map((cell,index)=><td key={index} className={index===row.cells.length-1?'right':''}>{cell}</td>)}</tr>):<tr><td colSpan={headers.length} className="contracts-empty-row">Nenhum registro encontrado.</td></tr>}</tbody></table></div><TableViewPagination page={currentPage} totalPages={totalPages} totalRecords={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>
      </section>
    </div>
    {creating&&<RegistryModal config={createConfig} onClose={()=>setCreating(false)} onCreate={create}/>} 
  </AdminShell>
}

const templateRows:RegistryRow[]=[
  {id:'tpl-1',search:'Publicidade Mídia banners publieditoriais comercial ativo',cells:[<strong>Publicidade / Mídia</strong>,'Publicidade','Banners, publieditoriais, mídia kit e campanhas comerciais.','6 variáveis',<span className="zip-badge zip-badge-success">Ativo</span>]},
  {id:'tpl-2',search:'Cobertura Evento editorial ativo',cells:[<strong>Cobertura de Evento</strong>,'Evento','Cobertura editorial, presença de equipe e entregáveis.','8 variáveis',<span className="zip-badge zip-badge-success">Ativo</span>]},
  {id:'tpl-3',search:'Parceria Institucional cooperação ativo',cells:[<strong>Parceria Institucional</strong>,'Parceria','Cooperação comercial, editorial ou institucional.','5 variáveis',<span className="zip-badge zip-badge-success">Ativo</span>]},
  {id:'tpl-4',search:'Prestação Serviços produção rascunho',cells:[<strong>Prestação de Serviços</strong>,'Serviços','Escopo, cronograma, valor e responsabilidades operacionais.','7 variáveis',<span className="zip-badge">Rascunho</span>]},
  {id:'tpl-5',search:'Licenciamento Conteúdo mídia ativo',cells:[<strong>Licenciamento de Conteúdo</strong>,'Conteúdo','Uso, prazo, território e direitos relacionados ao conteúdo.','9 variáveis',<span className="zip-badge zip-badge-success">Ativo</span>]},
]

const categoryRows:RegistryRow[]=[
  {id:'cat-1',search:'Publicidade comercial ativo',cells:[<strong>Publicidade</strong>,'Contratos comerciais, mídia e publieditoriais','6',<span className="zip-badge zip-badge-success">Ativa</span>]},
  {id:'cat-2',search:'Evento cobertura ativo',cells:[<strong>Evento</strong>,'Coberturas, festivais e entregas presenciais','3',<span className="zip-badge zip-badge-success">Ativa</span>]},
  {id:'cat-3',search:'Parceria institucional ativo',cells:[<strong>Parceria</strong>,'Acordos institucionais e colaboração','3',<span className="zip-badge zip-badge-success">Ativa</span>]},
  {id:'cat-4',search:'Serviços produção planejado',cells:[<strong>Serviços</strong>,'Prestação e contratação de serviços','0',<span className="zip-badge zip-badge-warning">Planejada</span>]},
  {id:'cat-5',search:'Conteúdo licenciamento planejado',cells:[<strong>Conteúdo</strong>,'Licenciamento e cessão de conteúdo','0',<span className="zip-badge zip-badge-warning">Planejada</span>]},
]

const variables=[
  ['{{contratante_nome}}','Contratante','Nome ou razão social do contratante','Texto'],
  ['{{contratante_documento}}','Contratante','CPF ou CNPJ do contratante','Documento'],
  ['{{valor_total}}','Financeiro','Valor total acordado no contrato','Moeda'],
  ['{{data_inicio}}','Vigência','Data de início da vigência','Data'],
  ['{{data_fim}}','Vigência','Data de encerramento da vigência','Data'],
  ['{{responsavel_interno}}','Operação','Responsável interno pelo contrato','Texto'],
  ['{{assinatura_provedor}}','Assinatura','Provedor utilizado na assinatura','Texto'],
  ['{{categoria_contrato}}','Classificação','Categoria atribuída ao contrato','Texto'],
]

function VariableToken({token}:{token:string}){
  const [copied,setCopied]=useState(false)
  const copy=async()=>{try{await navigator.clipboard.writeText(token)}catch{void 0};setCopied(true);window.setTimeout(()=>setCopied(false),1200)}
  return <button type="button" className="contracts-variable-token" onClick={copy} title="Copiar variável"><code>{token}</code><Copy size={12}/><span>{copied?'Copiado':'Copiar'}</span></button>
}

const variableRows:RegistryRow[]=variables.map(([token,group,description,type],index)=>({id:`var-${index+1}`,search:`${token} ${group} ${description} ${type}`,cells:[<VariableToken token={token}/>,group,description,type]}))

const templateCreate:RegistryCreateConfig={
  title:'Novo template',description:'Crie um modelo contratual para uso nesta sessão.',submitLabel:'Criar template',
  initial:{name:'',category:'Publicidade',description:'',variables:'0',status:'Rascunho'},
  fields:[
    {name:'name',label:'Nome do template',placeholder:'Ex.: Contrato de publicidade',required:true},
    {name:'category',label:'Categoria',type:'select',options:['Publicidade','Evento','Parceria','Serviços','Conteúdo'].map(value=>({label:value,value}))},
    {name:'variables',label:'Quantidade de variáveis',type:'number',placeholder:'0'},
    {name:'status',label:'Status',type:'select',options:[{label:'Rascunho',value:'Rascunho'},{label:'Ativo',value:'Ativo'}]},
    {name:'description',label:'Descrição',type:'textarea',placeholder:'Descreva a finalidade do template.',required:true},
  ],
  buildRow:(v,id)=>({id,search:`${v.name} ${v.category} ${v.description} ${v.status}`,cells:[<strong>{v.name}</strong>,v.category,v.description,`${v.variables||'0'} variáveis`,<span className={`zip-badge ${v.status==='Ativo'?'zip-badge-success':''}`}>{v.status}</span>]})
}

const categoryCreate:RegistryCreateConfig={
  title:'Nova categoria',description:'Crie uma classificação contratual para uso nesta sessão.',submitLabel:'Criar categoria',
  initial:{name:'',description:'',status:'Ativa'},
  fields:[
    {name:'name',label:'Nome da categoria',placeholder:'Ex.: Patrocínio',required:true},
    {name:'status',label:'Status',type:'select',options:[{label:'Ativa',value:'Ativa'},{label:'Planejada',value:'Planejada'}]},
    {name:'description',label:'Descrição',type:'textarea',placeholder:'Descreva quando esta categoria deve ser utilizada.',required:true},
  ],
  buildRow:(v,id)=>({id,search:`${v.name} ${v.description} ${v.status}`,cells:[<strong>{v.name}</strong>,v.description,'0',<span className={`zip-badge ${v.status==='Ativa'?'zip-badge-success':'zip-badge-warning'}`}>{v.status}</span>]})
}

const variableCreate:RegistryCreateConfig={
  title:'Nova variável',description:'Cadastre um token reutilizável para templates contratuais.',submitLabel:'Criar variável',
  initial:{token:'{{nova_variavel}}',group:'Geral',description:'',type:'Texto'},
  fields:[
    {name:'token',label:'Token',placeholder:'{{nome_variavel}}',required:true},
    {name:'group',label:'Grupo',placeholder:'Ex.: Contratante',required:true},
    {name:'type',label:'Tipo',type:'select',options:['Texto','Documento','Moeda','Data','Número'].map(value=>({label:value,value}))},
    {name:'description',label:'Descrição',type:'textarea',placeholder:'Explique o valor que esta variável representa.',required:true},
  ],
  buildRow:(v,id)=>({id,search:`${v.token} ${v.group} ${v.description} ${v.type}`,cells:[<VariableToken token={v.token}/>,v.group,v.description,v.type]})
}

export function ContractTemplatesPage(){return <RegistryTablePage title="Templates" description="Modelos estruturados para criação e padronização de contratos." headers={['Template','Categoria','Descrição','Variáveis','Status']} initialRows={templateRows} searchPlaceholder="Buscar template, categoria ou status…" actionLabel="Novo template" createConfig={templateCreate}/>}
export function ContractCategoriesPage(){return <RegistryTablePage title="Categorias" description="Classificação utilizada para organizar e segmentar contratos." headers={['Categoria','Descrição','Contratos','Status']} initialRows={categoryRows} searchPlaceholder="Buscar categoria ou descrição…" actionLabel="Nova categoria" createConfig={categoryCreate}/>}
export function ContractVariablesPage(){return <RegistryTablePage title="Variáveis" description="Variáveis reutilizáveis disponíveis para composição dos templates contratuais." headers={['Variável','Grupo','Descrição','Tipo']} initialRows={variableRows} searchPlaceholder="Buscar variável, grupo ou tipo…" actionLabel="Nova variável" createConfig={variableCreate}/>}
