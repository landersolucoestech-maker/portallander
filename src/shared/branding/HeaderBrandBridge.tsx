import { Image as ImageIcon, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { defaultHeaderBrandConfig, readHeaderBrandConfig, resetHeaderBrandConfig, writeHeaderBrandConfig, type HeaderBrandConfig } from './headerBrandModel'

function applyBrand(config:HeaderBrandConfig){
  const anchor=document.querySelector<HTMLAnchorElement>('.public-header .public-brand')
  if(!anchor)return
  const img=anchor.querySelector<HTMLImageElement>('img')
  const hidden=!config.active||config.deleted||!config.image
  anchor.style.display=hidden?'none':'inline-flex'
  if(hidden)return
  anchor.style.width=`${config.width}px`
  anchor.style.height=`${config.height}px`
  anchor.style.flex=`0 0 ${config.width}px`
  anchor.style.justifyContent=config.alignment==='left'?'flex-start':config.alignment==='right'?'flex-end':'center'
  anchor.setAttribute('href',/^https?:\/\//i.test(config.link)?config.link:`#${config.link.startsWith('/')?config.link:`/${config.link}`}`)
  if(img){
    img.src=config.image
    img.alt=config.imageAlt||'Portal Lander'
    img.style.width='100%'
    img.style.height='100%'
    img.style.maxWidth='100%'
    img.style.objectFit='contain'
    img.style.objectPosition=`${config.alignment} center`
  }
}

async function fileToDataUrl(file:File){
  return await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader()
    reader.onload=()=>resolve(String(reader.result||''))
    reader.onerror=()=>reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function HeaderBrandEditor(){
  const [draft,setDraft]=useState<HeaderBrandConfig>(()=>readHeaderBrandConfig())
  const [saved,setSaved]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const update=(patch:Partial<HeaderBrandConfig>)=>{setSaved(false);setDraft(current=>({...current,...patch}))}
  const save=()=>{writeHeaderBrandConfig(draft);setSaved(true)}
  const reset=()=>{resetHeaderBrandConfig();setDraft(defaultHeaderBrandConfig);setSaved(false)}
  const remove=()=>update({deleted:true,active:false,image:''})
  const upload=async(file?:File)=>{if(!file||!file.type.startsWith('image/'))return;update({image:await fileToDataUrl(file),deleted:false,active:true,imageAlt:draft.imageAlt||file.name.replace(/\.[^.]+$/,'')});if(fileRef.current)fileRef.current.value=''}

  return <div className="header-brand-editor-overlay">
    <div className="header-brand-editor-page">
      <header className="header-brand-editor-top"><div><span>GERENCIADOR DO SITE / CABEÇALHO</span><h1>Logo do cabeçalho</h1><p>Edite somente a marca exibida no canto superior esquerdo do site público.</p></div><div><button onClick={reset}><RotateCcw size={16}/> Restaurar</button><button className="primary" onClick={save}><Save size={16}/> Salvar</button></div></header>
      {saved&&<div className="header-brand-success">Configuração salva no frontend atual.</div>}
      <main className="header-brand-editor-grid">
        <section className="header-brand-panel">
          <h2>Configuração</h2>
          <label>Status<select value={draft.active&&!draft.deleted?'active':'inactive'} onChange={e=>update({active:e.target.value==='active',deleted:false})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
          <label>Link<input value={draft.link} onChange={e=>update({link:e.target.value})}/></label>
          <label>Texto alternativo<input value={draft.imageAlt} onChange={e=>update({imageAlt:e.target.value})}/></label>
          <div className="header-brand-two"><label>Largura útil · {draft.width}px<input type="range" min="80" max="280" value={draft.width} onChange={e=>update({width:Number(e.target.value)})}/></label><label>Altura · {draft.height}px<input type="range" min="32" max="90" value={draft.height} onChange={e=>update({height:Number(e.target.value)})}/></label></div>
          <label>Alinhamento<select value={draft.alignment} onChange={e=>update({alignment:e.target.value as HeaderBrandConfig['alignment']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
          <div className="header-brand-upload"><div className="header-brand-preview">{draft.image?<img src={draft.image} alt={draft.imageAlt}/>:<ImageIcon size={34}/>}</div><input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>void upload(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()}><Upload size={16}/> Fazer upload</button><button className="danger" onClick={remove}><Trash2 size={16}/> Excluir logo</button></div>
        </section>
        <section className="header-brand-live-preview"><h2>Preview</h2><div className="header-brand-preview-header"><div className="header-brand-preview-slot" style={{width:draft.width,height:draft.height,justifyContent:draft.alignment==='left'?'flex-start':draft.alignment==='right'?'flex-end':'center'}}>{draft.active&&!draft.deleted&&draft.image?<img src={draft.image} alt={draft.imageAlt}/>:<span>Logo desativada</span>}</div><div className="header-brand-preview-menu"><span>NOTÍCIAS</span><span>POLÊMICAS</span><span>BASTIDORES</span><span>LANÇAMENTOS</span></div></div></section>
      </main>
    </div>
  </div>
}

export function HeaderBrandBridge(){
  const location=useLocation()
  useEffect(()=>{
    const sync=()=>applyBrand(readHeaderBrandConfig())
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    window.addEventListener('portal-lander:header-brand-updated',sync)
    return()=>{observer.disconnect();window.removeEventListener('portal-lander:header-brand-updated',sync)}
  },[location.pathname])
  if(location.pathname==='/app/site/cabecalho')return <HeaderBrandEditor/>
  return null
}
