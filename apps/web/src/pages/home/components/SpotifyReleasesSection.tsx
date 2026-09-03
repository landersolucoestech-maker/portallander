import {useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {homeContentResponsiveCssVariables,withHomeContentSectionConfiguration} from '../../../features/site-manager/homeContentSectionConfiguration'
import type {SectionConfiguration} from '../../../features/site-manager/sectionConfiguration'
import {spotifyReleaseClient,type SpotifyReleasePublicState} from '../../../features/site-manager/spotifyReleaseClient'
import {PUBLIC_ROUTES} from '../../../shared/public/publicRoutes'
import '../styles/spotify-releases.css'

type LoadState='loading'|'ready'|'error'

export function SpotifyReleasesSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'lancamentos')
  const [loadState,setLoadState]=useState<LoadState>('loading')
  const [data,setData]=useState<SpotifyReleasePublicState|null>(null)
  useEffect(()=>{let active=true;setLoadState('loading');void spotifyReleaseClient.publicState().then(value=>{if(active){setData(value);setLoadState('ready')}}).catch(()=>{if(active)setLoadState('error')});return()=>{active=false}},[])
  const items=useMemo(()=>[...(data?.items||[])].sort((a,b)=>a.position-b.position).slice(0,Math.max(0,config.itemLimit)),[data?.items,config.itemLimit])
  if(!config.active)return null
  const allRoute=config.linkUrl||PUBLIC_ROUTES.lancamentos
  const sourceStatus=data?.source.status
  const state=loadState==='loading'?'loading':loadState==='error'?'error':sourceStatus==='disconnected'&&items.length===0?'disconnected':items.length===0?'empty':'success'
  return <section data-home-section="lancamentos" data-release-state={state} className="pl-section official-lancamentos pl-home-responsive-section" aria-label="Lançamentos" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}>
    <div className="pl-section-head"><h2>{config.title}</h2>{config.linkLabel&&<Link to={allRoute}>{config.linkLabel}</Link>}</div>
    {state!=='success'?<div className={`pl-release-state ${state}`} role={state==='error'?'alert':'status'}>{state==='loading'?'Carregando lançamentos…':state==='empty'?'Nenhum lançamento disponível no momento.':'Lançamentos temporariamente indisponíveis.'}</div>:<div className="pl-release-row pl-spotify-release-row">{items.map(item=><a className="pl-release pl-spotify-release" href={item.spotifyUrl} target="_blank" rel="noreferrer" key={item.id}><div className="pl-spotify-cover">{item.coverUrl?<img src={item.coverUrl} alt={`Capa de ${item.title}`}/>:<div className="pl-spotify-cover-empty" aria-hidden="true">♪</div>}</div><div className="pl-card-body"><span className="pl-spotify-source">SPOTIFY</span><h3>{item.title}</h3><div className="pl-meta"><span>{item.artistLabel||'Artista não informado'}</span></div><span className="pl-spotify-listen">OUVIR NO SPOTIFY →</span></div></a>)}</div>}
  </section>
}
