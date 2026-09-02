import type {CSSProperties} from 'react'
import { Link } from 'react-router-dom'
import type { EditorialContent, EditorialPage } from '../model'
import { useSectionConfiguration } from '../../site-manager/useSectionConfiguration'
import { PublicFooter, PublicHeader } from '../../../shared/public/PublicChrome'
import { useEditorialSeo } from '../hooks/useEditorialSeo'

export function EditorialContentPage({page,content}:{page:EditorialPage;content:EditorialContent}){
  useEditorialSeo(content)
  const articleHero=useSectionConfiguration('editorial-template','article-hero','Slug Page · Hero da Matéria')
  const articleContent=useSectionConfiguration('editorial-template','article-content','Slug Page · Corpo da Matéria')
  const articleTags=useSectionConfiguration('editorial-template','article-tags','Slug Page · Tags')
  const heroHeights={'--pl-hero-height-desktop':`${articleHero.heroHeightDesktop}px`,'--pl-hero-height-tablet':`${articleHero.heroHeightTablet}px`,'--pl-hero-height-mobile':`${articleHero.heroHeightMobile}px`} as CSSProperties
  return <div className="article-page" style={{background:articleContent.background,color:articleContent.textColor}}><PublicHeader/>
    {articleHero.active&&<section className="article-hero pl-responsive-hero" style={{...heroHeights,background:articleHero.background,color:articleHero.textColor,textAlign:articleHero.textAlign}}><div className="article-hero-inner"><div className="article-breadcrumb"><Link to="/">Início</Link><span>›</span><Link to={`/${page.slug}`}>{page.title}</Link><span>›</span><span>{content.title}</span></div><div className="article-category" style={{color:articleHero.accentColor}}>{content.tags[0]||page.title}</div><h1>{content.title}</h1>{content.subtitle&&<p className="article-dek">{content.subtitle}</p>}<div className="article-author-row"><div className="article-author"><span className="article-author-avatar" style={{background:articleHero.accentColor}}>PL</span><span>Por {content.author}</span>{content.publishedAt&&<><i/><span>{new Date(content.publishedAt).toLocaleDateString('pt-BR')}</span></>}</div></div></div></section>}
    {articleContent.active&&<main className="article-shell" style={{background:articleContent.background,color:articleContent.textColor,textAlign:articleContent.textAlign}}><div className="article-layout"><article className="article-content">{content.coverImage&&<figure><img src={content.coverImage} alt={content.coverImageAlt||content.title}/></figure>}{content.body.map((block,index)=>block.type==='heading'?<h2 key={index}>{block.text}</h2>:block.type==='quote'?<blockquote key={index}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:<p key={index}>{block.text}</p>)}{articleTags.active&&content.tags.length>0&&<div className="article-tags" style={{background:articleTags.background,color:articleTags.textColor}}><b style={{color:articleTags.accentColor}}>TAGS:</b>{content.tags.slice(0,Math.max(1,articleTags.itemLimit||8)).map(tag=><span key={tag} style={{borderColor:articleTags.accentColor}}>{tag}</span>)}</div>}</article></div></main>}
    <PublicFooter/></div>
}
