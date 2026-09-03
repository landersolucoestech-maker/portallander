import {timingSafeEqual} from 'node:crypto'
import {authService} from './authService.js'
import {HttpError} from './editorialService.js'
import {spotifyReleaseService} from './spotifyReleaseService.js'

const SESSION_COOKIE_NAME=String(process.env.PORTAL_SESSION_COOKIE_NAME||'portal_lander_session').trim()||'portal_lander_session'
const MAX_JSON_BYTES=64*1024

const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){
  const origin=String(req.headers.origin||'').trim()
  if(!origin)return {}
  const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean)
  const allow=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production')
  if(!allow)return {}
  return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id'}
}
function readCookie(req,name){for(const part of String(req.headers.cookie||'').split(';')){const index=part.indexOf('=');if(index<1)continue;const key=part.slice(0,index).trim();if(key!==name)continue;const value=part.slice(index+1).trim();try{return decodeURIComponent(value)}catch{return value}}return ''}
function safeEqual(a,b){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
async function requireAdmin(req){
  const expected=process.env.PORTAL_ADMIN_TOKEN||'',header=String(req.headers.authorization||''),bearer=header.startsWith('Bearer ')?header.slice(7):''
  if(expected&&bearer&&safeEqual(bearer,expected))return
  if(!await authService.session(readCookie(req,SESSION_COOKIE_NAME)))throw new HttpError(401,'Sessão administrativa inválida ou expirada.','ADMIN_UNAUTHORIZED')
}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleSpotifyReleaseRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/integrations/spotify/releases'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    if(req.method==='GET'&&path==='/api/integrations/spotify/releases/public'){
      const state=await spotifyReleaseService.publicState()
      send(res,200,state,cors)
      void spotifyReleaseService.syncIfStale()
      return true
    }
    if(req.method==='GET'&&path==='/api/integrations/spotify/releases/callback'){
      const error=url.searchParams.get('error')
      if(error)throw new HttpError(400,`Autorização Spotify recusada: ${error}.`,'SPOTIFY_AUTHORIZATION_DENIED')
      const returnTo=await spotifyReleaseService.completeAuthorization({code:url.searchParams.get('code'),state:url.searchParams.get('state')})
      res.writeHead(302,{location:`${returnTo}${returnTo.includes('?')?'&':'?'}spotify=connected`,'cache-control':'no-store'});res.end();return true
    }
    await requireAdmin(req)
    if(req.method==='GET'&&path==='/api/integrations/spotify/releases'){send(res,200,await spotifyReleaseService.adminState(),cors);return true}
    if(req.method==='POST'&&path==='/api/integrations/spotify/releases/connect'){
      const body=await readJson(req)
      const authorizeUrl=await spotifyReleaseService.createAuthorizationUrl(body.returnTo)
      send(res,200,{authorizeUrl},cors);return true
    }
    if(req.method==='DELETE'&&path==='/api/integrations/spotify/releases/connection'){send(res,200,await spotifyReleaseService.disconnect(),cors);return true}
    if(req.method==='PUT'&&path==='/api/integrations/spotify/releases/playlist'){
      const body=await readJson(req)
      send(res,200,await spotifyReleaseService.setPlaylist(body.playlistId||body.playlistUrl||body.playlist),cors);return true
    }
    if(req.method==='POST'&&path==='/api/integrations/spotify/releases/sync'){send(res,200,await spotifyReleaseService.sync(),cors);return true}
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
