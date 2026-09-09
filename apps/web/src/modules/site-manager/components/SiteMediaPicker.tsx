import {Check,Images,Search,X} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {mediaRepository} from '../mediaRepository'
import type {SiteMediaItem} from '../readModel'

type Props={
  open:boolean
  selectedUrl?:string
  onClose():void
  onSelect(item:SiteMediaItem):void
}

export function SiteMediaPicker({open,selectedUrl,onClose,onSelect}:Props){
  const [items,setItems]=useState<readonly SiteMediaItem[]>([])
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    if(!open)return
    let active=true
    Promise.resolve().then(()=>{if(active){setLoading(true);setError('')}})
    mediaRepository.list().then(media=>{
      if(active)setItems(media.filter(item=>item.type.startsWith('image/')))
    }).catch(caught=>{
      if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a biblioteca de imagens.')
    }).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[open])

  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const visible=useMemo(()=>items.filter(item=>!normalized||[item.name,item.alt??'',item.caption??''].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))),[items,normalized])

  if(!open)return null
  return <div className="site-media-picker-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="site-media-picker" role="dialog" aria-modal="true" aria-labelledby="site-media-picker-title">
      <header className="site-media-picker-head"><div><span>BIBLIOTECA DE MÍDIAS</span><h2 id="site-media-picker-title">Selecionar imagem de capa</h2><p>Escolha uma imagem já armazenada no Portal Lander.</p></div><button type="button" className="site-media-picker-close" onClick={onClose} aria-label="Fechar biblioteca"><X size={18}/></button></header>
      <div className="site-media-picker-toolbar"><label className="searchbox"><span className="sr-only">Buscar imagem</span><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por nome, texto alternativo ou legenda..."/></label><span>{visible.length} imagem(ns)</span></div>
      <div className="site-media-picker-body">
        {loading?<div className="site-media-picker-state"><Images size={28}/><strong>Carregando imagens</strong><p>Consultando a biblioteca persistente.</p></div>:error?<div className="site-media-picker-state"><Images size={28}/><strong>Não foi possível carregar</strong><p>{error}</p></div>:visible.length===0?<div className="site-media-picker-state"><Images size={28}/><strong>Nenhuma imagem encontrada</strong><p>Envie imagens em Site → Mídias ou ajuste a busca.</p></div>:<div className="site-media-picker-grid">{visible.map(item=>{
          const selected=item.url===selectedUrl
          return <button key={item.id} type="button" className={`site-media-picker-item${selected?' selected':''}`} onClick={()=>onSelect(item)} aria-pressed={selected}>
            <span className="site-media-picker-thumb"><img src={item.url} alt={item.alt||item.name}/>{selected&&<i><Check size={15}/></i>}</span>
            <span className="site-media-picker-copy"><strong>{item.name}</strong><small>{item.alt||item.caption||item.type}</small></span>
          </button>
        })}</div>}
      </div>
    </section>
  </div>
}
