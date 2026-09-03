import {createHash,randomBytes} from 'node:crypto'
import {getPool} from './db.js'
import {HttpError} from './editorialService.js'
import {decryptSpotifySecret,encryptSpotifySecret} from './spotifyTokenCrypto.js'

const PROVIDER='spotify'
const SOURCE_KEY='home-releases'
const ACCOUNTS_BASE='https://accounts.spotify.com'
const API_BASE='https://api.spotify.com/v1'
const DEFAULT_RETURN_TO='/app/site/paginas/home/secoes/lancamentos'
const DEFAULT_SCOPES='playlist-read-private playlist-read-collaborative user-read-private'
const MIN_SYNC_TTL_MINUTES=5

const hash=value=>createHash('sha256').update(value).digest('hex')
const safeReturnTo=value=>{const raw=String(value||'').trim();return raw.startsWith('/')&&!raw.startsWith('//')?raw:DEFAULT_RETURN_TO}

export function parseSpotifyPlaylistId(value){
  const raw=String(value||'').trim()
  if(!raw)throw new HttpError(400,'Informe a playlist do Spotify.','SPOTIFY_PLAYLIST_REQUIRED')
  const uri=raw.match(/^spotify:playlist:([A-Za-z0-9]+)$/i)
  if(uri)return uri[1]
  try{
    const url=new URL(raw)
    if(url.hostname==='open.spotify.com'){
      const match=url.pathname.match(/^\/playlist\/([A-Za-z0-9]+)/)
      if(match)return match[1]
    }
  }catch{}
  if(/^[A-Za-z0-9]+$/.test(raw))return raw
  throw new HttpError(400,'ID, URI ou URL de playlist Spotify inválido.','SPOTIFY_PLAYLIST_INVALID')
}

export function normalizeSpotifyPlaylistItem(entry,position){
  const track=entry?.item||entry?.track
  if(!track||track.type!=='track'||track.is_local)return null
  const spotifyUrl=String(track.external_urls?.spotify||'').trim()
  const id=String(track.id||'').trim()
  const title=String(track.name||'').trim()
  if(!id||!title||!spotifyUrl)return null
  const artists=Array.isArray(track.artists)?track.artists.map(item=>String(item?.name||'').trim()).filter(Boolean):[]
  const images=Array.isArray(track.album?.images)?track.album.images:[]
  const cover=images.find(image=>image?.url)?.url||''
  return {id,position,title,artists,artistLabel:artists.join(', '),albumName:String(track.album?.name||'').trim(),coverUrl:String(cover||''),spotifyUrl,durationMs:Number(track.duration_ms)||0,explicit:Boolean(track.explicit),addedAt:entry?.added_at||null}
}

function spotifyConfig(){
  const clientId=String(process.env.SPOTIFY_CLIENT_ID||'').trim()
  const clientSecret=String(process.env.SPOTIFY_CLIENT_SECRET||'').trim()
  const redirectUri=String(process.env.SPOTIFY_REDIRECT_URI||'').trim()
  if(!clientId||!clientSecret||!redirectUri)throw new HttpError(503,'A integração Spotify ainda não possui Client ID, Client Secret e Redirect URI configurados no backend.','SPOTIFY_NOT_CONFIGURED')
  return {clientId,clientSecret,redirectUri}
}

async function spotifyFetch(url,{token,method='GET',body,headers={}}={}){
  let response
  try{response=await fetch(url,{method,headers:{...(token?{authorization:`Bearer ${token}`}:{}) ,...headers},body})}
  catch{throw new HttpError(503,'Spotify temporariamente indisponível.','SPOTIFY_NETWORK_ERROR')}
  if(response.ok)return response
  let payload={}
  try{payload=await response.json()}catch{}
  const retryAfter=Number(response.headers.get('retry-after')||0)||null
  const apiMessage=String(payload?.error?.message||payload?.error_description||'').trim()
  if(response.status===401)throw new HttpError(401,apiMessage||'Credencial Spotify expirada ou inválida.','SPOTIFY_TOKEN_INVALID')
  if(response.status===403)throw new HttpError(403,apiMessage||'A playlist não pertence à conta conectada nem está disponível como colaboração.','SPOTIFY_PLAYLIST_FORBIDDEN')
  if(response.status===404)throw new HttpError(404,apiMessage||'Playlist Spotify não encontrada.','SPOTIFY_PLAYLIST_NOT_FOUND')
  if(response.status===429)throw new HttpError(429,'Limite temporário da API Spotify atingido.','SPOTIFY_RATE_LIMITED',{retryAfterSeconds:retryAfter})
  throw new HttpError(response.status>=500?503:400,apiMessage||'Falha ao consultar a API Spotify.','SPOTIFY_API_ERROR',{spotifyStatus:response.status})
}

async function tokenRequest(params){
  const {clientId,clientSecret}=spotifyConfig()
  const response=await spotifyFetch(`${ACCOUNTS_BASE}/api/token`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',authorization:`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`},body:new URLSearchParams(params)})
  return response.json()
}

async function connection(){const result=await getPool().query(`select provider,account_id,account_name,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,scope,connected_at,updated_at from spotify_connections where provider=$1`,[PROVIDER]);return result.rows[0]||null}
async function source(){const result=await getPool().query(`select source_key,provider,playlist_id,playlist_name,playlist_url,playlist_snapshot_id,normalized_items,status,last_synced_at,last_attempt_at,last_error_code,last_error_message,retry_after_seconds,updated_at from spotify_release_sources where source_key=$1`,[SOURCE_KEY]);return result.rows[0]||null}

const publicSource=row=>({provider:'spotify',playlistId:row?.playlist_id||'',playlistName:row?.playlist_name||'',playlistUrl:row?.playlist_url||'',status:row?.status||'disconnected',lastSyncedAt:row?.last_synced_at||null,lastAttemptAt:row?.last_attempt_at||null,error:row?.last_error_code?{code:row.last_error_code,message:row.last_error_message||'',retryAfterSeconds:row.retry_after_seconds||null}:null})

async function validAccessToken(row){
  if(!row)throw new HttpError(409,'Conecte uma conta Spotify antes de sincronizar.','SPOTIFY_DISCONNECTED')
  const expiresAt=new Date(row.token_expires_at).getTime()
  if(expiresAt>Date.now()+60_000)return decryptSpotifySecret(row.access_token_ciphertext)
  const refreshToken=decryptSpotifySecret(row.refresh_token_ciphertext)
  if(!refreshToken)throw new HttpError(401,'A conexão Spotify precisa ser autorizada novamente.','SPOTIFY_REAUTH_REQUIRED')
  let payload
  try{payload=await tokenRequest({grant_type:'refresh_token',refresh_token:refreshToken})}
  catch(error){if(error instanceof HttpError&&error.code==='SPOTIFY_API_ERROR')throw new HttpError(401,'A conexão Spotify precisa ser autorizada novamente.','SPOTIFY_REAUTH_REQUIRED');throw error}
  const nextAccess=String(payload.access_token||'')
  if(!nextAccess)throw new HttpError(401,'O Spotify não retornou um novo access token.','SPOTIFY_REAUTH_REQUIRED')
  const nextRefresh=String(payload.refresh_token||'')||refreshToken
  const tokenExpiresAt=new Date(Date.now()+(Number(payload.expires_in)||3600)*1000).toISOString()
  await getPool().query(`update spotify_connections set access_token_ciphertext=$2,refresh_token_ciphertext=$3,token_expires_at=$4,scope=coalesce(nullif($5,''),scope) where provider=$1`,[PROVIDER,encryptSpotifySecret(nextAccess),encryptSpotifySecret(nextRefresh),tokenExpiresAt,String(payload.scope||'')])
  return nextAccess
}

async function markSyncFailure(error){
  const code=error instanceof HttpError?error.code:'SPOTIFY_SYNC_FAILED'
  const message=error instanceof Error?error.message:'Falha inesperada na sincronização Spotify.'
  const retryAfter=error instanceof HttpError?Number(error.details?.retryAfterSeconds)||null:null
  await getPool().query(`update spotify_release_sources set status=case when jsonb_array_length(normalized_items)>0 then 'stale' else 'error' end,last_attempt_at=now(),last_error_code=$2,last_error_message=$3,retry_after_seconds=$4 where source_key=$1`,[SOURCE_KEY,code,message,retryAfter])
}

async function fetchPlaylistItems(token,playlistId){
  const all=[];let offset=0;const limit=50
  while(true){
    const fields=encodeURIComponent('items(added_at,item(id,type,is_local,name,duration_ms,explicit,external_urls,artists(name),album(name,images))),next,total')
    const response=await spotifyFetch(`${API_BASE}/playlists/${encodeURIComponent(playlistId)}/items?limit=${limit}&offset=${offset}&fields=${fields}`,{token})
    const payload=await response.json(),batch=Array.isArray(payload.items)?payload.items:[]
    all.push(...batch)
    if(!payload.next||batch.length===0)break
    offset+=batch.length
    if(offset>5000)break
  }
  return all.map((entry,index)=>normalizeSpotifyPlaylistItem(entry,index)).filter(Boolean)
}

async function performSync(){
  const conn=await connection(),current=await source()
  if(!current?.playlist_id)throw new HttpError(409,'Vincule uma playlist antes de sincronizar.','SPOTIFY_PLAYLIST_REQUIRED')
  await getPool().query(`update spotify_release_sources set status='syncing',last_attempt_at=now(),last_error_code=null,last_error_message=null,retry_after_seconds=null where source_key=$1`,[SOURCE_KEY])
  try{
    const token=await validAccessToken(conn)
    const metaResponse=await spotifyFetch(`${API_BASE}/playlists/${encodeURIComponent(current.playlist_id)}?fields=id,name,snapshot_id,external_urls,owner(id,display_name),tracks(total)`,{token})
    const meta=await metaResponse.json(),playlistId=String(meta.id||current.playlist_id),playlistName=String(meta.name||''),playlistUrl=String(meta.external_urls?.spotify||''),snapshotId=String(meta.snapshot_id||'')
    let items=current.normalized_items||[]
    if(!snapshotId||snapshotId!==current.playlist_snapshot_id||!Array.isArray(items)||items.length===0)items=await fetchPlaylistItems(token,playlistId)
    const status=items.length?'ready':'empty'
    const result=await getPool().query(`update spotify_release_sources set playlist_id=$2,playlist_name=$3,playlist_url=$4,playlist_snapshot_id=$5,normalized_items=$6::jsonb,status=$7,last_synced_at=now(),last_attempt_at=now(),last_error_code=null,last_error_message=null,retry_after_seconds=null where source_key=$1 returning *`,[SOURCE_KEY,playlistId,playlistName,playlistUrl,snapshotId,JSON.stringify(items),status])
    return result.rows[0]
  }catch(error){await markSyncFailure(error);throw error}
}

export const spotifyReleaseService={
  async adminState(){const [conn,row]=await Promise.all([connection(),source()]);return {configured:Boolean(process.env.SPOTIFY_CLIENT_ID&&process.env.SPOTIFY_CLIENT_SECRET&&process.env.SPOTIFY_REDIRECT_URI&&process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY),connected:Boolean(conn),account:conn?{id:conn.account_id,name:conn.account_name,connectedAt:conn.connected_at,scope:conn.scope}:null,source:publicSource(row),items:Array.isArray(row?.normalized_items)?row.normalized_items:[]}},
  async publicState(){const row=await source();return {source:publicSource(row),items:Array.isArray(row?.normalized_items)?row.normalized_items:[]}},
  async createAuthorizationUrl(returnTo){
    const {clientId,redirectUri}=spotifyConfig()
    if(!process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY)throw new HttpError(503,'A chave de criptografia Spotify não está configurada.','SPOTIFY_NOT_CONFIGURED')
    const state=randomBytes(32).toString('base64url'),stateHash=hash(state),cleanReturn=safeReturnTo(returnTo)
    await getPool().query(`delete from spotify_oauth_states where expires_at<=now()`)
    await getPool().query(`insert into spotify_oauth_states(state_hash,return_to,expires_at) values($1,$2,now()+interval '10 minutes')`,[stateHash,cleanReturn])
    const params=new URLSearchParams({response_type:'code',client_id:clientId,scope:DEFAULT_SCOPES,redirect_uri:redirectUri,state,show_dialog:'true'})
    return `${ACCOUNTS_BASE}/authorize?${params.toString()}`
  },
  async completeAuthorization({code,state}){
    const stateHash=hash(String(state||''))
    const result=await getPool().query(`delete from spotify_oauth_states where state_hash=$1 and expires_at>now() returning return_to`,[stateHash])
    if(!result.rows[0])throw new HttpError(400,'Estado OAuth do Spotify inválido ou expirado.','SPOTIFY_OAUTH_STATE_INVALID')
    const {redirectUri}=spotifyConfig(),payload=await tokenRequest({grant_type:'authorization_code',code:String(code||''),redirect_uri:redirectUri})
    const accessToken=String(payload.access_token||''),refreshToken=String(payload.refresh_token||'')
    if(!accessToken||!refreshToken)throw new HttpError(502,'O Spotify não retornou as credenciais necessárias.','SPOTIFY_TOKEN_EXCHANGE_FAILED')
    const meResponse=await spotifyFetch(`${API_BASE}/me`,{token:accessToken}),me=await meResponse.json(),expiresAt=new Date(Date.now()+(Number(payload.expires_in)||3600)*1000).toISOString()
    await getPool().query(`insert into spotify_connections(provider,account_id,account_name,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,scope,connected_at) values($1,$2,$3,$4,$5,$6,$7,now()) on conflict(provider) do update set account_id=excluded.account_id,account_name=excluded.account_name,access_token_ciphertext=excluded.access_token_ciphertext,refresh_token_ciphertext=excluded.refresh_token_ciphertext,token_expires_at=excluded.token_expires_at,scope=excluded.scope,connected_at=now()`,[PROVIDER,String(me.id||''),String(me.display_name||me.id||'Conta Spotify'),encryptSpotifySecret(accessToken),encryptSpotifySecret(refreshToken),expiresAt,String(payload.scope||'')])
    await getPool().query(`update spotify_release_sources set status=case when playlist_id is null then 'empty' when jsonb_array_length(normalized_items)>0 then 'stale' else 'empty' end,last_error_code=null,last_error_message=null,retry_after_seconds=null,last_attempt_at=null where source_key=$1`,[SOURCE_KEY])
    return safeReturnTo(result.rows[0].return_to)
  },
  async disconnect(){await getPool().query(`delete from spotify_connections where provider=$1`,[PROVIDER]);await getPool().query(`update spotify_release_sources set status='disconnected',last_error_code=null,last_error_message=null,retry_after_seconds=null where source_key=$1`,[SOURCE_KEY]);return spotifyReleaseService.adminState()},
  async setPlaylist(value){if(!await connection())throw new HttpError(409,'Conecte uma conta Spotify antes de vincular a playlist.','SPOTIFY_DISCONNECTED');const playlistId=parseSpotifyPlaylistId(value);await getPool().query(`update spotify_release_sources set playlist_id=$2,playlist_name='',playlist_url='',playlist_snapshot_id='',status='syncing',last_error_code=null,last_error_message=null,retry_after_seconds=null where source_key=$1`,[SOURCE_KEY,playlistId]);await performSync();return spotifyReleaseService.adminState()},
  async sync(){await performSync();return spotifyReleaseService.adminState()},
  async syncIfStale(){const ttl=Math.max(MIN_SYNC_TTL_MINUTES,Number(process.env.SPOTIFY_RELEASE_SYNC_TTL_MINUTES)||30);const claimed=await getPool().query(`update spotify_release_sources set last_attempt_at=now() where source_key=$1 and playlist_id is not null and status<>'disconnected' and (last_attempt_at is null or last_attempt_at<now()-($2::text||' minutes')::interval) returning source_key`,[SOURCE_KEY,String(ttl)]);if(!claimed.rows[0])return false;try{await performSync()}catch{}return true},
  sourceKey:SOURCE_KEY,
}
