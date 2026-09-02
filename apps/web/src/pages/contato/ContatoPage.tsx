import type {EditorialPage} from '../../features/editorial/model'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

export function ContatoPage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const channels=publicSiteReadModel.socialChannels()
  return <div className="public-page contato-page">
    <PublicHeader/>
    <main>
      <section className="public-standard-page-hero"><div className="public-shell"><div className="news-page-intro-copy"><span>CONTATO</span><h1>{page.title.toUpperCase()}</h1><p>{page.description}</p></div></div></section>
      <section className="public-shell pl-page"><div className="pl-page-hero"><div className="news-page-intro-copy"><h2>CANAIS OFICIAIS</h2><p>Escolha um dos canais públicos configurados pelo Portal Lander.</p></div></div>{channels.length?<div className="news-reference-grid editorial-listing-grid">{channels.map(channel=><a className="pl-card news-reference-card" href={channel.url} target="_blank" rel="noreferrer" key={channel.id}><div className="pl-card-body news-reference-card-body"><h3>{channel.label}</h3><p>{channel.network.toUpperCase()}</p></div></a>)}</div>:<div className="editorial-empty-state"><h2>Nenhum canal público configurado</h2><p>Os canais de contato aparecerão aqui quando forem habilitados na identidade do site.</p></div>}</section>
    </main>
    <PublicFooter/>
  </div>
}
