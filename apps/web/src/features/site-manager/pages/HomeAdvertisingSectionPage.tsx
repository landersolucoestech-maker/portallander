import {ExternalLink,Monitor,RotateCcw,Save,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useMemo,useState,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {SectionMediaField} from '../components/SectionMediaField'
import {
  advertisingViewportLayout,
  withAdvertisingSectionLayout,
  type AdvertisingAlignment,
  type AdvertisingSectionConfiguration,
} from '../advertisingSectionLayout'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/home-advertising-editor.css'

type AdvertisingSectionId='publicidade-lateral'|'anuncie-aqui'
type PreviewViewport=SectionHeroViewport
const labels:Record<AdvertisingSectionId,{name:string;summary:string}>={
  'publicidade-lateral':{name:'Publicidade Lateral',summary:'Publicidade lateral da Página Inicial; no Tablet/Mobile migra para o fluxo principal.'},
  'anuncie-aqui':{name:'Anuncie Aqui',summary:'Banner comercial da Página Inicial com arte, clique e adaptação responsiva.'},
}
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))
const viewportLabel=(viewport:PreviewViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

export function HomeAdvertisingSectionPage({sectionId}:{sectionId:AdvertisingSectionId}){
  const meta=labels[sectionId]
  const initial=()=>withAdvertisingSectionLayout(defaultSectionConfiguration(sectionId,meta.name),sectionId)
  const [config,setConfig]=useState<AdvertisingSectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<AdvertisingSectionConfiguration>(initial)
  const [previewViewport,setPreviewViewport]=useState<PreviewViewport>('desktop')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)
  const title=useMemo(()=>`Configurar seção: ${meta.name}`,[meta.name])
  const isSidebar=sectionId==='publicidade-lateral'

  useEffect(()=>{let active=true;void loadAdminHomeSection(sectionId,meta.name).then(value=>{if(!active)return;const normalized=withAdvertisingSectionLayout(value,sectionId);setConfig(normalized);setPersisted(normalized)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida.')} ).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[sectionId,meta.name])

  const patch=(next:Partial<AdvertisingSectionConfiguration>)=>{setConfig(current=>({...current,...next}));setMessage('');setError('')}
  const reset=()=>patch(withAdvertisingSectionLayout(defaultSectionConfiguration(sectionId,meta.name),sectionId))
  const save=async()=>{if(saving)return;setSaving(true);setMessage('');setError('');try{const saved=withAdvertisingSectionLayout(await saveHomeSection(sectionId,meta.name,config),sectionId);setConfig(saved);setPersisted(saved);setMessage('Configuração persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} A publicidade publicada anteriormente foi preservada.`:'Falha ao salvar. O estado publicado anterior foi preservado.')}finally{setSaving(false)}}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/`
  const desktop=advertisingViewportLayout(config,'desktop')

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title,description:'Edite uma seção por vez e visualize a Página Inicial inteira usando o mesmo renderer público.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <AdminNotice title="Preview canônico da página inteira" description={isSidebar?'No Desktop a publicidade permanece lateral. Em Tablet/Mobile ela entra no fluxo principal, ocupando a largura disponível sem deformar a arte.':'O banner preserva o Desktop e responde ao viewport real de Tablet/Mobile sem duplicar conteúdo.'}/>
    {loading&&<AdminNotice title="Sincronizando publicidade" description="Carregando o último estado persistido antes da edição."/>}
    {error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    <div className="section-config-workbench">
      <aside className="section-config-panel">
        <div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>{meta.name}</h2><p>{meta.summary}</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div>
        <div className="section-config-fields">
          <SectionMediaField value={config.imageUrl} onChange={imageUrl=>patch({imageUrl})} label="Imagem do anúncio"/>
          <Field label="Texto alternativo da imagem"><input value={config.adImageAlt} onChange={event=>patch({adImageAlt:event.target.value})} placeholder={`Publicidade ${meta.name}`}/></Field>
          <div className="home-advertising-copy-card"><strong>Conteúdo exibido quando não houver imagem</strong><Field label="Chamada superior"><input value={config.eyebrow} onChange={event=>patch({eyebrow:event.target.value})}/></Field><Field label="Título principal"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field><Field label="Descrição"><textarea rows={3} value={config.description} onChange={event=>patch({description:event.target.value})}/></Field><Field label="Texto do botão"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field></div>
          <div className="home-advertising-link-card"><label className="section-config-switch"><input type="checkbox" checked={config.adLinkEnabled} onChange={event=>patch({adLinkEnabled:event.target.checked})}/><span>Área inteira clicável</span></label><div className="section-config-two"><Field label="URL de destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})} placeholder="https://... ou /pagina"/></Field><Field label="Abrir link"><select value={config.adLinkTarget} onChange={event=>patch({adLinkTarget:event.target.value as AdvertisingSectionConfiguration['adLinkTarget']})}><option value="same">Na mesma aba</option><option value="new">Em nova aba</option></select></Field></div></div>
          <Field label="Ajuste da imagem"><select value={config.adImageFit} onChange={event=>patch({adImageFit:event.target.value as AdvertisingSectionConfiguration['adImageFit']})}><option value="contain">Conter inteira — preserva toda a arte</option><option value="cover">Preencher — corte proporcional quando necessário</option></select></Field>
          <div className="home-advertising-device-card"><div className="home-advertising-device-card-head"><strong>Layout Desktop de referência</strong><span>Tablet e Mobile são derivados automaticamente deste componente.</span></div><div className="section-config-two"><Field label={`Largura · ${desktop.width||'100%'}${desktop.width?'px':''}`}><input type="number" min="0" max="1920" value={desktop.width} onChange={event=>patch({adWidthDesktop:clamp(Number(event.target.value)||0,0,1920)})}/></Field><Field label={`Altura · ${desktop.height||'automática'}${desktop.height?'px':''}`}><input type="number" min="0" max="1600" value={desktop.height} onChange={event=>patch({adHeightDesktop:clamp(Number(event.target.value)||0,0,1600)})}/></Field></div><Field label="Alinhamento Desktop"><select value={desktop.align} onChange={event=>patch({adAlignDesktop:event.target.value as AdvertisingAlignment})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field></div>
          <div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div>
        </div>
        <div className="section-config-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" disabled={!dirty||saving} onClick={()=>void save()}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div>{message&&<div className="section-config-success" role="status">{message}</div>}
      </aside>
      <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW DA PÁGINA INTEIRA</small><strong>Página Inicial · foco em {meta.name}</strong><span className="section-preview-device-meta">{viewportLabel(previewViewport)}</span></div><div className="section-preview-device-switch"><button type="button" className={previewViewport==='desktop'?'active':''} onClick={()=>setPreviewViewport('desktop')}><Monitor size={16}/> Desktop</button><button type="button" className={previewViewport==='tablet'?'active':''} onClick={()=>setPreviewViewport('tablet')}><Tablet size={16}/> Tablet</button><button type="button" className={previewViewport==='mobile'?'active':''} onClick={()=>setPreviewViewport('mobile')}><Smartphone size={16}/> Mobile</button></div></div><div className="section-config-preview-frame responsive-device-preview"><HomePagePreviewFrame sectionId={sectionId} configuration={config} viewport={previewViewport}/></div></section>
    </div>
  </AdminShell>
}
