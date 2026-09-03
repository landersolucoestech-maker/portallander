import type {CSSProperties,ReactNode} from 'react'
import {Link} from 'react-router-dom'
import type {SectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {heroResponsiveCssVariables} from '../../features/site-manager/sectionConfiguration'
import {PublicFooter,PublicHeader,type PublicNewsletterConfiguration} from './PublicChrome'

export type PageHeroVariant='default'|'editorial'|'institutional'|'legal'|'minimal'
export type PageLayoutVariant='full'|'content-sidebar'|'editorial'|'institutional'|'legal'|'detail'

export function PageShell({children,className='',newsletterConfiguration}:{children:ReactNode;className?:string;newsletterConfiguration?:PublicNewsletterConfiguration}){
  return <div className={`public-page pl-page-shell ${className}`.trim()}><PublicHeader/>{children}<PublicFooter newsletterConfiguration={newsletterConfiguration}/></div>
}

export function PageContainer({children,className='',as='div'}:{children:ReactNode;className?:string;as?:'div'|'main'|'section'|'article'}){
  const Tag=as
  return <Tag className={`public-shell pl-page-container ${className}`.trim()}>{children}</Tag>
}

export function Breadcrumbs({items}:{items:Array<{label:string;to?:string}>}){
  return <nav className="pl-page-breadcrumbs" aria-label="Breadcrumb">{items.map((item,index)=><span key={`${item.label}-${index}`}>{index>0&&<b aria-hidden="true">›</b>}{item.to?<Link to={item.to}>{item.label}</Link>:<span aria-current="page">{item.label}</span>}</span>)}</nav>
}

export function PageHero({configuration,variant='default',title,description,eyebrow,breadcrumbs=[]}:{configuration:SectionConfiguration;variant?:PageHeroVariant;title?:string;description?:string;eyebrow?:string;breadcrumbs?:Array<{label:string;to?:string}>}){
  if(!configuration.active)return null
  const background=configuration.imageUrl?`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.58)),url(${configuration.imageUrl})`:configuration.background
  const style={...heroResponsiveCssVariables(configuration),background,backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat',color:configuration.imageUrl?'#fff':configuration.textColor,textAlign:configuration.textAlign} as CSSProperties
  return <section className={`pl-global-page-hero pl-responsive-hero is-${variant}`} style={style} data-page-hero-variant={variant}>
    <PageContainer><div className="pl-global-page-hero-copy">{breadcrumbs.length>0&&<Breadcrumbs items={breadcrumbs}/>}<span className="pl-page-eyebrow" style={{color:configuration.accentColor}}>{eyebrow??configuration.eyebrow}</span><h1>{title??configuration.title}</h1>{(description??configuration.description)&&<p>{description??configuration.description}</p>}</div></PageContainer>
  </section>
}

export function ContentSidebarLayout({children,sidebar,variant='content-sidebar',className=''}:{children:ReactNode;sidebar?:ReactNode;variant?:PageLayoutVariant;className?:string}){
  return <div className={`pl-content-sidebar-layout is-${variant} ${sidebar?'has-sidebar':'without-sidebar'} ${className}`.trim()}><div className="pl-main-content">{children}</div>{sidebar&&<aside className="pl-secondary-content" aria-label="Conteúdo complementar">{sidebar}</aside>}</div>
}

export function PageSection({children,className='',tone='default'}:{children:ReactNode;className?:string;tone?:'default'|'surface'|'muted'|'dark'}){
  return <section className={`pl-page-section is-${tone} ${className}`.trim()}>{children}</section>
}

export function SectionHeading({title,description,eyebrow}:{title:string;description?:string;eyebrow?:string}){
  return <header className="pl-page-section-heading">{eyebrow&&<span>{eyebrow}</span>}<h2>{title}</h2>{description&&<p>{description}</p>}</header>
}

export function PromotionalRegion({children}:{children:ReactNode}){
  return <div className="pl-promotional-region"><PageContainer>{children}</PageContainer></div>
}
