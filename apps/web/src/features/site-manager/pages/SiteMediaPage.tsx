import { Images, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminEmpty, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'
import {mediaRepository,type MediaRepository} from '../mediaRepository'
import type {SiteMediaItem} from '../readModel'

type MediaTypeFilter='Todos'|'Capa'|'image'|'video'|'embed'
const mediaTypes:readonly MediaTypeFilter[]=['Todos','Capa','image','video','embed']
const readOnlyDescription='A biblioteca já é consumida por uma camada de repository. Uploads e exclusões serão habilitados quando o storage persistente do Portal Lander estiver conectado.'

export function SiteMediaPage(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState<MediaTypeFilter>('Todos')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const [media,setMedia]=useState<readonly SiteMediaItem[]>([])
  const [loading,setLoading]=useState(true)
  const [loadError,setLoadError]=useState('')

  useEffect(()=>{let active=true;setLoading(true);mediaRepository.list().then(items=>{if(active){setMedia(items);setLoadError('')}}).catch(error=>{if(active)setLoadError(error instanceof Error?error.message:'Não foi possível carregar a biblioteca de mídias.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])

  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const items=useMemo(()=>media.filter(item=>{
    const matchesQuery=!normalized||[item.content,item.url,item.caption].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesType=type==='Todos'||item.type===type
    return matchesQuery&&matchesType
  }),[media,normalized,type])
  const totalPages=Math.max(1,Math.ceil(items.length/pageSize)),safePage=Math.min(page,totalPages),visibleItems=items.slice((safePage-1)*pageSize,safePage*pageSize)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídias',description:'Biblioteca central de imagens, vídeos e referências utilizadas pelo site.'}} headerAction={{label:'Adicionar mídia',disabled:true,disabledReason:ADMIN_CAPABILITIES.mediaStorage.description}}>
    <AdminNotice title="Biblioteca preparada para persistência" description={readOnlyDescription}/>
    {loadError&&<AdminNotice title="Falha ao carregar mídias" description={loadError}/>} 
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar mídia</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar mídia ou conteúdo..."/></label><label className="sr-only" htmlFor="media-type">Filtrar mídia por tipo</label><select id="media-type" className="admin-filter" value={type} onChange={event=>{setType(event.target.value as MediaTypeFilter);setPage(1)}}>{mediaTypes.map(value=><option key={value} value={value}>{value==='Todos'?'Todos os tipos':value}</option>)}</select></div><span className="admin-breadcrumb">{items.length} de {media.length} referências</span></div>
    {loading?<AdminEmpty title="Carregando mídias" description="Consultando a biblioteca do Site."/>:items.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Mídia</th><th>Conteúdo</th><th>Tipo</th><th>Legenda</th><th>Origem</th></tr></thead><tbody>{visibleItems.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14} aria-hidden="true"/></span><div><b>{item.url.split('/').pop()||item.url}</b><small>{item.url}</small></div></div></td><td>{item.content}</td><td><span className="status">{item.type}</span></td><td>{item.caption}</td><td>Conteúdo do Site</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={items.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma mídia encontrada" description={query||type!=='Todos'?'Nenhuma referência corresponde aos filtros atuais.':'Ainda não existem mídias associadas aos conteúdos do Site.'}/>} 
  </AdminShell>
}

export type {MediaRepository}
