import { Image as ImageIcon, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { defaultHeaderBrandConfig, readHeaderBrandConfig, resetHeaderBrandConfig, writeHeaderBrandConfig, type HeaderBrandConfig } from '../models/headerBrandModel'

async function fileToDataUrl(file:File){
  return await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader()
    reader.onload=()=>resolve(String(reader.result||''))
    reader.onerror=()=>reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function HeaderBrandEditor(){
  const [draft,setDraft]=useState<HeaderBrandConfig>(()=>readHeaderBrandConfig())
  const [saved,setSaved]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const update=(patch:Partial<HeaderBrandConfig>)=>{setSaved(false);setDraft(current=>({...current,...patch}))}
  const save=()=>{writeHeaderBrandConfig(draft);setSaved(true)}
  const reset=()=>{resetHeaderBrandConfig();setDraft(defaultHeaderBrandConfig);setSaved(false)}
  const remove=()=>update({deleted:true,active:false,image:''})
  const upload=async(file?:File)=>{if(!file||!file.type.startsWith('image/'))return;update({image:await fileToDataUrl(file),deleted:false,active:true,imageAlt:draft.imageAlt||file.name.replace(/\.[^.]+$/,'')});if(fileRef.current)fileRef.current.value=''}

  return <div className="header-brand-editor-page">
    <header className="header-brand-editor-top"><div><span>GERENCIADOR DO SITE / IDENTIDADE PADRÃO</span><h1>Logo principal do Portal Lander</h1><p>Esta é a marca padrão usada no cabeçalho público e na tela de autenticação. As alterações atuais permanecem locais neste navegador até existir persistência compartilhada.</p></div><div><button onClick={reset}><RotateCcw size={16}/> Restaurar padrão</button><button className="primary" onClick={save}><Save size={16}/> Salvar localmente</button></div></header>
    {saved&&<div className="header-brand-success">Logo padrão salva neste navegador e aplicada às superfícies que consomem a identidade principal.</div>}
    <div className="header-brand-editor-grid">
      <section className="header-brand-panel">
        <h2>Configuração padrão</h2>
        <label>Status<select value={draft.active&&!draft.deleted?'active':'inactive'} onChange={e=>update({active:e.target.value==='active',deleted:false})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
        <label>Link<input value={draft.link} onChange={e=>update({link:e.target.value})}/></label>
        <label>Texto alternativo<input value={draft.imageAlt} onChange={e=>update({imageAlt:e.target.value})}/></label>
        <div className="header-brand-two"><label>Largura útil · {draft.width}px<input type="range" min="80" max="280" value={draft.width} onChange={e=>update({width:Number(e.target.value)})}/></label><label>Altura · {draft.height}px<input type="range" min="32" max="90" value={draft.height} onChange={e=>update({height:Number(e.target.value)})}/></label></div>
        <label>Alinhamento<select value={draft.alignment} onChange={e=>update({alignment:e.target.value as HeaderBrandConfig['alignment']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
        <div className="header-brand-upload"><div className="header-brand-preview">{draft.image?<img src={draft.image} alt={draft.imageAlt}/>:<ImageIcon size={34}/>}</div><input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>void upload(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()}><Upload size={16}/> Fazer upload</button><button className="danger" onClick={remove}><Trash2 size={16}/> Excluir logo local</button></div>
      </section>
      <section className="header-brand-live-preview"><h2>Preview da identidade padrão</h2><div className="header-brand-preview-header"><div className="header-brand-preview-slot" style={{width:draft.width,height:draft.height,justifyContent:draft.alignment==='left'?'flex-start':draft.alignment==='right'?'flex-end':'center'}}>{draft.active&&!draft.deleted&&draft.image?<img src={draft.image} alt={draft.imageAlt}/>:<span>Logo desativada</span>}</div><div className="header-brand-preview-menu"><span>NOTÍCIAS</span><span>MÚSICAS</span><span>BASTIDORES</span><span>LANÇAMENTOS</span></div></div></section>
    </div>
  </div>
}
