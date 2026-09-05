import {getPool} from './db.js'
import {HttpError} from './editorialService.js'
import {googleAnalyticsConfig,googleAnalyticsProvider,normalizeGa4ReportRange} from './googleAnalyticsProvider.js'

const CACHE_TTL_MS=60_000
const cache=new Map()
const clean=value=>String(value??'').trim()
const number=value=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:null}
const dateText=date=>date.toISOString().slice(0,10)

function todayInTimezone(timeZone){
  try{return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  catch{return dateText(new Date())}
}
function shiftDate(value,days){const date=new Date(`${value}T12:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return dateText(date)}

export function resolveMarketingMetricsRange(input={},env=process.env){
  const preset=clean(input.range)||'30d',timezone=googleAnalyticsConfig(env).timezone||'UTC',today=todayInTimezone(timezone)
  let startDate,endDate
  if(preset==='today'){startDate=today;endDate=today}
  else if(preset==='7d'){startDate=shiftDate(today,-6);endDate=today}
  else if(preset==='30d'){startDate=shiftDate(today,-29);endDate=today}
  else if(preset==='90d'){startDate=shiftDate(today,-89);endDate=today}
  else if(preset==='custom'){startDate=clean(input.startDate);endDate=clean(input.endDate)}
  else throw new HttpError(400,'Período de Métricas inválido.','MARKETING_METRICS_RANGE_INVALID')
  const normalized=normalizeGa4ReportRange({startDate,endDate})
  return {...normalized,preset,timezone}
}

function metricRow(report){return report?.rows?.[0]?.metricValues||[]}
function metricValue(report,index){return number(metricRow(report)?.[index]?.value)}
function dimensionValue(row,index){return clean(row?.dimensionValues?.[index]?.value)}
function reportMetricValue(row,index){return number(row?.metricValues?.[index]?.value)}
function statusFor(value){return value===null?'empty':'available'}

async function loadGa4(range,{provider=googleAnalyticsProvider,env=process.env}={}){
  const config=googleAnalyticsConfig(env)
  if(!config.configured)return {status:'unavailable',reason:'GA4_NOT_CONFIGURED',overview:{},acquisition:[],pages:[],returningUsers:null}
  const settled=await Promise.allSettled([
    provider.runPortalOverview(range),provider.runAcquisition(range),provider.runContentPerformance(range),provider.runNewVsReturning(range),
  ])
  const overviewResult=settled[0]
  if(overviewResult.status==='rejected')return {status:'error',reason:overviewResult.reason?.code||'GA4_REQUEST_FAILED',message:overviewResult.reason instanceof Error?overviewResult.reason.message:'Falha ao consultar GA4.',overview:{},acquisition:[],pages:[],returningUsers:null}
  const report=overviewResult.value
  const values={
    users:metricValue(report,0),newUsers:metricValue(report,1),sessions:metricValue(report,2),pageviews:metricValue(report,3),pageviewsPerUser:metricValue(report,4),engagementRate:metricValue(report,5),averageSessionDuration:metricValue(report,6),
  }
  const returning=settled[3].status==='fulfilled'?settled[3].value.rows.find(row=>dimensionValue(row,0).toLowerCase()==='returning'):null
  const acquisition=settled[1].status==='fulfilled'?settled[1].value.rows.map(row=>({channel:dimensionValue(row,0)||'Unassigned',sessions:reportMetricValue(row,0),users:reportMetricValue(row,1)})):[]
  const pages=settled[2].status==='fulfilled'?settled[2].value.rows.map(row=>({path:dimensionValue(row,0),title:dimensionValue(row,1),pageviews:reportMetricValue(row,0),users:reportMetricValue(row,1)})):[]
  return {status:'available',provider:'google-analytics',propertyId:config.propertyId,overview:Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{value,status:statusFor(value)}])),acquisition,pages,returningUsers:reportingMetric(returning,0),partial:{acquisition:settled[1].status==='rejected',content:settled[2].status==='rejected',returning:settled[3].status==='rejected'}}
}
function reportingMetric(row,index){const value=row?reportMetricValue(row,index):null;return {value,status:statusFor(value)}}

async function loadEditorial(range){
  const pool=getPool()
  const [countsResult,periodResult,latestResult]=await Promise.all([
    pool.query(`select status,count(*)::int as count from editorial_contents group by status`),
    pool.query(`select count(*)::int as count from editorial_contents where status='published' and active=true and published_at >= $1::date and published_at < ($2::date + interval '1 day')`,[range.startDate,range.endDate]),
    pool.query(`select c.id,c.title,c.slug,c.status,c.published_at,p.slug as page_slug,p.title as page_title from editorial_contents c join editorial_pages p on p.id=c.page_id where c.status='published' and c.active=true order by c.published_at desc nulls last limit 10`),
  ])
  const counts=Object.fromEntries(countsResult.rows.map(row=>[row.status,Number(row.count)]))
  return {status:'available',counts:{published:counts.published||0,drafts:counts.draft||0,archived:counts.archived||0,publishedInPeriod:Number(periodResult.rows[0]?.count)||0},latest:latestResult.rows.map(row=>({id:row.id,title:row.title,slug:row.slug,pageSlug:row.page_slug,pageTitle:row.page_title,publishedAt:row.published_at?.toISOString?.()??row.published_at??null}))}
}

async function loadConversions(range){
  const {rows}=await getPool().query(`select f.slug,f.name,f.purpose,count(*)::int as count from form_submissions s join site_forms f on f.id=s.form_id where s.processing_status='accepted' and s.submitted_at >= $1::date and s.submitted_at < ($2::date + interval '1 day') group by f.slug,f.name,f.purpose order by count desc,f.name`,[range.startDate,range.endDate])
  return {status:'available',total:rows.reduce((sum,row)=>sum+Number(row.count),0),forms:rows.map(row=>({slug:row.slug,name:row.name,purpose:row.purpose,count:Number(row.count)}))}
}

export function createMarketingMetricsService({ga4Provider=googleAnalyticsProvider,env=process.env,cacheStore=cache}={}){
  return {async overview(input={}){
    const range=resolveMarketingMetricsRange(input,env),key=`${range.startDate}:${range.endDate}`,cached=cacheStore.get(key)
    if(cached&&Date.now()-cached.createdAt<CACHE_TTL_MS)return cached.value
    const [ga4,editorial,conversions]=await Promise.all([loadGa4(range,{provider:ga4Provider,env}),loadEditorial(range),loadConversions(range)])
    const value={range,ga4,editorial,conversions,generatedAt:new Date().toISOString()}
    cacheStore.set(key,{createdAt:Date.now(),value})
    return value
  }}
}

export const marketingMetricsService=createMarketingMetricsService()
