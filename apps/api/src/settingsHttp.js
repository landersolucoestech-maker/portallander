import {settingsService} from './settingsService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=1024*1024
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload de Settings excede o limite permitido.','SETTINGS_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleSettingsRequest(req,res){
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
 if(!path.startsWith('/api/settings'))return false
 try{
  const admin=await requireAdmin(req),userId=admin.user?.id||null
  if(!userId)throw new HttpError(401,'Settings requer sessão administrativa real.','SETTINGS_SESSION_REQUIRED')
  if(path==='/api/settings/state'&&req.method==='GET'){send(res,200,{state:await settingsService.state(userId,admin.sessionToken||'')});return true}
  if(path==='/api/settings/company'&&(req.method==='PUT'||req.method==='PATCH')){await settingsService.saveCompany(await readJson(req),userId);send(res,200,{state:await settingsService.state(userId,admin.sessionToken||'')});return true}
  if(path==='/api/settings/security/password'&&req.method==='POST'){await settingsService.changePassword(userId,admin.sessionToken||'',await readJson(req));send(res,200,{changed:true,state:await settingsService.state(userId,admin.sessionToken||'')});return true}
  if(path==='/api/settings/security/sessions/revoke-others'&&req.method==='POST'){const result=await settingsService.revokeOtherSessions(userId,admin.sessionToken||'');send(res,200,{...result,state:await settingsService.state(userId,admin.sessionToken||'')});return true}
  throw new HttpError(404,'Rota de Settings não encontrada.','SETTINGS_ROUTE_NOT_FOUND')
 }catch(error){const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API de Settings.';if(status>=500)console.error(error);send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})});return true}
}
