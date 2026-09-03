import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {advertisingResponsiveCssVariables,withAdvertisingSectionLayout,type AdvertisingSectionConfiguration} from '../../features/site-manager/advertisingSectionLayout'
import type {SectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {getRuntimeDataProvider} from '../data/runtimeDataProvider'

function SmartLink({to,children,className}:{to:string;children:ReactNode;className?:string}){
  if(/^https?:\/\//i.test(to))return <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>
  return <Link to={to||'/'} className={className}>{children}</Link>
}

function AdvertisingAreaLink({config,children,className}:{config:AdvertisingSectionConfiguration;children:ReactNode;className?:string}){
  if(!config.adLinkEnabled||!config.linkUrl)return <>{children}</>
  if(config.adLinkTarget==='same'&&!/^https?:\/\//i.test(config.linkUrl))return <Link to={config.linkUrl} className={className}>{children}</Link>
  const href=/^https?:\/\//i.test(config.linkUrl)?config.linkUrl:`${window.location.pathname}#${config.linkUrl}`
  return <a href={href} target={config.adLinkTarget==='new'?'_blank':'_self'} rel={config.adLinkTarget==='new'?'noreferrer':undefined} className={className}>{children}</a>
}

export function PublicAdvertisementModule({configuration,placement='sidebar'}:{configuration:SectionConfiguration;placement?:'sidebar'|'editorial'}){
  const configured=withAdvertisingSectionLayout(configuration,'publicidade-lateral')
  if(!configured.active)return null
  const imageUrl=configured.imageUrl.trim()
  const imageFit=configured.adImageFit==='cover'?'cover':'contain'
  const description=configured.description.trim()
  const media=imageUrl?<img className="pl-home-sidebar-ad-image" src={imageUrl} alt={configured.adImageAlt||configured.title||'Publicidade'}/>:<div className="pl-home-sidebar-ad-fallback" role="presentation"><div className="pl-home-sidebar-ad-copy-static">{configured.eyebrow&&<span className="pl-home-sidebar-ad-kicker">{configured.eyebrow}</span>}{configured.title&&<h3>{configured.title}</h3>}{description&&<p>{description}</p>}{configured.linkLabel&&<span className="pl-home-sidebar-ad-link-label">{configured.linkLabel} →</span>}</div></div>
  return <section data-home-section="publicidade-lateral" data-ad-placement={placement} className={`pl-home-sidebar-ad official-publicidade-lateral pl-home-configurable-ad ${imageUrl?'has-creative':'is-empty'} ad-fit-${imageFit}`} aria-label="Publicidade Lateral" style={{...advertisingResponsiveCssVariables(configured),textAlign:configured.textAlign,background:imageUrl?'transparent':configured.background,color:configured.textColor,borderColor:imageUrl?'transparent':configured.accentColor,borderRadius:0}}><div className="pl-home-sidebar-ad-inner"><AdvertisingAreaLink config={configured} className="pl-home-ad-area-link">{media}</AdvertisingAreaLink></div></section>
}

export function PublicMostReadModule({configuration,limit=5}:{configuration:SectionConfiguration;limit?:number}){
  if(!configuration.active)return null
  const items=getRuntimeDataProvider().home.mostRead().slice(0,Math.max(1,Math.min(5,limit)))
  return <section data-home-section="mais-lidas" className="pl-most official-mais-lidas pl-editorial-sidebar-module" aria-label="Mais Lidas" style={{background:configuration.background,color:configuration.textColor,textAlign:configuration.textAlign}}><h2>{configuration.title||'MAIS LIDAS'}</h2><div className="pl-editorial-sidebar-list">{items.map((title,index)=><SmartLink className="pl-editorial-sidebar-item" to={configuration.linkUrl||'/noticias'} key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h3>{title}</h3><small>Há {index+3} horas</small></div></SmartLink>)}</div>{configuration.linkLabel&&<SmartLink className="pl-outline-button" to={configuration.linkUrl||'/noticias'}>{configuration.linkLabel}</SmartLink>}</section>
}
