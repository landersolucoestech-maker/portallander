import {authService} from './authService.js'
import {HttpError} from './editorialService.js'
import {readSessionToken} from './http.js'
import {editorialIngestionService} from './editorialIngestionService.js'

const MAX_JSON_BYTES=128*1024
const CURATION_ROLES=new Set(['owner','admin','editor'])
const ADMIN_ROLES=new Set(['owner','admin'])
const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){const origin=String(req.headers.origin||'').trim();if(!origin)return {};const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);const allow=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production');if(!allow)return {};return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
async function requireRole(req,roles){const session=await authService.session(readSessionToken(req));if(!session)throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED');const role=String(session.user?.role||'').trim().toLowerCase();if(!roles.has(role))throw new HttpError(403,'Seu perfil não possui permissão para esta operação.','ADMIN_FORBIDDEN',{role});return session}
const decode=value=>decodeURIComponent(value)

export async function handleEditorialIngestionRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/editorial/import-candidates')&&!path.startsWith('/api/integrations/sources'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    if(path==='/api/integrations/sources'){
      const session=await requireRole(req,ADMIN_ROLES)
      if(req.method==='GET'){send(res,200,{sources:await editorialIngestionService.listSources()},cors);return true}
      if(req.method==='POST'){const source=await editorialIngestionService.createSource(await readJson(req),session.user?.id);send(res,201,{source},cors);return true}
    }
    const sourceMatch=path.match(/^\/api\/integrations\/sources\/([^/]+)$/)
    if(sourceMatch&&req.method==='PATCH'){await requireRole(req,ADMIN_ROLES);const source=await editorialIngestionService.updateSource(decode(sourceMatch[1]),await readJson(req));send(res,200,{source},cors);return true}
    const syncMatch=path.match(/^\/api\/integrations\/sources\/([^/]+)\/sync$/)
    if(syncMatch&&req.method==='POST'){await requireRole(req,ADMIN_ROLES);const result=await editorialIngestionService.syncSource(decode(syncMatch[1]));send(res,200,result,cors);return true}

    if(path==='/api/editorial/import-candidates'&&req.method==='GET'){
      await requireRole(req,CURATION_ROLES)
      const items=await editorialIngestionService.listCandidates({status:url.searchParams.get('status')||undefined,provider:url.searchParams.get('provider')||undefined,limit:url.searchParams.get('limit')||undefined,offset:url.searchParams.get('offset')||undefined})
      send(res,200,{items},cors);return true
    }
    const candidateMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)$/)
    if(candidateMatch&&req.method==='GET'){await requireRole(req,CURATION_ROLES);const item=await editorialIngestionService.getCandidate(decode(candidateMatch[1]));if(!item)throw new HttpError(404,'Candidato não encontrado.','EDITORIAL_CANDIDATE_NOT_FOUND');send(res,200,{item},cors);return true}
    const reviewMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)\/(review|approve|reject|ignore)$/)
    if(reviewMatch&&req.method==='POST'){
      const session=await requireRole(req,CURATION_ROLES),action=reviewMatch[2],body=await readJson(req)
      const status=action==='approve'?'approved':action==='reject'?'rejected':action==='ignore'?'ignored':String(body.status||'reviewing')
      const item=await editorialIngestionService.reviewCandidate(decode(reviewMatch[1]),status,session.user?.id);send(res,200,{item},cors);return true
    }
    const convertMatch=path.match(/^\/api\/editorial\/import-candidates\/([^/]+)\/convert$/)
    if(convertMatch&&req.method==='POST'){const session=await requireRole(req,CURATION_ROLES);const result=await editorialIngestionService.convertCandidate(decode(convertMatch[1]),await readJson(req),session);send(res,201,result,cors);return true}
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
