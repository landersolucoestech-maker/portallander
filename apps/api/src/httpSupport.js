import {randomUUID} from 'node:crypto'

const DEFAULT_METHODS='GET,POST,PUT,PATCH,DELETE,OPTIONS'
const DEFAULT_HEADERS='Content-Type,Authorization,X-Request-Id'
const requestIds=new WeakMap()
const clean=value=>String(value??'').trim()

export function requestId(req){
  if(requestIds.has(req))return requestIds.get(req)
  const supplied=clean(req.headers?.['x-request-id'])
  const value=supplied.slice(0,160)||randomUUID()
  requestIds.set(req,value)
  return value
}

export function requestMetadata(req){
  const forwarded=clean(req.headers?.['x-forwarded-for']).split(',')[0].trim()
  return {requestId:requestId(req),method:clean(req.method),path:clean(req.url).split('?')[0]||'/',origin:clean(req.headers?.origin),ip:forwarded||req.socket?.remoteAddress||'unknown'}
}

export function corsHeaders(req,{methods=DEFAULT_METHODS,headers=DEFAULT_HEADERS}={}){
  const base={'x-request-id':requestId(req)}
  const origin=clean(req.headers?.origin)
  if(!origin)return base
  const configured=clean(process.env.PORTAL_ALLOWED_ORIGINS).split(',').map(value=>value.trim()).filter(Boolean)
  const allowed=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production')
  if(!allowed)return base
  return {...base,'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':methods,'access-control-allow-headers':headers}
}

export function sendJson(res,status,value,headers={}){
  const body=JSON.stringify(value)
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers})
  res.end(body)
}

export function handleOptions(req,res,options){
  if(req.method!=='OPTIONS')return false
  res.writeHead(204,corsHeaders(req,options))
  res.end()
  return true
}
