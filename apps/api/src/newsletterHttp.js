import {timingSafeEqual} from 'node:crypto'
import {authService} from './authService.js'
import {HttpError} from './editorialService.js'
import {newsletterService} from './newsletterService.js'

const SESSION_COOKIE_NAME=String(process.env.PORTAL_SESSION_COOKIE_NAME||'portal_lander_session').trim()||'portal_lander_session'
const MAX_JSON_BYTES=16*1024
const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){const origin=String(req.headers.origin||'').trim();if(!origin)return {};const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);const allow=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production');if(!allow)return {};return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}}
function readCookie(req,name){for(const part of String(req.headers.cookie||'').split(';')){const index=part.indexOf('=');if(index<1)continue;if(part.slice(0,index).trim()!==name)continue;const value=part.slice(index+1).trim();try{return decodeURIComponent(value)}catch{return value}}return ''}
function safeEqual(a,b){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
async function requireAdmin(req){const expected=process.env.PORTAL_ADMIN_TOKEN||'',header=String(req.headers.authorization||''),bearer=header.startsWith('Bearer ')?header.slice(7):'';if(expected&&bearer&&safeEqual(bearer,expected))return;if(!await authService.session(readCookie(req,SESSION_COOKIE_NAME)))throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED')}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleNewsletterRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/newsletter'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    if(req.method==='POST'&&path==='/api/newsletter/subscribe'){
      const body=await readJson(req)
      if(body.website)throw new HttpError(400,'Inscrição inválida.','NEWSLETTER_SPAM_DETECTED')
      const result=await newsletterService.subscribe({email:body.email,source:body.source||'home-newsletter',consentVersion:body.consentVersion||'v1',metadata:{locale:String(req.headers['accept-language']||'').slice(0,80)}})
      send(res,201,{ok:true,synced:result.synced,message:result.warning||'Inscrição realizada com sucesso.'},cors);return true
    }
    await requireAdmin(req)
    if(req.method==='GET'&&path==='/api/newsletter/subscribers'){
      const subscribers=await newsletterService.list({limit:url.searchParams.get('limit'),status:url.searchParams.get('status')||undefined})
      send(res,200,{subscribers},cors);return true
    }
    if(req.method==='GET'&&path==='/api/newsletter/stats'){
      send(res,200,{stats:await newsletterService.stats()},cors);return true
    }
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code},cors);return true
  }
}
