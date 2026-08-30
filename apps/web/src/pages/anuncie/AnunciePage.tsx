import { BarChart3, LayoutGrid, Megaphone, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'

const formatIcons={home:LayoutGrid,news:Newspaper,campaigns:Megaphone,metrics:BarChart3} as const

export function AnunciePage(){
  const formats=publicSiteReadModel.advertisingFormats()
  return <div className="public-page"><PublicHeader/><main className="public-shell editorial-content-page public-info-page"><header className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE</span><h1>Anuncie no Portal Lander</h1><p>Espaços publicitários para marcas que querem aparecer dentro do universo da música, cultura urbana e entretenimento.</p></header><section className="public-info-grid">{formats.map(format=>{const Icon=formatIcons[format.iconKey];return <article className="public-info-card" key={format.id}><Icon size={20} aria-hidden="true"/><h2>{format.title}</h2><p>{format.description}</p></article>})}</section><section className="editorial-empty-state"><h2>Atendimento comercial em preparação</h2><p>O portal ainda não possui um endpoint ou canal comercial persistente conectado ao site. Nenhuma solicitação é simulada por esta página.</p><Link className="button outline" to="/">Voltar para o portal</Link></section></main><PublicFooter/></div>
}
