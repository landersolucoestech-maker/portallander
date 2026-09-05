import {contentIngestionService} from './contentIngestionService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=128*1024
const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){const origin=String(req.headers.origin||'').trim();if(!origin)return {};const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);const allow=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production');if(!allow)return {};return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
async function requireAttributableAdmin(req){const actor=await requireAdmin(req);if(actor.mode!=='session')throw new HttpError(403,'Esta operação exige sessão administrativa atribuível.','ATTRIBUTABLE_ADMIN_SESSION_REQUIRED');return actor}
const decode=value=>decodeURIComponent(value)

export async function handleContentIngestionRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/integrations/editorial')&&!path.startsWith('/api/editorial/import-candidates'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    const actor=await requireAttributableAdmin(req)
    if(req.method==='GET'&&path==='/api/integrations/editorial/provider-status'){send(res,200,{providers:await contentIngestionService.providerStatus()},cors);return true}
    if(req.method==='GET'&&path==='/api/integrations/editorial/sources'){send(res,200,{sources:await contentIngestionService.listSources()},cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/editorial/sources'){send(res,201,{source:await contentIngestionService.createSource(await readJson(req))},cors);return true}
    const sourceMatch=path.match(/^\/api\/integrations\/editorial\/sources\/([^/]+)$/)
    if(sourceMatch&&req.method==='PATCH'){send(res,200,{source:await contentIngestionService.updateSource(decode(sourceMatch[1]),await readJson(req))},cors);return true}
    const syncMatch=path.match(/^\/api\/integrations\/editorial\/sources\/([^/]+)\/sync$/)
    if(syncMatch&&req.method==='POST'){send(res,200,{run:await contentIngestionService.syncSource(decode(syncMatch[1]))},cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/editorial/sync-due'){send(res,200,{results:await contentIngestionService.syncDue()},cors);return true}
    if(req.method==='GET'&&path==='/api/integrations/editorial/sync-runs'){send(res,200,{runs:await contentIngestionService.listSyncRuns({sourceId:url.searchParams.get('sourceId')||undefined,limit:url.searchParams.get('limit')||undefined})},cors);return true}
    if(req.method==='GET'&&path==='/api/editorial/import-candidates'){send(res,200,{candidates:await contentIngestionService.listCandidates({status:url.searchParams.get('status')||undefined,provider:url.searchParams.get('provider')||undefined,limit:url.searchParams.get('limit')||undefined,offset:url.searchParams.get('offset')||undefined})},cors);return true}
    const candidateMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)$/)
    if(candidateMatch&&req.method==='GET'){send(res,200,{candidate:await contentIngestionService.getCandidate(decode(candidateMatch[1]))},cors);return true}
    const actionMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)\/(review|approve|reject|ignore|convert)$/)
    if(actionMatch&&req.method==='POST'){
      const id=decode(actionMatch[1]),action=actionMatch[2],body=await readJson(req)
      if(action==='convert'){send(res,201,await contentIngestionService.convertCandidate(id,{pageId:body.pageId,author:body.author},actor),cors);return true}
      const status={review:'reviewing',approve:'approved',reject:'rejected',ignore:'ignored'}[action]
      send(res,200,{candidate:await contentIngestionService.setCandidateStatus(id,status,actor)},cors);return true
    }
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
