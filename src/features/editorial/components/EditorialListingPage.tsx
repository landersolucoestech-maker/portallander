import { Link } from 'react-router-dom'
import { NewsAdSection } from '../../../pages/noticias/components/NewsAdSection'
import { useNewsAdRuntime } from '../../../pages/noticias/hooks/useNewsAdRuntime'
import { isNewsAdValid } from '../../../pages/noticias/models/newsAdModel'
import { PublicFooter, PublicHeader } from '../../../shared/public/PublicChrome'
import { useEditorialSeo } from '../hooks/useEditorialSeo'
import type { EditorialPage } from '../model'
import { editorialReadModel } from '../repository'

export function EditorialListingPage({page}:{page:EditorialPage}){
  const contents=editorialReadModel.listPageContents(page.id)
  const isNewsPage=page.slug==='noticias'
  const newsAd=useNewsAdRuntime(isNewsPage)
  const showNewsAd=isNewsPage&&isNewsAdValid(newsAd)
  useEditorialSeo(page)
  return <div className="public-page news-reference-page"><PublicHeader/><main className="pl-page public-shell"><div className="pl-page-hero"><div className="news-page-intro-copy"><span>Início › AGORA NO PORTAL</span><h1>{page.title.toUpperCase()}</h1><p>{page.description}</p></div></div>{contents.length===0?<section className="editorial-empty-state" role="status"><h2>Nenhum conteúdo publicado ainda</h2><p>Esta página está publicada, mas ainda não possui conteúdos disponíveis.</p></section>:<div className={`news-reference-grid editorial-listing-grid${showNewsAd?' has-news-ad':''}`}>{showNewsAd&&<NewsAdSection config={newsAd}/>} {contents.map(content=><Link className="pl-card news-reference-card" to={`/${page.slug}/${content.slug}`} key={content.id}><div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${content.coverImage||''})`}}>{content.tags[0]&&<span className="pl-badge">{content.tags[0]}</span>}</div><div className="pl-card-body news-reference-card-body"><h3>{content.title}</h3><p>{content.summary}</p><div className="pl-meta news-reference-meta"><span>{content.publishedAt?new Date(content.publishedAt).toLocaleDateString('pt-BR'):'Sem data'}</span><span>{content.author}</span></div></div></Link>)}</div>}</main><PublicFooter/></div>
}
