import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  ListOrdered,
  Megaphone,
  Monitor,
  Newspaper,
  PanelRight,
  Plus,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Video,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { readHeroConfig, writeHeroConfig, type HeroCarouselConfig } from '../../../pages/home/models/heroModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/homepage-builder.css'

type SectionId='hero'|'ticker'|'grid'|'ranking'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'
type Device='desktop'|'tablet'|'mobile'
type BuilderSection={id:SectionId;label:string;description:string;enabled:boolean;editor?:string;kind:'content'|'commercial'|'system'}

const STORAGE_KEY='portal-lander:cms:home-builder:v1'
const DEFAULT_SECTIONS:BuilderSection[]=[
  {id:'hero',label:'Hero principal',description:'Destaque editorial principal da página inicial.',enabled:true,editor:'/app/site/home/hero',kind:'content'},
  {id:'ticker',label:'Barra Agora (Ticker)',description:'Faixa de atualização exibida logo abaixo do Hero.',enabled:true,kind:'content'},
  {id:'grid',label:'Grid principal',description:'Cards editoriais principais da Home.',enabled:true,editor:'/app/site/conteudos',kind:'content'},
  {id:'ranking',label:'Ranking 01–10',description:'Ranking lateral de conteúdos em evidência.',enabled:true,kind:'content'},
  {id:'side-ad',label:'Publicidade lateral',description:'Slot comercial vertical da primeira dobra.',enabled:true,editor:'/app/site/home/anuncio',kind:'commercial'},
  {id:'secondary',label:'Destaques secundários',description:'Segunda faixa de cards editoriais.',enabled:true,editor:'/app/site/conteudos',kind:'content'},
  {id:'trending',label:'Em alta',description:'Lista lateral de conteúdos em alta.',enabled:true,kind:'content'},
  {id:'banner',label:'Banner horizontal',description:'Slot publicitário horizontal entre blocos.',enabled:true,editor:'/app/site/home/anuncio',kind:'commercial'},
  {id:'videos',label:'Vídeos',description:'Conteúdo audiovisual em cards verticais.',enabled:true,editor:'/app/site/conteudos',kind:'content'},
  {id:'agenda',label:'Agenda / Eventos',description:'Próximos eventos exibidos na Home.',enabled:true,kind:'content'},
  {id:'newsletter',label:'Newsletter',description:'Faixa de captura de e-mail antes do rodapé.',enabled:true,kind:'system'},
  {id:'footer',label:'Footer',description:'Rodapé institucional e navegação final.',enabled:true,kind:'system'},
]

function loadSections(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    if(!raw)return DEFAULT_SECTIONS
    const saved=JSON.parse(raw) as BuilderSection[]
    const byId=new Map(saved.map(item=>[item.id,item]))
    return DEFAULT_SECTIONS.map(base=>({...base,...byId.get(base.id)})).sort((a,b)=>{
      const ai=saved.findIndex(item=>item.id===a.id)
      const bi=saved.findIndex(item=>item.id===b.id)
      return (ai<0?999:ai)-(bi<0?999:bi)
    })
  }catch{return DEFAULT_SECTIONS}
}

function SectionGlyph({id}:{id:SectionId}){
  if(id==='hero')return <ImageIcon size={16}/>
  if(id==='ticker'||id==='trending')return <Newspaper size={16}/>
  if(id==='ranking')return <ListOrdered size={16}/>
  if(id==='side-ad'||id==='banner')return <Megaphone size={16}/>
  if(id==='videos')return <Video size={16}/>
  if(id==='agenda')return <CalendarDays size={16}/>
  return <LayoutGrid size={16}/>
}

function titleAsText(config:HeroCarouselConfig){return config.slides[0]?.title.map(part=>part.text).join('\n')||''}

export function HomeManagerPage(){
  const [sections,setSections]=useState<BuilderSection[]>(loadSections)
  const [selectedId,setSelectedId]=useState<SectionId>('hero')
  const [device,setDevice]=useState<Device>('desktop')
  const [hero,setHero]=useState<HeroCarouselConfig>(()=>readHeroConfig())
  const [saved,setSaved]=useState(false)
  const [previewVersion,setPreviewVersion]=useState(0)

  const selected=useMemo(()=>sections.find(section=>section.id===selectedId)??sections[0],[sections,selectedId])
  const slide=hero.slides[0]

  const move=(id:SectionId,delta:number)=>setSections(current=>{
    const next=[...current]
    const index=next.findIndex(item=>item.id===id)
    const target=index+delta
    if(index<0||target<0||target>=next.length)return current
    ;[next[index],next[target]]=[next[target],next[index]]
    setSaved(false)
    return next
  })
  const toggle=(id:SectionId)=>setSections(current=>current.map(item=>item.id===id?{...item,enabled:!item.enabled}:item))
  const patchSlide=(patch:Partial<NonNullable<typeof slide>>)=>{
    if(!slide)return
    setHero(current=>({...current,slides:current.slides.map((item,index)=>index===0?{...item,...patch}:item)}))
    setSaved(false)
  }
  const patchTitle=(value:string)=>{
    const lines=value.split('\n').filter((_,index,array)=>array.length===1||index<array.length-1||value.endsWith('\n')||array[index]!=='' )
    const previous=slide?.title??[]
    patchSlide({title:lines.map((text,index)=>({text,emphasis:previous[index]?.emphasis??index===lines.length-1}))})
  }
  const save=()=>{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(sections))
    writeHeroConfig(hero)
    setSaved(true)
    setPreviewVersion(value=>value+1)
  }

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Página inicial',description:'Builder visual da Home: organize blocos, edite o Hero e acompanhe o resultado no próprio painel.'}}>
    <div className="home-builder-topbar">
      <div className="home-builder-publish-state"><span className="home-builder-dot"/> Publicado</div>
      <div className="home-builder-top-actions">
        <a className="home-builder-button secondary" href="/" target="_blank" rel="noreferrer"><Eye size={15}/> Ver site</a>
        <button className="home-builder-button secondary" onClick={()=>setPreviewVersion(value=>value+1)}>Pré-visualizar</button>
        <button className="home-builder-button primary" onClick={save}><Save size={15}/> Salvar alterações</button>
      </div>
    </div>

    {saved&&<div className="home-builder-success">Alterações salvas. O Hero e o ticker usam a configuração real consumida pela Home pública; a composição do builder foi preservada para a próxima edição.</div>}

    <div className="home-builder-layout">
      <aside className="home-builder-sections">
        <div className="home-builder-panel-head"><div><strong>HOMEPAGE BUILDER</strong><span>Reordene, oculte e configure as seções.</span></div><button title="Adicionar seção"><Plus size={16}/></button></div>
        <div className="home-builder-section-list">
          {sections.map((section,index)=><div className={`home-builder-section-row ${selectedId===section.id?'active':''}`} key={section.id} onClick={()=>setSelectedId(section.id)}>
            <GripVertical className="home-builder-grip" size={16}/>
            <span className={`home-builder-section-icon ${section.kind}`}><SectionGlyph id={section.id}/></span>
            <span className="home-builder-section-copy"><strong>{section.label}</strong><small>{section.enabled?'Visível na composição':'Oculto na composição'}</small></span>
            <button title={section.enabled?'Ocultar seção':'Exibir seção'} onClick={event=>{event.stopPropagation();toggle(section.id);setSaved(false)}}>{section.enabled?<Eye size={15}/>:<EyeOff size={15}/>}</button>
            <button title="Configurar" onClick={event=>{event.stopPropagation();setSelectedId(section.id)}}><Settings2 size={15}/></button>
            <span className="home-builder-order-actions"><button disabled={index===0} title="Subir" onClick={event=>{event.stopPropagation();move(section.id,-1)}}><ArrowUp size={13}/></button><button disabled={index===sections.length-1} title="Descer" onClick={event=>{event.stopPropagation();move(section.id,1)}}><ArrowDown size={13}/></button></span>
          </div>)}
        </div>
        <div className="home-builder-page-settings"><strong>Configurações da página</strong><button><LayoutGrid size={16}/><span>Layout geral<small>Container, espaçamento e estrutura</small></span></button><button><PanelRight size={16}/><span>Cores e tipografia<small>Tokens visuais globais</small></span></button></div>
      </aside>

      <main className="home-builder-preview-panel">
        <div className="home-builder-preview-toolbar">
          <span>PREVIEW AO VIVO</span>
          <div className="home-builder-device-tabs">
            <button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')} title="Desktop"><Monitor size={16}/></button>
            <button className={device==='tablet'?'active':''} onClick={()=>setDevice('tablet')} title="Tablet"><Tablet size={16}/></button>
            <button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')} title="Mobile"><Smartphone size={16}/></button>
          </div>
        </div>
        <div className={`home-builder-preview-stage ${device}`}><iframe key={previewVersion} title="Pré-visualização da página inicial" src={`/?cmsPreview=${previewVersion}`}/></div>
      </main>

      <aside className="home-builder-inspector">
        <div className="home-builder-inspector-title"><div><span>CONFIGURAÇÕES DA SEÇÃO</span><h2>{selected.label}</h2></div><Settings2 size={18}/></div>
        <div className="home-builder-tabs"><button className="active">Conteúdo</button><button>Estilo</button><button>Avançado</button></div>

        <div className="home-builder-inspector-body">
          <label className="home-builder-toggle-row"><span><strong>Ativar seção</strong><small>Exibir este bloco na composição.</small></span><input type="checkbox" checked={selected.enabled} onChange={()=>{toggle(selected.id);setSaved(false)}}/></label>

          {selected.id==='hero'&&slide?<>
            <label>Título superior<input value={slide.eyebrow} onChange={event=>patchSlide({eyebrow:event.target.value})}/></label>
            <label>Título principal<textarea rows={4} value={titleAsText(hero)} onChange={event=>patchTitle(event.target.value)}/><small>Uma linha por trecho da headline. O destaque vermelho existente é preservado por trecho.</small></label>
            <label>Descrição<textarea rows={4} value={slide.description} onChange={event=>patchSlide({description:event.target.value})}/></label>
            <div className="home-builder-field-grid"><label>Botão primário<input value={slide.primaryCtaLabel} onChange={event=>patchSlide({primaryCtaLabel:event.target.value})}/></label><label>Link<input value={slide.primaryCtaUrl} onChange={event=>patchSlide({primaryCtaUrl:event.target.value})}/></label></div>
            <div className="home-builder-field-grid"><label>Botão secundário<input value={slide.secondaryCtaLabel} onChange={event=>patchSlide({secondaryCtaLabel:event.target.value})}/></label><label>Link<input value={slide.secondaryCtaUrl} onChange={event=>patchSlide({secondaryCtaUrl:event.target.value})}/></label></div>
            <label className="home-builder-toggle-row"><span><strong>Slide ativo</strong><small>Controla a publicação do primeiro destaque.</small></span><input type="checkbox" checked={slide.status==='active'} onChange={event=>patchSlide({status:event.target.checked?'active':'inactive'})}/></label>
            <Link className="home-builder-deep-link" to="/app/site/home/hero">Abrir editor completo do Hero</Link>
          </>:selected.id==='ticker'?<>
            <label>Rótulo<input value={hero.ticker.label} onChange={event=>{setHero(current=>({...current,ticker:{...current.ticker,label:event.target.value}}));setSaved(false)}}/></label>
            <label>Texto<textarea rows={3} value={hero.ticker.text} onChange={event=>{setHero(current=>({...current,ticker:{...current.ticker,text:event.target.value}}));setSaved(false)}}/></label>
            <label>Link<input value={hero.ticker.url} onChange={event=>{setHero(current=>({...current,ticker:{...current.ticker,url:event.target.value}}));setSaved(false)}}/></label>
            <label className="home-builder-toggle-row"><span><strong>Ticker ativo</strong></span><input type="checkbox" checked={hero.ticker.active} onChange={event=>{setHero(current=>({...current,ticker:{...current.ticker,active:event.target.checked}}));setSaved(false)}}/></label>
          </>:<>
            <div className="home-builder-section-summary"><span className={`home-builder-section-icon ${selected.kind}`}><SectionGlyph id={selected.id}/></span><div><strong>{selected.label}</strong><p>{selected.description}</p></div></div>
            <label>Origem do conteúdo<select defaultValue="automatic"><option value="automatic">Automática</option><option value="manual">Seleção manual</option></select></label>
            <label>Quantidade de itens<input type="number" min="1" max="20" defaultValue={selected.id==='ranking'?10:selected.id==='grid'?6:4}/></label>
            {selected.editor?<Link className="home-builder-deep-link" to={selected.editor}>Abrir editor relacionado</Link>:<div className="home-builder-note">Esta configuração visual já faz parte do builder. A persistência editorial específica deste módulo será conectada ao respectivo repositório de conteúdo.</div>}
          </>}
        </div>
      </aside>
    </div>
  </AdminShell>
}
