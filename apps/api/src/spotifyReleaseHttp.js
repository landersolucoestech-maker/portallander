import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {spotifyReleaseService} from './spotifyReleaseService.js'

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
function publicAppRedirect(returnTo,status){
  const path=`${returnTo}${returnTo.includes('?')?'&':'?'}spotify=${encodeURIComponent(status)}`
  const configured=String(process.env.PORTAL_PUBLIC_APP_URL||'').trim()
  if(!configured)return path
  try{return new URL(path,new URL(configured.endsWith('/')?configured:`${configured}/`)).toString()}catch{throw new HttpError(503,'PORTAL_PUBLIC_APP_URL possui formato inválido.','PUBLIC_APP_URL_INVALID')}
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
      res.writeHead(302,{location:publicAppRedirect(returnTo,'connected'),'cache-control':'no-store'});res.end();return true
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
