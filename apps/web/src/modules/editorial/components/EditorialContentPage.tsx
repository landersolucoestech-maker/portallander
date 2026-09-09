import {Link} from 'react-router-dom'
import {withAdvertisingSectionLayout} from '../../site-manager/advertisingSectionLayout'
import {defaultSectionConfiguration} from '../../site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../site-manager/usePublicHomeSections'
import {useSectionConfiguration} from '../../site-manager/useSectionConfiguration'
import {AdvertiseHereSection} from '../../../pages/home/components/AdvertiseHereSection'
import {SpotifyReleasesSection} from '../../../pages/home/components/SpotifyReleasesSection'
import {defaultHomeAdConfig} from '../../../pages/home/models/adModel'
import {ContentSidebarLayout,PageContainer,PageHero,PageSection,PageShell,PromotionalRegion,SectionHeading} from '../../../shared/public/PublicPageArchitecture'
import {PublicAdvertisementModule,PublicMostReadModule} from '../../../shared/public/PublicEditorialModules'
import {useEditorialSeo} from '../hooks/useEditorialSeo'
import type {EditorialContent,EditorialPage} from '../model'
import {editorialReadModel} from '../repository'

export function EditorialContentPage({page,content}:{page:EditorialPage;content:EditorialContent}){
  useEditorialSeo(content)
  const {sections:homeSections}=usePublicHomeSections()
  const articleHero=useSectionConfiguration(page.id,'article-hero','Slug Page · Hero da Matéria')
  const articleContent=useSectionConfiguration(page.id,'article-content','Slug Page · Corpo da Matéria')
  const articleTags=useSectionConfiguration(page.id,'article-tags','Slug Page · Tags')
  const advertising=useSectionConfiguration(page.id,'editorial-ad','Publicidade Editorial')
  const mostRead=homeSections['mais-lidas']??defaultSectionConfiguration('mais-lidas','Mais Lidas')
  const releases=homeSections.lancamentos??defaultSectionConfiguration('lancamentos','Lançamentos')
  const advertiseHere=homeSections['anuncie-aqui']??defaultSectionConfiguration('anuncie-aqui','Anuncie Aqui')
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')
  const adLayout=withAdvertisingSectionLayout(advertiseHere,'anuncie-aqui')
  const related=editorialReadModel.listPageContents(page.id).filter(item=>item.id!==content.id).slice(0,3)
  const heroConfiguration={...articleHero,imageUrl:content.coverImage||articleHero.imageUrl}
  const publishedLabel=content.publishedAt?new Date(content.publishedAt).toLocaleDateString('pt-BR'):null

  return <PageShell className="editorial-detail-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={heroConfiguration} variant="editorial" title={content.title} description={content.subtitle} eyebrow={content.tags[0]||page.navigationLabel} breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel,to:`/${page.slug}`},{label:content.title}]}/>
    <main style={{background:articleContent.background,color:articleContent.textColor,textAlign:articleContent.textAlign}}>
      {articleContent.active&&<PageSection><PageContainer><ContentSidebarLayout variant="detail" sidebar={<><PublicAdvertisementModule configuration={advertising} placement="editorial"/><PublicMostReadModule configuration={mostRead} limit={5}/><SpotifyReleasesSection configuration={releases} variant="sidebar" limit={3}/></>}>
        <article className="pl-reading-column pl-article-content">
          <div className="pl-article-meta"><span>Por {content.author}</span>{publishedLabel&&<span>{publishedLabel}</span>}</div>
          {content.coverImage&&<figure className="pl-article-cover"><img src={content.coverImage} alt={content.coverImageAlt||content.title}/></figure>}
          <div className="pl-article-body">{content.body.map((block,index)=>block.type==='heading'?<h2 key={index}>{block.text}</h2>:block.type==='quote'?<blockquote key={index}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:<p key={index}>{block.text}</p>)}</div>
          {articleTags.active&&content.tags.length>0&&<div className="pl-article-tags" aria-label="Tags" style={{background:articleTags.background,color:articleTags.textColor}}><b style={{color:articleTags.accentColor}}>TAGS:</b>{content.tags.slice(0,Math.max(1,articleTags.itemLimit||8)).map(tag=><span key={tag} style={{borderColor:articleTags.accentColor}}>{tag}</span>)}</div>}
          <div className="pl-article-share" aria-label="Compartilhar"><strong>COMPARTILHAR</strong><a href={`https://wa.me/?text=${encodeURIComponent(`${content.title} ${window.location.href}`)}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">Facebook</a></div>
        </article>
      </ContentSidebarLayout></PageContainer></PageSection>}
      {related.length>0&&<PageSection className="pl-related-content"><PageContainer><SectionHeading eyebrow="CONTINUE LENDO" title="CONTEÚDOS RELACIONADOS"/><div className="pl-related-grid">{related.map(item=><Link className="pl-card" to={`/${page.slug}/${item.slug}`} key={item.id}>{item.coverImage&&<div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${item.coverImage})`}}/>}<div className="pl-card-body"><h3>{item.title}</h3><p>{item.summary}</p></div></Link>)}</div></PageContainer></PageSection>}
      {adLayout.active&&<PromotionalRegion><AdvertiseHereSection layout={adLayout} config={{...defaultHomeAdConfig,active:true,title:adLayout.title,subtitle:adLayout.description||adLayout.eyebrow,buttonLabel:adLayout.linkLabel,buttonUrl:adLayout.linkUrl,image:adLayout.imageUrl,imageAlt:adLayout.adImageAlt,align:adLayout.textAlign==='center'?'center':adLayout.textAlign==='right'?'right':'left'}}/></PromotionalRegion>}
    </main>
  </PageShell>
}
