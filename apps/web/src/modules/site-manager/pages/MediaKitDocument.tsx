import type {ReactNode} from 'react'
import {PORTAL_ADVERTISING_INVENTORY} from '../../../shared/advertising/canonicalInventory'
import {portalLogo} from '../../../shared/branding/assets/brandAsset'
import type {MediaKitDraft,MediaKitResolvedMetric} from '../mediaKitDomain'

const PAGE_COUNT=9
const realMetricStatuses=new Set<string>(['LIVE','CACHED','STALE'])
const metricValue=(metric:MediaKitResolvedMetric)=>metric.value===null?'MÉTRICA NÃO DISPONÍVEL':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(metric.value)
const metricUpdatedAt=(metric:MediaKitResolvedMetric)=>metric.normalizedAt||metric.collectedAt||metric.providerUpdatedAt||metric.periodEnd
const availabilityLabel=(value:'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN'|undefined)=>value==='AVAILABLE'?'DISPONÍVEL COMERCIALMENTE':value==='UNAVAILABLE'?'INDISPONÍVEL':'DISPONIBILIDADE NÃO CONFIRMADA'
const isEligibleAutomaticMetric=(metric:MediaKitResolvedMetric)=>{
  const evidence=`${metric.sourceReference??''} ${JSON.stringify(metric.provenance??{})}`.toLowerCase()
  return Boolean(metric.value!==null&&metric.provider&&metric.providerAccountId&&!metric.isManual&&metric.sourceType==='provider'&&realMetricStatuses.has(metric.dataStatus)&&!evidence.includes('mock')&&!evidence.includes('fixture')&&!evidence.includes('demo'))
}

function Page({number,eyebrow,title,children,className=''}:{number:number;eyebrow:string;title:string;children:ReactNode;className?:string}){
  return <section className={`mk-page ${className}`.trim()} data-media-kit-page={number} aria-label={`Página ${number} de ${PAGE_COUNT}`}><header className="mk-page-header"><span>{eyebrow}</span><b>{String(number).padStart(2,'0')}</b></header><h2>{title}</h2>{children}<footer><span>PORTAL LANDER · MÍDIA KIT</span><span>{String(number).padStart(2,'0')}</span></footer></section>
}

function PreviewFrame({number,children}:{number:number;children:ReactNode}){
  return <div className="mk-preview-page-frame" data-preview-page={number}><div className="mk-preview-page-label">Página {number} de {PAGE_COUNT}</div>{children}</div>
}

export function MediaKitDocument({kit,selectedPage}:{kit:MediaKitDraft;selectedPage?:number}){
 const metrics=kit.audience.snapshot.filter(isEligibleAutomaticMetric)
 return <main className="mk-document" aria-label="Preview do Mídia Kit" {...(selectedPage?{'data-selected-page':selectedPage}:{})}>
  <PreviewFrame number={1}><section className="mk-page mk-cover" data-media-kit-page={1} aria-label={`Página 1 de ${PAGE_COUNT}`}><img src={portalLogo} alt="Portal Lander"/><div><span>MÍDIA · PUBLICIDADE · AUDIÊNCIA</span><h1>{kit.identity.title}</h1><strong>{kit.identity.subtitle} {kit.identity.versionLabel}</strong></div><footer><span>DOCUMENTO COMERCIAL</span><span>01</span></footer></section></PreviewFrame>
  <PreviewFrame number={2}><Page number={2} eyebrow="SOBRE" title="SOBRE O PORTAL LANDER"><div className="mk-lead"><p>{kit.institutional.summary||'Apresentação institucional ainda não preenchida.'}</p><p>{kit.institutional.positioning||'Posicionamento comercial ainda não preenchido.'}</p></div><div className="mk-rule"/><p className="mk-note">Uma apresentação comercial direta do Portal Lander para marcas e parceiros.</p></Page></PreviewFrame>
  <PreviewFrame number={3}><Page number={3} eyebrow="AUDIÊNCIA" title="NOSSA AUDIÊNCIA"><div className="mk-metric-grid">{metrics.length?metrics.map(metric=>{const updatedAt=metricUpdatedAt(metric);return <article key={metric.id}><span>{metric.label}</span><strong>{metricValue(metric)}</strong>{updatedAt&&<small>Atualizado em {new Date(updatedAt).toLocaleDateString('pt-BR')}</small>}</article>}):<article><span>Audiência</span><strong>MÉTRICA NÃO DISPONÍVEL</strong><small>Aguardando dados reais das integrações</small></article>}</div>{kit.audience.notes&&<p className="mk-note">{kit.audience.notes}</p>}<p className="mk-note">Os números desta página são preenchidos automaticamente. Ausência de dado não é convertida em zero ou estimativa.</p></Page></PreviewFrame>
  <PreviewFrame number={4}><Page number={4} eyebrow="PUBLICIDADE" title="ONDE SUA MARCA APARECE"><div className="mk-placement-list">{PORTAL_ADVERTISING_INVENTORY.map(placement=>{const configured=kit.inventory.placements.find(item=>item.placementId===placement.id);return <article key={placement.id}><b>{placement.name}</b><p>{placement.description}</p><small>{placement.contexts.join(' · ')}</small><em>{availabilityLabel(configured?.commercialAvailability)}</em></article>})}</div></Page></PreviewFrame>
  <PreviewFrame number={5}><Page number={5} eyebrow="INVENTÁRIO" title="INVENTÁRIO PUBLICITÁRIO"><div className="mk-inventory-grid">{PORTAL_ADVERTISING_INVENTORY.map(placement=>{const configured=kit.inventory.placements.find(item=>item.placementId===placement.id);return <article key={placement.id}><h3>{placement.name}</h3><p>{placement.description}</p><p>{placement.contexts.join(' · ')}</p><strong>{availabilityLabel(configured?.commercialAvailability)}</strong>{configured?.notes&&<p>{configured.notes}</p>}</article>})}</div></Page></PreviewFrame>
  <PreviewFrame number={6}><Page number={6} eyebrow="EDITORIAL" title="CONTEÚDO EDITORIAL"><div className="mk-lead"><p>Conteúdo editorial pensado para informação, descoberta e conexão entre artistas, público, marcas e mercado.</p><p>As oportunidades publicitárias apresentadas neste documento correspondem aos espaços efetivamente disponíveis no Portal.</p></div><div className="mk-editorial-diagram"><span>MATÉRIA</span><b>CONTEÚDO PRINCIPAL</b><span>PUBLICIDADE LATERAL</span><span>MAIS LIDAS</span><span>LANÇAMENTOS</span></div></Page></PreviewFrame>
  <PreviewFrame number={7}><Page number={7} eyebrow="NEWSLETTER" title="NEWSLETTER"><div className="mk-lead"><p>{kit.newsletter.enabled?(kit.newsletter.description||'Canal de newsletter incluído na apresentação comercial do Portal.'):'Newsletter não incluída nesta versão do documento.'}</p></div><div className="mk-status-card"><strong>{kit.newsletter.enabled?'CANAL INCLUÍDO NO MÍDIA KIT':'CANAL NÃO INCLUÍDO'}</strong><p>Indicadores de newsletter só são apresentados quando houver dados reais disponíveis.</p></div></Page></PreviewFrame>
  <PreviewFrame number={8}><Page number={8} eyebrow="DIGITAL" title="PRESENÇA DIGITAL"><div className="mk-lead"><p>{kit.social.channelIds.length?'A presença digital do Portal está conectada aos canais ativos configurados para a marca.':'Nenhum canal digital ativo está disponível nesta versão do documento.'}</p></div><div className="mk-status-card"><strong>DADOS CONECTADOS AO PORTAL</strong><p>Informações de audiência são atualizadas automaticamente quando as integrações disponibilizam dados elegíveis.</p></div></Page></PreviewFrame>
  <PreviewFrame number={9}><Page number={9} eyebrow="CONTATO" title="DISPONÍVEL AGORA / EXPANSÕES FUTURAS"><div className="mk-contact-grid"><article><span>CONTATO COMERCIAL</span><strong>{kit.commercial.name||'RESPONSÁVEL NÃO INFORMADO'}</strong><p>{kit.commercial.email||'E-mail não informado'}</p><p>{kit.commercial.phone||'Telefone não informado'}</p></article><article><span>CAPACIDADES ATUAIS</span>{kit.roadmap.currentCapabilities.length?kit.roadmap.currentCapabilities.map(item=><p key={item}>{item}</p>):<p>Nenhuma capacidade adicional declarada.</p>}</article><article><span>EXPANSÕES FUTURAS</span>{kit.roadmap.futureOpportunities.length?kit.roadmap.futureOpportunities.map(item=><p key={item}>{item}</p>):<p>Sem oportunidades futuras declaradas nesta versão.</p>}</article></div><p className="mk-note">Solicitações comerciais podem ser enviadas pelo canal /anuncie do Portal Lander. A disponibilidade de cada espaço segue o inventário apresentado neste documento.</p></Page></PreviewFrame>
 </main>
}

export const MEDIA_KIT_PAGE_COUNT=PAGE_COUNT
