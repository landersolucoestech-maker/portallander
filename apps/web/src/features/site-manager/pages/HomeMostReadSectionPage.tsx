import {ExternalLink,Monitor,RotateCcw,Save,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useState,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))
const viewportLabel=(value:SectionHeroViewport)=>value==='desktop'?'Desktop':value==='tablet'?'Tablet':'Mobile'
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

export function HomeMostReadSectionPage(){
  const initial=()=>defaultSectionConfiguration('mais-lidas','Mais Lidas')
  const [config,setConfig]=useState<SectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<SectionConfiguration>(initial)
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)

  useEffect(()=>{let active=true;void loadAdminHomeSection('mais-lidas','Mais Lidas').then(value=>{if(active){setConfig(value);setPersisted(value)}}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida.')} ).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])

  const patch=(next:Partial<SectionConfiguration>)=>{setConfig(current=>({...current,...next}));setMessage('');setError('')}
  const reset=()=>patch(defaultSectionConfiguration('mais-lidas','Mais Lidas'))
  const save=async()=>{if(saving)return;setSaving(true);setError('');setMessage('');try{const saved=await saveHomeSection('mais-lidas','Mais Lidas',{...config,itemLimit:clamp(config.itemLimit||1,1,5)});setConfig(saved);setPersisted(saved);setMessage('Configuração persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} O ranking publicado anterior foi preservado.`:'Falha ao salvar. O estado publicado anterior foi preservado.')}finally{setSaving(false)}}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/`

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Mais Lidas',description:'Edite uma seção por vez e visualize a Página Inicial inteira usando o mesmo renderer público.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <AdminNotice title="Quantidade configurável" description="Escolha de 1 a 5 conteúdos. O preview mostra a Página Inicial completa e usa o viewport real do frontend."/>
    {loading&&<AdminNotice title="Sincronizando seção" description="Carregando o último estado persistido."/>}{error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    <div className="section-config-workbench"><aside className="section-config-panel"><div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>Mais Lidas</h2><p>Ranking das matérias mais acessadas da Página Inicial.</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div><div className="section-config-fields"><Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field><Field label="Quantidade máxima de conteúdos"><select aria-label="Quantidade máxima de conteúdos" value={clamp(config.itemLimit||1,1,5)} onChange={event=>patch({itemLimit:Number(event.target.value)})}><option value="1">1 conteúdo</option><option value="2">2 conteúdos</option><option value="3">3 conteúdos</option><option value="4">4 conteúdos</option><option value="5">5 conteúdos</option></select></Field><div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})}/></Field></div><Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></div><div className="section-config-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" disabled={!dirty||saving} onClick={()=>void save()}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div>{message&&<div className="section-config-success" role="status">{message}</div>}</aside>
      <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW DA PÁGINA INTEIRA</small><strong>Página Inicial · foco em Mais Lidas</strong><span className="section-preview-device-meta">{viewportLabel(viewport)}</span></div><div className="section-preview-device-switch"><button type="button" className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')}><Monitor size={16}/> Desktop</button><button type="button" className={viewport==='tablet'?'active':''} onClick={()=>setViewport('tablet')}><Tablet size={16}/> Tablet</button><button type="button" className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')}><Smartphone size={16}/> Mobile</button></div></div><div className="section-config-preview-frame responsive-device-preview"><HomePagePreviewFrame sectionId="mais-lidas" configuration={config} viewport={viewport}/></div></section></div>
  </AdminShell>
}
