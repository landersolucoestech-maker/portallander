import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {corsHeaders,handleOptions,sendJson} from './httpSupport.js'
import {marketingMetricsService} from './marketingMetricsService.js'

async function requireMetricsAdmin(req){
  const actor=await requireAdmin(req)
  if(actor.mode!=='session')throw new HttpError(403,'Esta operação exige sessão administrativa atribuível.','ATTRIBUTABLE_ADMIN_SESSION_REQUIRED')
  return actor
}

export async function handleMarketingMetricsRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(path!=='/api/marketing/metrics')return false
  const cors=corsHeaders(req,{methods:'GET,OPTIONS'})
  if(handleOptions(req,res,{methods:'GET,OPTIONS'}))return true
  try{
    await requireMetricsAdmin(req)
    if(req.method!=='GET')throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
    const metrics=await marketingMetricsService.overview({range:url.searchParams.get('range')||undefined,startDate:url.searchParams.get('startDate')||undefined,endDate:url.searchParams.get('endDate')||undefined})
    sendJson(res,200,metrics,cors);return true
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'MARKETING_METRICS_INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno de Métricas.'
    if(status>=500)console.error(error)
    sendJson(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
