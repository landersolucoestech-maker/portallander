import { useMemo, useState } from 'react'
import { AlertTriangle, FileText, Globe2, Search } from 'lucide-react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { AdminEmpty, AdminPageHeader } from '../../../shared/internal/AdminUi'
import { editorialReadModel } from '../repository'
import type { PublicationStatus } from '../model'

const statuses: readonly ('all'|PublicationStatus)[]=['all','published','draft','archived']
const persistence=ADMIN_CAPABILITIES.editorialPersistence

function PersistenceNotice(){return <div className="admin-notice"><AlertTriangle size={18} aria-hidden="true"/><div><strong>{persistence.label} indisponível</strong><p>{persistence.description} Criação, edição, publicação e exclusão permanecem bloqueadas para não simular sucesso.</p></div></div>}

function Toolbar({placeholder,query,onQuery,status,onStatus,count,total}:{placeholder:string;query:string;onQuery:(value:string)=>void;status:(typeof statuses)[number];onStatus:(value:(typeof statuses)[number])=>void;count:number;total:number}){
  const id=`editorial-${placeholder.replace(/\W+/g,'-').toLocaleLowerCase('pt-BR')}`
  return <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">{placeholder}</span><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>onQuery(event.target.value)} placeholder={placeholder}/></label><label className="sr-only" htmlFor={`${id}-status`}>Filtrar por status</label><select id={`${id}-status`} className="admin-filter" value={status} onChange={event=>onStatus(event.target.value as (typeof statuses)[number])}>{statuses.map(value=><option key={value} value={value}>{value==='all'?'Todos os status':value}</option>)}</select></div><span className="admin-breadcrumb">{count} de {total} registros</span></div>
}

export function EditorialPagesAdmin(){
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<(typeof statuses)[number]>('all')
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const pages=useMemo(()=>editorialReadModel.pages.filter(page=>{
    const parent=page.parentId?editorialReadModel.getPageById(page.parentId)?.title||'':''
    const matchesQuery=!normalized||[page.title,page.navigationLabel,page.slug,page.type,parent].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    return matchesQuery&&(status==='all'||page.status===status)
  }),[normalized,status])
  const total=editorialReadModel.pages.length
  return <><AdminPageHeader eyebrow="Gerenciador do Site / Páginas" title="Páginas" description="Estrutura editorial, navegação, publicação e relacionamento entre páginas do portal." action="Nova página" disabled disabledReason={persistence.description}/><PersistenceNotice/><Toolbar placeholder="Buscar por título ou slug..." query={query} onQuery={setQuery} status={status} onStatus={setStatus} count={pages.length} total={total}/>{pages.length?<section className="table-card"><table><thead><tr><th>Página</th><th>Tipo</th><th>Slug</th><th>Status</th><th>Menu</th><th>Posição</th><th>Parent</th><th>Conteúdos</th><th>Atualização</th></tr></thead><tbody>{pages.map(page=><tr key={page.id}><td><div className="table-primary"><span className="table-avatar"><Globe2 size={15} aria-hidden="true"/></span><div><b>{page.title}</b><small>{page.navigationLabel}</small></div></div></td><td>{page.type}</td><td>/{page.slug}</td><td><span className={`status ${page.status}`}>{page.status}</span></td><td>{page.showInMainMenu?'Visível':'Oculta'}</td><td>{page.menuOrder}</td><td>{page.parentId?editorialReadModel.getPageById(page.parentId)?.title||page.parentId:'—'}</td><td>{editorialReadModel.countContents(page.id)}</td><td>{new Date(page.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhuma página encontrada" description="Nenhuma página corresponde à busca e ao status selecionados."/>}</>
}

export function EditorialContentsAdmin(){
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<(typeof statuses)[number]>('all')
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const contents=useMemo(()=>editorialReadModel.contents.filter(content=>{
    const page=editorialReadModel.getPageById(content.pageId)?.title||content.pageId
    const matchesQuery=!normalized||[content.title,content.slug,content.summary,content.author,page,...content.tags].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    return matchesQuery&&(status==='all'||content.status===status)
  }),[normalized,status])
  const total=editorialReadModel.contents.length
  return <><AdminPageHeader eyebrow="Gerenciador do Site / Conteúdos" title="Conteúdos" description="Gerencie todos os conteúdos editoriais por uma única estrutura, independentemente da página ou categoria." action="Novo conteúdo" disabled disabledReason={persistence.description}/><PersistenceNotice/><Toolbar placeholder="Buscar conteúdo, autor ou slug..." query={query} onQuery={setQuery} status={status} onStatus={setStatus} count={contents.length} total={total}/>{contents.length?<section className="table-card"><table><thead><tr><th>Conteúdo</th><th>Página</th><th>Slug</th><th>Status</th><th>Autor</th><th>Atualização</th></tr></thead><tbody>{contents.map(content=><tr key={content.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15} aria-hidden="true"/></span><div><b>{content.title}</b><small>{content.summary}</small></div></div></td><td>{editorialReadModel.getPageById(content.pageId)?.title||content.pageId}</td><td>{content.slug}</td><td><span className={`status ${content.status}`}>{content.status}</span></td><td>{content.author}</td><td>{new Date(content.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhum conteúdo encontrado" description="Nenhum conteúdo corresponde à busca e ao status selecionados."/>}</>
}
