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
const metricStatus=(metric:MediaKitResolvedMetric)=>metric.dataStatus==='STALE'?'DESATUALIZADO':metric.dataStatus==='UNAVAILABLE'?'INDISPONÍVEL':metric.dataStatus

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

  const automaticMetrics=draft.audience.snapshot.filter(metric=>!metric.isManual&&metric.sourceType!=='manual')
  const patch=(next:MediaKitDraft)=>{setDraft({...next,status:'draft'});setSaved(false);setNotice('');setError('')}
  const patchPlacement=(placementId:string,commercialAvailability:'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN',notes?:string)=>patch({...draft,inventory:{placements:draft.inventory.placements.map(item=>item.placementId===placementId?{...item,commercialAvailability,...(notes!==undefined?{notes}:{})}:item)}})
  const saveDraft=async()=>{
    setOperation('save');setError('');setNotice('')
    try{const next=await mediaKitRepository.save(draft);setDraft(next);setSaved(true);setNotice(persistent?'Rascunho persistente salvo na API. Nenhuma alteração pública foi feita.':'Rascunho salvo somente neste navegador.')}
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
    try{await mediaKitRepository.save({...draft,status:'draft'});const publishedKit=await mediaKitRepository.publish();setDraft(publishedKit);setSaved(false);setNotice(`Mídia Kit v${publishedKit.version} publicado com snapshot imutável. A versão anterior foi arquivada automaticamente.`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível publicar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const busy=Boolean(operation)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Documento comercial versionado, vinculado ao inventário real e a métricas com proveniência.'}}>
    <AdminNotice title={persistent?'Mídia Kit versionado e persistente':'Rascunho administrativo local'} description={persistent?'Salvar mantém um rascunho. Publicar grava o último snapshot canônico disponível das integrações e arquiva a publicação anterior.':'Sem API administrativa configurada, este build mantém o rascunho local e lê automaticamente os snapshots do cenário de desenvolvimento.'}/>
    {draft.adFormats.length>0&&<AdminNotice title="Formatos legados preservados" description="Os formatos livres existentes foram mantidos por compatibilidade, mas não alimentam mais o inventário comercial canônico. Novos placements só podem usar IDs reais do Portal."/>}
    {saved&&<AdminNotice title="Rascunho salvo" description={persistent?'As alterações estão persistidas no backend e ainda não foram publicadas.':'As alterações foram salvas neste navegador.'}/>} 
    {notice&&<AdminNotice title="Operação concluída" description={notice}/>} 
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 
    <div className="admin-kpi-grid"><AdminKpi label="Páginas ativas" value={String(pages)} detail="Estrutura atual do Site" icon={<Globe2 size={16}/>}/><AdminKpi label="Publicações" value={String(published)} detail="Conteúdos públicos" icon={<Newspaper size={16}/>}/><AdminKpi label="Mídias" value={String(assets)} detail="Arquivos da biblioteca" icon={<Images size={16}/>}/><AdminKpi label="Versão do kit" value={`v${draft.version}`} detail={draft.status==='published'?'Publicada':draft.status==='inactive'?'Arquivada':'Rascunho'} icon={<FileText size={16}/>}/></div>

    <div className="site-form-editor site-media-kit-editor">
      <section className="site-form-card"><header><div><h2>Identidade e apresentação</h2><p>A identidade visual do documento permanece vinculada ao Portal Lander.</p></div></header><div className="site-form-grid"><label><span>Título do documento</span><input value={draft.identity.title} onChange={event=>patch({...draft,identity:{...draft.identity,title:event.target.value}})}/></label><label><span>Subtítulo</span><input value={draft.identity.subtitle} onChange={event=>patch({...draft,identity:{...draft.identity,subtitle:event.target.value}})}/></label><label><span>Versão editorial</span><input value={draft.identity.versionLabel} onChange={event=>patch({...draft,identity:{...draft.identity,versionLabel:event.target.value}})}/></label><label><span>Status</span><input value={draft.status==='published'?'Publicado':draft.status==='inactive'?'Arquivado':'Rascunho'} disabled/></label><label className="site-form-span-2"><span>Resumo institucional</span><textarea rows={4} value={draft.institutional.summary} onChange={event=>patch({...draft,institutional:{...draft.institutional,summary:event.target.value}})}/></label><label className="site-form-span-2"><span>Posicionamento comercial</span><textarea rows={4} value={draft.institutional.positioning} onChange={event=>patch({...draft,institutional:{...draft.institutional,positioning:event.target.value}})}/></label></div></section>

      <section className="site-form-card" data-testid="media-kit-automatic-metrics"><header><div><h2>Audiência e métricas com proveniência</h2><p>As métricas disponíveis são lidas automaticamente dos snapshots canônicos das integrações. Provider, conta, chave técnica e escopo pertencem à integração e não são preenchidos no Mídia Kit.</p></div></header><div className="site-form-fields">{automaticMetrics.length?automaticMetrics.map(metric=>{const updatedAt=metricUpdatedAt(metric);return <article className="site-form-field" key={metric.id} data-media-kit-metric={`${metric.provider||'unknown'}:${metric.metricKey}`}><div className="site-form-field-grid"><label><span>Métrica</span><input value={metric.label} disabled/></label><label><span>Valor</span><input value={metricValue(metric)} disabled/></label><label><span>Provider</span><input value={metric.provider||'Origem indisponível'} disabled/></label><label><span>Conta</span><input value={metric.providerAccountId||'Conta não informada pelo snapshot'} disabled/></label><label><span>Atualizado em</span><input value={updatedAt?new Date(updatedAt).toLocaleString('pt-BR'):'Data indisponível'} disabled/></label><label><span>Status</span><input value={`${metricStatus(metric)} · ${metric.freshnessStatus}`} disabled/></label></div></article>}):<div className="site-form-preview-empty">Nenhuma métrica social disponível. Conecte e sincronize as integrações em Configurações → Integrações. Dados ausentes permanecem indisponíveis e nunca são convertidos em zero.</div>}</div>{draft.audience.snapshotResolvedAt&&<div className="site-form-preview"><strong>Snapshot canônico</strong><p>Última resolução: {new Date(draft.audience.snapshotResolvedAt).toLocaleString('pt-BR')}. O preview e o PDF usam estes mesmos valores e proveniências.</p></div>}</section>

      <section className="site-form-card"><header><div><h2>Inventário publicitário canônico</h2><p>Somente placements comprovados no Portal podem compor o inventário. Implementação técnica não implica disponibilidade comercial.</p></div></header><div className="site-form-fields">{PORTAL_ADVERTISING_INVENTORY.map(placement=>{const item=draft.inventory.placements.find(candidate=>candidate.placementId===placement.id);if(!item)return null;return <article className="site-form-field" key={placement.id}><div className="site-form-field-grid"><label><span>Placement</span><input value={placement.name} disabled/></label><label><span>Componente</span><input value={placement.component} disabled/></label><label><span>Implementação</span><input value={placement.implementationStatus} disabled/></label><label><span>Disponibilidade comercial</span><select value={item.commercialAvailability} onChange={event=>patchPlacement(placement.id,event.target.value as 'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN')}><option value="UNKNOWN">Não confirmada</option><option value="UNAVAILABLE">Indisponível</option><option value="AVAILABLE">Disponível</option></select></label><label className="site-form-span-2"><span>Notas comerciais</span><textarea rows={2} value={item.notes} onChange={event=>patchPlacement(placement.id,item.commercialAvailability,event.target.value)}/></label></div></article>})}</div></section>

      <section className="site-form-card"><header><div><h2>Newsletter e presença digital</h2><p>Newsletter reutiliza a infraestrutura existente. Canais sociais não são inventados: somente IDs confirmados por fonte real poderão ser publicados.</p></div></header><div className="site-form-grid"><label><span>Newsletter no documento</span><select value={draft.newsletter.enabled?'yes':'no'} onChange={event=>patch({...draft,newsletter:{...draft.newsletter,enabled:event.target.value==='yes'}})}><option value="yes">Incluir</option><option value="no">Não incluir</option></select></label><label className="site-form-span-2"><span>Descrição da newsletter</span><textarea rows={3} value={draft.newsletter.description} onChange={event=>patch({...draft,newsletter:{...draft.newsletter,description:event.target.value}})}/></label><label className="site-form-span-2"><span>Canais sociais confirmados</span><input value={draft.social.channelIds.join(', ')} disabled placeholder="Nenhum canal real confirmado"/></label></div></section>

      <section className="site-form-card"><header><div><h2>Compatibilidade de dados manuais legados</h2><p>Estes campos antigos permanecem somente para migração/compatibilidade. Métricas automáticas de integrações sempre têm precedência e dados manuais não sobrescrevem snapshots canônicos.</p></div></header><div className="site-form-grid"><label><span>Usuários mensais legado</span><input value={draft.audience.monthlyUsers} onChange={event=>patch({...draft,audience:{...draft.audience,monthlyUsers:event.target.value}})}/></label><label><span>Visualizações mensais legado</span><input value={draft.audience.monthlyViews} onChange={event=>patch({...draft,audience:{...draft.audience,monthlyViews:event.target.value}})}/></label><label><span>Alcance social legado</span><input value={draft.audience.socialReach} onChange={event=>patch({...draft,audience:{...draft.audience,socialReach:event.target.value}})}/></label><label className="site-form-span-2"><span>Observações</span><textarea rows={3} value={draft.audience.notes} onChange={event=>patch({...draft,audience:{...draft.audience,notes:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Contato comercial</h2><p>Somente informações efetivamente configuradas serão usadas pelo documento.</p></div></header><div className="site-form-grid"><label><span>Responsável / equipe</span><input value={draft.commercial.name} onChange={event=>patch({...draft,commercial:{...draft.commercial,name:event.target.value}})}/></label><label><span>E-mail</span><input type="email" value={draft.commercial.email} onChange={event=>patch({...draft,commercial:{...draft.commercial,email:event.target.value}})}/></label><label><span>Telefone / WhatsApp</span><input value={draft.commercial.phone} onChange={event=>patch({...draft,commercial:{...draft.commercial,phone:event.target.value}})}/></label><label><span>CTA</span><input value={draft.commercial.cta} onChange={event=>patch({...draft,commercial:{...draft.commercial,cta:event.target.value}})}/></label></div></section>

      <div className="site-form-editor-top site-media-kit-actions"><button type="button" className="button outline" onClick={()=>navigate('/app/site/midia-kit/preview')}><Eye size={15}/>Preview completo</button><button type="button" className="button outline" onClick={()=>void resetDraft()} disabled={busy}><RotateCcw size={15}/>{operation==='reset'?'Restaurando…':'Restaurar'}</button><button type="button" className="button outline" onClick={()=>void saveDraft()} disabled={busy}><Save size={15}/>{operation==='save'?'Salvando…':'Salvar rascunho'}</button><button type="button" className="button" onClick={()=>void publish()} disabled={!persistent||busy} title={persistent?'Publicar a versão atual com snapshot':'A publicação exige a API administrativa'}>{operation==='publish'?'Publicando…':'Publicar'}</button></div>
      <MediaKitLivePreview kit={draft}/>
    </div>
  </AdminShell>
}
