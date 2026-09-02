import {ExternalLink,Monitor,RotateCcw,Save,Smartphone,Tablet} from 'lucide-react'
import {useMemo,useState,type CSSProperties,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {SectionMediaField} from '../components/SectionMediaField'
import {
  advertisingViewportLayout,
  withAdvertisingSectionLayout,
  type AdvertisingAlignment,
  type AdvertisingSectionConfiguration,
} from '../advertisingSectionLayout'
import {
  defaultSectionConfiguration,
  readSectionConfiguration,
  resetSectionConfiguration,
  writeSectionConfiguration,
  type SectionHeroViewport,
} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/home-advertising-editor.css'

type AdvertisingSectionId='publicidade-lateral'|'anuncie-aqui'
type PreviewViewport=SectionHeroViewport

const labels:Record<AdvertisingSectionId,{name:string;summary:string}>={
  'publicidade-lateral':{name:'Publicidade Lateral',summary:'Controle completo da publicidade lateral da Página Inicial.'},
  'anuncie-aqui':{name:'Anuncie Aqui',summary:'Controle completo do banner comercial Anuncie Aqui da Página Inicial.'},
}

function clamp(value:number,min:number,max:number){return Math.min(max,Math.max(min,value))}
function suffix(viewport:PreviewViewport){return viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'}
function viewportLabel(viewport:PreviewViewport){return viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

function AdvertisingPreview({config,viewport,name}:{config:AdvertisingSectionConfiguration;viewport:PreviewViewport;name:string}){
  if(!config.active)return <div className="section-preview-disabled">Esta publicidade está desativada.</div>
  const layout=advertisingViewportLayout(config,viewport)
  const imageFit=config.adImageFit==='cover'?'cover':'contain'
  const hasImage=Boolean(config.imageUrl.trim())
  const style={
    width:layout.width>0?`${layout.width}px`:'100%',
    height:hasImage?'auto':layout.height>0?`${layout.height}px`:'auto',
    justifySelf:layout.align==='left'?'start':layout.align==='right'?'end':'center',
    margin:`${layout.marginY}px ${layout.marginX}px`,
    padding:hasImage?'0':`${layout.paddingY}px ${layout.paddingX}px`,
    transform:`translate(${layout.offsetX}px,${layout.offsetY}px)`,
    background:hasImage?'transparent':config.background,
    color:config.textColor,
  } as CSSProperties
  const image=hasImage?<img className="home-advertising-preview-image" src={config.imageUrl} alt={`Preview ${name}`} style={{objectFit:imageFit,height:'auto'}}/>:null
  const fallback=<div className="home-advertising-preview-placeholder"><div>{config.eyebrow&&<span className="home-advertising-preview-kicker">{config.eyebrow}</span>}<strong>{config.title||name}</strong>{config.description&&<p>{config.description}</p>}{config.linkLabel&&<span className="home-advertising-preview-button">{config.linkLabel} →</span>}</div></div>
  const creative=image||fallback
  return <div className="home-advertising-preview-stage"><section className={`home-advertising-preview-card ${hasImage?'has-creative':'is-empty'} ad-fit-${imageFit}`} style={style}>
    {config.adLinkEnabled&&config.linkUrl?<a className="home-advertising-preview-clickable" href={config.linkUrl} target={config.adLinkTarget==='new'?'_blank':'_self'} rel={config.adLinkTarget==='new'?'noreferrer':undefined} onClick={event=>event.preventDefault()} aria-label={`Link da publicidade para ${config.linkUrl}`}>{creative}</a>:creative}
  </section></div>
}

export function HomeAdvertisingSectionPage({sectionId}:{sectionId:AdvertisingSectionId}){
  const meta=labels[sectionId]
  const initial=()=>withAdvertisingSectionLayout(readSectionConfiguration('home',sectionId,meta.name),sectionId)
  const [config,setConfig]=useState<AdvertisingSectionConfiguration>(initial)
  const [saved,setSaved]=useState(false)
  const [previewViewport,setPreviewViewport]=useState<PreviewViewport>('desktop')
  const layout=advertisingViewportLayout(config,previewViewport)
  const deviceSuffix=suffix(previewViewport)
  const patch=(next:Partial<AdvertisingSectionConfiguration>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const patchDevice=(prefix:string,value:number|AdvertisingAlignment)=>patch({[`${prefix}${deviceSuffix}`]:value} as Partial<AdvertisingSectionConfiguration>)
  const save=()=>{writeSectionConfiguration('home',sectionId,config);setSaved(true)}
  const reset=()=>{resetSectionConfiguration('home',sectionId);setConfig(withAdvertisingSectionLayout(defaultSectionConfiguration(sectionId,meta.name),sectionId));setSaved(false)}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/`
  const title=useMemo(()=>`Configurar seção: ${meta.name}`,[meta.name])
  const isSidebar=sectionId==='publicidade-lateral'

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title,description:'Dimensione, posicione e configure o anúncio por dispositivo com preview em tempo real.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <AdminNotice title="Publicidade totalmente configurável" description={isSidebar?'Com imagem, a arte mantém sua proporção natural. Sem imagem, largura e altura configuradas controlam o espaço comercial e os textos abaixo ficam visíveis no frontend.':'Por padrão a arte ocupa 100% da largura disponível e mantém a altura proporcional original. Defina uma altura apenas quando quiser forçar um espaço específico.'}/>
    <div className="section-config-workbench">
      <aside className="section-config-panel">
        <div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>{meta.name}</h2><p>{meta.summary}</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div>
        <div className="section-config-fields">
          <SectionMediaField value={config.imageUrl} onChange={imageUrl=>patch({imageUrl})} label="Imagem do anúncio"/>
          <div className="home-advertising-copy-card">
            <strong>Conteúdo exibido quando não houver imagem</strong>
            <Field label="Chamada superior"><input value={config.eyebrow} onChange={event=>patch({eyebrow:event.target.value})} placeholder="ANUNCIE AQUI"/></Field>
            <Field label="Título principal"><input value={config.title} onChange={event=>patch({title:event.target.value})} placeholder="PUBLICIDADE"/></Field>
            <Field label="Descrição"><textarea rows={3} value={config.description} onChange={event=>patch({description:event.target.value})} placeholder="Texto opcional da área comercial"/></Field>
            <Field label="Texto do botão"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})} placeholder="SAIBA MAIS"/></Field>
          </div>
          <div className="home-advertising-link-card"><label className="section-config-switch"><input type="checkbox" checked={config.adLinkEnabled} onChange={event=>patch({adLinkEnabled:event.target.checked})}/><span>Área inteira clicável</span></label><div className="section-config-two"><Field label="URL de destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})} placeholder="https://... ou /pagina"/></Field><Field label="Abrir link"><select value={config.adLinkTarget} onChange={event=>patch({adLinkTarget:event.target.value as AdvertisingSectionConfiguration['adLinkTarget']})}><option value="same">Na mesma aba</option><option value="new">Em nova aba</option></select></Field></div></div>
          <Field label="Ajuste da imagem"><select value={config.adImageFit==='cover'?'cover':'contain'} onChange={event=>patch({adImageFit:event.target.value as AdvertisingSectionConfiguration['adImageFit']})}><option value="contain">Conter inteira — preserva toda a arte</option><option value="cover">Preencher — corte proporcional quando necessário</option></select></Field>
          <div className="home-advertising-device-card"><div className="home-advertising-device-card-head"><strong>Layout · {viewportLabel(previewViewport)}</strong><span>{isSidebar?'Sem imagem: 0 na largura = 100% · 0 na altura = automática. Com imagem: altura natural da arte.':'0 na largura = 100% · 0 na altura = proporcional à imagem'}</span></div><div className="section-config-two"><Field label={`Largura · ${layout.width||'100%'}${layout.width?'px':''}`}><input type="number" min="0" max="1920" step="1" value={layout.width} onChange={event=>patchDevice('adWidth',clamp(Number(event.target.value)||0,0,1920))}/></Field><Field label={`Altura · ${layout.height||'automática'}${layout.height?'px':''}`}><input type="number" min="0" max="1600" step="1" value={layout.height} onChange={event=>patchDevice('adHeight',clamp(Number(event.target.value)||0,0,1600))}/></Field></div><Field label="Alinhamento horizontal"><select value={layout.align} onChange={event=>patchDevice('adAlign',event.target.value as AdvertisingAlignment)}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-two"><Field label={`Margem horizontal · ${layout.marginX}px`}><input type="number" min="0" max="400" value={layout.marginX} onChange={event=>patchDevice('adMarginX',clamp(Number(event.target.value)||0,0,400))}/></Field><Field label={`Margem vertical · ${layout.marginY}px`}><input type="number" min="0" max="400" value={layout.marginY} onChange={event=>patchDevice('adMarginY',clamp(Number(event.target.value)||0,0,400))}/></Field></div><div className="section-config-two"><Field label={`Padding horizontal · ${layout.paddingX}px`}><input type="number" min="0" max="400" value={layout.paddingX} onChange={event=>patchDevice('adPaddingX',clamp(Number(event.target.value)||0,0,400))}/></Field><Field label={`Padding vertical · ${layout.paddingY}px`}><input type="number" min="0" max="400" value={layout.paddingY} onChange={event=>patchDevice('adPaddingY',clamp(Number(event.target.value)||0,0,400))}/></Field></div><div className="section-config-two"><Field label={`Deslocamento X · ${layout.offsetX}px`}><input type="number" min="-600" max="600" value={layout.offsetX} onChange={event=>patchDevice('adOffsetX',clamp(Number(event.target.value)||0,-600,600))}/></Field><Field label={`Deslocamento Y · ${layout.offsetY}px`}><input type="number" min="-600" max="600" value={layout.offsetY} onChange={event=>patchDevice('adOffsetY',clamp(Number(event.target.value)||0,-600,600))}/></Field></div></div>
          <div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div>
        </div>
        <div className="section-config-actions"><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>{saved&&<div className="section-config-success">Configuração salva com sucesso.</div>}
      </aside>
      <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW AO VIVO</small><strong>{meta.name}</strong><span className="section-preview-device-meta">{viewportLabel(previewViewport)}</span></div><div className="section-preview-device-switch"><button type="button" className={previewViewport==='desktop'?'active':''} onClick={()=>setPreviewViewport('desktop')}><Monitor size={16}/> Desktop</button><button type="button" className={previewViewport==='tablet'?'active':''} onClick={()=>setPreviewViewport('tablet')}><Tablet size={16}/> Tablet</button><button type="button" className={previewViewport==='mobile'?'active':''} onClick={()=>setPreviewViewport('mobile')}><Smartphone size={16}/> Mobile</button></div></div><div className="section-config-preview-frame responsive-device-preview"><div className={`section-preview-device-canvas ${previewViewport}`}><AdvertisingPreview config={config} viewport={previewViewport} name={meta.name}/></div></div></section>
    </div>
  </AdminShell>
}
