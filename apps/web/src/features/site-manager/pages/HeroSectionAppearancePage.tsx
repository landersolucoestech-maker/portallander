import { ArrowLeft, Save } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { HeroSection } from '../../../pages/home/components/HeroSection'
import { readHeroConfig, type HeroCarouselConfig } from '../../../pages/home/models/heroModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

type HeroSectionConfig={
  active:boolean
  width:number
  height:number
  paddingX:number
  paddingY:number
  radius:number
  background:string
  textColor:string
  titleColor:string
  accentColor:string
  borderColor:string
}
type ColorField='background'|'textColor'|'titleColor'|'accentColor'|'borderColor'

const STORAGE_KEY='portal-lander:cms:section-config:hero:v4'
const DEFAULTS:HeroSectionConfig={active:true,width:100,height:560,paddingX:0,paddingY:0,radius:0,background:'#090909',textColor:'#ffffff',titleColor:'#ffffff',accentColor:'#ff151f',borderColor:'#090909'}

function loadConfig():HeroSectionConfig{
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    return raw?{...DEFAULTS,...JSON.parse(raw)}:DEFAULTS
  }catch{return DEFAULTS}
}

function withoutTicker(config:HeroCarouselConfig):HeroCarouselConfig{
  return {...config,ticker:{...config.ticker,active:false}}
}

export function HeroSectionAppearancePage(){
  const [config,setConfig]=useState<HeroSectionConfig>(loadConfig)
  const [saved,setSaved]=useState(false)
  const liveHero=useMemo(()=>withoutTicker(readHeroConfig()),[])
  const slide=liveHero.slides[0]
  const currentTitle=slide?.title.map(item=>item.text).join(' ')||''
  const patch=(next:Partial<HeroSectionConfig>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const setColor=(field:ColorField,value:string)=>patch({[field]:value} as Partial<HeroSectionConfig>)
  const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(config));setSaved(true)}
  const widthValue=config.width<=100?1200:config.width
  const previewStyle={
    maxWidth:config.width<=100?'100%':config.width,
    height:config.height,
    borderRadius:config.radius,
    borderColor:config.borderColor,
    background:config.background,
    padding:`${config.paddingY}px ${config.paddingX}px`,
    '--section-preview-bg':config.background,
    '--section-preview-text':config.textColor,
    '--section-preview-title':config.titleColor,
    '--section-preview-accent':config.accentColor,
  } as CSSProperties

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Hero principal',description:'Ajuste somente a aparência e as dimensões. A prévia usa exatamente o Hero que está publicado hoje na Home.'}}>
    <div className="section-editor-toolbar">
      <div><Link to="/app/site/secoes"><ArrowLeft size={14}/> Seções das Páginas</Link><span className="section-editor-status"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/> {config.active?'Ativo':'Inativo'}</span></div>
      <div><Link className="button outline" to="/app/site/secoes">Cancelar</Link><button className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>
    </div>
    {saved&&<div className="home-section-manager-success">Configuração visual do Hero salva.</div>}

    <div className="section-editor-layout">
      <section className="section-editor-card">
        <h2>Conteúdo atual da Home</h2>
        <div className="section-current-content">
          <span><b>Chamada</b>{slide?.eyebrow||'—'}</span>
          <span><b>Título</b>{currentTitle||'—'}</span>
          <span><b>Descrição</b>{slide?.description||'—'}</span>
          <span><b>Imagem</b>{slide?.imageAlt||'Imagem atual do Hero'}</span>
        </div>
        <small>Esses dados vêm do Hero real consumido pela página pública. O conteúdo editorial não é duplicado neste módulo.</small>

        <h2>Aparência e dimensões</h2>
        <div className="section-editor-slider"><span>Largura</span><input type="range" min="220" max="1600" value={widthValue} onChange={event=>patch({width:Number(event.target.value)})}/><b>{config.width<=100?'Auto':`${config.width}px`}</b></div>
        <div className="section-editor-slider"><span>Altura</span><input type="range" min="300" max="900" value={config.height} onChange={event=>patch({height:Number(event.target.value)})}/><b>{config.height}px</b></div>
        <div className="section-editor-slider"><span>Padding horizontal</span><input type="range" min="0" max="80" value={config.paddingX} onChange={event=>patch({paddingX:Number(event.target.value)})}/><b>{config.paddingX}px</b></div>
        <div className="section-editor-slider"><span>Padding vertical</span><input type="range" min="0" max="80" value={config.paddingY} onChange={event=>patch({paddingY:Number(event.target.value)})}/><b>{config.paddingY}px</b></div>
        <div className="section-editor-slider"><span>Arredondamento</span><input type="range" min="0" max="32" value={config.radius} onChange={event=>patch({radius:Number(event.target.value)})}/><b>{config.radius}px</b></div>

        <div className="section-editor-colors">
          {([['background','Cor de fundo'],['titleColor','Cor do título'],['textColor','Cor do texto'],['accentColor','Cor de destaque'],['borderColor','Cor da borda']] as const).map(([field,label])=><label key={field}>{label}<span><input type="color" value={config[field]} onChange={event=>setColor(field,event.target.value)}/><input value={config[field]} onChange={event=>setColor(field,event.target.value)}/></span></label>)}
        </div>
      </section>

      <section className="section-editor-preview-column">
        <div className="section-editor-card">
          <h2>Prévia real da seção</h2>
          <div className="section-real-preview-frame" style={previewStyle}>
            <div className="section-real-preview-content"><HeroSection config={liveHero} disableAutoplay/></div>
          </div>
        </div>
        <div className="section-editor-card section-details"><h2>Detalhes da seção</h2><dl><dt>Identificador</dt><dd>home_hero_principal</dd><dt>Origem da prévia</dt><dd>Mesmo Hero usado pela Home pública neste navegador</dd><dt>Posição na página</dt><dd>Primeiro bloco da página</dd><dt>Conteúdo</dt><dd>Administrado fora deste módulo</dd></dl></div>
      </section>
    </div>
  </AdminShell>
}
