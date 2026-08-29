import { Copy, FileStack, Search, Tags, Variable } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminShell, type AdminShellAction } from '../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../shared/internal/TableViewPagination'

type RegistryRow={id:string;cells:ReactNode[];search:string}

type RegistryPageProps={
  title:string
  description:string
  headers:string[]
  rows:RegistryRow[]
  searchPlaceholder:string
  actionLabel?:string
}

function RegistryTablePage({title,description,headers,rows,searchPlaceholder,actionLabel}:RegistryPageProps){
  const navigate=useNavigate()
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(5)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const filtered=useMemo(()=>rows.filter(row=>!normalized||row.search.toLocaleLowerCase('pt-BR').includes(normalized)),[rows,normalized])
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize))
  const currentPage=Math.min(page,totalPages)
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize)
  const headerActions:readonly AdminShellAction[]=[
    {label:'Contratos',variant:'secondary',onClick:()=>navigate('/app/crm/contracts')},
    ...(actionLabel?[{label:actionLabel,variant:'primary' as const,disabled:true,disabledReason:'Persistência real ainda não conectada.'}]:[]),
  ]
  return <AdminShell area="crm" items={CRM_NAV} header={{title,description}} headerActions={headerActions}>
    <div className="zip-stack contracts-page">
      <div className="zip-toolbar contracts-toolbar"><label className="zip-search"><Search size={14}/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder={searchPlaceholder}/></label></div>
      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>{title}</h2><p>{filtered.length} registros encontrados</p></div></header>
        <div className="tableview-surface"><div className="zip-table-wrap"><table className="zip-table"><thead><tr>{headers.map((header,index)=><th key={header} className={index===headers.length-1?'right':''}>{header}</th>)}</tr></thead><tbody>{visible.map(row=><tr key={row.id}>{row.cells.map((cell,index)=><td key={index} className={index===row.cells.length-1?'right':''}>{cell}</td>)}</tr>)}</tbody></table></div><TableViewPagination page={currentPage} totalPages={totalPages} totalRecords={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>
      </section>
    </div>
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

export function ContractTemplatesPage(){return <RegistryTablePage title="Templates" description="Modelos estruturados para criação e padronização de contratos." headers={['Template','Categoria','Descrição','Variáveis','Status']} rows={templateRows} searchPlaceholder="Buscar template, categoria ou status…" actionLabel="Novo template"/>}
export function ContractCategoriesPage(){return <RegistryTablePage title="Categorias" description="Classificação utilizada para organizar e segmentar contratos." headers={['Categoria','Descrição','Contratos','Status']} rows={categoryRows} searchPlaceholder="Buscar categoria ou descrição…" actionLabel="Nova categoria"/>}
export function ContractVariablesPage(){return <RegistryTablePage title="Variáveis" description="Variáveis reutilizáveis disponíveis para composição dos templates contratuais." headers={['Variável','Grupo','Descrição','Tipo']} rows={variableRows} searchPlaceholder="Buscar variável, grupo ou tipo…" actionLabel="Nova variável"/>}
