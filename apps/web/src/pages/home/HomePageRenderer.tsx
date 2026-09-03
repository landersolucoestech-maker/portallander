import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {withAdvertisingSectionLayout} from '../../features/site-manager/advertisingSectionLayout'
import {
  filterAgendaByWindow,
  homeContentResponsiveCssVariables,
  selectConfiguredItems,
  withHomeContentSectionConfiguration,
} from '../../features/site-manager/homeContentSectionConfiguration'
import {defaultSectionConfiguration,type SectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'
import {PublicAdvertisementModule,PublicMostReadModule} from '../../shared/public/PublicEditorialModules'
import {AdvertiseHereSection} from './components/AdvertiseHereSection'
import {HeroSection} from './components/HeroSection'
import {SpotifyReleasesSection} from './components/SpotifyReleasesSection'
import {defaultHomeAdConfig} from './models/adModel'
import type {HeroCmsState} from './models/heroCmsRepository'
import {homeReadModel,type HomeStory} from './models/homeReadModel'
import './styles/home-official-sections.css'
import './styles/home-content-responsive.css'

export type HomeRenderedSectionId='em-destaque'|'mais-lidas'|'ultimas-noticias'|'publicidade-lateral'|'em-alta'|'anuncie-aqui'|'lancamentos'|'agenda'|'newsletter'
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
  newsletter:'Newsletter',
}

function sectionConfig(configurations:HomeSectionConfigurationMap,id:HomeRenderedSectionId){return configurations[id]??defaultSectionConfiguration(id,sectionNames[id])}
function SmartLink({to,children,className}:{to:string;children:ReactNode;className?:string}){if(/^https?:\/\//i.test(to))return <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>;return <Link to={to||'/'} className={className}>{children}</Link>}
function SectionHead({title,link,label}:{title:string;link?:string;label?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&label&&<SmartLink to={link}>{label}</SmartLink>}</div>}
function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>}
function Card({item,to='/noticias'}:{item:HomeStory;to?:string}){return <SmartLink className="pl-card" to={to}><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></SmartLink>}

function EmDestaqueSection({configuration}:{configuration:SectionConfiguration}){const config=withHomeContentSectionConfiguration(configuration,'em-destaque');if(!config.active)return null;const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.featuredStories;const items=selectConfiguredItems(source,config,item=>item.title);return <section data-home-section="em-destaque" className="pl-section official-em-destaque pl-home-responsive-section" aria-label="Em Destaque" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-card-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div>{config.linkLabel&&<div className="pl-center-link"><SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink></div>}</section>}
function UltimasNoticiasSection({configuration}:{configuration:SectionConfiguration}){const config=withHomeContentSectionConfiguration(configuration,'ultimas-noticias');if(!config.active)return null;const source=config.homeSelectionMode==='manual'?homeReadModel.stories:homeReadModel.latestStories;const items=selectConfiguredItems(source,config,item=>item.title);return <section data-home-section="ultimas-noticias" className="pl-section official-ultimas-noticias pl-home-responsive-section" aria-label="Últimas Notícias" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title} link={config.linkUrl||'/noticias'} label={config.linkLabel}/><div className="pl-latest-grid">{items.map(story=><Card key={story.title} item={story} to={config.linkUrl||'/noticias'}/>)}</div></section>}
function EmAltaSection({configuration}:{configuration:SectionConfiguration}){const config=withHomeContentSectionConfiguration(configuration,'em-alta');if(!config.active)return null;const items=selectConfiguredItems(homeReadModel.mostRead,config,title=>title);return <section data-home-section="em-alta" className="pl-trending official-em-alta pl-home-responsive-section" aria-label="Em Alta" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><div className="pl-section-head pl-trending-head"><h2>{config.title}</h2>{config.linkLabel&&<SmartLink to={config.linkUrl||'/noticias'}>{config.linkLabel}</SmartLink>}</div><div className="pl-trending-list pl-home-configurable-grid">{items.map((title,index)=><SmartLink className="pl-trending-item" to={config.linkUrl||'/noticias'} key={title}><span className="pl-trending-rank" style={{color:config.accentColor}}>{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Ranking atual</small></div></SmartLink>)}</div></section>}
function AnuncieAquiSection({configuration}:{configuration:SectionConfiguration}){const layout=withAdvertisingSectionLayout(configuration,'anuncie-aqui');if(!layout.active)return null;return <div data-home-section="anuncie-aqui"><AdvertiseHereSection layout={layout} config={{...defaultHomeAdConfig,active:true,title:layout.title,subtitle:layout.description||layout.eyebrow,buttonLabel:layout.linkLabel,buttonUrl:layout.linkUrl,image:layout.imageUrl,imageAlt:layout.adImageAlt,align:layout.textAlign==='center'?'center':layout.textAlign==='right'?'right':'left'}}/></div>}
function AgendaSection({configuration}:{configuration:SectionConfiguration}){const config=withHomeContentSectionConfiguration(configuration,'agenda');if(!config.active)return null;const source=filterAgendaByWindow(homeReadModel.agenda,config.homeAgendaWindow);const items=selectConfiguredItems(source,config,item=>item.title);return <section data-home-section="agenda" className="pl-agenda official-agenda pl-home-responsive-section" aria-label="Agenda" style={{...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign}}><SectionHead title={config.title}/><div className="pl-home-configurable-grid">{items.map(item=><SmartLink className="pl-agenda-item" to={config.linkUrl||'/destaques'} key={item.title}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></SmartLink>)}</div>{config.linkLabel&&<SmartLink className="pl-outline-button" to={config.linkUrl||'/destaques'}>{config.linkLabel}</SmartLink>}</section>}

function HomeContent({configurations}:{configurations:HomeSectionConfigurationMap}){return <main className="pl-main public-shell official-home-sections" aria-label="Seções da Página Inicial"><div className="official-home-primary-grid"><div className="official-home-main-stack"><EmDestaqueSection configuration={sectionConfig(configurations,'em-destaque')}/><UltimasNoticiasSection configuration={sectionConfig(configurations,'ultimas-noticias')}/></div><aside className="official-home-sidebar-stack" aria-label="Coluna lateral da Página Inicial"><PublicMostReadModule configuration={sectionConfig(configurations,'mais-lidas')}/><PublicAdvertisementModule configuration={sectionConfig(configurations,'publicidade-lateral')}/><EmAltaSection configuration={sectionConfig(configurations,'em-alta')}/></aside></div><AnuncieAquiSection configuration={sectionConfig(configurations,'anuncie-aqui')}/><div className="official-home-bottom-grid"><SpotifyReleasesSection configuration={sectionConfig(configurations,'lancamentos')}/><AgendaSection configuration={sectionConfig(configurations,'agenda')}/></div></main>}

export function HomePageRenderer({sectionConfigurations={},heroState,hydrated=true}:{sectionConfigurations?:HomeSectionConfigurationMap;heroState?:HeroCmsState;hydrated?:boolean}){return <div className="public-page" data-home-config-hydrated={hydrated?'true':'false'}><PublicHeader/><HeroSection config={heroState?.carousel} appearance={heroState?.appearance} background={heroState?.background}/><HomeContent configurations={sectionConfigurations}/><PublicFooter newsletterConfiguration={sectionConfig(sectionConfigurations,'newsletter')}/></div>}
