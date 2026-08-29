import { Menu, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'
import { readFooterBrandConfig, type FooterBrandConfig } from '../branding/models/footerBrandModel'
import { readHeaderBrandConfig, type HeaderBrandConfig } from '../branding/models/headerBrandModel'
import { editorialReadModel } from '../../features/editorial/repository'

const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim()

function PublicBrand(){
  const [config,setConfig]=useState<HeaderBrandConfig>(()=>readHeaderBrandConfig())
  useEffect(()=>{const sync=()=>setConfig(readHeaderBrandConfig());window.addEventListener('portal-lander:header-brand-updated',sync);return()=>window.removeEventListener('portal-lander:header-brand-updated',sync)},[])
  if(!config.active||config.deleted||!config.image)return null
  const justifyContent=config.alignment==='left'?'flex-start':config.alignment==='right'?'flex-end':'center'
  const style={width:config.width,height:config.height,flex:`0 0 ${config.width}px`,justifyContent}
  const image=<img src={config.image} alt={config.imageAlt||'Portal Lander'} style={{width:'100%',height:'100%',maxWidth:'100%',objectFit:'contain',objectPosition:`${config.alignment} center`}}/>
  if(/^https?:\/\//i.test(config.link))return <a href={config.link} className="public-brand" aria-label="Portal Lander" style={style}>{image}</a>
  const to=config.link.startsWith('/')?config.link:`/${config.link}`
  return <Link to={to||'/'} className="public-brand" aria-label="Portal Lander" style={style}>{image}</Link>
}

export function PublicHeader(){
  const [open,setOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [query,setQuery]=useState('')
  const navigate=useNavigate()
  const menuPages=editorialReadModel.listMenuPages()
  const roots=menuPages.filter(page=>!page.parentId)
  const children=(id:string)=>menuPages.filter(page=>page.parentId===id)
  const normalizedQuery=normalizeSearch(query)
  const suggestions=useMemo(()=>{
    if(!normalizedQuery)return []
    return editorialReadModel.contents.filter(content=>{
      const page=editorialReadModel.getPageById(content.pageId)
      return normalizeSearch([content.title,content.summary,content.author,...content.tags,page?.title||''].join(' ')).includes(normalizedQuery)
    }).slice(0,6)
  },[normalizedQuery])
  const closeSearch=()=>{setSearchOpen(false);setQuery('')}
  const submitSearch=(e:React.FormEvent)=>{e.preventDefault();const q=query.trim();if(!q)return;navigate(`/noticias?busca=${encodeURIComponent(q)}`);closeSearch();setOpen(false)}

  return <><header className="public-header"><div className="public-nav"><PublicBrand/><nav className={open?'public-links open':'public-links'}>{roots.map(page=>{const nested=children(page.id);return <div className="public-nav-item" key={page.id}><NavLink to={`/${page.slug}`}>{page.navigationLabel}</NavLink>{nested.length>0&&<div className="public-submenu">{nested.map(child=><NavLink key={child.id} to={`/${child.slug}`}>{child.navigationLabel}</NavLink>)}</div>}</div>})}<NavLink to="/colabore">Colabore</NavLink></nav><div className="nav-actions"><button type="button" className="public-search" aria-label={searchOpen?'Fechar busca':'Buscar'} aria-expanded={searchOpen} onClick={()=>{setSearchOpen(value=>!value);setQuery('')}}>{searchOpen?<X size={18}/>:<Search size={18}/>}</button><Link className="public-internal" to="/app">Área interna</Link><button type="button" className="public-menu" onClick={()=>setOpen(!open)} aria-label="Abrir menu">{open?<X/>:<Menu/>}</button></div></div></header>{searchOpen&&<div className="public-search-panel" role="search"><form onSubmit={submitSearch}><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')closeSearch()}} placeholder="Buscar notícias, artistas, músicas..." aria-label="Termo de busca"/><button type="submit">BUSCAR</button><button type="button" className="public-search-close" onClick={closeSearch} aria-label="Fechar busca"><X size={18}/></button></form>{normalizedQuery&&suggestions.length>0&&<div className="public-search-suggestions" role="listbox" aria-label="Sugestões de conteúdo">{suggestions.map(content=>{const page=editorialReadModel.getPageById(content.pageId);if(!page)return null;return <Link className="public-search-suggestion" to={`/${page.slug}/${content.slug}`} onClick={closeSearch} key={content.id}><span><small>{page.navigationLabel}</small><strong>{content.title}</strong></span><b aria-hidden="true">→</b></Link>})}</div>}{normalizedQuery&&suggestions.length===0&&<div className="public-search-suggestions" role="status"><span className="public-search-empty">Nenhum conteúdo editorial corresponde à busca.</span></div>}</div>}</>
}

export function PublicFooter(){
  const [footerBrand,setFooterBrand]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [newsletterUnavailable,setNewsletterUnavailable]=useState(false)
  useEffect(()=>{const sync=()=>setFooterBrand(readFooterBrandConfig());window.addEventListener('portal-lander:footer-brand-updated',sync);return()=>window.removeEventListener('portal-lander:footer-brand-updated',sync)},[])
  const menuPages=editorialReadModel.listMenuPages().filter(page=>!page.parentId)
  const institutional=[['sobre','Sobre o Portal'],['contato','Fale Conosco'],['politica','Política de Privacidade']].filter(([slug])=>Boolean(editorialReadModel.getPageBySlug(slug)))
  const help=[['faq','Perguntas Frequentes'],['regras','Regras de Publicação']].filter(([slug])=>Boolean(editorialReadModel.getPageBySlug(slug)))
  const partnerships=editorialReadModel.getPageBySlug('parcerias')
  return <><section className="pl-newsletter"><div className="public-shell"><div className="pl-newsletter-brand"><img src={portalLogo} alt=""/><strong>RECEBA AS PRINCIPAIS NOTÍCIAS<br/>DIRETO NO SEU E-MAIL!</strong></div><form onSubmit={e=>{e.preventDefault();setNewsletterUnavailable(true)}}><input required type="email" placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail"/><button type="submit">INSCREVER-SE</button>{newsletterUnavailable&&<small className="pl-newsletter-status" role="status">Newsletter ainda não conectada. Nenhuma inscrição foi enviada.</small>}</form><div className="pl-social"><b>SIGA O PORTAL LANDER</b>{['IG','TK','YT','X','SP'].map(x=><span key={x}>{x}</span>)}</div></div></section><footer className="public-footer"><div className="public-shell"><div className="pl-footer-grid"><div className="pl-footer-about">{footerBrand.active&&footerBrand.image&&<img src={footerBrand.image} alt={footerBrand.imageAlt||'Portal Lander'} style={{width:`${footerBrand.width}px`,maxWidth:'100%',height:'auto'}}/>}<p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div><div className="pl-footer-col"><h4>NAVEGAÇÃO</h4>{menuPages.map(page=><Link key={page.id} to={`/${page.slug}`}>{page.navigationLabel}</Link>)}</div><div className="pl-footer-col"><h4>INSTITUCIONAL</h4>{institutional.map(([slug,label])=><Link key={slug} to={`/${slug}`}>{label}</Link>)}<Link to="/colabore">Colabore</Link></div><div className="pl-footer-col"><h4>AJUDA</h4>{help.map(([slug,label])=><Link key={slug} to={`/${slug}`}>{label}</Link>)}<Link to="/anuncie">Como Anunciar</Link></div><div className="pl-footer-col"><h4>COLABORE</h4><Link to="/colabore">Envie sua notícia</Link><Link to="/colabore">Envie seu vídeo</Link>{partnerships&&<Link to="/parcerias">Parcerias</Link>}</div></div><div className="pl-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></div></footer></>
}
