import { Link, useLocation } from 'react-router-dom'
import { NewsAdSection } from '../../../pages/noticias/components/NewsAdSection'
import { useNewsAdRuntime } from '../../../pages/noticias/hooks/useNewsAdRuntime'
import { isNewsAdValid } from '../../../pages/noticias/models/newsAdModel'
import { useSectionConfiguration } from '../../site-manager/useSectionConfiguration'
import { PublicFooter, PublicHeader } from '../../../shared/public/PublicChrome'
import { useEditorialSeo } from '../hooks/useEditorialSeo'
import type { EditorialPage } from '../model'
import { editorialReadModel } from '../repository'

export function EditorialListingPage({page}:{page:EditorialPage}){
  const location=useLocation()
  const template=useSectionConfiguration('editorial-template','editorial-template','Template editorial de Notícias')
  const searchQuery=new URLSearchParams(location.search).get('busca')?.trim()||''
  const isSearchMode=Boolean(searchQuery)
  const allContents=isSearchMode?editorialReadModel.searchPublicContents(searchQuery):editorialReadModel.listPageContents(page.id)
  const contents=allContents.slice(0,Math.max(1,template.itemLimit||12))
  const editorialAd=useNewsAdRuntime(!isSearchMode)
  const showEditorialAd=!isSearchMode&&isNewsAdValid(editorialAd)
  useEditorialSeo(page)

  return <div className="public-page news-reference-page"><PublicHeader/><main className="pl-page public-shell" style={{background:template.background,color:template.textColor,textAlign:template.textAlign}}><div className="pl-page-hero"><div className="news-page-intro-copy"><span style={{color:template.accentColor}}>Início › {isSearchMode?'BUSCA':'AGORA NO PORTAL'}</span><h1>{isSearchMode?'RESULTADOS':page.title.toUpperCase()}</h1><p>{isSearchMode?`Resultados editoriais para “${searchQuery}”.`:page.description}</p></div></div>{!template.active&&!isSearchMode?<section className="editorial-empty-state" role="status"><h2>Seção editorial temporariamente oculta</h2><p>O template editorial está desativado na configuração de Páginas.</p></section>:allContents.length===0?<section className="editorial-empty-state" role="status"><h2>{isSearchMode?'Nenhum resultado encontrado':'Nenhum conteúdo publicado ainda'}</h2><p>{isSearchMode?'Tente outro termo ou navegue pelas páginas editoriais do portal.':'Esta página está publicada, mas ainda não possui conteúdos disponíveis.'}</p>{isSearchMode&&<Link className="button outline" to={`/${page.slug}`}>Voltar para {page.title}</Link>}</section>:<><div className="editorial-results-summary" role="status">{isSearchMode?`${allContents.length} resultado${allContents.length===1?'':'s'} encontrado${allContents.length===1?'':'s'}`:`${allContents.length} conteúdo${allContents.length===1?'':'s'}`}</div><div className={`news-reference-grid editorial-listing-grid${showEditorialAd?' has-news-ad':''}`} style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,template.columns||3))},minmax(0,1fr))`}}>{showEditorialAd&&<NewsAdSection config={editorialAd}/>} {contents.map(content=>{const contentPage=editorialReadModel.getPageById(content.pageId);const targetPage=contentPage?.slug||page.slug;return <Link className="pl-card news-reference-card" to={`/${targetPage}/${content.slug}`} key={content.id}><div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${content.coverImage||''})`}}>{content.tags[0]&&<span className="pl-badge">{content.tags[0]}</span>}</div><div className="pl-card-body news-reference-card-body"><h3>{content.title}</h3><p>{content.summary}</p><div className="pl-meta news-reference-meta"><span>{contentPage?.navigationLabel||'Editorial'}</span><span>{content.publishedAt?new Date(content.publishedAt).toLocaleDateString('pt-BR'):'Sem data'}</span><span>{content.author}</span></div></div></Link>})}</div></>}</main><PublicFooter/></div>
}
