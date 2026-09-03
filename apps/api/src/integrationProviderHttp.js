import {timingSafeEqual} from 'node:crypto'
import {authService} from './authService.js'
import {HttpError} from './editorialService.js'
import {parseMultipart} from './multipart.js'
import {autentiqueProvider,integrationRuntimeStatus,whatsappProvider} from './integrationProviderService.js'

const SESSION_COOKIE_NAME=String(process.env.PORTAL_SESSION_COOKIE_NAME||'portal_lander_session').trim()||'portal_lander_session'
const MAX_JSON_BYTES=32*1024
const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){const origin=String(req.headers.origin||'').trim();if(!origin)return {};const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);const allow=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production');if(!allow)return {};return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}}
function readCookie(req,name){for(const part of String(req.headers.cookie||'').split(';')){const index=part.indexOf('=');if(index<1)continue;const key=part.slice(0,index).trim();if(key!==name)continue;const value=part.slice(index+1).trim();try{return decodeURIComponent(value)}catch{return value}}return ''}
function safeEqual(a,b){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
async function requireAdmin(req){const expected=process.env.PORTAL_ADMIN_TOKEN||'',header=String(req.headers.authorization||''),bearer=header.startsWith('Bearer ')?header.slice(7):'';if(expected&&bearer&&safeEqual(bearer,expected))return;if(!await authService.session(readCookie(req,SESSION_COOKIE_NAME)))throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED')}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
function parseJsonField(value,code){try{return JSON.parse(String(value||''))}catch{throw new HttpError(400,'Campo JSON multipart inválido.',code)}}

export async function handleIntegrationProviderRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/integrations/providers'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    await requireAdmin(req)
    if(req.method==='GET'&&path==='/api/integrations/providers'){send(res,200,{providers:integrationRuntimeStatus()},cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/providers/autentique/test'){send(res,200,await autentiqueProvider.testConnection(),cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/providers/autentique/documents'){
      const {fields,files}=await parseMultipart(req,{maxFiles:1,maxFileBytes:25*1024*1024})
      const file=files.find(item=>item.fieldName==='file')||files[0]
      const signers=parseJsonField(fields.signers,'AUTENTIQUE_SIGNERS_INVALID')
      send(res,201,await autentiqueProvider.createDocument({name:fields.name,signers,file}),cors);return true
    }
    if(req.method==='POST'&&path==='/api/integrations/providers/whatsapp/test'){send(res,200,await whatsappProvider.testConnection(),cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/providers/whatsapp/messages'){
      const body=await readJson(req)
      send(res,201,await whatsappProvider.sendText({to:body.to,text:body.text}),cors);return true
    }
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
