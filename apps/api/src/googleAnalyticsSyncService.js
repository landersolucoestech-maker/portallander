import {analyticsService} from './analyticsService.js'
import {deriveFreshnessStatus} from './analyticsFreshness.js'
import {HttpError} from './editorialService.js'
import {GA4_METRIC_MAPPINGS,ga4DayPeriod,googleAnalyticsConfig,googleAnalyticsProvider,normalizeGa4Range} from './googleAnalyticsProvider.js'

const clean=value=>String(value??'').trim()
const rowDate=value=>{const raw=clean(value);if(!/^\d{8}$/.test(raw))throw new HttpError(502,'GA4 retornou dimensão date inválida.','GA4_RESPONSE_DATE_INVALID');return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`}
const numeric=value=>{const number=Number(value);if(!Number.isFinite(number))throw new HttpError(502,'GA4 retornou valor métrico não numérico.','GA4_RESPONSE_METRIC_INVALID');return number}

export function createGoogleAnalyticsSyncService({provider=googleAnalyticsProvider,analytics=analyticsService,configResolver=googleAnalyticsConfig}={}){
  return {
    async syncRange({startDate,endDate}={}){
      const config=configResolver(),range=normalizeGa4Range({startDate,endDate})
      if(!config?.configured)throw new HttpError(503,'GA4 ainda não possui configuração completa no backend.','GA4_NOT_CONFIGURED')
      const sync=await analytics.beginSync({provider:'google-analytics',providerAccountId:config.accountId,providerPropertyId:config.propertyId,scopeType:'portal',scopeId:'portal',metadata:{kind:'ga4-daily-report',range,timezone:config.timezone}})
      try{
        const report=await provider.runDailyReport({startDate,endDate})
        let processed=0
        for(const row of report.rows){
          const date=rowDate(row?.dimensionValues?.[0]?.value),period=ga4DayPeriod(date,report.timezone)
          for(let index=0;index<GA4_METRIC_MAPPINGS.length;index+=1){
            const mapping=GA4_METRIC_MAPPINGS[index],value=numeric(row?.metricValues?.[index]?.value)
            const sourceReference=`ga4:${report.propertyId}:${date}:${mapping.providerMetric}`
            const collectedAt=new Date().toISOString()
            const freshnessStatus=deriveFreshnessStatus({provider:report.provider,collectedAt})
            const raw=await analytics.upsertRawMetric({syncId:sync.id,provider:report.provider,providerAccountId:report.accountId,providerPropertyId:report.propertyId,scopeType:'portal',scopeId:'portal',providerMetric:mapping.providerMetric,value,unit:mapping.unit,periodStart:period.periodStart,periodEnd:period.periodEnd,granularity:'day',timezone:report.timezone,dimensions:{date},filters:{},sourceReference,collectedAt,providerPayload:{dimensionValues:row.dimensionValues,metricValue:row.metricValues?.[index]}})
            await analytics.upsertMetric({rawMetricId:raw.id,syncId:sync.id,metricKey:mapping.metricKey,value,unit:mapping.unit,provider:report.provider,providerAccountId:report.accountId,providerPropertyId:report.propertyId,scopeType:'portal',scopeId:'portal',periodStart:period.periodStart,periodEnd:period.periodEnd,granularity:'day',timezone:report.timezone,dimensions:{date},filters:{},sourceType:'provider',sourceReference,collectedAt,providerUpdatedAt:null,freshnessStatus,dataStatus:'LIVE',provenance:{providerMetric:mapping.providerMetric,provider:'Google Analytics Data API',apiVersion:'v1beta',accountId:report.accountId,propertyId:report.propertyId,timezone:report.timezone,freshnessPolicy:'ingestion_age_48h'},isEstimated:false,isManual:false})
            processed+=1
          }
        }
        const finished=await analytics.finishSync(sync.id,{status:'succeeded',recordsImported:processed,recordsUpdated:0,checkpoint:{endDate:report.range.endDate},cursor:{}})
        return {sync:finished,processed,provider:report.provider,accountId:report.accountId,propertyId:report.propertyId,range:report.range}
      }catch(error){
        await analytics.finishSync(sync.id,{status:'failed',recordsImported:0,recordsUpdated:0,error:error instanceof Error?error.message:'Falha de sincronização GA4.'}).catch(()=>undefined)
        throw error
      }
    },
  }
}

export const googleAnalyticsSyncService=createGoogleAnalyticsSyncService()
