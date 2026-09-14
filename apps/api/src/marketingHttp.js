import {marketingService} from './marketingService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {corsHeaders,handleOptions,sendJson} from './httpSupport.js'

const MAX_JSON_BYTES=768*1024
const decode=value=>decodeURIComponent(value)
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload de Marketing excede o limite permitido.','MARKETING_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleMarketingRequest(req,res){
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
 if(!path.startsWith('/api/marketing/'))return false
 const methods='GET,POST,PUT,PATCH,DELETE,OPTIONS',cors=corsHeaders(req,{methods})
 if(handleOptions(req,res,{methods}))return true
 try{
  const admin=await requireAdmin(req),userId=admin.user?.id||null
  if(!userId)throw new HttpError(401,'Marketing requer sessão administrativa atribuível.','MARKETING_SESSION_REQUIRED')
  if(path==='/api/marketing/hashtags/suggestions'&&req.method==='GET'){sendJson(res,200,await marketingService.listHashtagSuggestions(url.searchParams.get('q')||'',url.searchParams.get('limit')||8),cors);return true}
  if(path==='/api/marketing/contents'&&req.method==='GET'){sendJson(res,200,{contents:await marketingService.listContents()},cors);return true}
  if(path==='/api/marketing/contents'&&req.method==='POST'){sendJson(res,201,{content:await marketingService.createContent(await readJson(req),userId)},cors);return true}
  const payloadMatch=path.match(/^\/api\/marketing\/contents\/([^/]+)\/publication-payload$/)
  if(payloadMatch&&req.method==='GET'){sendJson(res,200,{payload:await marketingService.getPublicationPayload(decode(payloadMatch[1]),url.searchParams.get('provider')||'instagram')},cors);return true}
  const match=path.match(/^\/api\/marketing\/contents\/([^/]+)$/)
  if(match){const id=decode(match[1]);if(req.method==='GET'){sendJson(res,200,{content:await marketingService.getContent(id)},cors);return true}if(req.method==='PATCH'||req.method==='PUT'){const body=await readJson(req);sendJson(res,200,{content:await marketingService.updateContent(id,body.patch??body,body.expectedUpdatedAt,userId)},cors);return true}if(req.method==='DELETE'){await marketingService.removeContent(id);sendJson(res,200,{deleted:true,id},cors);return true}}
  throw new HttpError(404,'Rota de Marketing não encontrada.','MARKETING_ROUTE_NOT_FOUND')
 }catch(error){const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API de Marketing.';if(status>=500)console.error(error);sendJson(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true}
}
