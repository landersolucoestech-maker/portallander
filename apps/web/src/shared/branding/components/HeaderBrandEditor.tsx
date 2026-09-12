import {Image as ImageIcon,RotateCcw,Save,Trash2,Upload} from 'lucide-react'
import {useRef,useState} from 'react'
import {defaultHeaderBrandConfig,readHeaderBrandConfig,resetHeaderBrandConfig,writeHeaderBrandConfig,type HeaderBrandConfig} from '../models/headerBrandModel'

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
  const upload=async(file?:File)=>{
    if(!file||!file.type.startsWith('image/'))return
    update({image:await fileToDataUrl(file),deleted:false,active:true,imageAlt:draft.imageAlt||file.name.replace(/\.[^.]+$/,'')})
    if(fileRef.current)fileRef.current.value=''
  }

  return <div className="site-identity-brand-editor">
    {saved&&<div className="site-identity-success" role="status">Cabeçalho salvo e aplicado às páginas públicas.</div>}
    <div className="site-identity-editor-grid">
      <div className="site-identity-controls">
        <div className="site-identity-field-row">
          <label className="site-identity-field"><span>Status</span><select value={draft.active&&!draft.deleted?'active':'inactive'} onChange={event=>update({active:event.target.value==='active',deleted:false})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
          <label className="site-identity-field"><span>Alinhamento</span><select value={draft.alignment} onChange={event=>update({alignment:event.target.value as HeaderBrandConfig['alignment']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
        </div>
        <label className="site-identity-field"><span>Link da marca</span><input value={draft.link} onChange={event=>update({link:event.target.value})} placeholder="/"/></label>
        <label className="site-identity-field"><span>Texto alternativo</span><input value={draft.imageAlt} onChange={event=>update({imageAlt:event.target.value})} placeholder="Portal Lander"/></label>
        <div className="site-identity-field-row">
          <label className="site-identity-range"><span>Largura <b>{draft.width}px</b></span><input type="range" min="80" max="280" value={draft.width} onChange={event=>update({width:Number(event.target.value)})}/></label>
          <label className="site-identity-range"><span>Altura <b>{draft.height}px</b></span><input type="range" min="32" max="90" value={draft.height} onChange={event=>update({height:Number(event.target.value)})}/></label>
        </div>
        <div className="site-identity-logo-control">
          <div className="site-identity-logo-thumb">{draft.image?<img src={draft.image} alt="Preview da logo do cabeçalho"/>:<ImageIcon size={28}/>}</div>
          <div><strong>Logo do cabeçalho</strong><small>PNG, JPG, WEBP ou SVG.</small><div className="site-identity-inline-actions"><input ref={fileRef} hidden type="file" accept="image/*" onChange={event=>void upload(event.target.files?.[0])}/><button type="button" className="site-identity-button" onClick={()=>fileRef.current?.click()}><Upload size={14}/>Alterar logo</button><button type="button" className="site-identity-button danger" onClick={remove}><Trash2 size={14}/>Remover</button></div></div>
        </div>
      </div>
      <div className="site-identity-preview-panel">
        <div className="site-identity-preview-heading"><strong>Preview do cabeçalho</strong><span>Visualização em tempo real</span></div>
        <div className="site-identity-header-preview">
          <div className="site-identity-header-logo" style={{width:draft.width,height:draft.height,justifyContent:draft.alignment==='left'?'flex-start':draft.alignment==='right'?'flex-end':'center'}}>{draft.active&&!draft.deleted&&draft.image?<img src={draft.image} alt={draft.imageAlt}/>:<span>Logo desativada</span>}</div>
          <div className="site-identity-header-menu"><span>NOTÍCIAS</span><span>MÚSICAS</span><span>BASTIDORES</span><span>LANÇAMENTOS</span></div>
        </div>
      </div>
    </div>
    <div className="site-identity-actions"><button type="button" className="site-identity-button" onClick={reset}><RotateCcw size={14}/>Restaurar padrão</button><button type="button" className="site-identity-button primary" onClick={save}><Save size={14}/>Salvar cabeçalho</button></div>
  </div>
}
