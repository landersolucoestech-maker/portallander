import { Link } from 'react-router-dom'
import { isNewsAdValid, type NewsAdConfig } from '../models/newsAdModel'

export function NewsAdSection({config}:{config:NewsAdConfig}){
  if(!isNewsAdValid(config))return null
  const backgroundStyle=config.background?{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.72)),url(${config.background})`}:undefined
  const external=/^https?:\/\//i.test(config.buttonUrl)
  return <aside className="news-reference-sidebar-ad" aria-label="Publicidade"><div className={`news-sidebar-ad-content align-${config.align}`} style={backgroundStyle}>{config.image&&<img className="news-sidebar-ad-image" src={config.image} alt={config.imageAlt}/>}<div className="news-sidebar-ad-copy">{config.label&&<span className="news-sidebar-ad-label">{config.label}</span>}{config.title&&<strong>{config.title}</strong>}{config.subtitle&&<p>{config.subtitle}</p>}{config.buttonLabel&&(external||config.openInNewTab?<a href={config.buttonUrl||'/anuncie'} target={config.openInNewTab?'_blank':undefined} rel={config.openInNewTab?'noreferrer':undefined}>{config.buttonLabel}</a>:<Link to={config.buttonUrl||'/anuncie'}>{config.buttonLabel}</Link>)}{(config.advertiser||config.campaign)&&<small>{[config.advertiser,config.campaign].filter(Boolean).join(' · ')}</small>}</div></div></aside>
}
