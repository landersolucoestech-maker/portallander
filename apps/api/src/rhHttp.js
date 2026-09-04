import {rhService} from './rhService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=1024*1024
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload de RH excede o limite permitido.','RH_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
const decode=value=>decodeURIComponent(value)

export async function handleRhRequest(req,res){
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
 if(!path.startsWith('/api/rh'))return false
 try{
  const admin=await requireAdmin(req),userId=admin.user?.id||null
  if(!userId)throw new HttpError(401,'Sessão administrativa inválida.','RH_UNAUTHENTICATED')
  if(path==='/api/rh/state'&&req.method==='GET'){send(res,200,{state:await rhService.state()});return true}
  if(path==='/api/rh/employees'&&req.method==='POST'){const body=await readJson(req);send(res,201,await rhService.saveEmployee(body,null,userId));return true}
  if(path==='/api/rh/employees'&&req.method==='DELETE'){const body=await readJson(req);send(res,200,{state:await rhService.deleteEmployees(body.ids,userId)});return true}
  let match=path.match(/^\/api\/rh\/employees\/([^/]+)$/)
  if(match&&req.method==='PATCH'){const body=await readJson(req);send(res,200,await rhService.saveEmployee(body,decode(match[1]),userId));return true}
  if(path==='/api/rh/payroll'&&req.method==='POST'){const body=await readJson(req);send(res,201,await rhService.savePayroll(body,null,userId));return true}
  if(path==='/api/rh/payroll'&&req.method==='DELETE'){const body=await readJson(req);send(res,200,{state:await rhService.deletePayroll(body.ids,userId)});return true}
  match=path.match(/^\/api\/rh\/payroll\/([^/]+)$/)
  if(match&&req.method==='PATCH'){const body=await readJson(req);send(res,200,await rhService.savePayroll(body,decode(match[1]),userId));return true}
  if(path==='/api/rh/leaves'&&req.method==='POST'){const body=await readJson(req);send(res,201,await rhService.saveLeave(body,null,userId));return true}
  if(path==='/api/rh/leaves'&&req.method==='DELETE'){const body=await readJson(req);send(res,200,{state:await rhService.deleteLeaves(body.ids,userId)});return true}
  match=path.match(/^\/api\/rh\/leaves\/([^/]+)$/)
  if(match&&req.method==='PATCH'){const body=await readJson(req);send(res,200,await rhService.saveLeave(body,decode(match[1]),userId));return true}
  match=path.match(/^\/api\/rh\/documents\/([^/]+)$/)
  if(match&&req.method==='DELETE'){send(res,200,{state:await rhService.deleteDocument(decode(match[1]),userId)});return true}
  if(path==='/api/rh/documents'&&req.method==='POST'){await rhService.assertDocumentUploadUnavailable();return true}
  throw new HttpError(404,'Rota de RH não encontrada.','RH_ROUTE_NOT_FOUND')
 }catch(error){const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API de RH.';if(status>=500)console.error(error);send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})});return true}
}
