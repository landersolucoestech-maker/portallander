import {ImagePlus,Images,Upload,X} from 'lucide-react'
import {useRef,useState} from 'react'
import {isMediaPersistenceConfigured,mediaRepository} from '../mediaRepository'
import {SiteMediaPicker} from './SiteMediaPicker'

type Props={value:string;onChange(value:string):void;label?:string}

async function fileToDevelopmentDataUrl(file:File):Promise<string>{
  if(!file.type.startsWith('image/'))throw new Error('Selecione um arquivo de imagem válido.')
  const source=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.onload=()=>resolve(String(reader.result||''));reader.readAsDataURL(file)})
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=()=>reject(new Error('Não foi possível processar a imagem.'));element.src=source})
  const maxWidth=1600,scale=Math.min(1,maxWidth/image.naturalWidth)
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale))
  const context=canvas.getContext('2d');if(!context)throw new Error('Não foi possível preparar a imagem.')
  context.drawImage(image,0,0,canvas.width,canvas.height)
  return canvas.toDataURL('image/webp',.84)
}

export function SectionMediaField({value,onChange,label='Imagem da seção'}:Props){
  const inputRef=useRef<HTMLInputElement|null>(null)
  const [pickerOpen,setPickerOpen]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState('')
  const upload=async(file:File)=>{setUploading(true);setError('');try{if(isMediaPersistenceConfigured()){try{const item=await mediaRepository.upload({file,alt:label});onChange(item.url);return}catch{/* painel aberto em desenvolvimento: usa fallback local */}}onChange(await fileToDevelopmentDataUrl(file))}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar a imagem.')}finally{setUploading(false)}}
  return <div className="section-media-field"><div className="section-media-field-head"><span>{label}</span><small>Carregue uma nova imagem ou escolha uma arte já existente na biblioteca.</small></div>{value?<div className="section-media-current"><img src={value} alt="Preview da mídia selecionada"/><button type="button" onClick={()=>onChange('')} aria-label="Remover imagem"><X size={15}/></button></div>:<div className="section-media-empty"><ImagePlus size={24}/><span>Nenhuma imagem selecionada</span></div>}<div className="section-media-actions"><button type="button" className="button outline" onClick={()=>inputRef.current?.click()} disabled={uploading}><Upload size={15}/>{uploading?' Carregando...':' Carregar imagem'}</button><button type="button" className="button outline" onClick={()=>setPickerOpen(true)}><Images size={15}/> Biblioteca</button></div><input ref={inputRef} type="file" accept="image/*" hidden onChange={event=>{const file=event.target.files?.[0];event.currentTarget.value='';if(file)void upload(file)}}/>{error&&<small className="section-media-error">{error}</small>}<SiteMediaPicker open={pickerOpen} selectedUrl={value} onClose={()=>setPickerOpen(false)} onSelect={item=>{onChange(item.url);setPickerOpen(false)}}/></div>
}
