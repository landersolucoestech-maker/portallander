import {LayoutPanelLeft,Megaphone,Newspaper} from 'lucide-react'
import {Link} from 'react-router-dom'
import {PORTAL_ADVERTISING_INVENTORY} from '../../shared/advertising/canonicalInventory'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

const placementIcon={
  'home-sidebar':LayoutPanelLeft,
  'editorial-sidebar':Newspaper,
  'advertise-here':Megaphone,
} as const

export function AnunciePage(){
  return <div className="public-page"><PublicHeader/><main className="public-shell editorial-content-page public-info-page"><header className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE</span><h1>Anuncie no Portal Lander</h1><p>Conheça os espaços de publicidade que existem tecnicamente no Portal Lander. A disponibilidade comercial permanece sujeita à ativação do atendimento.</p></header><section className="public-info-grid">{PORTAL_ADVERTISING_INVENTORY.map(placement=>{const Icon=placementIcon[placement.id];return <article className="public-info-card" key={placement.id}><Icon size={20} aria-hidden="true"/><h2>{placement.name}</h2><p>{placement.description}</p><small>Implementado no Portal · disponibilidade comercial não confirmada</small></article>})}</section><section className="editorial-empty-state"><h2>Atendimento comercial em preparação</h2><p>O portal ainda não possui um endpoint ou canal comercial persistente conectado ao site. Nenhuma solicitação é simulada por esta página.</p><Link className="button outline" to="/">Voltar para o portal</Link></section></main><PublicFooter/></div>
}
