import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  advertisingResponsiveCssVariables,
  withAdvertisingSectionLayout,
  type AdvertisingSectionConfiguration,
} from '../../features/site-manager/advertisingSectionLayout'
import {
  filterAgendaByWindow,
  homeContentResponsiveCssVariables,
  selectConfiguredItems,
  withHomeContentSectionConfiguration,
} from '../../features/site-manager/homeContentSectionConfiguration'
import { readSectionConfiguration, SECTION_CONFIGURATION_EVENT, type SectionConfiguration } from '../../features/site-manager/sectionConfiguration'
import { loadSidebarAdConfig, SIDEBAR_AD_STORAGE_KEY, SIDEBAR_AD_UPDATED_EVENT, type SidebarAdConfig } from '../../shared/persistence/sidebarAdStorage'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import { HeroSection } from './components/HeroSection'
import { AdvertiseHereSection } from './components/AdvertiseHereSection'
import { homeReadModel, type HomeStory } from './models/homeReadModel'
import { defaultHomeAdConfig } from './models/adModel'
import './styles/home-official-sections.css'
import './styles/home-content-responsive.css'

const DEFAULT_SIDEBAR_AD:SidebarAdConfig={active:true,title:'PUBLICIDADE',subtitle:'ANUNCIE AQUI',linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',source:'HOME_SIDEBAR_01',quantity:1,width:300,height:600,paddingX:24,paddingY:24,radius:0,background:'#090909',textColor:'#ffffff',titleColor:'#ffffff',accentColor:'#e50914',borderColor:'#090909',bodyLines:['SUA MARCA NO RITMO CERTO!'],imageUrl:'',imageAlt:'Publicidade Portal Lander',imageStored:false}

function useHomeSectionConfiguration(sectionId:string,name:string){
  const [config,setConfig]=useState<SectionConfiguration>(()=>readSectionConfiguration('home',sectionId,name))
  useEffect(()=>{
    const sync=(event:Event)=>{const detail=(event as CustomEvent<{pageId?:string;sectionId?:string}>).detail;if(!detail||detail.pageId==='home'&&detail.sectionId===sectionId)setConfig(readSectionConfiguration('home',sectionId,name))}
    const storage=()=>setConfig(readSectionConfiguration('home',sectionId,name))
    window.addEventListener(SECTION_CONFIGURATION_EVENT,sync)
    window.addEventListener('storage',storage)
    return()=>{window.removeEventListener(SECTION_CONFIGURATION_EVENT,sync);window.removeEventListener('storage',storage)}
  },[sectionId,name])
  return config
}

function SmartLink({to,children,className}:{to:string;children:ReactNode;className?:string}){if(/^https?:\/\//i.test(to))return <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>;return <Link to={to||'/'} className={className}>{children}</Link>}
function AdvertisingAreaLink({config,children,className}:{config:AdvertisingSectionConfiguration;children:ReactNode;className?:string}){
  if(!config.adLinkEnabled||!config.linkUrl)return <>{children}</>
  if(config.adLinkTarget==='same'&&!/^https?:\/\//i.test(config.linkUrl))return <Link to={config.linkUrl} className={className}>{children}</Link>
  const href=/^https?:\/\//i.test(config.linkUrl)?config.linkUrl:`${window.location.pathname}#${config.linkUrl}`
  return <a href={href} target={config.adLinkTarget==='new'?'_blank':'_self'} rel={config.adLinkTarget==='new'?'noreferrer':undefined} className={className}>{children}</a>
}
function SectionHead({title,link,label}:{title:string;link?:string;label?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&label&&<SmartLink to={link}>{label}</SmartLink>}</div>}
function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>}
function Card({item,to='/noticias'}:{item:HomeStory;to?:string}){return <SmartLink className="pl-card" to={to} aria-label={undefined as never}><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></SmartLink>}

function PublicidadeLateralSection(){
  const section=useHomeSectionConfiguration('publicidade-lateral','Publicidade Lateral')
  const configured=withAdvertisingSectionLayout(section,'publicidade-lateral')
  const [legacy,setLegacy]=useState<SidebarAdConfig>(DEFAULT_SIDEBAR_AD)
  const refresh=useCallback(()=>{loadSidebarAdConfig(DEFAULT_SIDEBAR_AD).then(setLegacy)},[])
  useEffect(()=>{refresh();const onStorage=(event:StorageEvent)=>{if(event.key===SIDEBAR_AD_STORAGE_KEY)refresh()};const onUpdated=()=>refresh();window.addEventListener('storage',onStorage);window.addEventListener(SIDEBAR_AD_UPDATED_EVENT,onUpdated);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(SIDEBAR_AD_UPDATED_EVENT,onUpdated);window.removeEventListener('focus',refresh)}},[refresh])
  if(!configured.active)return null
  const imageUrl=configured.imageUrl.trim()
  const imageFit=configured.adImageFit==='cover'?'cover':'contain'
  const description=configured.description.trim()
  const media=imageUrl
    ?<img className="pl-home-sidebar-ad-image" src={imageUrl} alt={legacy.imageAlt||configured.title||'Publicidade'}/>
    :<div className="pl-home-sidebar-ad-fallback" role="presentation"><div className="pl-home-sidebar-ad-copy-static">{configured.eyebrow&&<span className="pl-home-sidebar-ad-kicker">{configured.eyebrow}</span>}{configured.title&&<h3>{configured.title}</h3>}{description&&<p>{description}</p>}{configured.linkLabel&&<span className="pl-home-sidebar-ad-link-label">{configured.linkLabel} →</span>}</div></div>
  return <section className={`pl-home-sidebar-ad official-publicidade-lateral pl-home-configurable-ad ${imageUrl?'has-creative':'is-empty'} ad-fit-${imageFit}`} aria-label="Publicidade Lateral" style={{...advertisingResponsiveCssVariables(configured),textAlign:configured.textAlign,background:imageUrl?'transparent':configured.background,color:configured.textColor,borderColor:imageUrl?'transparent':configured.accentColor,borderRadius:legacy.radius}}><div className="pl-home-sidebar-ad-inner"><AdvertisingAreaLink config={configured} className="pl-home-ad-area-link">{media}</AdvertisingAreaLink></div></section>
}

function EmDestaqueSection(){
  const config=withHomeContentSectionConfiguration(useHomeSectionConfiguration('em-destaque','Em Destaque'),'em-destaque')
  if(!config.active)return null
  const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.featuredStories
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section className="pl-section official-em-destaque pl-home-responsive-section" aria-label="Em Destaque" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-card-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div>{config.linkLabel&&<div className="pl-center-link"><SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink></div>}</section>
}
function MaisLidasSection(){const config=useHomeSectionConfiguration('mais-lidas','Mais Lidas');if(!config.active)return null;const limit=Math.max(1,Math.min(5,Number(config.itemLimit)||1));return <section className="pl-most official-mais-lidas" aria-label="Mais Lidas" style={{background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/>{homeReadModel.mostRead.slice(0,limit).map((title,index)=><SmartLink className="pl-ranked" to={config.linkUrl||'/noticias'} key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></SmartLink>)}{config.linkLabel&&<SmartLink className="pl-outline-button" to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink>}</section>}
function UltimasNoticiasSection(){
  const config=withHomeContentSectionConfiguration(useHomeSectionConfiguration('ultimas-noticias','Últimas Notícias'),'ultimas-noticias')
  if(!config.active)return null
  const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.latestStories
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section className="pl-section official-ultimas-noticias pl-home-responsive-section" aria-label="Últimas Notícias" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title} link={config.linkUrl||'/noticias'} label={config.linkLabel}/><div className="pl-latest-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div></section>
}
function EmAltaSection(){
  const config=withHomeContentSectionConfiguration(useHomeSectionConfiguration('em-alta','Em Alta'),'em-alta')
  if(!config.active)return null
  const items=selectConfiguredItems(homeReadModel.mostRead,config,title=>title)
  return <section className="pl-trending official-em-alta pl-home-responsive-section" aria-label="Em Alta" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><div className="pl-section-head pl-trending-head"><h2>{config.title}</h2>{config.linkLabel&&<SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink>}</div><div className="pl-trending-list pl-home-configurable-grid">{items.map((title,index)=><SmartLink className="pl-trending-item" to={config.linkUrl||'/noticias'} key={title}><span className="pl-trending-rank" style={{color:config.accentColor}}>{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Ranking atual</small></div></SmartLink>)}</div></section>
}
function AnuncieAquiSection(){const config=useHomeSectionConfiguration('anuncie-aqui','Anuncie Aqui');const layout=withAdvertisingSectionLayout(config,'anuncie-aqui');if(!layout.active)return null;return <AdvertiseHereSection layout={layout} config={{...defaultHomeAdConfig,active:true,title:layout.title||defaultHomeAdConfig.title,subtitle:layout.description||layout.eyebrow||defaultHomeAdConfig.subtitle,buttonLabel:layout.linkLabel||defaultHomeAdConfig.buttonLabel,buttonUrl:layout.linkUrl||defaultHomeAdConfig.buttonUrl,image:layout.imageUrl||defaultHomeAdConfig.image,align:layout.textAlign==='center'?'center':layout.textAlign==='right'?'right':'left'}}/>}
function LancamentosSection(){
  const config=withHomeContentSectionConfiguration(useHomeSectionConfiguration('lancamentos','Lançamentos'),'lancamentos')
  if(!config.active)return null
  const items=selectConfiguredItems(homeReadModel.releases,config,item=>item.title)
  return <section className="pl-section official-lancamentos pl-home-responsive-section" aria-label="Lançamentos" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title} link={config.linkUrl||'/lancamentos'} label={config.linkLabel}/><div className="pl-release-row">{items.map(release=><SmartLink className="pl-release" to={config.linkUrl||'/lancamentos'} key={release.title}><ImageThumb src={release.image} badge="▶"/><div className="pl-card-body"><h3>{release.title}</h3><div className="pl-meta"><span>{release.year}</span></div></div></SmartLink>)}</div></section>
}
function AgendaSection(){
  const config=withHomeContentSectionConfiguration(useHomeSectionConfiguration('agenda','Agenda'),'agenda')
  if(!config.active)return null
  const source=filterAgendaByWindow(homeReadModel.agenda,config.homeAgendaWindow)
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section className="pl-agenda official-agenda pl-home-responsive-section" aria-label="Agenda" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-home-configurable-grid">{items.map(item=><SmartLink className="pl-agenda-item" to={config.linkUrl||'/destaques'} key={item.title}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></SmartLink>)}</div>{config.linkLabel&&<SmartLink className="pl-outline-button" to={config.linkUrl||'/destaques'}>{config.linkLabel}</SmartLink>}</section>
}

function HomeContent(){return <main className="pl-main public-shell official-home-sections" aria-label="Seções da Página Inicial"><div className="official-home-primary-grid"><div className="official-home-main-stack"><EmDestaqueSection/><UltimasNoticiasSection/></div><aside className="official-home-sidebar-stack" aria-label="Coluna lateral da Página Inicial"><MaisLidasSection/><PublicidadeLateralSection/><EmAltaSection/></aside></div><AnuncieAquiSection/><div className="official-home-bottom-grid"><LancamentosSection/><AgendaSection/></div></main>}
export function PublicHome(){return <div className="public-page"><PublicHeader/><HeroSection/><HomeContent/><PublicFooter/></div>}
