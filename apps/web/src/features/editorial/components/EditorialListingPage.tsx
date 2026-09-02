import { Link, useLocation } from 'react-router-dom'
import {useMemo,type CSSProperties} from 'react'
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
  const heroFallback=useMemo(()=>({title:page.title.toUpperCase(),description:page.description,eyebrow:'AGORA NO PORTAL'}),[page.title,page.description])
  const hero=useSectionConfiguration(page.id,'editorial-hero',page.title,heroFallback)
  const template=useSectionConfiguration('editorial-template','editorial-template','Conteúdos / Grid Editorial')
  const searchQuery=new URLSearchParams(location.search).get('busca')?.trim()||''
  const isSearchMode=Boolean(searchQuery)
  const allContents=isSearchMode?editorialReadModel.searchPublicContents(searchQuery):editorialReadModel.listPageContents(page.id)
  const contents=allContents.slice(0,Math.max(1,template.itemLimit||12))
  const editorialAd=useNewsAdRuntime(!isSearchMode)
  const showEditorialAd=!isSearchMode&&isNewsAdValid(editorialAd)
  useEditorialSeo(page)

  const heroHeights={'--pl-hero-height-desktop':`${hero.heroHeightDesktop}px`,'--pl-hero-height-tablet':`${hero.heroHeightTablet}px`,'--pl-hero-height-mobile':`${hero.heroHeightMobile}px`} as CSSProperties
  const heroStyle={
    ...heroHeights,
    background:hero.background,
    color:hero.imageUrl?'#fff':hero.textColor,
    textAlign:hero.textAlign,
    ...(hero.imageUrl?{backgroundImage:`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.48)),url(${hero.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat'}:{}),
  }

  return <div className="public-page news-reference-page"><PublicHeader/>{hero.active&&<section className="public-standard-page-hero editorial-page-hero pl-responsive-hero" style={heroStyle}><div className="public-shell"><div className="news-page-intro-copy"><span style={{color:hero.accentColor}}>Início › {isSearchMode?'BUSCA':hero.eyebrow}</span><h1>{isSearchMode?'RESULTADOS':hero.title}</h1><p>{isSearchMode?`Resultados editoriais para “${searchQuery}”.`:hero.description}</p></div></div></section>}<main className="pl-page public-shell" style={{background:template.background,color:template.textColor,textAlign:template.textAlign}}>{!template.active&&!isSearchMode?<section className="editorial-empty-state" role="status"><h2>Seção editorial temporariamente oculta</h2><p>O grid editorial está desativado na configuração de Páginas.</p></section>:allContents.length===0?<section className="editorial-empty-state" role="status"><h2>{isSearchMode?'Nenhum resultado encontrado':'Nenhum conteúdo publicado ainda'}</h2><p>{isSearchMode?'Tente outro termo ou navegue pelas páginas editoriais do portal.':'Esta página está publicada, mas ainda não possui conteúdos disponíveis.'}</p>{isSearchMode&&<Link className="button outline" to={`/${page.slug}`}>Voltar para {page.title}</Link>}</section>:<><div className="editorial-results-summary" role="status">{isSearchMode?`${allContents.length} resultado${allContents.length===1?'':'s'} encontrado${allContents.length===1?'':'s'}`:`${allContents.length} conteúdo${allContents.length===1?'':'s'}`}</div><div className={`news-reference-grid editorial-listing-grid${showEditorialAd?' has-news-ad':''}`} style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,template.columns||3))},minmax(0,1fr))`}}>{showEditorialAd&&<NewsAdSection config={editorialAd}/>} {contents.map(content=>{const contentPage=editorialReadModel.getPageById(content.pageId);const targetPage=contentPage?.slug||page.slug;return <Link className="pl-card news-reference-card" to={`/${targetPage}/${content.slug}`} key={content.id}><div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${content.coverImage||''})`}}>{content.tags[0]&&<span className="pl-badge">{content.tags[0]}</span>}</div><div className="pl-card-body news-reference-card-body"><h3>{content.title}</h3><p>{content.summary}</p><div className="pl-meta news-reference-meta"><span>{contentPage?.navigationLabel||'Editorial'}</span><span>{content.publishedAt?new Date(content.publishedAt).toLocaleDateString('pt-BR'):'Sem data'}</span><span>{content.author}</span></div></div></Link>})}</div></>}</main><PublicFooter/></div>
}
