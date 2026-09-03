import {RotateCcw} from 'lucide-react'
import {useEffect,useState} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {SectionEditorField as Field,SectionEditorSaveBar,SectionEditorSummaryCard,SectionEditorTabButton as Tab,SectionViewportSwitch,type SectionEditorTabId as EditorTab} from '../components/SectionEditorUi'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/section-editor-workbench.css'

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))
const viewportLabel=(value:SectionHeroViewport)=>value==='desktop'?'Desktop':value==='tablet'?'Tablet':'Mobile'

export function HomeMostReadSectionPage(){
  const initial=()=>defaultSectionConfiguration('mais-lidas','Mais Lidas')
  const [config,setConfig]=useState<SectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<SectionConfiguration>(initial)
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [tab,setTab]=useState<EditorTab>('content')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)
  useEffect(()=>{let active=true;void loadAdminHomeSection('mais-lidas','Mais Lidas').then(value=>{if(active){setConfig(value);setPersisted(value)}}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
  const patch=(next:Partial<SectionConfiguration>)=>{setConfig(current=>({...current,...next}));setMessage('');setError('')}
  const reset=()=>{setConfig(defaultSectionConfiguration('mais-lidas','Mais Lidas'));setMessage('');setError('')}
  const discard=()=>{setConfig(persisted);setMessage('');setError('')}
  const save=async()=>{if(saving)return;setSaving(true);setError('');setMessage('');try{const saved=await saveHomeSection('mais-lidas','Mais Lidas',{...config,itemLimit:clamp(config.itemLimit||1,1,5)});setConfig(saved);setPersisted(saved);setMessage('Configuração persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} O ranking publicado anterior foi preservado.`:'Falha ao salvar. O estado publicado anterior foi preservado.')}finally{setSaving(false)}}
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Mais Lidas',description:'Configure Mais Lidas no painel rolável à esquerda e acompanhe a Página Inicial completa no preview fixo à direita.',backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title="Sincronizando Mais Lidas" description="Carregando a configuração persistida antes de abrir o editor."/>}{error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    {!loading&&<div className="section-editor-workbench"><div className="section-editor-rail" aria-label="Configurações da seção Mais Lidas"><SectionEditorSummaryCard eyebrow="MAIS LIDAS" description="Ranking das matérias mais acessadas da Página Inicial." active={config.active} onActiveChange={active=>patch({active})}/><div className="section-editor-tabs"><Tab active={tab==='content'} label="Conteúdo" onClick={()=>setTab('content')}/><Tab active={tab==='appearance'} label="Aparência" onClick={()=>setTab('appearance')}/><Tab active={tab==='behavior'} label="Comportamento" onClick={()=>setTab('behavior')}/></div><section className="section-editor-card section-editor-detail">
      {tab==='content'&&<><div className="section-editor-card-head"><h3>Conteúdo</h3><p>Defina o título e a quantidade do ranking.</p></div><div className="section-config-fields"><Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field><Field label="Quantidade máxima de conteúdos"><select value={clamp(config.itemLimit||1,1,5)} onChange={event=>patch({itemLimit:Number(event.target.value)})}>{[1,2,3,4,5].map(value=><option value={value} key={value}>{value} conteúdo{value>1?'s':''}</option>)}</select></Field></div></>}
      {tab==='appearance'&&<><div className="section-editor-card-head"><h3>Aparência</h3><p>Use a mesma linguagem visual das demais seções.</p></div><div className="section-config-fields"><Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></div></>}
      {tab==='behavior'&&<><div className="section-editor-card-head"><h3>Comportamento</h3><p>O ranking acompanha o viewport real do preview da Home.</p></div><div className="section-config-fields"><div className="section-editor-rule"><strong>Comportamento responsivo</strong><p>No Desktop permanece na coluna lateral; em Tablet e Mobile migra conforme a estrutura pública da Home.</p><span className="section-editor-device-badge">{viewportLabel(viewport)}</span></div><div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})}/></Field></div></div></>}
    </section><div className="section-editor-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button></div>{message&&<div className="section-config-success" role="status">{message}</div>}</div><section className="section-editor-preview"><div className="section-editor-preview-head"><div><h2>Preview da página inteira</h2><p>{viewportLabel(viewport)} · edição em tempo real · alterações refletidas antes de salvar.</p></div><SectionViewportSwitch viewport={viewport} onChange={setViewport}/></div><div className="section-editor-preview-canvas"><HomePagePreviewFrame sectionId="mais-lidas" configuration={config} viewport={viewport}/></div></section></div>}
    {!loading&&<SectionEditorSaveBar dirty={dirty} saving={saving} onDiscard={discard} onSave={()=>void save()} dirtyText="O preview já mostra o rascunho; a Home pública só muda após salvar." cleanText="O estado salvo continua sendo usado pela Home."/>}
  </AdminShell>
}
