import { Bell, Building2, ChevronDown, FileImage, FileText, Images, LayoutDashboard, Newspaper, Palette, RotateCcw, Save, Settings, Star, Tags, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { defaultHeaderBrandConfig, readHeaderBrandConfig, resetHeaderBrandConfig, writeHeaderBrandConfig, type HeaderBrandConfig } from './headerBrandModel'
import { defaultFooterBrandConfig, readFooterBrandConfig, resetFooterBrandConfig, writeFooterBrandConfig, type FooterBrandConfig } from './footerBrandModel'
import { defaultHomeAdConfig, readHomeAdConfig, resetHomeAdConfig, writeHomeAdConfig, type HomeAdConfig } from './adModel'

const siteNav = [
  ['Visão geral', LayoutDashboard, '/app/site'],
  ['Marca & Logos', Palette, '/app/site/marca'],
  ['Home · Hero', Star, '/app/site/home/hero'],
  ['Home · Anúncio', Newspaper, '/app/site/home/anuncio'],
  ['Conteúdos', FileText, '/app/site/conteudos'],
  ['Mídia', Images, '/app/site/midia'],
  ['Categorias', Tags, '/app/site/categorias'],
  ['Mídia Kit', Newspaper, '/app/site/midia-kit'],
  ['Configurações', Settings, '/app/site/configuracoes'],
] as const

async function fileToDataUrl(file:File){
  return await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader()
    reader.onload=()=>resolve(String(reader.result||''))
    reader.onerror=()=>reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function uploadButton(ref:React.RefObject<HTMLInputElement|null>, onFile:(file?:File)=>void){
  return <><input ref={ref} hidden type="file" accept="image/*" onChange={e=>onFile(e.target.files?.[0])}/><button type="button" onClick={()=>ref.current?.click()}><Upload size={15}/> Substituir logo</button></>
}

function BrandManagerPage(){
  const [header,setHeader]=useState<HeaderBrandConfig>(()=>readHeaderBrandConfig())
  const [footer,setFooter]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [ad,setAd]=useState<HomeAdConfig>(()=>readHomeAdConfig())
  const [saved,setSaved]=useState(false)
  const headerRef=useRef<HTMLInputElement>(null)
  const footerRef=useRef<HTMLInputElement>(null)
  const adRef=useRef<HTMLInputElement>(null)

  const upload=async(file:File|undefined, target:'header'|'footer'|'ad')=>{
    if(!file||!file.type.startsWith('image/'))return
    const data=await fileToDataUrl(file)
    setSaved(false)
    if(target==='header')setHeader(v=>({...v,image:data,imageAlt:v.imageAlt||file.name,active:true,deleted:false}))
    if(target==='footer')setFooter(v=>({...v,image:data,imageAlt:v.imageAlt||file.name,active:true}))
    if(target==='ad')setAd(v=>({...v,logo:data,logoAlt:v.logoAlt||file.name}))
  }

  const save=()=>{
    writeHeaderBrandConfig(header)
    writeFooterBrandConfig(footer)
    writeHomeAdConfig(ad)
    setSaved(true)
  }
  const reset=()=>{
    resetHeaderBrandConfig();resetFooterBrandConfig();resetHomeAdConfig()
    setHeader(defaultHeaderBrandConfig);setFooter(defaultFooterBrandConfig);setAd(defaultHomeAdConfig);setSaved(false)
  }

  return <div className="app-shell brand-assets-manager-overlay">
    <aside className="sidebar">
      <div className="sidebar-head"><Link to="/" className="brand"><span className="brand-mark">L</span></Link><span>SITE</span></div>
      <nav>{siteNav.map(([label,Icon,to])=><NavLink key={to} end={to==='/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">Gerenciador do Site</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header>
      <main className="workspace-main brand-assets-main">
        <div className="brand-assets-top"><div><span>IDENTIDADE VISUAL</span><h1>Marca & Logos</h1><p>Gerencie as logos exibidas no cabeçalho, rodapé e no bloco “Anuncie Aqui” da página inicial.</p></div><div className="brand-assets-actions"><button onClick={reset}><RotateCcw size={16}/> Restaurar padrões</button><button className="primary" onClick={save}><Save size={16}/> Salvar alterações</button></div></div>
        {saved&&<div className="brand-assets-success">Alterações salvas e aplicadas ao site público.</div>}
        <div className="brand-assets-grid">
          <section className="brand-asset-card">
            <div className="brand-asset-title"><FileImage size={19}/><div><h2>Logo do cabeçalho</h2><p>Marca principal no topo de todas as páginas públicas.</p></div></div>
            <div className="brand-asset-preview header-preview">{header.active&&!header.deleted&&header.image?<img src={header.image} alt={header.imageAlt}/>:<span>Logo desativada</span>}</div>
            <div className="brand-asset-controls">{uploadButton(headerRef,file=>void upload(file,'header'))}<label>Texto alternativo<input value={header.imageAlt} onChange={e=>{setSaved(false);setHeader(v=>({...v,imageAlt:e.target.value}))}}/></label><label>Largura · {header.width}px<input type="range" min="80" max="280" value={header.width} onChange={e=>{setSaved(false);setHeader(v=>({...v,width:Number(e.target.value)}))}}/></label><label>Status<select value={header.active&&!header.deleted?'active':'inactive'} onChange={e=>{setSaved(false);setHeader(v=>({...v,active:e.target.value==='active',deleted:false}))}}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label></div>
          </section>
          <section className="brand-asset-card">
            <div className="brand-asset-title"><FileImage size={19}/><div><h2>Logo do rodapé</h2><p>Logo exibida na área institucional no final do portal.</p></div></div>
            <div className="brand-asset-preview footer-preview">{footer.active&&footer.image?<img src={footer.image} alt={footer.imageAlt}/>:<span>Logo desativada</span>}</div>
            <div className="brand-asset-controls">{uploadButton(footerRef,file=>void upload(file,'footer'))}<label>Texto alternativo<input value={footer.imageAlt} onChange={e=>{setSaved(false);setFooter(v=>({...v,imageAlt:e.target.value}))}}/></label><label>Largura · {footer.width}px<input type="range" min="70" max="260" value={footer.width} onChange={e=>{setSaved(false);setFooter(v=>({...v,width:Number(e.target.value)}))}}/></label><label>Status<select value={footer.active?'active':'inactive'} onChange={e=>{setSaved(false);setFooter(v=>({...v,active:e.target.value==='active'}))}}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label></div>
          </section>
          <section className="brand-asset-card">
            <div className="brand-asset-title"><Newspaper size={19}/><div><h2>Logo · Anuncie Aqui</h2><p>Logo opcional exibida dentro da seção de anúncio da página inicial.</p></div></div>
            <div className="brand-asset-preview ad-preview">{ad.logo?<img src={ad.logo} alt={ad.logoAlt}/>:<span>Nenhuma logo configurada</span>}</div>
            <div className="brand-asset-controls">{uploadButton(adRef,file=>void upload(file,'ad'))}<label>Texto alternativo<input value={ad.logoAlt} onChange={e=>{setSaved(false);setAd(v=>({...v,logoAlt:e.target.value}))}}/></label><label>Largura · {ad.logoWidth}px<input type="range" min="60" max="320" value={ad.logoWidth} onChange={e=>{setSaved(false);setAd(v=>({...v,logoWidth:Number(e.target.value)}))}}/></label><button type="button" className="danger" onClick={()=>{setSaved(false);setAd(v=>({...v,logo:''}))}}>Remover logo do anúncio</button></div>
          </section>
        </div>
      </main>
    </div>
  </div>
}

function applyFooterBrand(config:FooterBrandConfig){
  document.querySelectorAll<HTMLImageElement>('.public-footer .pl-footer-about img').forEach(img=>{
    img.style.display=config.active&&config.image?'block':'none'
    if(config.active&&config.image){img.src=config.image;img.alt=config.imageAlt||'Portal Lander';img.style.width=`${config.width}px`;img.style.maxWidth='100%';img.style.height='auto'}
  })
}

export function BrandAssetsBridge(){
  const location=useLocation()
  useEffect(()=>{
    const sync=()=>applyFooterBrand(readFooterBrandConfig())
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    window.addEventListener('portal-lander:footer-brand-updated',sync)
    return()=>{observer.disconnect();window.removeEventListener('portal-lander:footer-brand-updated',sync)}
  },[location.pathname])
  if(location.pathname==='/app/site/marca')return <BrandManagerPage/>
  return null
}
