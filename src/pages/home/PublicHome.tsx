import { Link } from 'react-router-dom'
import { editorialReadModel } from '../../features/editorial/repository'
import { portalLogo } from '../../shared/branding/assets/brandAsset'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import { HeroSection } from './components/HeroSection'
import { HomeAdSection } from './components/HomeAdSection'
import { homeReadModel, type HomeStory } from './models/homeReadModel'

function SectionHead({title,link}:{title:string;link?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&<Link to={link}>VER TODOS</Link>}</div>}
function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>}
function Card({item}:{item:HomeStory}){return <article className="pl-card"><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></article>}

function SidebarAd(){return <aside className="pl-home-sidebar-ad"><div className="pl-home-sidebar-ad-inner"><img src={portalLogo} alt="Portal Lander"/><span className="pl-home-sidebar-ad-kicker">PUBLICIDADE</span><h3>ANUNCIE AQUI</h3><p>SUA MARCA NO<br/>RITMO CERTO!</p><Link to="/anuncie">SAIBA MAIS →</Link></div></aside>}

function Trending(){
  return <aside className="pl-trending"><div className="pl-section-head pl-trending-head"><h2>EM ALTA</h2><Link to="/noticias">VER TODOS</Link></div><div className="pl-trending-list">{homeReadModel.mostRead.slice(0,4).map((title,index)=><Link className="pl-trending-item" to="/noticias" key={title}><span className="pl-trending-rank">{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Há {index+3} horas</small></div></Link>)}</div></aside>
}

function HomeContent(){
  return <div className="pl-main public-shell">
    <div className="pl-grid-main">
      <section className="pl-section"><SectionHead title="EM DESTAQUE"/><div className="pl-card-grid">{homeReadModel.featuredStories.map(story=><Card key={story.title} item={story}/>)}</div><div className="pl-center-link"><Link to="/noticias">EXPLORAR DESTAQUES</Link></div></section>
      <aside className="pl-most"><SectionHead title="MAIS LIDAS"/>{homeReadModel.mostRead.map((title,index)=><div className="pl-ranked" key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></div>)}<Link className="pl-outline-button" to="/noticias">VER TODOS</Link><SidebarAd/></aside>
    </div>
    <div className="pl-latest-wrap">
      <section className="pl-section"><SectionHead title="ÚLTIMAS NOTÍCIAS" link="/noticias"/><div className="pl-latest-grid">{homeReadModel.latestStories.map(story=><Card key={story.title} item={story}/>)}</div><div className="pl-center-link"><Link to="/noticias">VER TODAS AS NOTÍCIAS</Link></div></section>
      <Trending/>
    </div>
    <HomeAdSection/>
    <div className="pl-release-agenda">
      <section className="pl-section"><SectionHead title="LANÇAMENTOS"/><div className="pl-release-row">{homeReadModel.releases.map(release=><article className="pl-release" key={release.title}><ImageThumb src={release.image} badge="▶"/><div className="pl-card-body"><h3>{release.title}</h3><div className="pl-meta"><span>{release.year}</span></div></div></article>)}</div></section>
      <aside className="pl-agenda"><SectionHead title="AGENDA"/>{homeReadModel.agenda.map(item=><div className="pl-agenda-item" key={item.title}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></div>)}<Link className="pl-outline-button" to="/agenda">VER AGENDA COMPLETA</Link></aside>
    </div>
  </div>
}

export function PublicHome(){return <div className="public-page"><PublicHeader/><HeroSection/><HomeContent/><PublicFooter/></div>}
