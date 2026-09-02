import type {EditorialPage} from '../../features/editorial/model'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'

export function SobrePage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  return <div className="public-page sobre-page">
    <PublicHeader/>
    <main>
      <section className="public-standard-page-hero"><div className="public-shell"><div className="news-page-intro-copy"><span>INSTITUCIONAL</span><h1>{page.title.toUpperCase()}</h1><p>{page.description}</p></div></div></section>
      <section className="public-shell article-shell"><article className="article-content"><h2>PORTAL LANDER</h2><p>{page.description}</p></article></section>
    </main>
    <PublicFooter/>
  </div>
}
