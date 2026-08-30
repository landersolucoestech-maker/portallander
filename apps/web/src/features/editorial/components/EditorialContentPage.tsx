import { Link } from 'react-router-dom'
import type { EditorialContent, EditorialPage } from '../model'
import { PublicFooter, PublicHeader } from '../../../shared/public/PublicChrome'
import { useEditorialSeo } from '../hooks/useEditorialSeo'

export function EditorialContentPage({page,content}:{page:EditorialPage;content:EditorialContent}){
  useEditorialSeo(content)
  return <div className="article-page"><PublicHeader/><section className="article-hero"><div className="article-hero-inner"><div className="article-breadcrumb"><Link to="/">Início</Link><span>›</span><Link to={`/${page.slug}`}>{page.title}</Link><span>›</span><span>{content.title}</span></div><div className="article-category">{content.tags[0]||page.title}</div><h1>{content.title}</h1>{content.subtitle&&<p className="article-dek">{content.subtitle}</p>}<div className="article-author-row"><div className="article-author"><span className="article-author-avatar">PL</span><span>Por {content.author}</span>{content.publishedAt&&<><i/><span>{new Date(content.publishedAt).toLocaleDateString('pt-BR')}</span></>}</div></div></div></section><main className="article-shell"><div className="article-layout"><article className="article-content">{content.coverImage&&<figure><img src={content.coverImage} alt={content.coverImageAlt||content.title}/></figure>}{content.body.map((block,index)=>block.type==='heading'?<h2 key={index}>{block.text}</h2>:block.type==='quote'?<blockquote key={index}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:<p key={index}>{block.text}</p>)}{content.tags.length>0&&<div className="article-tags"><b>TAGS:</b>{content.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}</article></div></main><PublicFooter/></div>
}
