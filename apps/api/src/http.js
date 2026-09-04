import {randomUUID,timingSafeEqual} from 'node:crypto'
import {authService} from './authService.js'
import {getPool} from './db.js'
import {editorialService,HttpError} from './editorialService.js'
import {formAdminService} from './formAdminService.js'
import {formPublicService} from './formPublicService.js'
import {formService,hashClientIp} from './formService.js'
import {mediaService} from './mediaService.js'
import {mediaKitService} from './mediaKitService.js'
import {parseMultipart} from './multipart.js'

const MAX_JSON_BYTES=1024*1024
const SESSION_COOKIE_NAME=String(process.env.PORTAL_SESSION_COOKIE_NAME||'portal_lander_session').trim()||'portal_lander_session'
const ADMINISTRATIVE_ROLES=new Set(['owner','admin'])

function send(res,status,value,headers={}){
  const body=JSON.stringify(value)
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers})
  res.end(body)
}

function corsHeaders(req){
  const origin=String(req.headers.origin||'').trim()
  if(!origin)return {}
  const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean)
  const allowDevelopmentFallback=configured.length===0&&process.env.NODE_ENV!=='production'
  const allowed=configured.includes(origin)||allowDevelopmentFallback
  if(!allowed)return {}
  return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}
}

function safeEqual(a,b){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
function parseCookies(req){const raw=String(req.headers.cookie||''),cookies={};for(const part of raw.split(';')){const index=part.indexOf('=');if(index<1)continue;const key=part.slice(0,index).trim(),value=part.slice(index+1).trim();if(!key)continue;try{cookies[key]=decodeURIComponent(value)}catch{cookies[key]=value}}return cookies}
export function readSessionToken(req){return parseCookies(req)[SESSION_COOKIE_NAME]||''}
function sessionCookie(token,{expiresAt,clear=false}={}){const configuredSameSite=String(process.env.PORTAL_SESSION_SAME_SITE||'lax').trim().toLowerCase(),sameSite=['strict','lax','none'].includes(configuredSameSite)?configuredSameSite:'lax',secure=process.env.PORTAL_SESSION_COOKIE_SECURE==='true'||process.env.NODE_ENV==='production'||sameSite==='none',parts=[`${SESSION_COOKIE_NAME}=${clear?'':encodeURIComponent(token||'')}`,'Path=/','HttpOnly',`SameSite=${sameSite[0].toUpperCase()}${sameSite.slice(1)}`];if(secure)parts.push('Secure');if(clear)parts.push('Max-Age=0','Expires=Thu, 01 Jan 1970 00:00:00 GMT');else if(expiresAt){const expires=new Date(expiresAt);parts.push(`Expires=${expires.toUTCString()}`,`Max-Age=${Math.max(0,Math.floor((expires.getTime()-Date.now())/1000))}`)}return parts.join('; ')}
export function isAdministrativeRole(role){return ADMINISTRATIVE_ROLES.has(String(role||'').trim().toLowerCase())}
export async function requireAdmin(req){const expected=process.env.PORTAL_ADMIN_TOKEN||'',header=String(req.headers.authorization||''),bearer=header.startsWith('Bearer ')?header.slice(7):'';if(expected&&bearer&&safeEqual(bearer,expected))return {mode:'legacy-token'};const token=readSessionToken(req),session=await authService.session(token);if(!session)throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED');if(!isAdministrativeRole(session.user?.role))throw new HttpError(403,'Seu perfil não possui permissão administrativa.','ADMIN_FORBIDDEN',{role:session.user?.role||null});return {mode:'session',sessionToken:token,...session}}

async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}
function parseJsonField(fields,key,fallback){const raw=fields[key];if(raw===undefined||raw==='')return fallback;try{return JSON.parse(raw)}catch{throw new HttpError(400,`Campo ${key} contém JSON inválido.`,'FORM_FIELD_JSON_INVALID',{field:key})}}
function clientIp(req){const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();return forwarded||req.socket?.remoteAddress||'unknown'}
const decode=value=>decodeURIComponent(value)

export async function handleRequest(req,res){
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return}
  try{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
    const path=url.pathname.replace(/\/+$/,'')||'/'
    if(path==='/api/health'&&req.method==='GET'){send(res,200,{ok:true,service:'portallander-api'},cors);return}
    if(path==='/api/auth/login'&&req.method==='POST'){const body=await readJson(req),session=await authService.login({email:body.email,password:body.password,remember:Boolean(body.remember),userAgent:String(req.headers['user-agent']||''),ipHash:hashClientIp(clientIp(req))});send(res,200,{user:session.user,expiresAt:session.expiresAt},{...cors,'set-cookie':sessionCookie(session.token,{expiresAt:session.expiresAt})});return}
    if(path==='/api/auth/session'&&req.method==='GET'){const session=await authService.session(readSessionToken(req));if(!session){send(res,401,{message:'Sessão administrativa inválida ou expirada.','code':'ADMIN_UNAUTHORIZED'},cors);return}send(res,200,{user:session.user,expiresAt:session.expiresAt},cors);return}
    if(path==='/api/auth/logout'&&req.method==='POST'){await authService.logout(readSessionToken(req));send(res,200,{ok:true},{...cors,'set-cookie':sessionCookie('',{clear:true})});return}
    if(path.startsWith('/api/forms/public/')&&req.method==='GET'){const slug=decode(path.slice('/api/forms/public/'.length));send(res,200,{form:await formPublicService.getBySlug(slug)},cors);return}
    if(path.startsWith('/api/forms/public/')&&req.method==='POST'){const slug=decode(path.slice('/api/forms/public/'.length));const form=await formPublicService.getBySlug(slug);const contentType=String(req.headers['content-type']||'');let body;if(contentType.includes('multipart/form-data')){const parsed=await parseMultipart(req,{maxFileBytes:20*1024*1024,maxTotalBytes:25*1024*1024});body={...parsed.fields,answers:parseJsonField(parsed.fields,'answers',{}),consent:parseJsonField(parsed.fields,'consent',{}),file:parsed.files[0]||null}}else body=await readJson(req);send(res,201,await formPublicService.submit({slug,payload:body,form,ipHash:hashClientIp(clientIp(req)),userAgent:String(req.headers['user-agent']||'')}),cors);return}
    if(path==='/api/media/public'&&req.method==='GET'){send(res,200,{items:await mediaService.listPublic()},cors);return}
    const admin=await requireAdmin(req)
    if(path==='/api/admin/me'&&req.method==='GET'){send(res,200,{user:admin.user||null,mode:admin.mode},cors);return}
    if(path==='/api/editorial/posts'&&req.method==='GET'){send(res,200,{posts:await editorialService.listPosts()},cors);return}
    if(path==='/api/editorial/posts'&&req.method==='POST'){send(res,201,{post:await editorialService.createPost(await readJson(req),admin.user?.id||null)},cors);return}
    const postMatch=path.match(/^\/api\/editorial\/posts\/([^/]+)$/)
    if(postMatch&&req.method==='GET'){send(res,200,{post:await editorialService.getPost(decode(postMatch[1]))},cors);return}
    if(postMatch&&req.method==='PUT'){send(res,200,{post:await editorialService.updatePost(decode(postMatch[1]),await readJson(req),admin.user?.id||null)},cors);return}
    if(postMatch&&req.method==='DELETE'){await editorialService.deletePost(decode(postMatch[1]));send(res,200,{ok:true},cors);return}
    if(path==='/api/forms/admin'&&req.method==='GET'){send(res,200,{forms:await formAdminService.list()},cors);return}
    if(path==='/api/forms/admin'&&req.method==='POST'){send(res,201,{form:await formAdminService.create(await readJson(req),admin.user?.id||null)},cors);return}
    const formMatch=path.match(/^\/api\/forms\/admin\/([^/]+)$/)
    if(formMatch&&req.method==='GET'){send(res,200,{form:await formAdminService.get(decode(formMatch[1]))},cors);return}
    if(formMatch&&req.method==='PUT'){send(res,200,{form:await formAdminService.update(decode(formMatch[1]),await readJson(req),admin.user?.id||null)},cors);return}
    if(path==='/api/media/admin'&&req.method==='GET'){send(res,200,{items:await mediaService.listAdmin()},cors);return}
    if(path==='/api/media/admin'&&req.method==='POST'){const parsed=await parseMultipart(req,{maxFileBytes:20*1024*1024,maxTotalBytes:25*1024*1024});send(res,201,{item:await mediaService.upload(parsed.files[0],parsed.fields,admin.user?.id||null)},cors);return}
    const mediaMatch=path.match(/^\/api\/media\/admin\/([^/]+)$/)
    if(mediaMatch&&req.method==='DELETE'){await mediaService.remove(decode(mediaMatch[1]));send(res,200,{ok:true},cors);return}
    if(path==='/api/media-kit/admin'&&req.method==='GET'){send(res,200,{mediaKit:await mediaKitService.getAdmin()},cors);return}
    if(path==='/api/media-kit/admin'&&req.method==='PUT'){send(res,200,{mediaKit:await mediaKitService.saveAdmin(await readJson(req),admin.user?.id||null)},cors);return}
    throw new HttpError(404,'Rota não encontrada.','NOT_FOUND')
  }catch(error){const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.';if(status>=500)console.error(error);send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors)}
}
