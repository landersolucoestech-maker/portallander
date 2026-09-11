import {Eye,FileText,Globe2,Images,Newspaper,RotateCcw,Save} from 'lucide-react'
import {useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {PORTAL_ADVERTISING_INVENTORY} from '../../../shared/advertising/canonicalInventory'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminKpi,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import type {MediaKitDraft,MediaKitResolvedMetric} from '../mediaKitDomain'
import {isMediaKitPersistenceConfigured,mediaKitRepository} from '../mediaKitRepository'
import {siteManagerReadModel} from '../readModel'
import {MediaKitLivePreview} from './MediaKitLivePreview'
import './site-forms.css'
import './media-kit.css'

const metricValue=(metric:MediaKitResolvedMetric)=>metric.value===null?'INDISPONÍVEL':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(metric.value)
const metricUpdatedAt=(metric:MediaKitResolvedMetric)=>metric.normalizedAt||metric.collectedAt||metric.providerUpdatedAt||metric.periodEnd
const realMetricStatuses=new Set<string>(['LIVE','CACHED','STALE'])
const isEligibleAutomaticMetric=(metric:MediaKitResolvedMetric)=>{
  const evidence=`${metric.sourceReference??''} ${JSON.stringify(metric.provenance??{})}`.toLowerCase()
  return Boolean(metric.value!==null&&metric.provider&&metric.providerAccountId&&!metric.isManual&&metric.sourceType==='provider'&&realMetricStatuses.has(metric.dataStatus)&&!evidence.includes('mock')&&!evidence.includes('fixture')&&!evidence.includes('demo'))
}

export function MediaKitPage(){
  const navigate=useNavigate()
  const persistent=isMediaKitPersistenceConfigured()
  const [draft,setDraft]=useState<MediaKitDraft>()
  const [saved,setSaved]=useState(false)
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')
  const [operation,setOperation]=useState('')
  const pages=siteManagerReadModel.pages.filter(page=>page.active).length
  const published=siteManagerReadModel.publishedContents.length
  const assets=siteManagerReadModel.media.length

  useEffect(()=>{
    let active=true
    mediaKitRepository.read().then(value=>{if(active){setDraft(value);setError('')}}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar o Mídia Kit.')})
    return()=>{active=false}
  },[])

  if(!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Gerencie a apresentação comercial do Portal Lander.'}}>{error?<AdminNotice title="Falha ao carregar o Mídia Kit" description={error}/>:<AdminNotice title="Carregando Mídia Kit" description="Sincronizando a versão administrativa disponível."/>}</AdminShell>

  const automaticMetrics=draft.audience.snapshot.filter(isEligibleAutomaticMetric)
  const patch=(next:MediaKitDraft)=>{setDraft({...next,status:'draft'});setSaved(false);setNotice('');setError('')}
  const patchPlacement=(placementId:string,commercialAvailability:'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN',notes?:string)=>patch({...draft,inventory:{placements:draft.inventory.placements.map(item=>item.placementId===placementId?{...item,commercialAvailability,...(notes!==undefined?{notes}:{})}:item)}})
  const saveDraft=async()=>{
    setOperation('save');setError('');setNotice('')
    try{const next=await mediaKitRepository.save(draft);setDraft(next);setSaved(true);setNotice(persistent?'Rascunho persistente salvo na API. Nenhuma alteração pública foi feita.':'Rascunho editorial salvo somente neste navegador.')}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const resetDraft=async()=>{
    if(!window.confirm(persistent?'Descartar o rascunho atual e restaurar a última versão publicada do Mídia Kit?':'Descartar o rascunho local e restaurar a estrutura padrão?'))return
    setOperation('reset');setError('');setNotice('')
    try{const next=await mediaKitRepository.reset();setDraft(next);setSaved(false);setNotice(persistent?(next.status==='published'?`Rascunho descartado. Versão publicada v${next.version} restaurada no editor.`:'Rascunho descartado. Estrutura inicial restaurada.'):'Rascunho local removido.')}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível restaurar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const publish=async()=>{
    if(!persistent)return
    setOperation('publish');setError('');setNotice('')
    try{await mediaKitRepository.save({...draft,status:'draft'});const publishedKit=await mediaKitRepository.publish();setDraft(publishedKit);setSaved(false);setNotice(`Mídia Kit v${publishedKit.version} publicado. Os números exibidos foram resolvidos automaticamente a partir das integrações elegíveis.`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível publicar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const busy=Boolean(operation)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Edite a apresentação comercial; audiência e canais são preenchidos automaticamente a partir dos dados reais do Portal.'}}>
    <AdminNotice title={persistent?'Mídia Kit versionado e persistente':'Rascunho editorial local'} description={persistent?'Os textos e decisões comerciais são editáveis aqui. Os números de audiência não são digitados no Mídia Kit: eles vêm automaticamente das integrações e permanecem indisponíveis quando não há dado real elegível.':'Este ambiente permite editar o conteúdo do documento. Métricas só aparecem quando uma fonte real elegível estiver disponível; o Mídia Kit não cria números de demonstração nem substitui ausência por zero.'}/>
    {saved&&<AdminNotice title="Rascunho salvo" description={persistent?'As alterações editoriais estão persistidas no backend e ainda não foram publicadas.':'As alterações editoriais foram salvas neste navegador.'}/>} 
    {notice&&<AdminNotice title="Operação concluída" description={notice}/>} 
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 
    <div className="admin-kpi-grid"><AdminKpi label="Páginas ativas" value={String(pages)} detail="Estrutura atual do Site" icon={<Globe2 size={16}/>}/><AdminKpi label="Publicações" value={String(published)} detail="Conteúdos públicos" icon={<Newspaper size={16}/>}/><AdminKpi label="Mídias" value={String(assets)} detail="Arquivos da biblioteca" icon={<Images size={16}/>}/><AdminKpi label="Versão do kit" value={`v${draft.version}`} detail={draft.status==='published'?'Publicada':draft.status==='inactive'?'Arquivada':'Rascunho'} icon={<FileText size={16}/>}/></div>

    <div className="site-form-editor site-media-kit-editor">
      <section className="site-form-card"><header><div><h2>Identidade e apresentação</h2><p>Defina como o Portal Lander se apresenta comercialmente.</p></div></header><div className="site-form-grid"><label><span>Título do documento</span><input value={draft.identity.title} onChange={event=>patch({...draft,identity:{...draft.identity,title:event.target.value}})}/></label><label><span>Subtítulo</span><input value={draft.identity.subtitle} onChange={event=>patch({...draft,identity:{...draft.identity,subtitle:event.target.value}})}/></label><label><span>Versão editorial</span><input value={draft.identity.versionLabel} onChange={event=>patch({...draft,identity:{...draft.identity,versionLabel:event.target.value}})}/></label><label><span>Status</span><input value={draft.status==='published'?'Publicado':draft.status==='inactive'?'Arquivado':'Rascunho'} disabled/></label><label className="site-form-span-2"><span>Resumo institucional</span><textarea rows={4} value={draft.institutional.summary} onChange={event=>patch({...draft,institutional:{...draft.institutional,summary:event.target.value}})}/></label><label className="site-form-span-2"><span>Posicionamento comercial</span><textarea rows={4} value={draft.institutional.positioning} onChange={event=>patch({...draft,institutional:{...draft.institutional,positioning:event.target.value}})}/></label></div></section>

      <section className="site-form-card" data-testid="media-kit-automatic-metrics"><header><div><h2>Audiência</h2><p>Os números abaixo são selecionados automaticamente a partir das integrações do Portal. Não existe preenchimento manual de audiência neste módulo.</p></div></header><div className="site-form-fields">{automaticMetrics.length?automaticMetrics.map(metric=>{const updatedAt=metricUpdatedAt(metric);return <article className="site-form-field" key={metric.id} data-media-kit-metric={metric.metricKey}><div className="site-form-field-grid"><label><span>{metric.label}</span><input value={metricValue(metric)} disabled/></label><label><span>Última atualização</span><input value={updatedAt?new Date(updatedAt).toLocaleString('pt-BR'):'Não informada'} disabled/></label></div></article>}):<div className="site-form-preview-empty">Nenhum dado real de audiência está disponível no momento. Assim que uma integração elegível sincronizar métricas, elas aparecerão aqui automaticamente. Ausência de dado não vira zero, estimativa ou valor manual.</div>}</div><div className="site-form-grid"><label className="site-form-span-2"><span>Contexto editorial da audiência</span><textarea rows={3} value={draft.audience.notes} onChange={event=>patch({...draft,audience:{...draft.audience,notes:event.target.value}})} placeholder="Observações comerciais opcionais. Este texto não altera os números automáticos."/></label></div></section>

      <section className="site-form-card"><header><div><h2>Inventário publicitário</h2><p>Gerencie somente a disponibilidade comercial e as observações de cada espaço já existente no Portal.</p></div></header><div className="site-form-fields">{PORTAL_ADVERTISING_INVENTORY.map(placement=>{const item=draft.inventory.placements.find(candidate=>candidate.placementId===placement.id);if(!item)return null;return <article className="site-form-field" key={placement.id}><div className="site-form-field-grid"><label><span>Espaço publicitário</span><input value={placement.name} disabled/></label><label><span>Disponibilidade comercial</span><select value={item.commercialAvailability} onChange={event=>patchPlacement(placement.id,event.target.value as 'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN')}><option value="UNKNOWN">Não confirmada</option><option value="UNAVAILABLE">Indisponível</option><option value="AVAILABLE">Disponível</option></select></label><label className="site-form-span-2"><span>Notas comerciais</span><textarea rows={2} value={item.notes} onChange={event=>patchPlacement(placement.id,item.commercialAvailability,event.target.value)}/></label></div></article>})}</div></section>

      <section className="site-form-card"><header><div><h2>Newsletter e presença digital</h2><p>Edite apenas a apresentação comercial. Os canais ativos são identificados automaticamente pela configuração do Portal.</p></div></header><div className="site-form-grid"><label><span>Newsletter no documento</span><select value={draft.newsletter.enabled?'yes':'no'} onChange={event=>patch({...draft,newsletter:{...draft.newsletter,enabled:event.target.value==='yes'}})}><option value="yes">Incluir</option><option value="no">Não incluir</option></select></label><label className="site-form-span-2"><span>Descrição da newsletter</span><textarea rows={3} value={draft.newsletter.description} onChange={event=>patch({...draft,newsletter:{...draft.newsletter,description:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Contato comercial</h2><p>Defina as informações de contato apresentadas ao anunciante.</p></div></header><div className="site-form-grid"><label><span>Responsável / equipe</span><input value={draft.commercial.name} onChange={event=>patch({...draft,commercial:{...draft.commercial,name:event.target.value}})}/></label><label><span>E-mail</span><input type="email" value={draft.commercial.email} onChange={event=>patch({...draft,commercial:{...draft.commercial,email:event.target.value}})}/></label><label><span>Telefone / WhatsApp</span><input value={draft.commercial.phone} onChange={event=>patch({...draft,commercial:{...draft.commercial,phone:event.target.value}})}/></label><label><span>CTA</span><input value={draft.commercial.cta} onChange={event=>patch({...draft,commercial:{...draft.commercial,cta:event.target.value}})}/></label></div></section>

      <div className="site-form-editor-top site-media-kit-actions"><button type="button" className="button outline" onClick={()=>navigate('/app/site/media-kit/preview')}><Eye size={15}/>Preview completo</button><button type="button" className="button outline" onClick={()=>void resetDraft()} disabled={busy}><RotateCcw size={15}/>{operation==='reset'?'Restaurando…':'Restaurar'}</button><button type="button" className="button outline" onClick={()=>void saveDraft()} disabled={busy}><Save size={15}/>{operation==='save'?'Salvando…':'Salvar rascunho'}</button><button type="button" className="button" onClick={()=>void publish()} disabled={!persistent||busy} title={persistent?'Publicar a versão atual':'A publicação exige a API administrativa'}>{operation==='publish'?'Publicando…':'Publicar'}</button></div>
      <MediaKitLivePreview kit={draft}/>
    </div>
  </AdminShell>
}
