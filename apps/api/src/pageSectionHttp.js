import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {pageSectionService} from './pageSectionService.js'

const MAX_JSON_BYTES=1024*1024

const send=(res,status,value,headers={})=>{
  const body=JSON.stringify(value)
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers})
  res.end(body)
}

function corsHeaders(req){
  const origin=String(req.headers.origin||'').trim()
  if(!origin)return {}
  const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean)
  const allowDevelopmentFallback=configured.length===0&&process.env.NODE_ENV!=='production'
  if(!configured.includes(origin)&&!allowDevelopmentFallback)return {}
  return {
    'access-control-allow-origin':origin,
    'access-control-allow-credentials':'true',
    'vary':'Origin',
    'access-control-allow-methods':'GET,PUT,PATCH,OPTIONS',
    'access-control-allow-headers':'Content-Type,Authorization,X-Request-Id',
  }
}

async function readJson(req){
  let total=0,raw=''
  for await(const chunk of req){
    total+=chunk.length
    if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE')
    raw+=chunk
  }
  if(!raw)return {}
  try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}
}

export async function handlePageSectionRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  const match=path.match(/^\/api\/editorial\/page-sections\/([^/]+)$/)
  if(!match)return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    await requireAdmin(req)
    const pageKey=decodeURIComponent(match[1])
    if(req.method==='GET'){
      const sections=await pageSectionService.list(pageKey)
      send(res,200,{sections},cors);return true
    }
    if(req.method==='PUT'||req.method==='PATCH'){
      const body=await readJson(req)
      const sections=await pageSectionService.replace(pageKey,body.sections)
      send(res,200,{sections},cors);return true
    }
    throw new HttpError(405,'Método não permitido.','METHOD_NOT_ALLOWED')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API.'
    if(status>=500)console.error(error)
    send(res,status,{message,code},cors);return true
  }
}
