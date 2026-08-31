import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroEditor } from '../../../pages/home/components/HeroEditor'
import { defaultHeroAppearance, readHeroAppearance, resetHeroAppearance, writeHeroAppearance, type HeroAppearanceConfig } from '../../../pages/home/models/heroAppearanceModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

type ColorField='background'|'textColor'|'titleColor'|'accentColor'|'borderColor'|'eyebrowColor'

export function HeroSectionAppearancePage(){
  const [appearance,setAppearance]=useState<HeroAppearanceConfig>(()=>readHeroAppearance())

  const patch=(next:Partial<HeroAppearanceConfig>)=>{
    setAppearance(current=>{
      const updated={...current,...next}
      writeHeroAppearance(updated)
      return updated
    })
  }

  const setColor=(field:ColorField,value:string)=>patch({[field]:value} as Partial<HeroAppearanceConfig>)
  const reset=()=>{resetHeroAppearance();setAppearance({...defaultHeroAppearance})}
  const widthValue=appearance.width<=100?1200:appearance.width

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Hero Editorial',description:'Uma única configuração para aparência, conteúdo, slides, imagem, CTAs e comportamento. A prévia usa o mesmo componente da Home.'}}>
    <div className="section-editor-toolbar">
      <div>
        <Link to="/app/site/secoes"><ArrowLeft size={14}/> Seções das Páginas</Link>
        <span className="section-editor-status"><input type="checkbox" checked={appearance.active} onChange={event=>patch({active:event.target.checked})}/> {appearance.active?'Ativo':'Inativo'}</span>
      </div>
      <div><button className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar aparência</button></div>
    </div>

    <section className="section-editor-card hero-appearance-panel">
      <div className="hero-appearance-panel-head">
        <div><span>APARÊNCIA DA SEÇÃO</span><h2>Dimensões, alinhamento, cores e tipografia</h2></div>
        <small>Alterações visuais são aplicadas imediatamente à prévia e ao estado desta seção.</small>
      </div>

      <div className="hero-appearance-columns">
        <div>
          <h3>Dimensões e alinhamento</h3>
          <div className="section-editor-slider"><span>Largura</span><input type="range" min="220" max="1600" value={widthValue} onChange={event=>patch({width:Number(event.target.value)})}/><b>{appearance.width<=100?'Auto':`${appearance.width}px`}</b></div>
          <div className="section-editor-slider"><span>Altura</span><input type="range" min="300" max="1000" value={appearance.height} onChange={event=>patch({height:Number(event.target.value)})}/><b>{appearance.height}px</b></div>
          <div className="section-editor-slider"><span>Padding horizontal</span><input type="range" min="0" max="120" value={appearance.paddingX} onChange={event=>patch({paddingX:Number(event.target.value)})}/><b>{appearance.paddingX}px</b></div>
          <div className="section-editor-slider"><span>Padding vertical</span><input type="range" min="0" max="120" value={appearance.paddingY} onChange={event=>patch({paddingY:Number(event.target.value)})}/><b>{appearance.paddingY}px</b></div>
          <div className="section-editor-slider"><span>Arredondamento</span><input type="range" min="0" max="48" value={appearance.radius} onChange={event=>patch({radius:Number(event.target.value)})}/><b>{appearance.radius}px</b></div>
          <div className="section-editor-two"><label>Alinhamento horizontal<select value={appearance.contentAlign} onChange={event=>patch({contentAlign:event.target.value as HeroAppearanceConfig['contentAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label><label>Alinhamento vertical<select value={appearance.verticalAlign} onChange={event=>patch({verticalAlign:event.target.value as HeroAppearanceConfig['verticalAlign']})}><option value="start">Topo</option><option value="center">Centro</option><option value="end">Base</option></select></label></div>
        </div>

        <div>
          <h3>Cores</h3>
          <div className="section-editor-colors">{([['background','Background'],['titleColor','Cor padrão do headline'],['textColor','Cor do texto'],['accentColor','Cor de destaque / CTA'],['borderColor','Cor da borda'],['eyebrowColor','Cor do eyebrow']] as const).map(([field,label])=><label key={field}>{label}<span><input type="color" value={appearance[field]} onChange={event=>setColor(field,event.target.value)}/><input value={appearance[field]} onChange={event=>setColor(field,event.target.value)}/></span></label>)}</div>
        </div>

        <div>
          <h3>Tipografia global</h3>
          <div className="section-editor-slider"><span>Eyebrow</span><input type="range" min="9" max="28" value={appearance.eyebrowSize} onChange={event=>patch({eyebrowSize:Number(event.target.value)})}/><b>{appearance.eyebrowSize}px</b></div>
          <div className="section-editor-slider"><span>Descrição</span><input type="range" min="11" max="32" value={appearance.descriptionSize} onChange={event=>patch({descriptionSize:Number(event.target.value)})}/><b>{appearance.descriptionSize}px</b></div>
          <div className="section-editor-slider"><span>CTAs</span><input type="range" min="10" max="24" value={appearance.ctaSize} onChange={event=>patch({ctaSize:Number(event.target.value)})}/><b>{appearance.ctaSize}px</b></div>
          <div className="section-editor-two"><label>Peso eyebrow<select value={appearance.eyebrowWeight} onChange={event=>patch({eyebrowWeight:Number(event.target.value)})}><option value="400">400</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></label><label>Peso descrição<select value={appearance.descriptionWeight} onChange={event=>patch({descriptionWeight:Number(event.target.value)})}><option value="300">300</option><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option></select></label><label>Peso CTAs<select value={appearance.ctaWeight} onChange={event=>patch({ctaWeight:Number(event.target.value)})}><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></label></div>
        </div>
      </div>
    </section>

    <div className="hero-section-full-editor hero-editor-embedded"><HeroEditor/></div>
  </AdminShell>
}
