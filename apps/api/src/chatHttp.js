import {chatService} from './chatService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=1024*1024
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload do Chat excede o limite permitido.','CHAT_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
const decode=value=>decodeURIComponent(value)

export async function handleChatRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/chat'))return false
  try{
    const admin=await requireAdmin(req),userId=admin.user?.id||null
    if(!userId)throw new HttpError(401,'Sessão administrativa inválida.','CHAT_UNAUTHENTICATED')
    if(path==='/api/chat/state'&&req.method==='GET'){send(res,200,{state:await chatService.state()});return true}
    if(path==='/api/chat/support'&&req.method==='POST'){
      const body=await readJson(req),created=await chatService.createSupport(body,userId)
      let state=created.state
      if(String(body.initialMessage||'').trim())state=await chatService.sendSupport(created.conversation.id,{body:body.initialMessage},userId)
      send(res,201,{state,conversation:created.conversation});return true
    }
    let match=path.match(/^\/api\/chat\/support\/([^/]+)\/(messages|status|transfer|tags|crm)$/)
    if(match){const id=decode(match[1]),action=match[2],body=await readJson(req);if(req.method!=='POST'&&req.method!=='PATCH')throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED');let state;if(action==='messages')state=await chatService.sendSupport(id,body,userId);else if(action==='status')state=await chatService.setStatus(id,body.status,userId);else if(action==='transfer')state=await chatService.transfer(id,body.assignee,userId);else if(action==='tags')state=await chatService.addTag(id,body.tag,userId);else state=await chatService.markCrm(id,body,userId);send(res,200,{state});return true}
    if(path==='/api/chat/internal'&&req.method==='POST'){const body=await readJson(req);send(res,201,{state:await chatService.createInternal(body.participantAuthUserIds,userId)});return true}
    match=path.match(/^\/api\/chat\/internal\/([^/]+)\/messages$/)
    if(match&&req.method==='POST'){const body=await readJson(req);send(res,201,{state:await chatService.sendInternal(decode(match[1]),body.body,userId)});return true}
    if(path==='/api/chat/automation'&&(req.method==='PUT'||req.method==='PATCH')){send(res,200,{state:await chatService.saveAutomation(await readJson(req),userId)});return true}
    throw new HttpError(404,'Rota do Chat não encontrada.','CHAT_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API de Chat.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})});return true
  }
}
