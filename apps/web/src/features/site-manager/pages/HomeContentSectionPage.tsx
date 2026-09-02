import {ArrowDown,ArrowUp,ExternalLink,Monitor,RotateCcw,Save,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useState,type CSSProperties,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {homeReadModel,type HomeAgendaItem,type HomeRelease,type HomeStory} from '../../../pages/home/models/homeReadModel'
import {
  HOME_CONTENT_MAX_ITEMS,
  filterAgendaByWindow,
  homeContentResponsiveCssVariables,
  homeContentViewportLayout,
  selectConfiguredItems,
  withHomeContentSectionConfiguration,
  type HomeContentSectionConfiguration,
  type HomeContentSectionId,
  type HomeSelectionMode,
  type HomeSortMode,
} from '../homeContentSectionConfiguration'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,readSectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../pages/home/styles/home-official-sections.css'
import '../../../pages/home/styles/home-content-responsive.css'
import '../../../styles/section-configuration-editor.css'

type PreviewViewport=SectionHeroViewport
type PreviewItem={key:string;title:string;subtitle?:string;image?:string;badge?:string}

const meta:Record<HomeContentSectionId,{name:string;summary:string;criterion:string;responsive:string}>={
  'em-destaque':{name:'Em Destaque',summary:'Grid principal de matérias em destaque.',criterion:'Destaques definidos pela fonte editorial',responsive:'Desktop 3 colunas · Tablet 2 · Mobile 1'},
  'ultimas-noticias':{name:'Últimas Notícias',summary:'Listagem das publicações mais recentes.',criterion:'Ordem atual da fonte de notícias',responsive:'Desktop 2 colunas · Tablet 2 quando há espaço · Mobile 1'},
  'lancamentos':{name:'Lançamentos',summary:'Grid de lançamentos musicais.',criterion:'Lançamentos disponíveis na fonte editorial',responsive:'Desktop 4 colunas · Tablet 2 · Mobile 1'},
  'agenda':{name:'Agenda',summary:'Eventos e destaques da agenda.',criterion:'Eventos conforme janela temporal configurada',responsive:'Uma lista responsiva; a sidebar migra para baixo em viewports menores'},
  'em-alta':{name:'Em Alta',summary:'Conteúdos e assuntos em alta.',criterion:'Ranking de popularidade fornecido pela fonte de dados atual',responsive:'Uma lista responsiva; a sidebar migra para baixo em viewports menores'},
}

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))
const viewportLabel=(viewport:PreviewViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

function availableFor(sectionId:HomeContentSectionId,config?:HomeContentSectionConfiguration):PreviewItem[]{
  if(sectionId==='em-destaque'||sectionId==='ultimas-noticias')return homeReadModel.stories.map((item:HomeStory)=>({key:item.title,title:item.title,subtitle:item.meta,image:item.image,badge:item.category}))
  if(sectionId==='lancamentos')return homeReadModel.releases.map((item:HomeRelease)=>({key:item.title,title:item.title,subtitle:item.year,image:item.image,badge:'▶'}))
  if(sectionId==='agenda')return filterAgendaByWindow(homeReadModel.agenda,config?.homeAgendaWindow||'all').map((item:HomeAgendaItem)=>({key:item.title,title:item.title,subtitle:`${item.day} ${item.month} · ${item.place}`}))
  return homeReadModel.mostRead.map(title=>({key:title,title}))
}
function automaticFor(sectionId:HomeContentSectionId,config:HomeContentSectionConfiguration):PreviewItem[]{
  if(sectionId==='em-destaque')return homeReadModel.featuredStories.map(item=>({key:item.title,title:item.title,subtitle:item.meta,image:item.image,badge:item.category}))
  if(sectionId==='ultimas-noticias')return homeReadModel.latestStories.map(item=>({key:item.title,title:item.title,subtitle:item.meta,image:item.image,badge:item.category}))
  if(sectionId==='lancamentos')return homeReadModel.releases.map(item=>({key:item.title,title:item.title,subtitle:item.year,image:item.image,badge:'▶'}))
  if(sectionId==='agenda')return availableFor('agenda',config)
  return homeReadModel.mostRead.map(title=>({key:title,title}))
}
function resolvedItems(sectionId:HomeContentSectionId,config:HomeContentSectionConfiguration){
  const source=config.homeSelectionMode==='manual'?availableFor(sectionId,config):automaticFor(sectionId,config)
  return selectConfiguredItems(source,config,item=>item.key)
}

function Preview({sectionId,config,viewport}:{sectionId:HomeContentSectionId;config:HomeContentSectionConfiguration;viewport:PreviewViewport}){
  if(!config.active)return <div className="section-preview-disabled">Esta seção está desativada. O frontend não reserva espaço para ela.</div>
  const layout=homeContentViewportLayout(config,viewport)
  const items=resolvedItems(sectionId,config)
  const style={...homeContentResponsiveCssVariables(config),background:config.background,color:config.textColor,textAlign:config.textAlign} as CSSProperties
  const gridStyle={gridTemplateColumns:`repeat(${layout.columns},minmax(0,1fr))`,gap:layout.gap} as CSSProperties
  if(sectionId==='agenda')return <section className="pl-agenda pl-home-responsive-section section-preview-real" style={style}><div className="pl-section-head"><h2>{config.title}</h2></div><div className="pl-home-configurable-grid" style={gridStyle}>{items.map(item=><div className="pl-agenda-item" key={item.key}><div><strong>{item.subtitle?.split(' ')[0]||'--'}</strong></div><div><b>{item.title}</b><small>{item.subtitle}</small></div></div>)}</div></section>
  if(sectionId==='em-alta')return <section className="pl-trending pl-home-responsive-section section-preview-real" style={style}><div className="pl-section-head"><h2>{config.title}</h2></div><div className="pl-trending-list pl-home-configurable-grid" style={gridStyle}>{items.map((item,index)=><div className="pl-trending-item" key={item.key}><span className="pl-trending-rank">{String(index+1).padStart(2,'0')}</span><div><strong>{item.title}</strong></div></div>)}</div></section>
  return <section className="pl-section pl-home-responsive-section section-preview-real" style={style}><div className="pl-section-head"><h2>{config.title}</h2>{config.linkLabel&&<span>{config.linkLabel}</span>}</div><div className="pl-home-configurable-grid" style={gridStyle}>{items.map(item=><article className="pl-card" key={item.key}>{item.image&&<div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${item.image})`}}>{item.badge&&<span className="pl-badge">{item.badge}</span>}</div>}<div className="pl-card-body"><h3>{item.title}</h3>{item.subtitle&&<div className="pl-meta"><span>{item.subtitle}</span></div>}</div></article>)}</div></section>
}

export function HomeContentSectionPage({sectionId}:{sectionId:HomeContentSectionId}){
  const info=meta[sectionId]
  const initial=()=>withHomeContentSectionConfiguration(readSectionConfiguration('home',sectionId,info.name),sectionId)
  const [config,setConfig]=useState<HomeContentSectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<HomeContentSectionConfiguration>(initial)
  const [previewViewport,setPreviewViewport]=useState<PreviewViewport>('desktop')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const max=HOME_CONTENT_MAX_ITEMS[sectionId]
  const available=availableFor(sectionId,config)
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)

  useEffect(()=>{let active=true;void loadAdminHomeSection(sectionId,info.name).then(value=>{if(!active)return;const normalized=withHomeContentSectionConfiguration(value,sectionId);setConfig(normalized);setPersisted(normalized)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[sectionId,info.name])

  const patch=(next:Partial<HomeContentSectionConfiguration>)=>{setConfig(current=>({...current,...next}));setMessage('');setError('')}
  const toggleManual=(key:string)=>patch({homeManualSelection:config.homeManualSelection.includes(key)?config.homeManualSelection.filter(item=>item!==key):[...config.homeManualSelection,key]})
  const moveManual=(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=config.homeManualSelection.length)return;const next=[...config.homeManualSelection];[next[index],next[target]]=[next[target],next[index]];patch({homeManualSelection:next})}
  const reset=()=>patch(withHomeContentSectionConfiguration(defaultSectionConfiguration(sectionId,info.name),sectionId))
  const save=async()=>{if(saving)return;setSaving(true);setError('');setMessage('');try{const candidate={...config,itemLimit:clamp(config.itemLimit,0,max)};const saved=withHomeContentSectionConfiguration(await saveHomeSection(sectionId,info.name,candidate),sectionId);setConfig(saved);setPersisted(saved);setMessage('Configuração persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} O último estado persistido foi mantido.`:'Falha ao salvar. O último estado persistido foi mantido.')}finally{setSaving(false)}}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/`

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:`Configurar seção: ${info.name}`,description:'O conteúdo é configurado uma única vez; Desktop, Tablet e Mobile são apenas modos de visualização responsiva.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <AdminNotice title="Responsividade canônica" description={`${info.responsive}. Os modos de preview não criam três configurações independentes.`}/>
    {loading&&<AdminNotice title="Sincronizando seção" description="Carregando o último estado persistido antes da edição."/>}
    {error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    <div className="section-config-workbench">
      <aside className="section-config-panel">
        <div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>{info.name}</h2><p>{info.summary}</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div>
        <div className="section-config-fields">
          <Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field>
          <div className="section-config-two"><Field label={`Quantidade exibida · máximo ${max}`}><input type="number" min="0" max={max} value={config.itemLimit} onChange={event=>patch({itemLimit:clamp(Number(event.target.value)||0,0,max)})}/></Field><Field label="Modo de seleção"><select value={config.homeSelectionMode} onChange={event=>patch({homeSelectionMode:event.target.value as HomeSelectionMode})}><option value="automatic">Automático</option><option value="manual">Manual</option></select></Field></div>
          <div className="section-config-two"><Field label="Ordenação"><select value={config.homeSortMode} onChange={event=>patch({homeSortMode:event.target.value as HomeSortMode})}><option value="provider">Ordem da fonte</option><option value="reverse">Ordem inversa</option><option value="title-asc">Título A–Z</option><option value="title-desc">Título Z–A</option></select></Field><Field label="Critério automático"><input value={info.criterion} disabled/></Field></div>
          {sectionId==='agenda'&&<Field label="Eventos considerados"><select value={config.homeAgendaWindow} onChange={event=>patch({homeAgendaWindow:event.target.value as HomeContentSectionConfiguration['homeAgendaWindow']})}><option value="all">Todos</option><option value="future">Futuros</option><option value="past">Passados</option></select></Field>}
          {config.homeSelectionMode==='manual'&&<div className="section-config-responsive-padding"><strong>Seleção manual e prioridade</strong><p>Marque os conteúdos e use as setas para definir a ordem exata.</p><div className="home-manual-selection-list">{available.map(item=>{const selectedIndex=config.homeManualSelection.indexOf(item.key);const selected=selectedIndex>=0;return <div className={`home-manual-selection-item${selected?' selected':''}`} key={item.key}><label><input type="checkbox" checked={selected} onChange={()=>toggleManual(item.key)}/><span>{item.title}</span></label>{selected&&<div><button type="button" onClick={()=>moveManual(selectedIndex,-1)} disabled={selectedIndex===0} aria-label={`Subir ${item.title}`}><ArrowUp size={14}/></button><button type="button" onClick={()=>moveManual(selectedIndex,1)} disabled={selectedIndex===config.homeManualSelection.length-1} aria-label={`Descer ${item.title}`}><ArrowDown size={14}/></button></div>}</div>})}</div></div>}
          <div className="section-config-responsive-padding"><strong>Comportamento responsivo</strong><p>{info.responsive}. Breakpoints e espaçamentos são controlados pela estrutura da Home, não duplicados como conteúdo administrativo.</p></div>
          <div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})}/></Field></div>
          <Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as HomeContentSectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field>
          <div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div>
        </div>
        <div className="section-config-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" disabled={!dirty||saving} onClick={()=>void save()}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div>{message&&<div className="section-config-success" role="status">{message}</div>}
      </aside>
      <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW AO VIVO</small><strong>{info.name}</strong><span className="section-preview-device-meta">{viewportLabel(previewViewport)}</span></div><div className="section-preview-device-switch"><button type="button" className={previewViewport==='desktop'?'active':''} onClick={()=>setPreviewViewport('desktop')}><Monitor size={16}/> Desktop</button><button type="button" className={previewViewport==='tablet'?'active':''} onClick={()=>setPreviewViewport('tablet')}><Tablet size={16}/> Tablet</button><button type="button" className={previewViewport==='mobile'?'active':''} onClick={()=>setPreviewViewport('mobile')}><Smartphone size={16}/> Mobile</button></div></div><div className="section-config-preview-frame responsive-device-preview"><div className={`section-preview-device-canvas ${previewViewport}`}><Preview sectionId={sectionId} config={config} viewport={previewViewport}/></div></div></section>
    </div>
  </AdminShell>
}
