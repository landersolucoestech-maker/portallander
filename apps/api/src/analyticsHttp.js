import {analyticsService} from './analyticsService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

function corsHeaders(req){
  const origin=String(req.headers.origin||'').trim()
  if(!origin)return {}
  const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean)
  const allowDevelopmentFallback=configured.length===0&&process.env.NODE_ENV!=='production'
  if(!configured.includes(origin)&&!allowDevelopmentFallback)return {}
  return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin'}
}
function send(res,status,value,headers={}){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(JSON.stringify(value))}
function query(url){return Object.fromEntries(url.searchParams.entries())}

export async function handleAnalyticsRequest(req,res){
  if(req.method!=='GET')return false
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/analytics/'))return false
  const cors=corsHeaders(req)
  try{
    await requireAdmin(req)
    if(path==='/api/analytics/metrics'){
      const metrics=await analyticsService.listMetrics(query(url))
      send(res,200,{metrics},cors);return true
    }
    if(path==='/api/analytics/providers/status'){
      const providers=await analyticsService.providerStatus()
      send(res,200,{providers},cors);return true
    }
    if(path==='/api/analytics/syncs'){
      const syncs=await analyticsService.listSyncs(query(url))
      send(res,200,{syncs},cors);return true
    }
    throw new HttpError(404,'Rota de Analytics não encontrada.','ANALYTICS_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'ANALYTICS_INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno de Analytics.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors)
    return true
  }
}
