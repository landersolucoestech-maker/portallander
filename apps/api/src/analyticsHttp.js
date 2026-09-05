import {analyticsService} from './analyticsService.js'
import {HttpError} from './editorialService.js'
import {googleAnalyticsSyncService} from './googleAnalyticsSyncService.js'
import {requireAdmin} from './http.js'
import {corsHeaders,sendJson} from './httpSupport.js'

const MAX_JSON_BYTES=64*1024
function query(url){return Object.fromEntries(url.searchParams.entries())}
async function readJson(req){let size=0,raw='';for await(const chunk of req){size+=chunk.length;if(size>MAX_JSON_BYTES)throw new HttpError(413,'Payload de Analytics excede o limite.','ANALYTICS_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return{};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','ANALYTICS_INVALID_JSON')}}

export async function handleAnalyticsRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/analytics/'))return false
  if(!['GET','POST'].includes(req.method||''))return false
  const cors=corsHeaders(req,{methods:'GET,POST,OPTIONS'})
  try{
    await requireAdmin(req)
    if(req.method==='GET'&&path==='/api/analytics/metrics'){
      const metrics=await analyticsService.listMetrics(query(url))
      sendJson(res,200,{metrics},cors);return true
    }
    if(req.method==='GET'&&path==='/api/analytics/providers/status'){
      const providers=await analyticsService.providerStatus()
      sendJson(res,200,{providers},cors);return true
    }
    if(req.method==='GET'&&path==='/api/analytics/syncs'){
      const syncs=await analyticsService.listSyncs(query(url))
      sendJson(res,200,{syncs},cors);return true
    }
    if(req.method==='POST'&&path==='/api/analytics/syncs/ga4'){
      const body=await readJson(req)
      const result=await googleAnalyticsSyncService.syncRange({startDate:body.startDate,endDate:body.endDate})
      sendJson(res,200,result,cors);return true
    }
    throw new HttpError(404,'Rota de Analytics não encontrada.','ANALYTICS_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'ANALYTICS_INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno de Analytics.'
    if(status>=500)console.error(error)
    sendJson(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors)
    return true
  }
}
