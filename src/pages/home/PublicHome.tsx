import { Link } from 'react-router-dom'
import { editorialReadModel } from '../../features/editorial/repository'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import { HeroSection } from './components/HeroSection'

type Story = { category:string; title:string; meta:string; views:string; image:string }

const IMG={
  stage:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85',
  dj:'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=85',
  crowd:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  concert:'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85',
  decks:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85',
  live:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  festival:'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85',
  singer:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=85',
}

const stories:Story[]=[
  {category:'Lançamentos',title:'MC Cabelinho lança “Melhor Só” e faz voô à loucura',meta:'Há 2 horas',views:'12.4K',image:IMG.stage},
  {category:'Bastidores',title:'Bastidores do clipe de Orochi viralizam na web',meta:'Há 5 horas',views:'8.7K',image:IMG.dj},
  {category:'Polêmica',title:'Treta! MC Poze alfineta Oruam nas redes sociais',meta:'Há 7 horas',views:'15.2K',image:IMG.crowd},
  {category:'Cultura',title:'A arte do funk: artistas que transformam a quebrada',meta:'Há 9 horas',views:'6.1K',image:IMG.concert},
  {category:'Notícias',title:'Djonga anuncia pausa na carreira para cuidar da saúde mental',meta:'Há 2 horas',views:'3.1K',image:IMG.singer},
  {category:'Notícias',title:'Tribo da Periferia lança documentário sobre sua trajetória',meta:'Há 2 horas',views:'2.7K',image:IMG.live},
  {category:'Destaques',title:'Filipe Ret solta prévia de faixa inédita e anima fãs',meta:'Há 3 horas',views:'4.6K',image:IMG.decks},
  {category:'Cultura',title:'MC Dricka fala sobre novos projetos e empoderamento',meta:'Há 4 horas',views:'3.8K',image:IMG.festival},
]

const ranked=['Veigh bate recorde com novo álbum “Dos Prédios Deluxe”','MC Ryan SP cancela show de última hora e web reage','Festival de Trap 2025 anuncia line-up pesado','Ludmilla confirma nova turnê “Numanice 4”','Entenda a treta entre Mainstreet e Pineapple']
const releases=[{title:'Oruam — Liberado',image:IMG.stage},{title:'Veigh — Dos Prédios Deluxe',image:IMG.dj},{title:'MC Cabelinho — Melhor Só',image:IMG.concert},{title:'Ludmilla — Numanice #4',image:IMG.live},{title:'WIU — Manual de Cria',image:IMG.festival}]
const agenda=[['24','MAI','Festival de Trap 2025','São Paulo, SP'],['31','MAI','Show do Orochi','Rio de Janeiro, RJ'],['07','JUN','Ludmilla · Numanice #4','Belo Horizonte, MG'],['14','JUN','MC Cabelinho','Curitiba, PR']]

function SectionHead({title,link}:{title:string;link?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&<Link to={link}>VER TODOS</Link>}</div>}
function ImageThumb({src,badge,className=''}:{src:string;badge?:string;className?:string}){return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>}
function Card({item}:{item:Story}){return <article className="pl-card"><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></article>}

function HomeContent(){return <div className="pl-main public-shell"><div className="pl-grid-main"><section className="pl-section"><SectionHead title="EM DESTAQUE"/><div className="pl-card-grid">{stories.slice(0,6).map(s=><Card key={s.title} item={s}/>)}</div><div className="pl-center-link"><Link to="/noticias">EXPLORAR DESTAQUES</Link></div></section><aside className="pl-most"><SectionHead title="MAIS LIDAS"/>{ranked.map((r,i)=><div className="pl-ranked" key={r}><strong>{String(i+1).padStart(2,'0')}</strong><div><h4>{r}</h4><small>Há {i+3} horas</small></div></div>)}<Link className="pl-outline-button" to="/noticias">VER TODOS</Link></aside></div><div className="pl-ad"><b><em>PORTAL LANDER</em></b><span>ANUNCIE AQUI · SUA MARCA NO RITMO CERTO!</span><Link to="/anuncie">SAIBA MAIS →</Link></div><div className="pl-latest-wrap"><section className="pl-section"><SectionHead title="ÚLTIMAS NOTÍCIAS" link="/noticias"/><div className="pl-latest-grid">{stories.slice(4,8).map(s=><Card key={s.title} item={s}/>)}</div><div className="pl-center-link"><Link to="/noticias">VER TODAS AS NOTÍCIAS</Link></div></section><aside className="pl-whatsapp"><div className="pl-phone-visual"><span>WHATSAPP</span></div><h3>PORTAL LANDER<br/>NO SEU WHATSAPP!</h3><p>Receba as principais notícias em primeira mão.</p><Link to="/whatsapp">QUERO RECEBER →</Link></aside></div><section className="pl-section"><SectionHead title="NAVEGUE POR CATEGORIAS"/><div className="pl-categories">{editorialReadModel.listMenuPages().filter(page=>!page.parentId).map(page=><Link className="pl-category" to={`/${page.slug}`} key={page.id}><h3>{page.navigationLabel}</h3><p>{page.description}</p></Link>)}</div></section><div className="pl-release-agenda"><section className="pl-section"><SectionHead title="LANÇAMENTOS"/><div className="pl-release-row">{releases.map(r=><article className="pl-release" key={r.title}><ImageThumb src={r.image} badge="▶"/><div className="pl-card-body"><h3>{r.title}</h3><div className="pl-meta"><span>2026</span></div></div></article>)}</div></section><aside className="pl-agenda"><SectionHead title="AGENDA"/>{agenda.map(([day,month,title,place])=><div className="pl-agenda-item" key={title}><div><strong>{day}</strong><span>{month}</span></div><div><b>{title}</b><small>{place}</small></div></div>)}<Link className="pl-outline-button" to="/agenda">VER AGENDA COMPLETA</Link></aside></div></div>}

export function PublicHome(){return <div className="public-page"><PublicHeader/><HeroSection/><HomeContent/><PublicFooter/></div>}
