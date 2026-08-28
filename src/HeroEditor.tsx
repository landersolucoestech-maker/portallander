import { Copy, Eye, Image as ImageIcon, Plus, RotateCcw, Save, Trash2, Upload, ChevronUp, ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { HeroSection } from './HeroSection'
import { applyArticleToSlide, defaultHeroConfig, defaultHeroSlide, heroArticles, readHeroConfig, resetHeroConfig, writeHeroConfig, type HeroCarouselConfig, type HeroSlide } from './heroModel'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="hero-editor-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>
}

function makeSlide(order:number):HeroSlide{
  return {...defaultHeroSlide,id:`hero-slide-${Date.now()}`,order,title:defaultHeroSlide.title.map(item=>({...item})),eyebrow:'PORTAL LANDER • EM DESTAQUE'}
}

export function HeroEditor(){
  const [draft,setDraft]=useState<HeroCarouselConfig>(()=>readHeroConfig())
  const [selectedId,setSelectedId]=useState(()=>readHeroConfig().slides[0]?.id||defaultHeroSlide.id)
  const [saved,setSaved]=useState(false)
  const [libraryOpen,setLibraryOpen]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)

  const selectedIndex=Math.max(0,draft.slides.findIndex(slide=>slide.id===selectedId))
  const slide=draft.slides[selectedIndex]||draft.slides[0]||defaultHeroSlide
  const ordered=useMemo(()=>[...draft.slides].sort((a,b)=>a.order-b.order),[draft.slides])

  const updateSlide=(patch:Partial<HeroSlide>)=>{setSaved(false);setDraft(current=>({...current,slides:current.slides.map(item=>item.id===slide.id?{...item,...patch}:item)}))}
  const save=()=>{writeHeroConfig(draft);setSaved(true)}
  const reset=()=>{resetHeroConfig();setDraft(defaultHeroConfig);setSelectedId(defaultHeroSlide.id);setSaved(false)}
  const addSlide=()=>{const next=makeSlide(draft.slides.length+1);setDraft(current=>({...current,slides:[...current.slides,next]}));setSelectedId(next.id);setSaved(false)}
  const duplicate=()=>{const next={...slide,id:`hero-slide-${Date.now()}`,order:draft.slides.length+1,title:slide.title.map(item=>({...item}))};setDraft(current=>({...current,slides:[...current.slides,next]}));setSelectedId(next.id);setSaved(false)}
  const remove=()=>{if(draft.slides.length<=1)return;const remaining=draft.slides.filter(item=>item.id!==slide.id).map((item,index)=>({...item,order:index+1}));setDraft(current=>({...current,slides:remaining}));setSelectedId(remaining[0].id);setSaved(false)}
  const move=(delta:number)=>{const sorted=[...ordered];const index=sorted.findIndex(item=>item.id===slide.id);const target=index+delta;if(target<0||target>=sorted.length)return;[sorted[index],sorted[target]]=[sorted[target],sorted[index]];const normalized=sorted.map((item,i)=>({...item,order:i+1}));setDraft(current=>({...current,slides:current.slides.map(item=>normalized.find(n=>n.id===item.id)!) }));setSaved(false)}

  const upload=(file?:File)=>{
    if(!file)return
    if(!file.type.startsWith('image/'))return
    if(file.size>1_800_000){alert('Para este protótipo frontend, use imagem de até 1,8 MB. O storage definitivo será conectado depois.');return}
    const reader=new FileReader();reader.onload=()=>updateSlide({image:String(reader.result||'')});reader.readAsDataURL(file)
  }

  return <div className="hero-editor">
    <div className="hero-editor-toolbar">
      <div><span>CONTEÚDO / HOME</span><h1>Hero / Destaques principais</h1><p>O background aprovado do Portal Lander é fixo e não pode ser alterado aqui. Cada slide troca somente conteúdo editorial e imagem principal.</p></div>
      <div className="hero-editor-toolbar-actions"><button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button><button className="button dark" onClick={save}><Save size={16}/> Salvar</button></div>
    </div>

    {saved&&<div className="hero-editor-success">Slides salvos no estado frontend atual. Background fixo preservado.</div>}

    <div className="hero-slide-manager panel">
      <div className="hero-slide-manager-head"><div><span>SLIDES</span><h2>Destaques do Hero</h2></div><button className="button dark" onClick={addSlide}><Plus size={16}/> Novo destaque</button></div>
      <div className="hero-slide-list">{ordered.map((item,index)=><button className={`hero-slide-card ${item.id===slide.id?'active':''}`} onClick={()=>setSelectedId(item.id)} key={item.id}><strong>{String(index+1).padStart(2,'0')}</strong><span>{item.title.map(part=>part.text).join(' ')}</span><small>{item.status==='active'?'Ativo':'Inativo'} · Ordem {item.order}</small></button>)}</div>
      <div className="hero-slide-actions"><button onClick={()=>move(-1)}><ChevronUp size={15}/> Subir</button><button onClick={()=>move(1)}><ChevronDown size={15}/> Descer</button><button onClick={duplicate}><Copy size={15}/> Duplicar</button><button onClick={remove} disabled={draft.slides.length<=1}><Trash2 size={15}/> Remover</button></div>
    </div>

    <div className="hero-editor-layout">
      <section className="panel hero-editor-form">
        <div className="hero-editor-section-head"><span>Publicação</span><h2>Configuração do slide</h2></div>
        <div className="hero-editor-grid two">
          <Field label="Status"><select value={slide.status} onChange={e=>updateSlide({status:e.target.value as HeroSlide['status']})}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field>
          <Field label="Agendar para"><input type="datetime-local" value={slide.scheduledAt} onChange={e=>updateSlide({scheduledAt:e.target.value})}/></Field>
        </div>

        <div className="hero-editor-section-head"><span>Texto editorial</span><h2>Headline</h2></div>
        <Field label="Eyebrow / selo superior"><input value={slide.eyebrow} onChange={e=>updateSlide({eyebrow:e.target.value})}/></Field>
        <div className="hero-title-editor">{slide.title.map((segment,index)=><div className="hero-title-row" key={index}><input value={segment.text} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,text:e.target.value}:item)})}/><label className="hero-emphasis-toggle"><input type="checkbox" checked={segment.emphasis} onChange={e=>updateSlide({title:slide.title.map((item,i)=>i===index?{...item,emphasis:e.target.checked}:item)})}/> Vermelho</label><button className="icon-button" disabled={slide.title.length<=1} onClick={()=>updateSlide({title:slide.title.filter((_,i)=>i!==index)})}><Trash2 size={15}/></button></div>)}<button className="text-button hero-add-title" onClick={()=>updateSlide({title:[...slide.title,{text:'NOVO TRECHO',emphasis:false}]})}><Plus size={15}/> Adicionar trecho</button></div>
        <Field label="Descrição"><textarea rows={4} value={slide.description} onChange={e=>updateSlide({description:e.target.value})}/></Field>

        <div className="hero-editor-section-head"><span>Imagem principal</span><h2>Artista / notícia em destaque</h2></div>
        <div className="hero-media-picker">
          <div className="hero-media-preview">{slide.image?<img src={slide.image} alt="Preview da imagem principal"/>:<ImageIcon size={32}/>}</div>
          <div className="hero-media-picker-actions"><input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>upload(e.target.files?.[0])}/><button className="button outline" onClick={()=>fileRef.current?.click()}><Upload size={16}/> Fazer upload</button><button className="button outline" onClick={()=>setLibraryOpen(true)}><ImageIcon size={16}/> Biblioteca de mídia</button></div>
          <small>Upload local do protótipo: a imagem é salva no navegador. O storage definitivo será conectado depois; o background fixo nunca é substituído por este campo.</small>
        </div>
        <Field label="Texto alternativo"><input value={slide.imageAlt} onChange={e=>updateSlide({imageAlt:e.target.value})}/></Field>
        <div className="hero-editor-grid two">
          <Field label={`Posição X · ${slide.imagePositionX}%`}><input type="range" min="0" max="100" value={slide.imagePositionX} onChange={e=>updateSlide({imagePositionX:Number(e.target.value)})}/></Field>
          <Field label={`Posição Y · ${slide.imagePositionY}%`}><input type="range" min="0" max="100" value={slide.imagePositionY} onChange={e=>updateSlide({imagePositionY:Number(e.target.value)})}/></Field>
          <Field label={`Escala · ${slide.imageScale.toFixed(2)}x`}><input type="range" min="0.6" max="1.6" step="0.01" value={slide.imageScale} onChange={e=>updateSlide({imageScale:Number(e.target.value)})}/></Field>
          <Field label={`Offset X · ${slide.imageOffsetX}px`}><input type="range" min="-180" max="180" value={slide.imageOffsetX} onChange={e=>updateSlide({imageOffsetX:Number(e.target.value)})}/></Field>
          <Field label={`Offset Y · ${slide.imageOffsetY}px`}><input type="range" min="-120" max="160" value={slide.imageOffsetY} onChange={e=>updateSlide({imageOffsetY:Number(e.target.value)})}/></Field>
        </div>

        <div className="hero-editor-section-head"><span>CTAs</span><h2>Ações</h2></div>
        <div className="hero-editor-grid two"><Field label="CTA primário"><input value={slide.primaryCtaLabel} onChange={e=>updateSlide({primaryCtaLabel:e.target.value})}/></Field><Field label="URL primária"><input value={slide.primaryCtaUrl} onChange={e=>updateSlide({primaryCtaUrl:e.target.value})}/></Field><Field label="CTA secundário"><input value={slide.secondaryCtaLabel} onChange={e=>updateSlide({secondaryCtaLabel:e.target.value})}/></Field><Field label="URL secundária"><input value={slide.secondaryCtaUrl} onChange={e=>updateSlide({secondaryCtaUrl:e.target.value})}/></Field></div>

        <div className="hero-editor-section-head"><span>Notícia vinculada</span><h2>Fonte editorial</h2></div>
        <Field label="Selecionar notícia"><select value={slide.articleId} onChange={e=>{const article=heroArticles.find(item=>item.id===e.target.value);if(article)updateSlide(applyArticleToSlide(slide,article))}}>{heroArticles.map(article=><option value={article.id} key={article.id}>{article.title}</option>)}</select></Field>

        <div className="hero-editor-section-head"><span>Carrossel</span><h2>Comportamento global</h2></div>
        <div className="hero-editor-grid two"><Field label="Autoplay"><select value={draft.autoplay?'on':'off'} onChange={e=>setDraft(current=>({...current,autoplay:e.target.value==='on'}))}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field><Field label="Intervalo (segundos)"><input type="number" min="3" max="20" value={Math.round(draft.intervalMs/1000)} onChange={e=>setDraft(current=>({...current,intervalMs:Math.max(3000,Number(e.target.value)*1000)}))}/></Field></div>
      </section>

      <section className="hero-editor-preview-panel"><div className="hero-editor-preview-head"><span>PREVIEW</span><strong>Mesmo componente da Home</strong></div><div className="hero-editor-preview-frame"><HeroSection config={{...draft,slides:[slide]}} disableAutoplay/></div></section>
    </div>

    {libraryOpen&&<div className="hero-library-backdrop" onClick={()=>setLibraryOpen(false)}><div className="hero-library-modal" onClick={e=>e.stopPropagation()}><div className="hero-library-head"><div><span>MÍDIA</span><h2>Escolher da biblioteca</h2></div><button onClick={()=>setLibraryOpen(false)}>×</button></div><div className="hero-library-grid">{heroArticles.filter(article=>article.image).map(article=><button key={article.id} onClick={()=>{updateSlide({image:article.image,imageAlt:article.imageAlt});setLibraryOpen(false)}}><img src={article.image} alt={article.imageAlt}/><strong>{article.title}</strong></button>)}</div></div></div>}
  </div>
}
