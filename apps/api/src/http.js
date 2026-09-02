import {randomUUID,timingSafeEqual} from 'node:crypto'
import {authService} from './authService.js'
import {getPool} from './db.js'
import {editorialService,HttpError} from './editorialService.js'
import {formAdminService} from './formAdminService.js'
import {formPublicService} from './formPublicService.js'
import {formService,hashClientIp} from './formService.js'
import {parseMultipart} from './multipart.js'

const MAX_JSON_BYTES=1024*1024
const SESSION_COOKIE_NAME=String(process.env.PORTAL_SESSION_COOKIE_NAME||'portal_lander_session').trim()||'portal_lander_session'

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
  return {
    'access-control-allow-origin':origin,
    'access-control-allow-credentials':'true',
    'vary':'Origin',
    'access-control-allow-methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers':'Content-Type,Authorization,X-Request-Id',
  }
}

function safeEqual(a,b){
  const left=Buffer.from(a),right=Buffer.from(b)
  return left.length===right.length&&timingSafeEqual(left,right)
}

function parseCookies(req){
  const raw=String(req.headers.cookie||'')
  const cookies={}
  for(const part of raw.split(';')){
    const index=part.indexOf('=')
    if(index<1)continue
    const key=part.slice(0,index).trim(),value=part.slice(index+1).trim()
    if(!key)continue
    try{cookies[key]=decodeURIComponent(value)}catch{cookies[key]=value}
  }
  return cookies
}

function readSessionToken(req){return parseCookies(req)[SESSION_COOKIE_NAME]||''}

function sessionCookie(token,{expiresAt,clear=false}={}){
  const configuredSameSite=String(process.env.PORTAL_SESSION_SAME_SITE||'lax').trim().toLowerCase()
  const sameSite=['strict','lax','none'].includes(configuredSameSite)?configuredSameSite:'lax'
  const secure=process.env.PORTAL_SESSION_COOKIE_SECURE==='true'||process.env.NODE_ENV==='production'||sameSite==='none'
  const parts=[`${SESSION_COOKIE_NAME}=${clear?'':encodeURIComponent(token||'')}`,'Path=/','HttpOnly',`SameSite=${sameSite[0].toUpperCase()}${sameSite.slice(1)}`]
  if(secure)parts.push('Secure')
  if(clear)parts.push('Max-Age=0','Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  else if(expiresAt){
    const expires=new Date(expiresAt)
    parts.push(`Expires=${expires.toUTCString()}`,`Max-Age=${Math.max(0,Math.floor((expires.getTime()-Date.now())/1000))}`)
  }
  return parts.join('; ')
}

async function requireAdmin(req){
  const expected=process.env.PORTAL_ADMIN_TOKEN||''
  const header=String(req.headers.authorization||'')
  const bearer=header.startsWith('Bearer ')?header.slice(7):''
  if(expected&&bearer&&safeEqual(bearer,expected))return {mode:'legacy-token'}
  const session=await authService.session(readSessionToken(req))
  if(!session)throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED')
  return {mode:'session',...session}
}

async function readJson(req){
  let total=0,raw=''
  for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}
  if(!raw)return {}
  try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}
}

function parseJsonField(fields,key,fallback){
  const raw=fields[key]
  if(raw===undefined||raw==='')return fallback
  try{return JSON.parse(raw)}catch{throw new HttpError(400,`Campo ${key} contém JSON inválido.`,'FORM_FIELD_JSON_INVALID',{field:key})}
}

function clientIp(req){
  const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()
  return forwarded||req.socket?.remoteAddress||'unknown'
}

const decode=value=>decodeURIComponent(value)

export async function handleRequest(req,res){
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return}
  try{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
    const path=url.pathname.replace(/\/+$/,'')||'/'

    if(req.method==='GET'&&path==='/health'){
      await getPool().query('select 1')
      send(res,200,{status:'ok',service:'@portallander/api',database:'connected'},cors);return
    }

    if(req.method==='POST'&&path==='/api/auth/login'){
      const body=await readJson(req)
      const session=await authService.login({
        email:body.email,
        password:body.password,
        remember:Boolean(body.remember),
        userAgent:String(req.headers['user-agent']||''),
        ipHash:hashClientIp(clientIp(req)),
      })
      send(res,200,{authenticated:true,user:session.user,expiresAt:session.expiresAt},{...cors,'set-cookie':sessionCookie(session.token,{expiresAt:session.expiresAt})});return
    }

    if(req.method==='GET'&&path==='/api/auth/session'){
      const session=await authService.session(readSessionToken(req))
      send(res,200,session?{authenticated:true,user:session.user,expiresAt:session.expiresAt}:{authenticated:false},cors);return
    }

    if(req.method==='POST'&&path==='/api/auth/logout'){
      await authService.logout(readSessionToken(req))
      send(res,200,{authenticated:false},{...cors,'set-cookie':sessionCookie('',{clear:true})});return
    }

    if(req.method==='GET'&&path==='/api/editorial/snapshot'){
      const [pages,contents]=await Promise.all([
        editorialService.listPages({publicOnly:true}),
        editorialService.listContents({publicOnly:true}),
      ])
      send(res,200,{pages,contents},cors);return
    }

    if(req.method==='GET'&&path==='/api/editorial/pages'){
      const publicOnly=url.searchParams.get('public')==='1'
      if(!publicOnly)await requireAdmin(req)
      const pages=await editorialService.listPages({publicOnly})
      send(res,200,{pages},cors);return
    }
    if(req.method==='POST'&&path==='/api/editorial/pages'){
      await requireAdmin(req);const page=await editorialService.createPage(await readJson(req));send(res,201,{page},cors);return
    }
    const pageMatch=path.match(/^\/api\/editorial\/pages\/([^/]+)$/)
    if(pageMatch){
      const id=decode(pageMatch[1])
      if(req.method==='GET'){await requireAdmin(req);const page=await editorialService.getPage(id);if(!page)throw new HttpError(404,'Página não encontrada.','PAGE_NOT_FOUND');send(res,200,{page},cors);return}
      if(req.method==='PUT'||req.method==='PATCH'){await requireAdmin(req);const page=await editorialService.updatePage(id,await readJson(req));send(res,200,{page},cors);return}
      if(req.method==='DELETE'){await requireAdmin(req);await editorialService.deletePage(id);send(res,200,{deleted:true,id},cors);return}
    }

    if(req.method==='GET'&&path==='/api/editorial/contents'){
      const publicOnly=url.searchParams.get('public')==='1'
      if(!publicOnly)await requireAdmin(req)
      const contents=await editorialService.listContents({pageId:url.searchParams.get('pageId')||undefined,publicOnly})
      send(res,200,{contents},cors);return
    }
    if(req.method==='POST'&&path==='/api/editorial/contents'){
      await requireAdmin(req);const content=await editorialService.createContent(await readJson(req));send(res,201,{content},cors);return
    }
    const contentMatch=path.match(/^\/api\/editorial\/contents\/([^/]+)$/)
    if(contentMatch){
      const id=decode(contentMatch[1])
      if(req.method==='GET'){await requireAdmin(req);const content=await editorialService.getContent(id);if(!content)throw new HttpError(404,'Conteúdo não encontrado.','CONTENT_NOT_FOUND');send(res,200,{content},cors);return}
      if(req.method==='PUT'||req.method==='PATCH'){await requireAdmin(req);const content=await editorialService.updateContent(id,await readJson(req));send(res,200,{content},cors);return}
      if(req.method==='DELETE'){await requireAdmin(req);await editorialService.deleteContent(id);send(res,200,{deleted:true,id},cors);return}
    }

    if(req.method==='GET'&&path==='/api/forms/definitions/public'){
      const forms=await formPublicService.listPublished()
      send(res,200,{forms},cors);return
    }
    if(req.method==='GET'&&path==='/api/forms/definitions'){
      await requireAdmin(req);const forms=await formAdminService.list();send(res,200,{forms},cors);return
    }
    if(req.method==='POST'&&path==='/api/forms/definitions'){
      await requireAdmin(req);const form=await formAdminService.create(await readJson(req));send(res,201,{form},cors);return
    }
    const publishFormMatch=path.match(/^\/api\/forms\/definitions\/([^/]+)\/publish$/)
    if(req.method==='POST'&&publishFormMatch){
      await requireAdmin(req);const form=await formAdminService.publish(decode(publishFormMatch[1]));send(res,200,{form},cors);return
    }
    const statusFormMatch=path.match(/^\/api\/forms\/definitions\/([^/]+)\/status$/)
    if((req.method==='PUT'||req.method==='PATCH')&&statusFormMatch){
      await requireAdmin(req);const body=await readJson(req);const form=await formAdminService.setStatus(decode(statusFormMatch[1]),body.status);send(res,200,{form},cors);return
    }
    const formDefinitionMatch=path.match(/^\/api\/forms\/definitions\/([^/]+)$/)
    if(formDefinitionMatch){
      const key=decode(formDefinitionMatch[1])
      if(req.method==='GET'){await requireAdmin(req);const form=await formAdminService.get(key);send(res,200,{form},cors);return}
      if(req.method==='PUT'||req.method==='PATCH'){await requireAdmin(req);const form=await formAdminService.save(key,await readJson(req));send(res,200,{form},cors);return}
      if(req.method==='DELETE'){await requireAdmin(req);const result=await formAdminService.remove(key);send(res,200,result,cors);return}
    }

    const submissionMatch=path.match(/^\/api\/forms\/([^/]+)\/submissions$/)
    if(req.method==='POST'&&submissionMatch){
      const slug=decode(submissionMatch[1])
      const {fields,files}=await parseMultipart(req)
      const submission=await formService.submit({
        slug,
        version:Number(fields.formVersion||0)||undefined,
        payload:parseJsonField(fields,'payload',{}),
        source:parseJsonField(fields,'source',{}),
        acceptedConsentIds:parseJsonField(fields,'acceptedConsentIds',[]),
        antiSpam:parseJsonField(fields,'antiSpam',{}),
        files,
        ipHash:hashClientIp(clientIp(req)),
        userAgent:String(req.headers['user-agent']||''),
        requestId:String(req.headers['x-request-id']||randomUUID()),
      })
      send(res,201,submission,cors);return
    }

    if(req.method==='GET'&&path==='/api/forms/editorial/collaborations'){
      await requireAdmin(req)
      const items=await formService.listCollaborations()
      send(res,200,{items},cors);return
    }

    throw new HttpError(404,'Rota não encontrada.','ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors)
  }
}
