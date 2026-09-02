import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
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
import {defaultSectionConfiguration,type SectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'
import {AdvertiseHereSection} from './components/AdvertiseHereSection'
import {HeroSection} from './components/HeroSection'
import {defaultHomeAdConfig} from './models/adModel'
import type {HeroCmsState} from './models/heroCmsRepository'
import {homeReadModel,type HomeStory} from './models/homeReadModel'
import './styles/home-official-sections.css'
import './styles/home-content-responsive.css'

export type HomeRenderedSectionId='em-destaque'|'mais-lidas'|'ultimas-noticias'|'publicidade-lateral'|'em-alta'|'anuncie-aqui'|'lancamentos'|'agenda'
export type HomeSectionConfigurationMap=Partial<Record<HomeRenderedSectionId,SectionConfiguration>>

const sectionNames:Record<HomeRenderedSectionId,string>={
  'em-destaque':'Em Destaque',
  'mais-lidas':'Mais Lidas',
  'ultimas-noticias':'Últimas Notícias',
  'publicidade-lateral':'Publicidade Lateral',
  'em-alta':'Em Alta',
  'anuncie-aqui':'Anuncie Aqui',
  lancamentos:'Lançamentos',
  agenda:'Agenda',
}

function sectionConfig(configurations:HomeSectionConfigurationMap,id:HomeRenderedSectionId){
  return configurations[id]??defaultSectionConfiguration(id,sectionNames[id])
}

function SmartLink({to,children,className}:{to:string;children:ReactNode;className?:string}){
  if(/^https?:\/\//i.test(to))return <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>
  return <Link to={to||'/'} className={className}>{children}</Link>
}

function AdvertisingAreaLink({config,children,className}:{config:AdvertisingSectionConfiguration;children:ReactNode;className?:string}){
  if(!config.adLinkEnabled||!config.linkUrl)return <>{children}</>
  if(config.adLinkTarget==='same'&&!/^https?:\/\//i.test(config.linkUrl))return <Link to={config.linkUrl} className={className}>{children}</Link>
  const href=/^https?:\/\//i.test(config.linkUrl)?config.linkUrl:`${window.location.pathname}#${config.linkUrl}`
  return <a href={href} target={config.adLinkTarget==='new'?'_blank':'_self'} rel={config.adLinkTarget==='new'?'noreferrer':undefined} className={className}>{children}</a>
}

function SectionHead({title,link,label}:{title:string;link?:string;label?:string}){
  return <div className="pl-section-head"><h2>{title}</h2>{link&&label&&<SmartLink to={link}>{label}</SmartLink>}</div>
}

function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){
  return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>
}

function Card({item,to='/noticias'}:{item:HomeStory;to?:string}){
  return <SmartLink className="pl-card" to={to}><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></SmartLink>
}

function PublicidadeLateralSection({configuration}:{configuration:SectionConfiguration}){
  const configured=withAdvertisingSectionLayout(configuration,'publicidade-lateral')
  if(!configured.active)return null
  const imageUrl=configured.imageUrl.trim()
  const imageFit=configured.adImageFit==='cover'?'cover':'contain'
  const description=configured.description.trim()
  const media=imageUrl
    ?<img className="pl-home-sidebar-ad-image" src={imageUrl} alt={configured.adImageAlt||configured.title||'Publicidade'}/>
    :<div className="pl-home-sidebar-ad-fallback" role="presentation"><div className="pl-home-sidebar-ad-copy-static">{configured.eyebrow&&<span className="pl-home-sidebar-ad-kicker">{configured.eyebrow}</span>}{configured.title&&<h3>{configured.title}</h3>}{description&&<p>{description}</p>}{configured.linkLabel&&<span className="pl-home-sidebar-ad-link-label">{configured.linkLabel} →</span>}</div></div>
  return <section data-home-section="publicidade-lateral" className={`pl-home-sidebar-ad official-publicidade-lateral pl-home-configurable-ad ${imageUrl?'has-creative':'is-empty'} ad-fit-${imageFit}`} aria-label="Publicidade Lateral" style={{...advertisingResponsiveCssVariables(configured),textAlign:configured.textAlign,background:imageUrl?'transparent':configured.background,color:configured.textColor,borderColor:imageUrl?'transparent':configured.accentColor,borderRadius:0}}><div className="pl-home-sidebar-ad-inner"><AdvertisingAreaLink config={configured} className="pl-home-ad-area-link">{media}</AdvertisingAreaLink></div></section>
}

function EmDestaqueSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'em-destaque')
  if(!config.active)return null
  const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.featuredStories
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section data-home-section="em-destaque" className="pl-section official-em-destaque pl-home-responsive-section" aria-label="Em Destaque" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-card-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div>{config.linkLabel&&<div className="pl-center-link"><SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink></div>}</section>
}

function MaisLidasSection({configuration}:{configuration:SectionConfiguration}){
  const config=configuration
  if(!config.active)return null
  const limit=Math.max(1,Math.min(5,Number(config.itemLimit)||1))
  return <section data-home-section="mais-lidas" className="pl-most official-mais-lidas" aria-label="Mais Lidas" style={{background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/>{homeReadModel.mostRead.slice(0,limit).map((title,index)=><SmartLink className="pl-ranked" to={config.linkUrl||'/noticias'} key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></SmartLink>)}{config.linkLabel&&<SmartLink className="pl-outline-button" to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink>}</section>
}

function UltimasNoticiasSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'ultimas-noticias')
  if(!config.active)return null
  const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.latestStories
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section data-home-section="ultimas-noticias" className="pl-section official-ultimas-noticias pl-home-responsive-section" aria-label="Últimas Notícias" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title} link={config.linkUrl||'/noticias'} label={config.linkLabel}/><div className="pl-latest-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div></section>
}

function EmAltaSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'em-alta')
  if(!config.active)return null
  const items=selectConfiguredItems(homeReadModel.mostRead,config,title=>title)
  return <section data-home-section="em-alta" className="pl-trending official-em-alta pl-home-responsive-section" aria-label="Em Alta" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><div className="pl-section-head pl-trending-head"><h2>{config.title}</h2>{config.linkLabel&&<SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink>}</div><div className="pl-trending-list pl-home-configurable-grid">{items.map((title,index)=><SmartLink className="pl-trending-item" to={config.linkUrl||'/noticias'} key={title}><span className="pl-trending-rank" style={{color:config.accentColor}}>{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Ranking atual</small></div></SmartLink>)}</div></section>
}

function AnuncieAquiSection({configuration}:{configuration:SectionConfiguration}){
  const layout=withAdvertisingSectionLayout(configuration,'anuncie-aqui')
  if(!layout.active)return null
  return <div data-home-section="anuncie-aqui"><AdvertiseHereSection layout={layout} config={{...defaultHomeAdConfig,active:true,title:layout.title,subtitle:layout.description||layout.eyebrow,buttonLabel:layout.linkLabel,buttonUrl:layout.linkUrl,image:layout.imageUrl,imageAlt:layout.adImageAlt,align:layout.textAlign==='center'?'center':layout.textAlign==='right'?'right':'left'}}/></div>
}

function LancamentosSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'lancamentos')
  if(!config.active)return null
  const items=selectConfiguredItems(homeReadModel.releases,config,item=>item.title)
  return <section data-home-section="lancamentos" className="pl-section official-lancamentos pl-home-responsive-section" aria-label="Lançamentos" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title} link={config.linkUrl||'/lancamentos'} label={config.linkLabel}/><div className="pl-release-row">{items.map(release=><SmartLink className="pl-release" to={config.linkUrl||'/lancamentos'} key={release.title}><ImageThumb src={release.image} badge="▶"/><div className="pl-card-body"><h3>{release.title}</h3><div className="pl-meta"><span>{release.year}</span></div></div></SmartLink>)}</div></section>
}

function AgendaSection({configuration}:{configuration:SectionConfiguration}){
  const config=withHomeContentSectionConfiguration(configuration,'agenda')
  if(!config.active)return null
  const source=filterAgendaByWindow(homeReadModel.agenda,config.homeAgendaWindow)
  const items=selectConfiguredItems(source,config,item=>item.title)
  return <section data-home-section="agenda" className="pl-agenda official-agenda pl-home-responsive-section" aria-label="Agenda" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-home-configurable-grid">{items.map(item=><SmartLink className="pl-agenda-item" to={config.linkUrl||'/destaques'} key={item.title}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></SmartLink>)}</div>{config.linkLabel&&<SmartLink className="pl-outline-button" to={config.linkUrl||'/destaques'}>{config.linkLabel}</SmartLink>}</section>
}

function HomeContent({configurations}:{configurations:HomeSectionConfigurationMap}){
  return <main className="pl-main public-shell official-home-sections" aria-label="Seções da Página Inicial"><div className="official-home-primary-grid"><div className="official-home-main-stack"><EmDestaqueSection configuration={sectionConfig(configurations,'em-destaque')}/><UltimasNoticiasSection configuration={sectionConfig(configurations,'ultimas-noticias')}/></div><aside className="official-home-sidebar-stack" aria-label="Coluna lateral da Página Inicial"><MaisLidasSection configuration={sectionConfig(configurations,'mais-lidas')}/><PublicidadeLateralSection configuration={sectionConfig(configurations,'publicidade-lateral')}/><EmAltaSection configuration={sectionConfig(configurations,'em-alta')}/></aside></div><AnuncieAquiSection configuration={sectionConfig(configurations,'anuncie-aqui')}/><div className="official-home-bottom-grid"><LancamentosSection configuration={sectionConfig(configurations,'lancamentos')}/><AgendaSection configuration={sectionConfig(configurations,'agenda')}/></div></main>
}

export function HomePageRenderer({sectionConfigurations={},heroState,hydrated=true}:{sectionConfigurations?:HomeSectionConfigurationMap;heroState?:HeroCmsState;hydrated?:boolean}){
  return <div className="public-page" data-home-config-hydrated={hydrated?'true':'false'}><PublicHeader/><HeroSection config={heroState?.carousel} appearance={heroState?.appearance} background={heroState?.background}/><HomeContent configurations={sectionConfigurations}/><PublicFooter/></div>
}
