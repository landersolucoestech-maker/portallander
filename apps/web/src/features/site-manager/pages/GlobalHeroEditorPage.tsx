import {ExternalLink,Image as ImageIcon,Monitor,RotateCcw,Save,Smartphone,Tablet,Upload} from 'lucide-react'
import {useMemo,useRef,useState,type CSSProperties,type ReactNode} from 'react'
import {useParams} from 'react-router-dom'
import {editorialReadModel} from '../../editorial/repository'
import {AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {sitePageRepository} from '../pageRepository'
import {
  HOME_HERO_BACKGROUND_URL,
  defaultSectionConfiguration,
  heroTextPadding,
  readSectionConfiguration,
  resetSectionConfiguration,
  writeSectionConfiguration,
  type SectionConfiguration,
  type SectionHeroViewport,
} from '../sectionConfiguration'
import '../../../pages/home/styles/hero-editor-cms.css'
import '../../../styles/global-page-hero-editor.css'

type EditorTab='content'|'appearance'|'behavior'

type FieldProps={label:ReactNode;children:ReactNode;hint?:string}
function Field({label,children,hint}:FieldProps){return <label className="hero-cms-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}

const sectionName:Record<string,string>={
  'editorial-hero':'Hero Editorial',
  'sobre-hero':'Hero Institucional',
  'contato-hero':'Hero de Contato',
  'colabore-hero':'Hero Colabore',
}
const sectionEyebrow:Record<string,string>={
  'editorial-hero':'AGORA NO PORTAL',
  'sobre-hero':'INSTITUCIONAL',
  'contato-hero':'CONTATO',
  'colabore-hero':'PARTICIPE DO PORTAL',
}

function viewportLabel(viewport:SectionHeroViewport){return viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'}
function viewportWidth(viewport:SectionHeroViewport){return viewport==='desktop'?1440:viewport==='tablet'?768:390}
function heroHeight(config:SectionConfiguration,viewport:SectionHeroViewport){return viewport==='desktop'?config.heroHeightDesktop:viewport==='tablet'?config.heroHeightTablet:config.heroHeightMobile}

function Preview({config,viewport}:{config:SectionConfiguration;viewport:SectionHeroViewport}){
  const padding=heroTextPadding(config,viewport)
  const height=heroHeight(config,viewport)
  const style={
    height:`${height}px`,minHeight:`${height}px`,maxHeight:`${height}px`,
    background:config.background,color:config.imageUrl?'#fff':config.textColor,textAlign:config.textAlign,
    ...(config.imageUrl?{backgroundImage:`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.48)),url(${config.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat'}:{}),
  } as CSSProperties
  if(!config.active)return <div className="global-hero-preview-disabled">Hero desativada nesta página.</div>
  return <section className={`global-page-hero-preview ${viewport}`} style={style}><div className="global-page-hero-preview-shell"><div className="global-page-hero-preview-copy"><span style={{color:config.accentColor,padding:`${padding.kicker.y}px ${padding.kicker.x}px`}}>{config.eyebrow}</span><h1 style={{padding:`${padding.title.y}px ${padding.title.x}px`}}>{config.title}</h1>{config.description&&<p style={{padding:`${padding.description.y}px ${padding.description.x}px`}}>{config.description}</p>}{config.linkLabel&&<span className="global-page-hero-preview-cta" style={{background:config.accentColor}}>{config.linkLabel}</span>}</div></div></section>
}

export function GlobalHeroEditorPage({sectionId}:{sectionId:string}){
  const {pageId=''}=useParams()
  const page=editorialReadModel.pages.find(item=>item.id===pageId)
  const localPage=sitePageRepository.listDraftPages().find(item=>item.id===pageId)
  const pageTitle=page?.title||localPage?.title||'Página'
  const pageSlug=page?.slug||localPage?.slug||''
  const fallback=useMemo<Partial<SectionConfiguration>>(()=>({title:sectionId==='editorial-hero'?pageTitle.toUpperCase():undefined,description:page?.description||'',eyebrow:sectionEyebrow[sectionId]||'PORTAL LANDER'}),[pageTitle,page?.description,sectionId])
  const name=sectionName[sectionId]||'Hero Section'
  const [draft,setDraft]=useState<SectionConfiguration>(()=>readSectionConfiguration(pageId,sectionId,name,fallback))
  const [tab,setTab]=useState<EditorTab>('content')
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [dirty,setDirty]=useState(false)
  const [saved,setSaved]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const patch=(next:Partial<SectionConfiguration>)=>{setDraft(current=>({...current,...next}));setDirty(true);setSaved(false)}
  const save=()=>{writeSectionConfiguration(pageId,sectionId,draft);setDirty(false);setSaved(true)}
  const discard=()=>{setDraft(readSectionConfiguration(pageId,sectionId,name,fallback));setDirty(false);setSaved(false)}
  const reset=()=>{resetSectionConfiguration(pageId,sectionId);setDraft(defaultSectionConfiguration(sectionId,name,fallback));setDirty(true);setSaved(false)}
  const upload=(file?:File)=>{if(!file||!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>patch({imageUrl:String(reader.result||'')});reader.readAsDataURL(file)}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/${pageSlug}`
  const currentPadding=heroTextPadding(draft,viewport)
  const suffix=viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
  const heightKey=`heroHeight${suffix}` as keyof SectionConfiguration
  const paddingKey=(target:'Kicker'|'Title'|'Description',axis:'X'|'Y')=>`hero${target}Padding${axis}${suffix}` as keyof SectionConfiguration
  const setNumeric=(key:keyof SectionConfiguration,value:number)=>patch({[key]:value} as Partial<SectionConfiguration>)
  const deviceName=viewportLabel(viewport)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:`Configurar seção: ${name}`,description:'Editor global de Hero. Mesmo padrão visual e operacional da Hero Section da Homepage.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <div className="hero-cms-editor global-page-hero-editor">
      <div className="hero-cms-tabs" role="tablist" aria-label="Configuração global do Hero"><button className={tab==='content'?'active':''} onClick={()=>setTab('content')}>Conteúdo</button><button className={tab==='appearance'?'active':''} onClick={()=>setTab('appearance')}>Aparência</button><button className={tab==='behavior'?'active':''} onClick={()=>setTab('behavior')}>Comportamento</button></div>
      <div className="hero-cms-layout global-page-hero-layout">
        <main className="hero-cms-panel global-page-hero-controls">
          <div className={`hero-cms-device-context ${viewport}`}><div><strong>{deviceName}</strong><span>{viewport==='desktop'?'Configuração base da Hero desta página.':'Configuração específica deste breakpoint.'}</span></div></div>
          {tab==='content'&&<div className="hero-cms-tab-content"><div className="hero-cms-section-title"><div><h2>Conteúdo do Hero</h2><p>Conteúdo individual desta página usando o editor global do Portal Lander.</p></div></div><section className="hero-cms-group"><div className="hero-cms-grid two"><Field label="Chamada / kicker"><input value={draft.eyebrow} onChange={event=>patch({eyebrow:event.target.value})}/></Field><Field label="Título"><input value={draft.title} onChange={event=>patch({title:event.target.value})}/></Field></div><Field label="Descrição"><textarea rows={5} value={draft.description} onChange={event=>patch({description:event.target.value})}/></Field><div className="hero-cms-grid two"><Field label="Texto do CTA"><input value={draft.linkLabel} onChange={event=>patch({linkLabel:event.target.value})} placeholder="Opcional"/></Field><Field label="Destino do CTA"><input value={draft.linkUrl} onChange={event=>patch({linkUrl:event.target.value})} placeholder="/noticias"/></Field></div></section><section className="hero-cms-group"><h3>Mídia principal</h3><div className="hero-cms-media-preview">{draft.imageUrl?<img src={draft.imageUrl} alt="Preview da imagem de fundo"/>:<ImageIcon size={34}/>}</div><div className="hero-cms-inline-actions"><input ref={fileRef} hidden type="file" accept="image/*" onChange={event=>upload(event.target.files?.[0])}/><button type="button" className="button outline" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Fazer upload</button><button type="button" className="button outline" onClick={()=>patch({imageUrl:HOME_HERO_BACKGROUND_URL})}>Usar fundo da Homepage</button></div><Field label="URL da imagem"><input value={draft.imageUrl} onChange={event=>patch({imageUrl:event.target.value})}/></Field></section></div>}
          {tab==='appearance'&&<div className="hero-cms-tab-content"><div className="hero-cms-section-title"><div><h2>Aparência · {deviceName}</h2><p>Altura e espaçamentos são independentes por dispositivo, como na Hero da Homepage.</p></div><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button></div><section className="hero-cms-group"><h3>Dimensões e composição</h3><div className="hero-cms-grid two"><Field label={`Altura · ${heroHeight(draft,viewport)}px`}><input type="range" min="200" max="900" step="10" value={Number(draft[heightKey])} onChange={event=>setNumeric(heightKey,Number(event.target.value))}/></Field><Field label="Alinhamento horizontal"><select value={draft.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field></div></section><section className="hero-cms-group"><h3>Espaçamento dos textos</h3><p className="hero-cms-group-note">Ajuste o padding individual de cada elemento no dispositivo selecionado.</p>{([['Kicker','Chamada / kicker',currentPadding.kicker],['Title','Título',currentPadding.title],['Description','Descrição',currentPadding.description]] as const).map(([target,label,value])=><div className="global-hero-padding-row" key={target}><strong>{label}</strong><div className="hero-cms-grid two"><Field label={`Horizontal · ${value.x}px`}><input type="range" min="0" max="160" value={Number(draft[paddingKey(target,'X')])} onChange={event=>setNumeric(paddingKey(target,'X'),Number(event.target.value))}/></Field><Field label={`Vertical · ${value.y}px`}><input type="range" min="0" max="120" value={Number(draft[paddingKey(target,'Y')])} onChange={event=>setNumeric(paddingKey(target,'Y'),Number(event.target.value))}/></Field></div></div>)}</section><section className="hero-cms-group"><h3>Cores globais</h3><div className="hero-cms-grid colors"><Field label="Background"><input type="color" value={draft.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={draft.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={draft.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></section></div>}
          {tab==='behavior'&&<div className="hero-cms-tab-content"><div className="hero-cms-section-title"><div><h2>Comportamento</h2><p>Estado e regras operacionais da Hero desta página.</p></div></div><section className="hero-cms-group"><div className="hero-cms-grid two"><Field label="Status"><select value={draft.active?'on':'off'} onChange={event=>patch({active:event.target.value==='on'})}><option value="on">Ativa</option><option value="off">Inativa</option></select></Field><Field label="Imagem padrão"><select value={draft.imageUrl===HOME_HERO_BACKGROUND_URL?'home':'custom'} onChange={event=>event.target.value==='home'&&patch({imageUrl:HOME_HERO_BACKGROUND_URL})}><option value="home">Fundo oficial da Homepage</option><option value="custom">Imagem personalizada</option></select></Field></div></section></div>}
        </main>
        <aside className="hero-cms-preview-column global-page-hero-preview-column"><div className="hero-cms-preview-head"><div><h2>Preview em tempo real</h2><p>{deviceName}: {viewportWidth(viewport)}px · altura {heroHeight(draft,viewport)}px</p></div><div className="hero-cms-viewports"><button className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')} aria-label="Desktop"><Monitor size={17}/></button><button className={viewport==='tablet'?'active':''} onClick={()=>setViewport('tablet')} aria-label="Tablet"><Tablet size={17}/></button><button className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')} aria-label="Mobile"><Smartphone size={17}/></button></div></div><div className={`global-page-hero-preview-stage ${viewport}`}><div className="global-page-hero-preview-canvas"><Preview config={draft} viewport={viewport}/></div></div></aside>
      </div>
      <div className="hero-cms-savebar"><div><span className={`hero-cms-unsaved-dot ${dirty?'dirty':''}`}/><strong>{dirty?'Alterações não salvas':saved?'Alterações salvas':'Sem alterações pendentes'}</strong><small>Revise Desktop, Tablet e Mobile antes de concluir.</small></div><div><button type="button" className="button outline" onClick={discard} disabled={!dirty}>Descartar alterações</button><button type="button" className="button dark hero-cms-save" onClick={save} disabled={!dirty}><Save size={16}/> Salvar alterações</button></div></div>
    </div>
  </AdminShell>
}
