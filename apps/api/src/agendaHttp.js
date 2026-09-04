import {agendaService} from './agendaService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=1024*1024
const decode=value=>decodeURIComponent(value)
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload da Agenda excede o limite permitido.','AGENDA_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleAgendaRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/agenda'))return false
  try{
    const admin=await requireAdmin(req)
    const userId=admin.user?.id||null
    if(path==='/api/agenda/events'&&req.method==='GET'){send(res,200,{events:await agendaService.list()});return true}
    if(path==='/api/agenda/events'&&req.method==='POST'){send(res,201,{event:await agendaService.create(await readJson(req),userId)});return true}
    const match=path.match(/^\/api\/agenda\/events\/([^/]+)$/)
    if(match){
      const id=decode(match[1])
      if(req.method==='GET'){send(res,200,{event:await agendaService.get(id)});return true}
      if(req.method==='PATCH'||req.method==='PUT'){const body=await readJson(req);send(res,200,{event:await agendaService.update(id,body.patch??body,body.expectedUpdatedAt,userId)});return true}
      if(req.method==='DELETE'){await agendaService.remove(id);send(res,200,{deleted:true,id});return true}
    }
    throw new HttpError(404,'Rota da Agenda não encontrada.','AGENDA_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API de Agenda.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})})
    return true
  }
}
