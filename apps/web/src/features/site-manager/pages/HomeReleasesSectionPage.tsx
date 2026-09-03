import {RefreshCw,RotateCcw,Unplug,Zap} from 'lucide-react'
import {useEffect,useState} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {SectionEditorField as Field,SectionEditorSaveBar,SectionEditorSummaryCard,SectionEditorTabButton as Tab,SectionViewportSwitch,type SectionEditorTabId as EditorTab} from '../components/SectionEditorUi'
import {HOME_CONTENT_MAX_ITEMS,withHomeContentSectionConfiguration,type HomeContentSectionConfiguration} from '../homeContentSectionConfiguration'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import {spotifyReleaseClient,type SpotifyReleaseAdminState} from '../spotifyReleaseClient'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/section-editor-workbench.css'
import '../../../styles/spotify-releases-editor.css'

const SECTION_ID='lancamentos' as const
const SECTION_NAME='Lançamentos'
const MAX_ITEMS=HOME_CONTENT_MAX_ITEMS[SECTION_ID]
const viewportLabel=(value:SectionHeroViewport)=>value==='desktop'?'Desktop':value==='tablet'?'Tablet':'Mobile'
const dateLabel=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'Ainda não sincronizado'

export function HomeReleasesSectionPage(){
  const initial=()=>withHomeContentSectionConfiguration(defaultSectionConfiguration(SECTION_ID,SECTION_NAME),SECTION_ID)
  const [config,setConfig]=useState<HomeContentSectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<HomeContentSectionConfiguration>(initial)
  const [integration,setIntegration]=useState<SpotifyReleaseAdminState|null>(null)
  const [playlistInput,setPlaylistInput]=useState('')
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [tab,setTab]=useState<EditorTab>('content')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [integrationBusy,setIntegrationBusy]=useState(false)
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [previewRevision,setPreviewRevision]=useState(0)
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)

  useEffect(()=>{let active=true;void Promise.all([loadAdminHomeSection(SECTION_ID,SECTION_NAME),spotifyReleaseClient.adminState()]).then(([section,state])=>{if(!active)return;const normalized=withHomeContentSectionConfiguration(section,SECTION_ID);setConfig(normalized);setPersisted(normalized);setIntegration(state);setPlaylistInput(state.source.playlistId)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração de Lançamentos.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])

  const patch=(next:Partial<HomeContentSectionConfiguration>)=>{setConfig(current=>withHomeContentSectionConfiguration({...current,...next},SECTION_ID));setSaved(false);setMessage('')}
  const updateIntegration=async(action:()=>Promise<SpotifyReleaseAdminState>,success:string)=>{if(integrationBusy)return;setIntegrationBusy(true);setError('');setMessage('');try{const state=await action();setIntegration(state);setPlaylistInput(state.source.playlistId);setMessage(success);setPreviewRevision(value=>value+1)}catch(caught){setError(caught instanceof Error?caught.message:'Falha na integração Spotify.')}finally{setIntegrationBusy(false)}}
  const connect=async()=>{setIntegrationBusy(true);setError('');try{window.location.assign(await spotifyReleaseClient.connect())}catch(caught){setError(caught instanceof Error?caught.message:'Falha ao iniciar conexão Spotify.');setIntegrationBusy(false)}}
  const save=async()=>{if(saving)return;setSaving(true);setError('');try{const candidate=withHomeContentSectionConfiguration({...config,homeSelectionMode:'automatic',homeSortMode:'provider',homeManualSelection:[]},SECTION_ID);const savedConfig=withHomeContentSectionConfiguration(await saveHomeSection(SECTION_ID,SECTION_NAME,candidate),SECTION_ID);setConfig(savedConfig);setPersisted(savedConfig);setSaved(true);setMessage('Configuração da seção salva com sucesso.')}catch(caught){setError(caught instanceof Error?caught.message:'Falha ao salvar Lançamentos.')}finally{setSaving(false)}}
  const discard=()=>{setConfig(persisted);setSaved(false);setMessage('')}
  const reset=()=>{setConfig(initial());setSaved(false);setMessage('')}
  const status=integration?.connected?(integration.source.status==='ready'?'Conectado e sincronizado':integration.source.status==='syncing'?'Sincronizando':integration.source.status==='stale'?'Conectado · cache preservado':integration.source.status==='empty'?'Conectado · playlist vazia':'Conectado'):'Desconectado'

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Lançamentos',description:'Spotify como fonte dos lançamentos, usando o mesmo workbench canônico das demais seções.',backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title="Sincronizando Lançamentos" description="Carregando configuração persistida e estado da integração Spotify."/>}
    {error&&<AdminNotice title="Falha em Lançamentos" description={error}/>} 
    {!loading&&<div className="section-editor-workbench"><div className="section-editor-rail" aria-label="Configurações da seção Lançamentos">
      <SectionEditorSummaryCard eyebrow="LANÇAMENTOS" description="Lançamentos musicais sincronizados a partir da playlist Spotify vinculada." active={config.active} onActiveChange={active=>patch({active})}/>
      <div className="section-editor-tabs"><Tab active={tab==='content'} label="Conteúdo" onClick={()=>setTab('content')}/><Tab active={tab==='appearance'} label="Aparência" onClick={()=>setTab('appearance')}/><Tab active={tab==='behavior'} label="Comportamento" onClick={()=>setTab('behavior')}/></div>
      <section className="section-editor-card section-editor-detail">
        {tab==='content'&&<><div className="section-editor-card-head"><h3>Conteúdo</h3><p>Fonte, playlist e quantidade exibida. Credenciais permanecem exclusivamente no backend.</p></div><div className="section-config-fields">
          <div className="spotify-editor-card"><div className="spotify-editor-card-head"><div><small>FONTE DOS CONTEÚDOS</small><strong>Spotify</strong></div><span className={`spotify-editor-status ${integration?.connected?'connected':'disconnected'}`}>● {status}</span></div><dl><div><dt>Conta conectada</dt><dd>{integration?.account?.name||'Nenhuma conta conectada'}</dd></div><div><dt>Status da integração</dt><dd>{integration?.configured?'Backend configurado':'Variáveis do backend pendentes'}</dd></div></dl><div className="spotify-editor-actions"><button type="button" className="button outline" disabled={integrationBusy||!integration?.configured} onClick={()=>void connect()}><Zap size={14}/>{integration?.connected?'Reconectar':'Conectar Spotify'}</button>{integration?.connected&&<button type="button" className="button outline" disabled={integrationBusy} onClick={()=>void updateIntegration(()=>spotifyReleaseClient.disconnect(),'Conta Spotify desconectada. A playlist e o último cache foram preservados.')}><Unplug size={14}/> Desconectar</button>}</div></div>
          <div className="spotify-editor-card"><div className="spotify-editor-card-head"><div><small>PLAYLIST VINCULADA</small><strong>{integration?.source.playlistName||'Nenhuma playlist vinculada'}</strong></div><span className="spotify-editor-status neutral">{integration?.source.playlistId?'Vinculada':'Pendente'}</span></div><Field label="ID, URL ou URI da playlist" hint="O vínculo é persistido pelo ID estável da playlist; renomear a playlist não quebra a associação."><input value={playlistInput} disabled={!integration?.connected||integrationBusy} onChange={event=>setPlaylistInput(event.target.value)} placeholder="https://open.spotify.com/playlist/..."/></Field><dl><div><dt>ID persistido</dt><dd>{integration?.source.playlistId||'—'}</dd></div><div><dt>Última sincronização</dt><dd>{dateLabel(integration?.source.lastSyncedAt||null)}</dd></div><div><dt>Itens em cache</dt><dd>{integration?.items.length??0}</dd></div></dl>{integration?.source.error&&<div className="spotify-editor-error"><strong>{integration.source.error.code}</strong><span>{integration.source.error.message}</span></div>}<div className="spotify-editor-actions"><button type="button" className="button dark" disabled={!integration?.connected||integrationBusy||!playlistInput.trim()} onClick={()=>void updateIntegration(()=>spotifyReleaseClient.setPlaylist(playlistInput),'Playlist vinculada e sincronizada com sucesso.')}>Vincular e sincronizar</button><button type="button" className="button outline" disabled={!integration?.connected||integrationBusy||!integration?.source.playlistId} onClick={()=>void updateIntegration(()=>spotifyReleaseClient.sync(),'Sincronização Spotify concluída.')}><RefreshCw size={14}/> Sincronizar agora</button></div></div>
          <Field label={`Quantidade de itens a exibir · máximo ${MAX_ITEMS}`} hint="A playlist pode conter mais músicas; este limite pertence somente à apresentação da seção."><input type="number" min="0" max={MAX_ITEMS} value={config.itemLimit} onChange={event=>patch({itemLimit:Math.max(0,Math.min(MAX_ITEMS,Number(event.target.value)||0))})}/></Field>
          <Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field>
        </div></>}
        {tab==='appearance'&&<><div className="section-editor-card-head"><h3>Aparência</h3><p>Os cards usam os mesmos tokens e o artwork do Spotify é exibido sem corte.</p></div><div className="section-config-fields"><Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as HomeContentSectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></div></>}
        {tab==='behavior'&&<><div className="section-editor-card-head"><h3>Comportamento</h3><p>Ordenação e responsividade possuem uma única regra de domínio.</p></div><div className="section-config-fields"><div className="section-editor-rule"><strong>Ordenação</strong><p>Ordem da playlist. O backend preserva a posição retornada pelo Spotify; nenhuma data ou ordenação alfabética compete com ela.</p><span className="section-editor-device-badge">Playlist</span></div><div className="section-editor-rule"><strong>Comportamento responsivo</strong><p>Desktop 4 colunas · Tablet 2 · Mobile 1, usando o viewport real do preview.</p><span className="section-editor-device-badge">{viewportLabel(viewport)}</span></div><div className="section-config-two"><Field label="Texto do link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})}/></Field></div></div></>}
      </section>
      <div className="section-editor-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button></div>
      {message&&<div className="section-config-success" role="status">{message}</div>}
    </div><section className="section-editor-preview" aria-label="Preview completo da Página Inicial"><div className="section-editor-preview-head"><div><h2>Preview da página inteira</h2><p>{viewportLabel(viewport)} · dados normalizados do cache Spotify · mesma renderização da Home pública.</p></div><SectionViewportSwitch viewport={viewport} onChange={setViewport}/></div><div className="section-editor-preview-canvas"><HomePagePreviewFrame key={previewRevision} sectionId={SECTION_ID} configuration={config} viewport={viewport}/></div></section></div>}
    {!loading&&<SectionEditorSaveBar dirty={dirty} saving={saving} saved={saved} onDiscard={discard} onSave={()=>void save()} dirtyText="O preview já mostra o rascunho; a Home pública só muda após salvar a configuração da seção." cleanText="A integração e o cache Spotify permanecem independentes da ativação visual da seção."/>}
  </AdminShell>
}
