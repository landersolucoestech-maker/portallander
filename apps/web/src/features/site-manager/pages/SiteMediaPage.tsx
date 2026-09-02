import { Images, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminEmpty, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'
import {mediaRepository} from '../mediaRepository'
import type {SiteMediaItem} from '../readModel'

const readOnlyDescription='Esta tela usa o catálogo editorial.media() do Data Provider. Upload e exclusão permanecem bloqueados até existir storage persistente conectado ao Portal Lander.'
const formatSize=(bytes:number)=>bytes>=1024*1024?`${(bytes/(1024*1024)).toLocaleString('pt-BR',{maximumFractionDigits:1})} MB`:`${Math.max(1,Math.round(bytes/1024)).toLocaleString('pt-BR')} KB`
const formatDate=(value:string)=>new Date(value).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})

export function SiteMediaPage(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const [media,setMedia]=useState<readonly SiteMediaItem[]>([])
  const [loading,setLoading]=useState(true)
  const [loadError,setLoadError]=useState('')

  useEffect(()=>{let active=true;mediaRepository.list().then(items=>{if(active){setMedia(items);setLoadError('')}}).catch(error=>{if(active)setLoadError(error instanceof Error?error.message:'Não foi possível carregar a biblioteca de mídias.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])

  const availableTypes=useMemo(()=>['Todos',...Array.from(new Set(media.map(item=>item.type))).sort((a,b)=>a.localeCompare(b,'pt-BR'))],[media])
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const items=useMemo(()=>media.filter(item=>{
    const matchesQuery=!normalized||[item.name,item.url,item.type].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesType=type==='Todos'||item.type===type
    return matchesQuery&&matchesType
  }),[media,normalized,type])
  const totalPages=Math.max(1,Math.ceil(items.length/pageSize)),safePage=Math.min(page,totalPages),visibleItems=items.slice((safePage-1)*pageSize,safePage*pageSize)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídias',description:'Biblioteca central de arquivos do Site, separada das referências usadas dentro dos conteúdos.'}} headerAction={{label:'Adicionar mídia',disabled:true,disabledReason:ADMIN_CAPABILITIES.mediaStorage.description}}>
    <AdminNotice title="Biblioteca conectada ao Data Provider" description={readOnlyDescription}/>
    {loadError&&<AdminNotice title="Falha ao carregar mídias" description={loadError}/>} 
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar mídia</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar arquivo, URL ou tipo..."/></label><label className="sr-only" htmlFor="media-type">Filtrar mídia por tipo</label><select id="media-type" className="admin-filter" value={type} onChange={event=>{setType(event.target.value);setPage(1)}}>{availableTypes.map(value=><option key={value} value={value}>{value==='Todos'?'Todos os tipos':value}</option>)}</select></div><span className="admin-breadcrumb">{items.length} de {media.length} arquivos</span></div>
    {loading?<AdminEmpty title="Carregando mídias" description="Consultando a biblioteca do Site."/>:items.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Arquivo</th><th>Tipo</th><th>Tamanho</th><th>Adicionado em</th><th>Origem</th></tr></thead><tbody>{visibleItems.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14} aria-hidden="true"/></span><div><b>{item.name||item.url.split('/').pop()||'Mídia sem nome'}</b><small>{item.url||'Arquivo sem URL pública'}</small></div></div></td><td><span className="status">{item.type}</span></td><td>{formatSize(item.size)}</td><td>{formatDate(item.createdAt)}</td><td>Biblioteca do Site</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={items.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma mídia encontrada" description={query||type!=='Todos'?'Nenhum arquivo corresponde aos filtros atuais.':'A biblioteca de mídia do Data Provider está vazia.'}/>} 
  </AdminShell>
}
