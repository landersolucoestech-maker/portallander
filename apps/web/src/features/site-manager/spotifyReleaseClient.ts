const configuredBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')
const apiBase=configuredBase

export type SpotifyReleaseItem={
  id:string
  position:number
  title:string
  artists:string[]
  artistLabel:string
  albumName:string
  coverUrl:string
  spotifyUrl:string
  durationMs:number
  explicit:boolean
  addedAt:string|null
}
export type SpotifyReleaseSource={
  provider:'spotify'
  playlistId:string
  playlistName:string
  playlistUrl:string
  status:'disconnected'|'ready'|'syncing'|'empty'|'stale'|'error'
  lastSyncedAt:string|null
  lastAttemptAt:string|null
  error:{code:string;message:string;retryAfterSeconds:number|null}|null
}
export type SpotifyReleasePublicState={source:SpotifyReleaseSource;items:SpotifyReleaseItem[]}
export type SpotifyReleaseAdminState=SpotifyReleasePublicState&{
  configured:boolean
  connected:boolean
  account:{id:string;name:string;connectedAt:string;scope:string}|null
}

class SpotifyReleaseClientError extends Error{constructor(message:string,public code:string,public status:number,public details?:unknown){super(message)}}

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  let response:Response
  try{response=await fetch(`${apiBase}${path}`,{credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})},...init})}
  catch{throw new SpotifyReleaseClientError('Não foi possível alcançar a API de integração Spotify.','SPOTIFY_NETWORK_ERROR',0)}
  let payload:any={}
  try{payload=await response.json()}catch{}
  if(!response.ok)throw new SpotifyReleaseClientError(payload.message||`Falha HTTP ${response.status}.`,payload.code||'SPOTIFY_REQUEST_FAILED',response.status,payload.details)
  return payload as T
}

export const spotifyReleaseClient={
  publicState:()=>request<SpotifyReleasePublicState>('/api/integrations/spotify/releases/public'),
  adminState:()=>request<SpotifyReleaseAdminState>('/api/integrations/spotify/releases'),
  connect:async(returnTo='/app/site/paginas/home/secoes/lancamentos')=>(await request<{authorizeUrl:string}>('/api/integrations/spotify/releases/connect',{method:'POST',body:JSON.stringify({returnTo})})).authorizeUrl,
  disconnect:()=>request<SpotifyReleaseAdminState>('/api/integrations/spotify/releases/connection',{method:'DELETE'}),
  setPlaylist:(playlist:string)=>request<SpotifyReleaseAdminState>('/api/integrations/spotify/releases/playlist',{method:'PUT',body:JSON.stringify({playlist})}),
  sync:()=>request<SpotifyReleaseAdminState>('/api/integrations/spotify/releases/sync',{method:'POST',body:'{}'}),
}
