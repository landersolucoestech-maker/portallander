import {ArrowDown,ArrowUp,Monitor,RotateCcw,Save,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useState,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {homeReadModel,type HomeAgendaItem,type HomeRelease,type HomeStory} from '../../../pages/home/models/homeReadModel'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {
  HOME_CONTENT_MAX_ITEMS,
  filterAgendaByWindow,
  withHomeContentSectionConfiguration,
  type HomeContentSectionConfiguration,
  type HomeContentSectionId,
  type HomeSelectionMode,
  type HomeSortMode,
} from '../homeContentSectionConfiguration'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/section-editor-workbench.css'

type EditorTab='content'|'appearance'|'behavior'
type PreviewItem={key:string;title:string}

const meta:Record<HomeContentSectionId,{name:string;summary:string;criterion:string;responsive:string}>={
  'em-destaque':{name:'Em Destaque',summary:'Grid principal de matérias em destaque.',criterion:'Destaques definidos pela fonte editorial',responsive:'Desktop 3 colunas · Tablet 2 quando há espaço · Mobile 1'},
  'ultimas-noticias':{name:'Últimas Notícias',summary:'Listagem das publicações mais recentes.',criterion:'Ordem atual da fonte de notícias',responsive:'Desktop 3 colunas · Tablet 2 quando há espaço · Mobile 1'},
  'lancamentos':{name:'Lançamentos',summary:'Grid de lançamentos musicais.',criterion:'Lançamentos disponíveis na fonte editorial',responsive:'Desktop 4 colunas · Tablet 2 · Mobile 1'},
  'agenda':{name:'Agenda',summary:'Eventos e destaques da agenda.',criterion:'Eventos conforme janela temporal configurada',responsive:'Lista responsiva; a sidebar migra para baixo em viewports menores'},
  'em-alta':{name:'Em Alta',summary:'Conteúdos e assuntos em alta.',criterion:'Ranking de popularidade fornecido pela fonte atual',responsive:'Lista responsiva; a sidebar migra para baixo em viewports menores'},
}

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))
const viewportLabel=(viewport:SectionHeroViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}
function Tab({active,label,onClick}:{active:boolean;label:string;onClick:()=>void}){return <button type="button" className={`section-editor-tab${active?' active':''}`} onClick={onClick}>{label}</button>}

function availableFor(sectionId:HomeContentSectionId,config?:HomeContentSectionConfiguration):PreviewItem[]{
  if(sectionId==='em-destaque'||sectionId==='ultimas-noticias')return homeReadModel.stories.map((item:HomeStory)=>({key:item.title,title:item.title}))
  if(sectionId==='lancamentos')return homeReadModel.releases.map((item:HomeRelease)=>({key:item.title,title:item.title}))
  if(sectionId==='agenda')return filterAgendaByWindow(homeReadModel.agenda,config?.homeAgendaWindow||'all').map((item:HomeAgendaItem)=>({key:item.title,title:item.title}))
  return homeReadModel.mostRead.map(title=>({key:title,title}))
}

export function HomeContentSectionPage({sectionId}:{sectionId:HomeContentSectionId}){
  const info=meta[sectionId]
  const initial=()=>withHomeContentSectionConfiguration(defaultSectionConfiguration(sectionId,info.name),sectionId)
  const [config,setConfig]=useState<HomeContentSectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<HomeContentSectionConfiguration>(initial)
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [tab,setTab]=useState<EditorTab>('content')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const max=HOME_CONTENT_MAX_ITEMS[sectionId]
  const available=availableFor(sectionId,config)
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)

  useEffect(()=>{let active=true;void loadAdminHomeSection(sectionId,info.name).then(value=>{if(!active)return;const normalized=withHomeContentSectionConfiguration(value,sectionId);setConfig(normalized);setPersisted(normalized)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[sectionId,info.name])

  const patch=(next:Partial<HomeContentSectionConfiguration>)=>{setConfig(current=>withHomeContentSectionConfiguration({...current,...next},sectionId));setMessage('');setError('')}
  const toggleManual=(key:string)=>patch({homeManualSelection:config.homeManualSelection.includes(key)?config.homeManualSelection.filter(item=>item!==key):[...config.homeManualSelection,key]})
  const moveManual=(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=config.homeManualSelection.length)return;const next=[...config.homeManualSelection];[next[index],next[target]]=[next[target],next[index]];patch({homeManualSelection:next})}
  const reset=()=>{setConfig(withHomeContentSectionConfiguration(defaultSectionConfiguration(sectionId,info.name),sectionId));setMessage('');setError('')}
  const discard=()=>{setConfig(persisted);setMessage('');setError('')}
  const save=async()=>{if(saving)return;setSaving(true);setError('');setMessage('');try{const candidate=withHomeContentSectionConfiguration({...config,itemLimit:clamp(config.itemLimit,0,max)},sectionId);const saved=withHomeContentSectionConfiguration(await saveHomeSection(sectionId,info.name,candidate),sectionId);setConfig(saved);setPersisted(saved);setMessage('Configuração persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} O último estado persistido foi mantido.`:'Falha ao salvar. O último estado persistido foi mantido.')}finally{setSaving(false)}}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:`Configurar seção: ${info.name}`,description:`Configure ${info.name} no painel rolável à esquerda e acompanhe a Página Inicial completa no preview fixo à direita.`,backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title={`Sincronizando ${info.name}`} description="Carregando a configuração persistida antes de abrir o editor."/>}
    {error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    {!loading&&<div className="section-editor-workbench">
      <div className="section-editor-rail" aria-label={`Configurações da seção ${info.name}`}>
        <section className="section-editor-card section-editor-summary"><div className="section-editor-summary-head"><div><small>{info.name.toUpperCase()}</small><h2>Configurações da seção</h2><p>{info.summary}</p></div><label className="section-editor-active"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div></section>
        <div className="section-editor-tabs" aria-label="Grupos de configuração"><Tab active={tab==='content'} label="Conteúdo" onClick={()=>setTab('content')}/><Tab active={tab==='appearance'} label="Aparência" onClick={()=>setTab('appearance')}/><Tab active={tab==='behavior'} label="Comportamento" onClick={()=>setTab('behavior')}/></div>
        <section className="section-editor-card section-editor-detail">
          {tab==='content'&&<><div className="section-editor-card-head"><h3>Conteúdo</h3><p>Defina conteúdo, quantidade, seleção e prioridade desta seção.</p></div><div className="section-config-fields"><Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field><div className="section-config-two"><Field label={`Quantidade exibida · máximo ${max}`}><input type="number" min="0" max={max} value={config.itemLimit} onChange={event=>patch({itemLimit:clamp(Number(event.target.value)||0,0,max)})}/></Field><Field label="Modo de seleção"><select value={config.homeSelectionMode} onChange={event=>patch({homeSelectionMode:event.target.value as HomeSelectionMode})}><option value="automatic">Automático</option><option value="manual">Manual</option></select></Field></div><div className="section-config-two"><Field label="Ordenação"><select value={config.homeSortMode} onChange={event=>patch({homeSortMode:event.target.value as HomeSortMode})}><option value="provider">Ordem da fonte</option><option value="reverse">Ordem inversa</option><option value="title-asc">Título A–Z</option><option value="title-desc">Título Z–A</option></select></Field><Field label="Critério automático"><input value={info.criterion} disabled/></Field></div>{sectionId==='agenda'&&<Field label="Eventos considerados"><select value={config.homeAgendaWindow} onChange={event=>patch({homeAgendaWindow:event.target.value as HomeContentSectionConfiguration['homeAgendaWindow']})}><option value="all">Todos</option><option value="future">Futuros</option><option value="past">Passados</option></select></Field>}{config.homeSelectionMode==='manual'&&<div className="section-editor-manual"><strong>Seleção manual e prioridade</strong><p>Marque os conteúdos e use as setas para definir a ordem exata.</p><div className="home-manual-selection-list">{available.map(item=>{const selectedIndex=config.homeManualSelection.indexOf(item.key);const selected=selectedIndex>=0;return <div className={`home-manual-selection-item${selected?' selected':''}`} key={item.key}><label><input type="checkbox" checked={selected} disabled={!selected&&config.homeManualSelection.length>=max} onChange={()=>toggleManual(item.key)}/><span>{item.title}</span></label>{selected&&<div><button type="button" onClick={()=>moveManual(selectedIndex,-1)} disabled={selectedIndex===0} aria-label={`Subir ${item.title}`}><ArrowUp size={14}/></button><button type="button" onClick={()=>moveManual(selectedIndex,1)} disabled={selectedIndex===config.homeManualSelection.length-1} aria-label={`Descer ${item.title}`}><ArrowDown size={14}/></button></div>}</div>})}</div></div>}</div></>}
          {tab==='appearance'&&<><div className="section-editor-card-head"><h3>Aparência</h3><p>Use os mesmos controles visuais e tokens adotados pelas demais configurações.</p></div><div className="section-config-fields"><Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as HomeContentSectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></div></>}
          {tab==='behavior'&&<><div className="section-editor-card-head"><h3>Comportamento</h3><p>O comportamento público responde ao viewport real do mesmo preview usado pela Hero Section.</p></div><div className="section-config-fields"><div className="section-editor-rule"><strong>Comportamento responsivo</strong><p>{info.responsive}. A estrutura é a mesma da Home pública.</p><span className="section-editor-device-badge">{viewportLabel(viewport)}</span></div><div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})}/></Field></div></div></>}
        </section>
        <div className="section-editor-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button></div>
        {message&&<div className="section-config-success" role="status">{message}</div>}
      </div>
      <section className="section-editor-preview" aria-label="Preview completo da Página Inicial"><div className="section-editor-preview-head"><div><h2>Preview da página inteira</h2><p>{viewportLabel(viewport)} · edição em tempo real · alterações refletidas antes de salvar.</p></div><div className="section-editor-devices" aria-label="Viewport do preview"><button type="button" className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')} aria-label="Desktop" title="Desktop"><Monitor size={17}/></button><button type="button" className={viewport==='tablet'?'active':''} onClick={()=>setViewport('tablet')} aria-label="Tablet" title="Tablet"><Tablet size={17}/></button><button type="button" className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')} aria-label="Mobile" title="Mobile"><Smartphone size={17}/></button></div></div><div className="section-editor-preview-canvas"><HomePagePreviewFrame sectionId={sectionId} configuration={config} viewport={viewport}/></div></section>
    </div>}
    {!loading&&<div className="section-editor-savebar"><div><span className={`section-editor-save-state${dirty?' dirty':''}`}/><strong>{dirty?'Alterações não salvas':'Sem alterações pendentes'}</strong><small>{dirty?'O preview já mostra o rascunho; a Home pública só muda após salvar.':'O estado salvo continua sendo usado pela Home.'}</small></div><div><button type="button" className="button outline" disabled={!dirty||saving} onClick={discard}>Descartar alterações</button><button type="button" className="button dark" disabled={!dirty||saving} onClick={()=>void save()}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div></div>}
  </AdminShell>
}
