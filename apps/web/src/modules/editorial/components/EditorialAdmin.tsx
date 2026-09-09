import { useMemo, useState } from 'react'
import { FileText, Globe2, Search } from 'lucide-react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { AdminEmpty, AdminNotice } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'
import { editorialReadModel } from '../repository'
import type { PublicationStatus } from '../model'

const statuses: readonly ('all'|PublicationStatus)[]=['all','published','draft','archived']
const persistence=ADMIN_CAPABILITIES.editorialPersistence

function PersistenceNotice(){return <AdminNotice title={`${persistence.label} indisponível`} description={`${persistence.description} Criação, edição, publicação e exclusão permanecem bloqueadas para não simular sucesso.`}/>} 

function Toolbar({placeholder,query,onQuery,status,onStatus,count,total}:{placeholder:string;query:string;onQuery:(value:string)=>void;status:(typeof statuses)[number];onStatus:(value:(typeof statuses)[number])=>void;count:number;total:number}){
  const id=`editorial-${placeholder.replace(/\W+/g,'-').toLocaleLowerCase('pt-BR')}`
  return <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">{placeholder}</span><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>onQuery(event.target.value)} placeholder={placeholder}/></label><label className="sr-only" htmlFor={`${id}-status`}>Filtrar por status</label><select id={`${id}-status`} className="admin-filter" value={status} onChange={event=>onStatus(event.target.value as (typeof statuses)[number])}>{statuses.map(value=><option key={value} value={value}>{value==='all'?'Todos os status':value}</option>)}</select></div><span className="admin-breadcrumb">{count} de {total} registros</span></div>
}

export function EditorialPagesAdmin(){
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<(typeof statuses)[number]>('all')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const pages=useMemo(()=>editorialReadModel.pages.filter(page=>{
    const parent=page.parentId?editorialReadModel.getPageById(page.parentId)?.title||'':''
    const matchesQuery=!normalized||[page.title,page.navigationLabel,page.slug,page.type,parent].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    return matchesQuery&&(status==='all'||page.status===status)
  }),[normalized,status])
  const total=editorialReadModel.pages.length
  const totalPages=Math.max(1,Math.ceil(pages.length/pageSize));const safePage=Math.min(page,totalPages);const visiblePages=pages.slice((safePage-1)*pageSize,safePage*pageSize)
  const changeQuery=(value:string)=>{setQuery(value);setPage(1)}
  const changeStatus=(value:(typeof statuses)[number])=>{setStatus(value);setPage(1)}
  return <><PersistenceNotice/><Toolbar placeholder="Buscar por título ou slug..." query={query} onQuery={changeQuery} status={status} onStatus={changeStatus} count={pages.length} total={total}/>{pages.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Página</th><th>Tipo</th><th>Slug</th><th>Status</th><th>Menu</th><th>Posição</th><th>Parent</th><th>Conteúdos</th><th>Atualização</th></tr></thead><tbody>{visiblePages.map(page=><tr key={page.id}><td><div className="table-primary"><span className="table-avatar"><Globe2 size={15} aria-hidden="true"/></span><div><b>{page.title}</b><small>{page.navigationLabel}</small></div></div></td><td>{page.type}</td><td>/{page.slug}</td><td><span className={`status ${page.status}`}>{page.status}</span></td><td>{page.showInMainMenu?'Visível':'Oculta'}</td><td>{page.menuOrder}</td><td>{page.parentId?editorialReadModel.getPageById(page.parentId)?.title||page.parentId:'—'}</td><td>{editorialReadModel.countContents(page.id)}</td><td>{new Date(page.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={pages.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma página encontrada" description="Nenhuma página corresponde à busca e ao status selecionados."/>}</>
}

export function EditorialContentsAdmin(){
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<(typeof statuses)[number]>('all')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const contents=useMemo(()=>editorialReadModel.contents.filter(content=>{
    const page=editorialReadModel.getPageById(content.pageId)?.title||content.pageId
    const matchesQuery=!normalized||[content.title,content.slug,content.summary,content.author,page,...content.tags].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    return matchesQuery&&(status==='all'||content.status===status)
  }),[normalized,status])
  const total=editorialReadModel.contents.length
  const totalPages=Math.max(1,Math.ceil(contents.length/pageSize));const safePage=Math.min(page,totalPages);const visibleContents=contents.slice((safePage-1)*pageSize,safePage*pageSize)
  const changeQuery=(value:string)=>{setQuery(value);setPage(1)}
  const changeStatus=(value:(typeof statuses)[number])=>{setStatus(value);setPage(1)}
  return <><PersistenceNotice/><Toolbar placeholder="Buscar conteúdo, categoria, autor ou slug..." query={query} onQuery={changeQuery} status={status} onStatus={changeStatus} count={contents.length} total={total}/>{contents.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Conteúdo</th><th>Categoria</th><th>Página</th><th>Slug</th><th>Status</th><th>Autor</th><th>Atualização</th></tr></thead><tbody>{visibleContents.map(content=><tr key={content.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15} aria-hidden="true"/></span><div><b>{content.title}</b><small>{content.summary}</small></div></div></td><td>{content.tags[0]||'Sem categoria'}</td><td>{editorialReadModel.getPageById(content.pageId)?.title||content.pageId}</td><td>{content.slug}</td><td><span className={`status ${content.status}`}>{content.status}</span></td><td>{content.author}</td><td>{new Date(content.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={contents.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhum conteúdo encontrado" description="Nenhum conteúdo corresponde à busca e ao status selecionados."/>}</>
}
