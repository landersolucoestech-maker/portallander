import { BarChart3, LayoutGrid, Megaphone, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'

const formats=[
  {icon:LayoutGrid,title:'Home',description:'Espaços de destaque integrados à página inicial do Portal Lander.'},
  {icon:Newspaper,title:'Notícias',description:'Publicidade contextual junto ao fluxo editorial da página de notícias.'},
  {icon:Megaphone,title:'Campanhas',description:'Formatos de presença de marca alinhados ao conteúdo e à audiência do portal.'},
  {icon:BarChart3,title:'Métricas',description:'A mensuração comercial será disponibilizada quando a camada real de analytics estiver conectada.'},
]

export function AnunciePage(){
  return <div className="public-page"><PublicHeader/><main className="public-shell editorial-content-page public-info-page"><header className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE</span><h1>Anuncie no Portal Lander</h1><p>Espaços publicitários para marcas que querem aparecer dentro do universo da música, cultura urbana e entretenimento.</p></header><section className="public-info-grid">{formats.map(({icon:Icon,title,description})=><article className="public-info-card" key={title}><Icon size={20} aria-hidden="true"/><h2>{title}</h2><p>{description}</p></article>)}</section><section className="editorial-empty-state"><h2>Atendimento comercial em preparação</h2><p>O portal ainda não possui um endpoint ou canal comercial persistente conectado ao site. Nenhuma solicitação é simulada por esta página.</p><Link className="button outline" to="/">Voltar para o portal</Link></section></main><PublicFooter/></div>
}
