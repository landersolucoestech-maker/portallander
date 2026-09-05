import {contentIngestionService} from './contentIngestionService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {corsHeaders,handleOptions,sendJson} from './httpSupport.js'

const MAX_JSON_BYTES=128*1024
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
async function requireAttributableAdmin(req){const actor=await requireAdmin(req);if(actor.mode!=='session')throw new HttpError(403,'Esta operação exige sessão administrativa atribuível.','ATTRIBUTABLE_ADMIN_SESSION_REQUIRED');return actor}
const decode=value=>decodeURIComponent(value)

export async function handleContentIngestionRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/integrations/editorial')&&!path.startsWith('/api/editorial/import-candidates'))return false
  const cors=corsHeaders(req,{methods:'GET,POST,PATCH,OPTIONS'})
  if(handleOptions(req,res,{methods:'GET,POST,PATCH,OPTIONS'}))return true
  try{
    const actor=await requireAttributableAdmin(req)
    if(req.method==='GET'&&path==='/api/integrations/editorial/provider-status'){sendJson(res,200,{providers:await contentIngestionService.providerStatus()},cors);return true}
    if(req.method==='GET'&&path==='/api/integrations/editorial/sources'){sendJson(res,200,{sources:await contentIngestionService.listSources()},cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/editorial/sources'){sendJson(res,201,{source:await contentIngestionService.createSource(await readJson(req))},cors);return true}
    const sourceMatch=path.match(/^\/api\/integrations\/editorial\/sources\/([^/]+)$/)
    if(sourceMatch&&req.method==='PATCH'){sendJson(res,200,{source:await contentIngestionService.updateSource(decode(sourceMatch[1]),await readJson(req))},cors);return true}
    const syncMatch=path.match(/^\/api\/integrations\/editorial\/sources\/([^/]+)\/sync$/)
    if(syncMatch&&req.method==='POST'){sendJson(res,200,{run:await contentIngestionService.syncSource(decode(syncMatch[1]))},cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/editorial/sync-due'){sendJson(res,200,{results:await contentIngestionService.syncDue()},cors);return true}
    if(req.method==='GET'&&path==='/api/integrations/editorial/sync-runs'){sendJson(res,200,{runs:await contentIngestionService.listSyncRuns({sourceId:url.searchParams.get('sourceId')||undefined,limit:url.searchParams.get('limit')||undefined})},cors);return true}
    if(req.method==='GET'&&path==='/api/editorial/import-candidates'){sendJson(res,200,{candidates:await contentIngestionService.listCandidates({status:url.searchParams.get('status')||undefined,provider:url.searchParams.get('provider')||undefined,limit:url.searchParams.get('limit')||undefined,offset:url.searchParams.get('offset')||undefined})},cors);return true}
    const candidateMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)$/)
    if(candidateMatch&&req.method==='GET'){sendJson(res,200,{candidate:await contentIngestionService.getCandidate(decode(candidateMatch[1]))},cors);return true}
    const actionMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)\/(review|approve|reject|ignore|convert)$/)
    if(actionMatch&&req.method==='POST'){
      const id=decode(actionMatch[1]),action=actionMatch[2],body=await readJson(req)
      if(action==='convert'){sendJson(res,201,await contentIngestionService.convertCandidate(id,{pageId:body.pageId,author:body.author},actor),cors);return true}
      const status={review:'reviewing',approve:'approved',reject:'rejected',ignore:'ignored'}[action]
      sendJson(res,200,{candidate:await contentIngestionService.setCandidateStatus(id,status,actor)},cors);return true
    }
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    sendJson(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
