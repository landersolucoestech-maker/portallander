import {analyticsClient} from '../analytics/client'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {AnalyticsMetric} from '../analytics/domain'
import type {MediaKitDraft,MediaKitMetricBinding,MediaKitResolvedMetric} from './mediaKitDomain'
import {siteManagerReadModel} from './readModel'

const clone=<T>(value:T):T=>structuredClone(value)
const AUTOMATIC_METRICS:ReadonlyArray<Pick<MediaKitMetricBinding,'id'|'label'|'metricKey'|'unit'>>=[
 {id:'media-kit:auto:reach',label:'Alcance',metricKey:'reach',unit:'count'},
 {id:'media-kit:auto:impressions',label:'Impressões',metricKey:'impressions',unit:'count'},
 {id:'media-kit:auto:followers',label:'Seguidores',metricKey:'followers',unit:'count'},
]
function aggregate(metrics:AnalyticsMetric[],key:string){
 const rows=metrics.filter(item=>item.metricKey===key&&item.value!==null&&['LIVE','CACHED','MANUAL','STALE'].includes(item.dataStatus))
 if(!rows.length)return null
 return rows.reduce((total,item)=>total+(item.value??0),0)
}
function resolvedMetric(binding:Pick<MediaKitMetricBinding,'id'|'label'|'metricKey'|'unit'>,metrics:AnalyticsMetric[]):MediaKitResolvedMetric{
 const rows=metrics.filter(item=>item.metricKey===binding.metricKey),value=aggregate(metrics,binding.metricKey),reference=rows[0]
 return {id:binding.id,label:binding.label,metricKey:binding.metricKey,value,unit:binding.unit,provider:reference?.provider??null,providerAccountId:reference?.providerAccountId??null,providerPropertyId:reference?.providerPropertyId??null,periodStart:reference?.periodStart??null,periodEnd:reference?.periodEnd??null,granularity:reference?.granularity??null,sourceType:value===null?'unavailable':'derived',sourceReference:value===null?null:'media-kit-read-model:analytics',collectedAt:reference?.collectedAt??null,providerUpdatedAt:reference?.providerUpdatedAt??null,normalizedAt:reference?.normalizedAt??null,freshnessStatus:reference?.freshnessStatus??'UNKNOWN',dataStatus:value===null?'UNAVAILABLE':reference?.dataStatus==='STALE'?'STALE':'CACHED',syncId:reference?.syncId??null,provenance:{source:'analyticsClient',automatic:true,metricKey:binding.metricKey},isEstimated:false,isManual:false}
}

export const mediaKitReadModel={
 async snapshot(source:MediaKitDraft):Promise<MediaKitDraft>{
  const provider=getRuntimeDataProvider(),settings=provider.settings.seed(),social=provider.branding.socialChannels().filter(channel=>channel.active),about=siteManagerReadModel.pages.find(page=>page.slug==='sobre')
  let analytics:AnalyticsMetric[]=[]
  try{analytics=(await analyticsClient.metrics({limit:500})).metrics}catch{/* unavailable is represented explicitly below */}
  const automaticBindings:MediaKitMetricBinding[]=AUTOMATIC_METRICS.map(item=>({id:item.id,label:item.label,metricKey:item.metricKey,unit:item.unit,sourceMode:'analytics',provider:'',providerAccountId:'',providerPropertyId:'',scopeType:'portal',scopeId:'portal',manualValue:'',manualPeriodStart:'',manualPeriodEnd:''}))
  const automaticSnapshot=AUTOMATIC_METRICS.map(item=>resolvedMetric(item,analytics))
  return {
   ...clone(source),
   identity:{...source.identity,title:settings.company.tradeName||source.identity.title},
   institutional:{...source.institutional,title:settings.company.tradeName||source.institutional.title,summary:about?.description||source.institutional.summary},
   audience:{...source.audience,metrics:automaticBindings,snapshot:automaticSnapshot,snapshotResolvedAt:'2026-09-05T18:00:00.000Z'},
   social:{channelIds:social.map(channel=>channel.id)},
   commercial:{...source.commercial,name:settings.company.responsible||source.commercial.name,phone:settings.company.phone||source.commercial.phone},
  }
 },
}
