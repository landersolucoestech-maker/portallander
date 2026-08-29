import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'
import { readFooterBrandConfig, type FooterBrandConfig } from '../branding/models/footerBrandModel'
import { readHeaderBrandConfig, type HeaderBrandConfig } from '../branding/models/headerBrandModel'
import { editorialReadModel } from '../../features/editorial/repository'

function PublicBrand(){
  const [config,setConfig]=useState<HeaderBrandConfig>(()=>readHeaderBrandConfig())
  useEffect(()=>{
    const sync=()=>setConfig(readHeaderBrandConfig())
    window.addEventListener('portal-lander:header-brand-updated',sync)
    return()=>window.removeEventListener('portal-lander:header-brand-updated',sync)
  },[])
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
  const submitSearch=(e:React.FormEvent)=>{e.preventDefault();const q=query.trim();if(!q)return;navigate(`/noticias?busca=${encodeURIComponent(q)}`);setSearchOpen(false);setOpen(false)}
  return <><header className="public-header"><div className="public-nav"><PublicBrand/><nav className={open?'public-links open':'public-links'}>{roots.map(page=>{const nested=children(page.id);return <div className="public-nav-item" key={page.id}><NavLink to={`/${page.slug}`}>{page.navigationLabel}</NavLink>{nested.length>0&&<div className="public-submenu">{nested.map(child=><NavLink key={child.id} to={`/${child.slug}`}>{child.navigationLabel}</NavLink>)}</div>}</div>})}<NavLink to="/colabore">Colabore</NavLink></nav><div className="nav-actions"><button type="button" className="public-search" aria-label={searchOpen?'Fechar busca':'Buscar'} aria-expanded={searchOpen} onClick={()=>setSearchOpen(v=>!v)}>{searchOpen?<X size={18}/>:<Search size={18}/>}</button><Link className="public-internal" to="/app">Área interna</Link><button type="button" className="public-menu" onClick={()=>setOpen(!open)} aria-label="Abrir menu">{open?<X/>:<Menu/>}</button></div></div></header>{searchOpen&&<div className="public-search-panel" role="search"><form onSubmit={submitSearch}><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar notícias, artistas, músicas..." aria-label="Termo de busca"/><button type="submit">BUSCAR</button><button type="button" className="public-search-close" onClick={()=>setSearchOpen(false)} aria-label="Fechar busca"><X size={18}/></button></form></div>}</>
}

export function PublicFooter(){
  const [footerBrand,setFooterBrand]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  useEffect(()=>{
    const sync=()=>setFooterBrand(readFooterBrandConfig())
    window.addEventListener('portal-lander:footer-brand-updated',sync)
    return()=>window.removeEventListener('portal-lander:footer-brand-updated',sync)
  },[])
  const menuPages=editorialReadModel.listMenuPages().filter(page=>!page.parentId)
  return <><section className="pl-newsletter"><div className="public-shell"><div className="pl-newsletter-brand"><img src={portalLogo} alt=""/><strong>RECEBA AS PRINCIPAIS NOTÍCIAS<br/>DIRETO NO SEU E-MAIL!</strong></div><form onSubmit={e=>e.preventDefault()}><input type="email" placeholder="Seu melhor e-mail"/><button>INSCREVER-SE</button></form><div className="pl-social"><b>SIGA O PORTAL LANDER</b>{['IG','TK','YT','X','SP'].map(x=><span key={x}>{x}</span>)}</div></div></section><footer className="public-footer"><div className="public-shell"><div className="pl-footer-grid"><div className="pl-footer-about">{footerBrand.active&&footerBrand.image&&<img src={footerBrand.image} alt={footerBrand.imageAlt||'Portal Lander'} style={{width:`${footerBrand.width}px`,maxWidth:'100%',height:'auto'}}/>}<p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div><div className="pl-footer-col"><h4>NAVEGAÇÃO</h4>{menuPages.map(page=><Link key={page.id} to={`/${page.slug}`}>{page.navigationLabel}</Link>)}</div><div className="pl-footer-col"><h4>INSTITUCIONAL</h4><Link to="/sobre">Sobre o Portal</Link><Link to="/contato">Fale Conosco</Link><Link to="/colabore">Colabore</Link><Link to="/politica">Política de Privacidade</Link></div><div className="pl-footer-col"><h4>AJUDA</h4><Link to="/faq">Perguntas Frequentes</Link><Link to="/anuncie">Como Anunciar</Link><Link to="/regras">Regras de Publicação</Link></div><div className="pl-footer-col"><h4>COLABORE</h4><Link to="/colabore">Envie sua notícia</Link><Link to="/colabore">Envie seu vídeo</Link><Link to="/parcerias">Parcerias</Link></div></div><div className="pl-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></div></footer></>
}
