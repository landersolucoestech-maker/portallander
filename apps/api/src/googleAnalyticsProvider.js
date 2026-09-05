import {HttpError} from './editorialService.js'

const TOKEN_URL='https://oauth2.googleapis.com/token'
const DATA_API_BASE='https://analyticsdata.googleapis.com/v1beta'
const REQUEST_TIMEOUT_MS=20_000
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/

export const GA4_METRIC_MAPPINGS=Object.freeze([
  {providerMetric:'activeUsers',metricKey:'active_users',unit:'count'},
  {providerMetric:'newUsers',metricKey:'new_users',unit:'count'},
  {providerMetric:'sessions',metricKey:'sessions',unit:'count'},
  {providerMetric:'screenPageViews',metricKey:'pageviews',unit:'count'},
  {providerMetric:'engagedSessions',metricKey:'engaged_sessions',unit:'count'},
  {providerMetric:'engagementRate',metricKey:'engagement_rate',unit:'ratio'},
])

export const GA4_PORTAL_OVERVIEW_METRICS=Object.freeze([
  'activeUsers','newUsers','sessions','screenPageViews','screenPageViewsPerUser','engagementRate','averageSessionDuration',
])

const clean=value=>String(value??'').trim()

export function googleAnalyticsConfig(env=process.env){
  const config={
    clientId:clean(env.GOOGLE_CLIENT_ID),
    clientSecret:clean(env.GOOGLE_CLIENT_SECRET),
    refreshToken:clean(env.GOOGLE_REFRESH_TOKEN),
    accountId:clean(env.GOOGLE_ANALYTICS_ACCOUNT_ID),
    propertyId:clean(env.GOOGLE_ANALYTICS_PROPERTY_ID),
    timezone:clean(env.GOOGLE_ANALYTICS_TIMEZONE),
  }
  return {...config,configured:Boolean(config.clientId&&config.clientSecret&&config.refreshToken&&config.accountId&&config.propertyId&&config.timezone)}
}

function parseDate(value,label){
  const text=clean(value)
  if(!DATE_RE.test(text))throw new HttpError(400,`${label} deve usar YYYY-MM-DD.`,'GA4_DATE_INVALID',{field:label})
  const date=new Date(`${text}T00:00:00.000Z`)
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==text)throw new HttpError(400,`${label} inválido.`,'GA4_DATE_INVALID',{field:label})
  return {text,date}
}

export function normalizeGa4Range({startDate,endDate}={}){
  const start=parseDate(startDate,'startDate'),end=parseDate(endDate,'endDate')
  if(end.date<start.date)throw new HttpError(400,'endDate deve ser igual ou posterior a startDate.','GA4_RANGE_INVALID')
  const days=Math.floor((end.date-start.date)/86_400_000)+1
  if(days>31)throw new HttpError(400,'Cada sincronização GA4 está limitada a 31 dias.','GA4_RANGE_TOO_LARGE')
  return {startDate:start.text,endDate:end.text,days}
}

export function normalizeGa4ReportRange({startDate,endDate}={}){
  const start=parseDate(startDate,'startDate'),end=parseDate(endDate,'endDate')
  if(end.date<start.date)throw new HttpError(400,'endDate deve ser igual ou posterior a startDate.','GA4_RANGE_INVALID')
  const days=Math.floor((end.date-start.date)/86_400_000)+1
  if(days>366)throw new HttpError(400,'Consultas de Métricas estão limitadas a 366 dias.','GA4_REPORT_RANGE_TOO_LARGE')
  return {startDate:start.text,endDate:end.text,days}
}

function timezoneLocalParts(date,timeZone){
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})
  const parts=Object.fromEntries(formatter.formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]))
  return {year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour),minute:Number(parts.minute),second:Number(parts.second)}
}

export function zonedMidnightUtc(dateString,timeZone){
  const {text}=parseDate(dateString,'date')
  const [year,month,day]=text.split('-').map(Number)
  const target=Date.UTC(year,month-1,day,0,0,0)
  let guess=target
  try{
    for(let i=0;i<4;i+=1){
      const local=timezoneLocalParts(new Date(guess),timeZone)
      const represented=Date.UTC(local.year,local.month-1,local.day,local.hour,local.minute,local.second)
      const delta=target-represented
      guess+=delta
      if(delta===0)break
    }
  }catch{throw new HttpError(503,'Timezone GA4 inválida ou não suportada pelo runtime.','GA4_TIMEZONE_INVALID')}
  return new Date(guess)
}

export function ga4DayPeriod(dateString,timeZone){
  const start=zonedMidnightUtc(dateString,timeZone)
  const date=new Date(`${dateString}T00:00:00.000Z`);date.setUTCDate(date.getUTCDate()+1)
  const end=zonedMidnightUtc(date.toISOString().slice(0,10),timeZone)
  return {periodStart:start,periodEnd:end}
}

export function createGoogleAnalyticsProvider({env=process.env,fetchImpl=globalThis.fetch,timeoutMs=REQUEST_TIMEOUT_MS}={}){
  if(typeof fetchImpl!=='function')throw new TypeError('GA4 fetch implementation is required.')

  async function jsonFetch(url,init={}){
    let response
    try{response=await fetchImpl(url,{...init,signal:AbortSignal.timeout(timeoutMs)})}
    catch(error){if(error?.name==='TimeoutError'||error?.name==='AbortError')throw new HttpError(504,'Google Analytics excedeu o tempo limite.','GA4_TIMEOUT');throw new HttpError(503,'Não foi possível conectar ao Google Analytics.','GA4_NETWORK_ERROR')}
    const payload=await response.json().catch(()=>({}))
    if(!response.ok){const detail=clean(payload?.error?.message||payload?.error_description||payload?.message);throw new HttpError(response.status>=500?502:response.status,detail||`Google respondeu ${response.status}.`,'GA4_REQUEST_FAILED',{providerStatus:response.status})}
    return payload
  }

  function configuredOrThrow(){
    const config=googleAnalyticsConfig(env)
    if(!config.configured)throw new HttpError(503,'GA4 não está configurado. Defina credenciais OAuth, account/property IDs e timezone somente no backend.','GA4_NOT_CONFIGURED')
    return config
  }

  async function accessToken(config){
    const body=new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,refresh_token:config.refreshToken,grant_type:'refresh_token'})
    const payload=await jsonFetch(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body})
    const token=clean(payload?.access_token)
    if(!token)throw new HttpError(502,'Google OAuth não retornou access token.','GA4_TOKEN_RESPONSE_INVALID')
    return token
  }

  async function runReport({startDate,endDate,dimensions=[],metrics=[],limit=10000,orderBys=[]}={}){
    const config=configuredOrThrow(),range=normalizeGa4ReportRange({startDate,endDate}),token=await accessToken(config),property=encodeURIComponent(config.propertyId)
    if(!Array.isArray(metrics)||!metrics.length)throw new HttpError(400,'Relatório GA4 exige ao menos uma métrica.','GA4_REPORT_METRICS_REQUIRED')
    const payload=await jsonFetch(`${DATA_API_BASE}/properties/${property}:runReport`,{
      method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({dateRanges:[{startDate:range.startDate,endDate:range.endDate}],dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),keepEmptyRows:false,limit:String(Math.max(1,Math.min(100000,Number(limit)||10000))),...(orderBys.length?{orderBys}:{})}),
    })
    return {provider:'google-analytics',accountId:config.accountId,propertyId:config.propertyId,timezone:config.timezone,range,rows:Array.isArray(payload?.rows)?payload.rows:[],dimensionHeaders:Array.isArray(payload?.dimensionHeaders)?payload.dimensionHeaders:[],metricHeaders:Array.isArray(payload?.metricHeaders)?payload.metricHeaders:[],rowCount:Number(payload?.rowCount)||0}
  }

  return {
    configured(){return googleAnalyticsConfig(env).configured},
    runReport,
    async runPortalOverview(input={}){return runReport({...input,metrics:GA4_PORTAL_OVERVIEW_METRICS})},
    async runAcquisition(input={}){return runReport({...input,dimensions:['sessionDefaultChannelGroup'],metrics:['sessions','activeUsers'],limit:50,orderBys:[{metric:{metricName:'sessions'},desc:true}]})},
    async runContentPerformance(input={}){return runReport({...input,dimensions:['pagePath','pageTitle'],metrics:['screenPageViews','activeUsers'],limit:50,orderBys:[{metric:{metricName:'screenPageViews'},desc:true}]})},
    async runNewVsReturning(input={}){return runReport({...input,dimensions:['newVsReturning'],metrics:['activeUsers'],limit:10})},
    async runDailyReport(input={}){
      const config=configuredOrThrow(),range=normalizeGa4Range(input),token=await accessToken(config),property=encodeURIComponent(config.propertyId)
      const payload=await jsonFetch(`${DATA_API_BASE}/properties/${property}:runReport`,{
        method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({dateRanges:[{startDate:range.startDate,endDate:range.endDate}],dimensions:[{name:'date'}],metrics:GA4_METRIC_MAPPINGS.map(item=>({name:item.providerMetric})),keepEmptyRows:false,limit:'100000'}),
      })
      return {provider:'google-analytics',accountId:config.accountId,propertyId:config.propertyId,timezone:config.timezone,range,rows:Array.isArray(payload?.rows)?payload.rows:[],metricHeaders:Array.isArray(payload?.metricHeaders)?payload.metricHeaders:[]}
    },
  }
}

export const googleAnalyticsProvider=createGoogleAnalyticsProvider()
