import { Images, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminEmpty, AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'
import { siteManagerReadModel } from '../readModel'

type MediaTypeFilter='Todos'|'Capa'|'image'|'video'|'embed'
const mediaTypes: readonly MediaTypeFilter[]=['Todos','Capa','image','video','embed']
const readOnlyDescription='Busca e filtros funcionam sobre o snapshot editorial atual. Escritas continuam bloqueadas enquanto não existir uma camada persistente conectada.'

export function SiteMediaPage(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState<MediaTypeFilter>('Todos')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const items=useMemo(()=>siteManagerReadModel.media.filter(item=>{
    const matchesQuery=!normalized||[item.content,item.url,item.caption].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesType=type==='Todos'||item.type===type
    return matchesQuery&&matchesType
  }),[normalized,type])
  const total=siteManagerReadModel.media.length
  const totalPages=Math.max(1,Math.ceil(items.length/pageSize));const safePage=Math.min(page,totalPages);const visibleItems=items.slice((safePage-1)*pageSize,safePage*pageSize)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Mídia" title="Mídia" description="Inventário dos arquivos e referências de mídia já associados aos conteúdos editoriais." action="Adicionar mídia" disabled disabledReason={ADMIN_CAPABILITIES.mediaStorage.description}/>
    <AdminNotice title="Gerenciamento em modo leitura" description={readOnlyDescription}/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar mídia</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar mídia ou conteúdo..."/></label><label className="sr-only" htmlFor="media-type">Filtrar mídia por tipo</label><select id="media-type" className="admin-filter" value={type} onChange={event=>{setType(event.target.value as MediaTypeFilter);setPage(1)}}>{mediaTypes.map(value=><option key={value} value={value}>{value==='Todos'?'Todos os tipos':value}</option>)}</select></div><span className="admin-breadcrumb">{items.length} de {total} referências</span></div>
    {items.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Mídia</th><th>Conteúdo</th><th>Tipo</th><th>Legenda</th><th>Origem</th></tr></thead><tbody>{visibleItems.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14} aria-hidden="true"/></span><div><b>{item.url.split('/').pop()||item.url}</b><small>{item.url}</small></div></div></td><td>{item.content}</td><td><span className="status">{item.type}</span></td><td>{item.caption}</td><td>Snapshot editorial</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={items.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma mídia encontrada" description={query||type!=='Todos'?'Nenhuma referência corresponde aos filtros atuais.':'O snapshot editorial atual ainda não possui capas ou itens de mídia associados aos conteúdos.'}/>} 
  </AdminShell>
}
