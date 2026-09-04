import {analyticsService} from './analyticsService.js'
import {HttpError} from './editorialService.js'
import {GA4_METRIC_MAPPINGS,ga4DayPeriod,googleAnalyticsProvider} from './googleAnalyticsProvider.js'

const clean=value=>String(value??'').trim()
const rowDate=value=>{const raw=clean(value);if(!/^\d{8}$/.test(raw))throw new HttpError(502,'GA4 retornou dimensão date inválida.','GA4_RESPONSE_DATE_INVALID');return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`}
const numeric=value=>{const number=Number(value);if(!Number.isFinite(number))throw new HttpError(502,'GA4 retornou valor métrico não numérico.','GA4_RESPONSE_METRIC_INVALID');return number}

export const googleAnalyticsSyncService={
  async syncRange({startDate,endDate}={}){
    if(!googleAnalyticsProvider.configured())throw new HttpError(503,'GA4 ainda não possui configuração completa no backend.','GA4_NOT_CONFIGURED')
    const configReport={startDate,endDate}
    let sync
    try{
      const probe=await googleAnalyticsProvider.runDailyReport(configReport)
      sync=await analyticsService.beginSync({provider:probe.provider,providerAccountId:probe.accountId,providerPropertyId:probe.propertyId,scopeType:'portal',scopeId:'portal',metadata:{kind:'ga4-daily-report',range:probe.range,timezone:probe.timezone}})
      let processed=0
      for(const row of probe.rows){
        const date=rowDate(row?.dimensionValues?.[0]?.value),period=ga4DayPeriod(date,probe.timezone)
        for(let index=0;index<GA4_METRIC_MAPPINGS.length;index+=1){
          const mapping=GA4_METRIC_MAPPINGS[index],value=numeric(row?.metricValues?.[index]?.value)
          const sourceReference=`ga4:${probe.propertyId}:${date}:${mapping.providerMetric}`
          const collectedAt=new Date().toISOString()
          const raw=await analyticsService.upsertRawMetric({syncId:sync.id,provider:probe.provider,providerAccountId:probe.accountId,providerPropertyId:probe.propertyId,scopeType:'portal',scopeId:'portal',providerMetric:mapping.providerMetric,value,unit:mapping.unit,periodStart:period.periodStart,periodEnd:period.periodEnd,granularity:'day',timezone:probe.timezone,dimensions:{date},filters:{},sourceReference,collectedAt,providerPayload:{dimensionValues:row.dimensionValues,metricValue:row.metricValues?.[index]}})
          await analyticsService.upsertMetric({rawMetricId:raw.id,syncId:sync.id,metricKey:mapping.metricKey,value,unit:mapping.unit,provider:probe.provider,providerAccountId:probe.accountId,providerPropertyId:probe.propertyId,scopeType:'portal',scopeId:'portal',periodStart:period.periodStart,periodEnd:period.periodEnd,granularity:'day',timezone:probe.timezone,dimensions:{date},filters:{},sourceType:'provider',sourceReference,collectedAt,providerUpdatedAt:null,freshnessStatus:'UNKNOWN',dataStatus:'LIVE',provenance:{providerMetric:mapping.providerMetric,provider:'Google Analytics Data API',apiVersion:'v1beta',accountId:probe.accountId,propertyId:probe.propertyId,timezone:probe.timezone},isEstimated:false,isManual:false})
          processed+=1
        }
      }
      const finished=await analyticsService.finishSync(sync.id,{status:'succeeded',recordsImported:processed,recordsUpdated:0,checkpoint:{endDate:probe.range.endDate},cursor:{}})
      return {sync:finished,processed,provider:probe.provider,accountId:probe.accountId,propertyId:probe.propertyId,range:probe.range}
    }catch(error){
      if(sync?.id)await analyticsService.finishSync(sync.id,{status:'failed',recordsImported:0,recordsUpdated:0,error:error instanceof Error?error.message:'Falha de sincronização GA4.'}).catch(()=>undefined)
      throw error
    }
  },
}
