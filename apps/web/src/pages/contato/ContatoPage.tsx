import type {EditorialPage} from '../../features/editorial/model'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

export function ContatoPage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const hero=useSectionConfiguration(page.id,'contato-hero','Hero de Contato')
  const channelsSection=useSectionConfiguration(page.id,'contato-canais','Canais Oficiais')
  const channels=publicSiteReadModel.socialChannels().slice(0,channelsSection.itemLimit)
  return <div className="public-page contato-page">
    <PublicHeader/>
    <main>
      {hero.active&&<section className="public-standard-page-hero" style={{background:hero.background,color:hero.textColor,textAlign:hero.textAlign,position:'relative',overflow:'hidden'}}>{hero.imageUrl&&<img src={hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.25}}/>}<div className="public-shell" style={{position:'relative',zIndex:1}}><div className="news-page-intro-copy"><span style={{color:hero.accentColor}}>{hero.eyebrow||'CONTATO'}</span><h1>{hero.title||page.title.toUpperCase()}</h1><p>{hero.description||page.description}</p></div></div></section>}
      {channelsSection.active&&<section className="public-shell pl-page" style={{background:channelsSection.background,color:channelsSection.textColor,textAlign:channelsSection.textAlign}}><div className="pl-page-hero"><div className="news-page-intro-copy"><h2>{channelsSection.title||'CANAIS OFICIAIS'}</h2><p>{channelsSection.description||'Escolha um dos canais públicos configurados pelo Portal Lander.'}</p></div></div>{channels.length?<div className="news-reference-grid editorial-listing-grid" style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,channelsSection.columns))},minmax(0,1fr))`}}>{channels.map(channel=><a className="pl-card news-reference-card" href={channel.url} target="_blank" rel="noreferrer" key={channel.id}><div className="pl-card-body news-reference-card-body"><h3>{channel.label}</h3><p>{channel.network.toUpperCase()}</p></div></a>)}</div>:<div className="editorial-empty-state"><h2>Nenhum canal público configurado</h2><p>Os canais de contato aparecerão aqui quando forem habilitados na identidade do site.</p></div>}</section>}
    </main>
    <PublicFooter/>
  </div>
}
