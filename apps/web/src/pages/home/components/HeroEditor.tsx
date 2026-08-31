import { Copy, Image as ImageIcon, Plus, RotateCcw, Save, Trash2, Upload, ChevronUp, ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { HeroSection } from './HeroSection'
import { applyArticleToSlide, defaultHeroConfig, defaultHeroSlide, heroArticles, readHeroConfig, resetHeroConfig, writeHeroConfig, type HeroCarouselConfig, type HeroCta, type HeroSlide } from '../models/heroModel'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="hero-editor-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>
}

function makeSlide(order:number):HeroSlide{
  return {...defaultHeroSlide,id:`hero-slide-${Date.now()}`,order,title:defaultHeroSlide.title.map(item=>({...item,visible:item.visible!==false})),ctas:(defaultHeroSlide.ctas||[]).map(item=>({...item})),eyebrow:'PORTAL LANDER • EM DESTAQUE'}
}

async function optimizeImageForPreview(file:File):Promise<string>{
  const objectUrl=URL.createObjectURL(file)
  try{
    const image=new Image()
    image.decoding='async'
    image.src=objectUrl
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Não foi possível carregar a imagem selecionada.'))})
    const render=(maxDimension:number,quality:number)=>{
      const ratio=Math.min(1,maxDimension/Math.max(image.naturalWidth,image.naturalHeight))
      const width=Math.max(1,Math.round(image.naturalWidth*ratio))
      const height=Math.max(1,Math.round(image.naturalHeight*ratio))
      const canvas=document.createElement('canvas')
      canvas.width=width;canvas.height=height
      const context=canvas.getContext('2d')
      if(!context)throw new Error('Canvas indisponível para otimização da imagem.')
      context.drawImage(image,0,0,width,height)
      return canvas.toDataURL('image/webp',quality)
    }
    let dataUrl=render(2000,.9)
    if(dataUrl.length>3_200_000)dataUrl=render(1600,.84)
    if(dataUrl.length>3_200_000)dataUrl=render(1280,.78)
    return dataUrl
  }finally{URL.revokeObjectURL(objectUrl)}
}

export function HeroEditor(){
  const [draft,setDraft]=useState<HeroCarouselConfig>(()=>readHeroConfig())
  const [selectedId,setSelectedId]=useState(()=>readHeroConfig().slides[0]?.id||defaultHeroSlide.id)
  const [saved,setSaved]=useState(false)
  const [libraryOpen,setLibraryOpen]=useState(false)
  const [uploading,setUploading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)

  const selectedIndex=Math.max(0,draft.slides.findIndex(slide=>slide.id===selectedId))
  const slide=draft.slides[selectedIndex]||draft.slides[0]||defaultHeroSlide
  const ordered=useMemo(()=>[...draft.slides].sort((a,b)=>a.order-b.order),[draft.slides])
  const ctas=useMemo(()=>[...(slide.ctas||[])].sort((a,b)=>a.order-b.order),[slide.ctas])

  const updateSlide=(patch:Partial<HeroSlide>)=>{setSaved(false);setDraft(current=>({...current,slides:current.slides.map(item=>item.id===slide.id?{...item,...patch}:item)}))}
  const save=()=>{writeHeroConfig(draft);setSaved(true)}
  const reset=()=>{resetHeroConfig();setDraft(readHeroConfig());setSelectedId(defaultHeroSlide.id);setSaved(false)}
  const addSlide=()=>{const next=makeSlide(draft.slides.length+1);setDraft(current=>({...current,slides:[...current.slides,next]}));setSelectedId(next.id);setSaved(false)}
  const duplicate=()=>{const next={...slide,id:`hero-slide-${Date.now()}`,order:draft.slides.length+1,title:slide.title.map(item=>({...item})),ctas:(slide.ctas||[]).map(item=>({...item,id:`${item.id}-${Date.now()}`}))};setDraft(current=>({...current,slides:[...current.slides,next]}));setSelectedId(next.id);setSaved(false)}
  const remove=()=>{if(draft.slides.length<=1)return;const remaining=draft.slides.filter(item=>item.id!==slide.id).map((item,index)=>({...item,order:index+1}));setDraft(current=>({...current,slides:remaining}));setSelectedId(remaining[0].id);setSaved(false)}
  const move=(delta:number)=>{const sorted=[...ordered];const index=sorted.findIndex(item=>item.id===slide.id);const target=index+delta;if(target<0||target>=sorted.length)return;[sorted[index],sorted[target]]=[sorted[target],sorted[index]];const normalized=sorted.map((item,i)=>({...item,order:i+1}));setDraft(current=>({...current,slides:current.slides.map(item=>normalized.find(n=>n.id===item.id)!) }));setSaved(false)}
  const moveSegment=(index:number,delta:number)=>{const next=[...slide.title];const target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];updateSlide({title:next})}
  const updateCta=(id:string,patch:Partial<HeroCta>)=>updateSlide({ctas:ctas.map(item=>item.id===id?{...item,...patch}:item)})
  const addCta=()=>{const next:HeroCta={id:`cta-${Date.now()}`,active:true,label:'NOVO CTA',url:'#',external:false,order:ctas.length+1,variant:ctas.length?'secondary':'primary'};updateSlide({ctas:[...ctas,next]})}
  const removeCta=(id:string)=>updateSlide({ctas:ctas.filter(item=>item.id!==id).map((item,index)=>({...item,order:index+1}))})
  const moveCta=(id:string,delta:number)=>{const next=[...ctas];const index=next.findIndex(item=>item.id===id);const target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];updateSlide({ctas:next.map((item,i)=>({...item,order:i+1}))})}

  const upload=async(file?:File)=>{
    if(!file||!file.type.startsWith('image/'))return
    setUploading(true)
    try{const optimized=await optimizeImageForPreview(file);updateSlide({image:optimized,imageVisible:true,imageAlt:slide.imageAlt||file.name.replace(/\.[^.]+$/,'')})}
    catch(error){console.error(error)}
    finally{setUploading(false);if(fileRef.current)fileRef.current.value=''}
  }

  return <div className="hero-editor">
    <div className="hero-editor-toolbar">
      <div><span>SEÇÕES / HOME</span><h1>Hero Editorial</h1><p>Todo conteúdo e comportamento abaixo é configurável pelo CMS. A Home apenas interpreta e renderiza o estado salvo.</p></div>
      <div className="hero-editor-toolbar-actions"><button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button><button className="button dark" onClick={save}><Save size={16}/> Salvar Hero</button></div>
    </div>
    {saved&&<div className="hero-editor-success">Configuração completa do Hero salva no estado atual.</div>}

    <div className="hero-slide-manager panel">
      <div className="hero-slide-manager-head"><div><span>SLIDES</span><h2>Destaques do Hero</h2></div><button className="button dark" onClick={addSlide}><Plus size={16}/> Novo destaque</button></div>
      <div className="hero-slide-list">{ordered.map((item,index)=><button className={`hero-slide-card ${item.id===slide.id?'active':''}`} onClick={()=>setSelectedId(item.id)} key={item.id}><strong>{String(index+1).padStart(2,'0')}</strong><span>{item.title.filter(part=>part.visible!==false).map(part=>part.text).join(' ')||'Sem headline'}</span><small>{item.status==='active'?'Ativo':'Inativo'} · Ordem {item.order}</small></button>)}</div>
      <div className="hero-slide-actions"><button onClick={()=>move(-1)}><ChevronUp size={15}/> Subir</button><button onClick={()=>move(1)}><ChevronDown size={15}/> Descer</button><button onClick={duplicate}><Copy size={15}/> Duplicar</button><button onClick={remove} disabled={draft.slides.length<=1}><Trash2 size={15}/> Remover</button></div>
    </div>

    <div className="hero-editor-layout">
      <section className="panel hero-editor-form">
        <div className="hero-editor-section-head"><span>Publicação</span><h2>Configuração do slide</h2></div>
        <div className="hero-editor-grid two"><Field label="Status"><select value={slide.status} onChange={e=>updateSlide({status:e.target.value as HeroSlide['status']})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field><Field label="Agendar para"><input type="datetime-local" value={slide.scheduledAt} onChange={e=>updateSlide({scheduledAt:e.target.value})}/></Field></div>

        <div className="hero-editor-section-head"><span>Texto editorial</span><h2>Headline e elementos</h2></div>
        <div className="hero-editor-grid two"><Field label="Eyebrow / selo superior"><input value={slide.eyebrow} onChange={e=>updateSlide({eyebrow:e.target.value})}/></Field><Field label="Exibir eyebrow"><select value={slide.eyebrowVisible===false?'off':'on'} onChange={e=>updateSlide({eyebrowVisible:e.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
        <div className="hero-title-editor">{slide.title.map((segment,index)=><div className="hero-title-row" key={index}>
          <input value={segment.text} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,text:e.target.value}:item)})}/>
          <input aria-label="Cor do trecho" type="color" value={segment.color||(segment.emphasis?'#ff151f':'#ffffff')} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,color:e.target.value}:item)})}/>
          <label className="hero-emphasis-toggle"><input type="checkbox" checked={segment.visible!==false} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,visible:e.target.checked}:item)})}/> Visível</label>
          <button className="icon-button" onClick={()=>moveSegment(index,-1)} disabled={index===0}><ChevronUp size={15}/></button><button className="icon-button" onClick={()=>moveSegment(index,1)} disabled={index===slide.title.length-1}><ChevronDown size={15}/></button><button className="icon-button" disabled={slide.title.length<=1} onClick={()=>updateSlide({title:slide.title.filter((_,i)=>i!==index)})}><Trash2 size={15}/></button>
          <div className="hero-editor-grid two"><Field label="Tamanho (px)"><input type="number" min="20" max="140" placeholder="Padrão" value={segment.fontSize||''} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,fontSize:e.target.value?Number(e.target.value):undefined}:item)})}/></Field><Field label="Peso"><select value={segment.fontWeight||''} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,fontWeight:e.target.value?Number(e.target.value):undefined}:item)})}><option value="">Padrão</option><option value="400">400</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></Field></div>
        </div>)}<button className="text-button hero-add-title" onClick={()=>updateSlide({title:[...slide.title,{text:'NOVO TRECHO',emphasis:false,color:'#ffffff',visible:true}]})}><Plus size={15}/> Adicionar trecho</button></div>
        <div className="hero-editor-grid two"><Field label="Descrição"><textarea rows={4} value={slide.description} onChange={e=>updateSlide({description:e.target.value})}/></Field><Field label="Exibir descrição"><select value={slide.descriptionVisible===false?'off':'on'} onChange={e=>updateSlide({descriptionVisible:e.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
        <div className="hero-editor-grid two"><Field label="Texto sobre a imagem / assinatura editorial"><input value={slide.mediaCaption} onChange={e=>updateSlide({mediaCaption:e.target.value})}/></Field><Field label="Exibir assinatura"><select value={slide.mediaCaptionVisible===false?'off':'on'} onChange={e=>updateSlide({mediaCaptionVisible:e.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>

        <div className="hero-editor-section-head"><span>Imagem principal</span><h2>Mídia e enquadramento</h2></div>
        <div className="hero-media-picker"><div className="hero-media-preview">{slide.image&&slide.imageVisible!==false?<img src={slide.image} alt="Preview da imagem principal"/>:<ImageIcon size={32}/>}</div><div className="hero-media-picker-actions"><input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>void upload(e.target.files?.[0])}/><button className="button outline" disabled={uploading} onClick={()=>fileRef.current?.click()}><Upload size={16}/> {uploading?'Processando...':'Fazer upload'}</button><button className="button outline" onClick={()=>setLibraryOpen(true)}><ImageIcon size={16}/> Biblioteca de mídia</button><button className="button outline" onClick={()=>updateSlide({image:'',imageVisible:false})}><Trash2 size={16}/> Remover imagem</button></div></div>
        <div className="hero-editor-grid two"><Field label="Exibir imagem"><select value={slide.imageVisible===false?'off':'on'} onChange={e=>updateSlide({imageVisible:e.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Texto alternativo"><input value={slide.imageAlt} onChange={e=>updateSlide({imageAlt:e.target.value})}/></Field></div>
        <div className="hero-editor-grid two"><Field label={`Posição X · ${slide.imagePositionX}%`}><input type="range" min="0" max="100" value={slide.imagePositionX} onChange={e=>updateSlide({imagePositionX:Number(e.target.value)})}/></Field><Field label={`Posição Y · ${slide.imagePositionY}%`}><input type="range" min="0" max="100" value={slide.imagePositionY} onChange={e=>updateSlide({imagePositionY:Number(e.target.value)})}/></Field><Field label={`Escala · ${slide.imageScale.toFixed(2)}x`}><input type="range" min="0.4" max="2.4" step="0.01" value={slide.imageScale} onChange={e=>updateSlide({imageScale:Number(e.target.value)})}/></Field><Field label={`Offset X · ${slide.imageOffsetX}px`}><input type="range" min="-400" max="400" value={slide.imageOffsetX} onChange={e=>updateSlide({imageOffsetX:Number(e.target.value)})}/></Field><Field label={`Offset Y · ${slide.imageOffsetY}px`}><input type="range" min="-300" max="300" value={slide.imageOffsetY} onChange={e=>updateSlide({imageOffsetY:Number(e.target.value)})}/></Field></div>

        <div className="hero-editor-section-head"><span>CTAs</span><h2>Ações configuráveis</h2></div>
        {ctas.map((cta,index)=><div className="hero-title-row" key={cta.id}><div className="hero-editor-grid two"><Field label={`CTA ${index+1} · Texto`}><input value={cta.label} onChange={e=>updateCta(cta.id,{label:e.target.value})}/></Field><Field label="URL / destino"><input value={cta.url} onChange={e=>updateCta(cta.id,{url:e.target.value})}/></Field><Field label="Status"><select value={cta.active?'on':'off'} onChange={e=>updateCta(cta.id,{active:e.target.value==='on'})}><option value="on">Ativo</option><option value="off">Oculto</option></select></Field><Field label="Abertura"><select value={cta.external?'external':'internal'} onChange={e=>updateCta(cta.id,{external:e.target.value==='external'})}><option value="internal">Interna</option><option value="external">Nova aba / externa</option></select></Field><Field label="Estilo"><select value={cta.variant} onChange={e=>updateCta(cta.id,{variant:e.target.value as HeroCta['variant']})}><option value="primary">Primário</option><option value="secondary">Secundário</option></select></Field></div><button className="icon-button" onClick={()=>moveCta(cta.id,-1)} disabled={index===0}><ChevronUp size={15}/></button><button className="icon-button" onClick={()=>moveCta(cta.id,1)} disabled={index===ctas.length-1}><ChevronDown size={15}/></button><button className="icon-button" onClick={()=>removeCta(cta.id)}><Trash2 size={15}/></button></div>)}
        <button className="text-button hero-add-title" onClick={addCta}><Plus size={15}/> Adicionar CTA</button>

        <div className="hero-editor-section-head"><span>Notícia vinculada</span><h2>Fonte editorial opcional</h2></div>
        <Field label="Selecionar notícia"><select value={slide.articleId} onChange={e=>{if(!e.target.value){updateSlide({articleId:''});return}const article=heroArticles.find(item=>item.id===e.target.value);if(article)updateSlide(applyArticleToSlide(slide,article))}}><option value="">Sem notícia vinculada</option>{heroArticles.map(article=><option value={article.id} key={article.id}>{article.title}</option>)}</select></Field>

        <div className="hero-editor-section-head"><span>Carrossel</span><h2>Comportamento global</h2></div>
        <div className="hero-editor-grid two"><Field label="Autoplay"><select value={draft.autoplay?'on':'off'} onChange={e=>{setSaved(false);setDraft(current=>({...current,autoplay:e.target.value==='on'}))}}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field><Field label="Intervalo (segundos)"><input type="number" min="3" max="60" value={Math.round(draft.intervalMs/1000)} onChange={e=>{setSaved(false);setDraft(current=>({...current,intervalMs:Math.max(3000,Number(e.target.value)*1000)}))}}/></Field><Field label="Navegação"><select value={draft.navigation||'arrows-dots'} onChange={e=>{setSaved(false);setDraft(current=>({...current,navigation:e.target.value as HeroCarouselConfig['navigation']}))}}><option value="arrows-dots">Setas + pontos</option><option value="arrows">Somente setas</option><option value="dots">Somente pontos</option><option value="none">Sem navegação</option></select></Field></div>
      </section>

      <section className="hero-editor-preview-panel"><div className="hero-editor-preview-head"><span>PREVIEW EM TEMPO REAL</span><strong>Mesmo componente da Home</strong></div><div className="hero-editor-preview-frame"><HeroSection config={{...draft,slides:[slide]}} disableAutoplay/></div></section>
    </div>

    {libraryOpen&&<div className="hero-library-backdrop" onClick={()=>setLibraryOpen(false)}><div className="hero-library-modal" onClick={e=>e.stopPropagation()}><div className="hero-library-head"><div><span>MÍDIA</span><h2>Escolher da biblioteca</h2></div><button onClick={()=>setLibraryOpen(false)}>×</button></div><div className="hero-library-grid">{heroArticles.filter(article=>article.image).map(article=><button key={article.id} onClick={()=>{updateSlide({image:article.image,imageVisible:true,imageAlt:article.imageAlt});setLibraryOpen(false)}}><img src={article.image} alt={article.imageAlt}/><strong>{article.title}</strong></button>)}</div></div></div>}
  </div>
}
