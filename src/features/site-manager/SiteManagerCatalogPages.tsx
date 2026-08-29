import { Images, Search, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminEmpty, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { SITE_MANAGER_NAV } from '../../shared/internal/adminNavigation'
import { editorialReadModel } from '../editorial/repository'

function ReadOnlyNotice(){return <div className="admin-notice"><div><strong>Gerenciamento em modo leitura</strong><p>Busca e filtros funcionam sobre o snapshot editorial atual. Escritas continuam bloqueadas enquanto não existir backend e banco conectados.</p></div></div>}

export function SiteCategories(){
  const [query,setQuery]=useState('')
  const categories=useMemo(()=>{
    const tagMap=new Map<string,number>()
    editorialReadModel.contents.forEach(content=>content.tags.forEach(tag=>tagMap.set(tag,(tagMap.get(tag)||0)+1)))
    const normalized=query.trim().toLocaleLowerCase('pt-BR')
    return [...tagMap.entries()].filter(([tag])=>!normalized||tag.toLocaleLowerCase('pt-BR').includes(normalized)).sort((a,b)=>b[1]-a[1])
  },[query])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Categorias" title="Categorias" description="Visão consolidada das tags editoriais utilizadas pelos conteúdos atuais." action="Nova categoria" disabled/>
    <ReadOnlyNotice/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar categorias</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar categoria..."/></label></div><span className="admin-breadcrumb">{categories.length} categorias encontradas</span></div>
    {categories.length?<section className="table-card"><table><thead><tr><th>Categoria</th><th>Conteúdos relacionados</th><th>Origem</th></tr></thead><tbody>{categories.map(([tag,count])=><tr key={tag}><td><div className="table-primary"><span className="table-avatar"><Tags size={14} aria-hidden="true"/></span><div><b>{tag}</b><small>Tag editorial existente</small></div></div></td><td><strong>{count}</strong></td><td>Snapshot editorial</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhuma categoria encontrada" description={query?'Nenhuma categoria corresponde à busca atual.':'Os conteúdos atuais não possuem tags cadastradas no snapshot editorial.'}/>} 
  </AdminShell>
}

type MediaTypeFilter='Todos'|'Capa'|'image'|'video'|'embed'
const mediaTypes: readonly MediaTypeFilter[]=['Todos','Capa','image','video','embed']

export function SiteMedia(){
  const [query,setQuery]=useState('')
  const [type,setType]=useState<MediaTypeFilter>('Todos')
  const allItems=useMemo(()=>editorialReadModel.contents.flatMap(content=>[
    ...(content.coverImage?[{id:`cover-${content.id}`,content:content.title,type:'Capa' as const,url:content.coverImage,caption:content.coverImageAlt||'Imagem de capa'}]:[]),
    ...content.media.map((media,index)=>({id:`media-${content.id}-${index}`,content:content.title,type:media.type,url:media.url,caption:media.caption||'—'})),
  ]),[])
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const items=useMemo(()=>allItems.filter(item=>{
    const matchesQuery=!normalized||[item.content,item.url,item.caption].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesType=type==='Todos'||item.type===type
    return matchesQuery&&matchesType
  }),[allItems,normalized,type])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Mídia" title="Mídia" description="Inventário dos arquivos e referências de mídia já associados aos conteúdos editoriais." action="Adicionar mídia" disabled/>
    <ReadOnlyNotice/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar mídia</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar mídia ou conteúdo..."/></label><label className="sr-only" htmlFor="media-type">Filtrar mídia por tipo</label><select id="media-type" className="admin-filter" value={type} onChange={event=>setType(event.target.value as MediaTypeFilter)}>{mediaTypes.map(value=><option key={value} value={value}>{value==='Todos'?'Todos os tipos':value}</option>)}</select></div><span className="admin-breadcrumb">{items.length} de {allItems.length} referências</span></div>
    {items.length?<section className="table-card"><table><thead><tr><th>Mídia</th><th>Conteúdo</th><th>Tipo</th><th>Legenda</th><th>Origem</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14} aria-hidden="true"/></span><div><b>{item.url.split('/').pop()||item.url}</b><small>{item.url}</small></div></div></td><td>{item.content}</td><td><span className="status">{item.type}</span></td><td>{item.caption}</td><td>Snapshot editorial</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhuma mídia encontrada" description={query||type!=='Todos'?'Nenhuma referência corresponde aos filtros atuais.':'O snapshot editorial atual ainda não possui capas ou itens de mídia associados aos conteúdos.'}/>} 
  </AdminShell>
}
