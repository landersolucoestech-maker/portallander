import {Image as ImageIcon,Monitor,Save,Smartphone,Tablet,Trash2,Upload} from 'lucide-react'
import {useMemo,useRef,useState} from 'react'
import {HeroSection} from '../../../pages/home/components/HeroSection'
import {readHeroAppearance,type HeroBreakpoint} from '../../../pages/home/models/heroAppearanceModel'
import {readHeroBackground,type HeroBackgroundConfig} from '../../../pages/home/models/heroBackgroundModel'
import {saveHeroBackgroundCmsState} from '../../../pages/home/models/heroCmsRepository'
import {readHeroConfig} from '../../../pages/home/models/heroModel'
import {mediaRepository} from '../mediaRepository'
import '../../../styles/hero-background-manager.css'

const MAX_FILE_BYTES=25*1024*1024
const ALLOWED_TYPES=new Set(['image/jpeg','image/png','image/webp'])

async function validateImage(file:File){
  if(!ALLOWED_TYPES.has(file.type))throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
  if(file.size<=0)throw new Error('O arquivo selecionado está vazio.')
  if(file.size>MAX_FILE_BYTES)throw new Error('A imagem excede o limite de 25 MB.')
  const objectUrl=URL.createObjectURL(file)
  try{
    const image=new Image()
    image.decoding='async'
    image.src=objectUrl
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('A imagem não pôde ser decodificada. O arquivo pode estar corrompido.'))})
    if(!image.naturalWidth||!image.naturalHeight)throw new Error('A imagem não possui dimensões válidas.')
  }finally{URL.revokeObjectURL(objectUrl)}
}

export function HeroBackgroundManager(){
  const carousel=useMemo(()=>readHeroConfig(),[])
  const appearance=useMemo(()=>readHeroAppearance(),[])
  const initial=useMemo(()=>readHeroBackground(),[])
  const [persisted,setPersisted]=useState<HeroBackgroundConfig>(initial)
  const [draft,setDraft]=useState<HeroBackgroundConfig>(initial)
  const [viewport,setViewport]=useState<HeroBreakpoint>('desktop')
  const [adjusting,setAdjusting]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const fileRef=useRef<HTMLInputElement>(null)
  const temporaryUrl=useRef('')
  const dirty=JSON.stringify(draft)!==JSON.stringify(persisted)

  const clearTemporaryUrl=()=>{
    if(!temporaryUrl.current)return
    URL.revokeObjectURL(temporaryUrl.current)
    temporaryUrl.current=''
  }

  const selectFile=async(file?:File)=>{
    if(!file)return
    setError('');setMessage('')
    const previous=draft
    try{
      await validateImage(file)
      clearTemporaryUrl()
      const localUrl=URL.createObjectURL(file)
      temporaryUrl.current=localUrl
      setDraft(current=>({...current,url:localUrl,mediaId:'',fileName:file.name}))
      setUploading(true)
      const media=await mediaRepository.upload({file,alt:'Imagem de fundo da Hero Section'})
      setDraft(current=>({...current,url:media.url,mediaId:media.id,fileName:media.name||file.name}))
      clearTemporaryUrl()
      setMessage('Upload concluído. A nova imagem está apenas no preview até você salvar.')
    }catch(caught){
      clearTemporaryUrl()
      setDraft(previous)
      setError(caught instanceof Error?caught.message:'Não foi possível enviar a imagem.')
    }finally{
      setUploading(false)
      if(fileRef.current)fileRef.current.value=''
    }
  }

  const removeAssociation=()=>{
    clearTemporaryUrl()
    setDraft(current=>({...current,url:'',mediaId:'',fileName:''}))
    setMessage('Imagem removida do estado em edição. O arquivo da biblioteca não foi excluído.')
    setError('')
  }

  const discard=()=>{
    clearTemporaryUrl()
    setDraft(persisted)
    setMessage('Alterações descartadas. A configuração publicada foi restaurada no preview.')
    setError('')
  }

  const save=async()=>{
    if(!dirty||uploading||saving)return
    setSaving(true);setError('');setMessage('')
    try{
      const state=await saveHeroBackgroundCmsState(draft)
      setPersisted(state.background)
      setDraft(state.background)
      setMessage('Imagem de fundo salva. A Home pública passa a usar esta configuração.')
    }catch(caught){
      setError(caught instanceof Error?caught.message:'Não foi possível persistir a imagem de fundo. A configuração publicada anterior foi preservada.')
    }finally{setSaving(false)}
  }

  return <section className="hero-background-manager" aria-labelledby="hero-background-title">
    <div className="hero-background-manager-grid">
      <div className="hero-background-card">
        <div className="hero-background-heading"><div><span>Hero Section</span><h2 id="hero-background-title">Imagem de Fundo</h2><p>Uma única imagem principal, adaptada por crop responsivo. A imagem nunca altera as dimensões estruturais da Hero.</p></div><span className={`hero-background-state ${draft.url?'configured':'empty'}`}>{draft.url?'Configurada':'Sem imagem'}</span></div>
        <div className={`hero-background-media ${draft.url?'has-image':'is-empty'}`}>
          {draft.url?<img src={draft.url} alt="Preview da imagem de fundo configurada" style={{objectPosition:`${draft.positionX}% ${draft.positionY}%`}} onError={()=>setError('Não foi possível carregar a imagem em edição. A configuração publicada não foi alterada.')}/>:<div><ImageIcon size={36}/><strong>Nenhuma imagem configurada</strong><span>A Hero continuará funcionando com o fundo visual padrão.</span></div>}
        </div>
        {draft.fileName&&<div className="hero-background-filename">{draft.fileName}</div>}
        <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void selectFile(event.target.files?.[0])}/>
        <div className="hero-background-actions">
          <button type="button" className="button outline" disabled={uploading||saving} onClick={()=>fileRef.current?.click()}><Upload size={15}/>{uploading?'Enviando...':draft.url?'Substituir':'Adicionar imagem'}</button>
          {draft.url&&<button type="button" className="button outline" disabled={uploading||saving} onClick={()=>setAdjusting(value=>!value)}>Ajustar / editar</button>}
          {draft.url&&<button type="button" className="button outline hero-background-remove" disabled={uploading||saving} onClick={removeAssociation}><Trash2 size={15}/>Remover</button>}
        </div>
        {adjusting&&draft.url&&<div className="hero-background-focal" aria-label="Ajuste do ponto focal">
          <label><span>Posição horizontal · {Math.round(draft.positionX)}%</span><input type="range" min="0" max="100" value={draft.positionX} onChange={event=>setDraft(current=>({...current,positionX:Number(event.target.value)}))}/></label>
          <label><span>Posição vertical · {Math.round(draft.positionY)}%</span><input type="range" min="0" max="100" value={draft.positionY} onChange={event=>setDraft(current=>({...current,positionY:Number(event.target.value)}))}/></label>
          <small>O ponto focal define a região prioritária quando o cover precisar recortar a imagem. Desktop, Tablet e Mobile usam a mesma mídia.</small>
        </div>}
        {error&&<div className="hero-background-feedback error" role="alert">{error}</div>}
        {message&&<div className="hero-background-feedback success" role="status">{message}</div>}
        <div className="hero-background-savebar"><span>{dirty?'Alterações não salvas':'Configuração sincronizada'}</span><div><button type="button" className="button outline" disabled={!dirty||uploading||saving} onClick={discard}>Descartar</button><button type="button" className="button dark" disabled={!dirty||uploading||saving} onClick={()=>void save()}><Save size={15}/>{saving?'Salvando...':'Salvar imagem de fundo'}</button></div></div>
      </div>
      <div className="hero-background-preview">
        <div className="hero-background-preview-head"><div><h3>Preview completo da Hero</h3><p>O mesmo componente público é renderizado com o background ainda não publicado.</p></div><div className="hero-background-viewports" role="group" aria-label="Viewport do preview"><button type="button" className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')} aria-label="Desktop"><Monitor size={17}/></button><button type="button" className={viewport==='tablet'?'active':''} onClick={()=>setViewport('tablet')} aria-label="Tablet"><Tablet size={17}/></button><button type="button" className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')} aria-label="Mobile"><Smartphone size={17}/></button></div></div>
        <div className={`hero-background-preview-stage ${viewport}`}><HeroSection config={carousel} appearance={appearance} background={draft} previewViewport={viewport} disableAutoplay/></div>
      </div>
    </div>
  </section>
}
