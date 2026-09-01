import { Link } from 'react-router-dom'
import { portalLogo } from '../../shared/branding/assets/brandAsset'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import { HeroSection } from './components/HeroSection'
import { HomeAdSection } from './components/HomeAdSection'
import { homeReadModel, type HomeStory } from './models/homeReadModel'

type SidebarAdConfig={
  active:boolean
  title:string
  subtitle:string
  linkLabel:string
  linkUrl:string
  bodyLines:string[]
  imageUrl:string
  imageAlt:string
}

const SIDEBAR_AD_STORAGE_KEY='portal-lander:cms:section-config:side-ad:v4'
const DEFAULT_SIDEBAR_AD:SidebarAdConfig={
  active:true,
  title:'PUBLICIDADE',
  subtitle:'ANUNCIE AQUI',
  linkLabel:'SAIBA MAIS',
  linkUrl:'/anuncie',
  bodyLines:['SUA MARCA NO RITMO CERTO!'],
  imageUrl:'',
  imageAlt:'Publicidade Portal Lander',
}

function readSidebarAdConfig():SidebarAdConfig{
  if(typeof window==='undefined')return DEFAULT_SIDEBAR_AD
  try{
    const raw=window.localStorage.getItem(SIDEBAR_AD_STORAGE_KEY)
    if(!raw)return DEFAULT_SIDEBAR_AD
    const parsed=JSON.parse(raw) as Partial<SidebarAdConfig>
    return {
      ...DEFAULT_SIDEBAR_AD,
      ...parsed,
      bodyLines:Array.isArray(parsed.bodyLines)?parsed.bodyLines:DEFAULT_SIDEBAR_AD.bodyLines,
    }
  }catch{return DEFAULT_SIDEBAR_AD}
}

function SectionHead({title,link}:{title:string;link?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&<Link to={link}>VER TODOS</Link>}</div>}
function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>}
function Card({item}:{item:HomeStory}){return <Link className="pl-card" to="/noticias" aria-label={`Abrir notícias relacionadas a ${item.title}`}><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></Link>}

function SidebarAd(){
  const config=readSidebarAdConfig()
  if(!config.active)return null
  return <aside className="pl-home-sidebar-ad">
    <div className="pl-home-sidebar-ad-inner">
      {config.imageUrl
        ? <img src={config.imageUrl} alt={config.imageAlt||'Publicidade'} style={{display:'block',width:'100%',height:'auto',objectFit:'contain',marginBottom:12}}/>
        : <img src={portalLogo} alt="Portal Lander"/>}
      {config.title&&<span className="pl-home-sidebar-ad-kicker">{config.title}</span>}
      {config.subtitle&&<h3>{config.subtitle}</h3>}
      {config.bodyLines.filter(Boolean).map((line,index)=><p key={`${line}-${index}`}>{line}</p>)}
      {config.linkLabel&&config.linkUrl&&<Link to={config.linkUrl}>{config.linkLabel} →</Link>}
    </div>
  </aside>
}

function Trending(){
  return <aside className="pl-trending"><div className="pl-section-head pl-trending-head"><h2>EM ALTA</h2><Link to="/noticias">VER TODOS</Link></div><div className="pl-trending-list">{homeReadModel.mostRead.slice(0,4).map((title,index)=><Link className="pl-trending-item" to="/noticias" key={title}><span className="pl-trending-rank">{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Há {index+3} horas</small></div></Link>)}</div></aside>
}

function HomeContent(){
  return <div className="pl-main public-shell">
    <div className="pl-grid-main">
      <section className="pl-section"><SectionHead title="EM DESTAQUE"/><div className="pl-card-grid">{homeReadModel.featuredStories.map(story=><Card key={story.title} item={story}/>)}</div><div className="pl-center-link"><Link to="/noticias">EXPLORAR DESTAQUES</Link></div></section>
      <aside className="pl-most"><SectionHead title="MAIS LIDAS"/>{homeReadModel.mostRead.map((title,index)=><Link className="pl-ranked" to="/noticias" key={title} aria-label={`Abrir notícias relacionadas a ${title}`}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></Link>)}<Link className="pl-outline-button" to="/noticias">VER TODOS</Link><SidebarAd/></aside>
    </div>
    <div className="pl-latest-wrap">
      <section className="pl-section"><SectionHead title="ÚLTIMAS NOTÍCIAS" link="/noticias"/><div className="pl-latest-grid">{homeReadModel.latestStories.map(story=><Card key={story.title} item={story}/>)}</div><div className="pl-center-link"><Link to="/noticias">VER TODAS AS NOTÍCIAS</Link></div></section>
      <Trending/>
    </div>
    <HomeAdSection/>
    <div className="pl-release-agenda">
      <section className="pl-section"><SectionHead title="LANÇAMENTOS"/><div className="pl-release-row">{homeReadModel.releases.map(release=><Link className="pl-release" to="/lancamentos" key={release.title} aria-label={`Abrir lançamentos relacionados a ${release.title}`}><ImageThumb src={release.image} badge="▶"/><div className="pl-card-body"><h3>{release.title}</h3><div className="pl-meta"><span>{release.year}</span></div></div></Link>)}</div></section>
      <aside className="pl-agenda"><SectionHead title="AGENDA"/>{homeReadModel.agenda.map(item=><Link className="pl-agenda-item" to="/destaques" key={item.title} aria-label={`Abrir destaques relacionados a ${item.title}`}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></Link>)}<Link className="pl-outline-button" to="/destaques">VER DESTAQUES</Link></aside>
    </div>
  </div>
}

export function PublicHome(){return <div className="public-page"><PublicHeader/><HeroSection/><HomeContent/><PublicFooter/></div>}
