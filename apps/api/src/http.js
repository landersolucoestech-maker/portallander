import {timingSafeEqual} from 'node:crypto'
import {getPool} from './db.js'
import {editorialService,HttpError} from './editorialService.js'

const MAX_JSON_BYTES=1024*1024

function send(res,status,value,headers={}){
  const body=JSON.stringify(value)
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers})
  res.end(body)
}

function corsHeaders(req){
  const origin=req.headers.origin
  const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean)
  const allowOrigin=!origin?'*':configured.length===0||configured.includes(origin)?origin:''
  return allowOrigin?{'access-control-allow-origin':allowOrigin,'vary':'Origin','access-control-allow-methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS','access-control-allow-headers':'Content-Type,Authorization'}:{}
}

function safeEqual(a,b){
  const left=Buffer.from(a),right=Buffer.from(b)
  return left.length===right.length&&timingSafeEqual(left,right)
}

function requireAdmin(req){
  const expected=process.env.PORTAL_ADMIN_TOKEN||''
  if(!expected)throw new HttpError(503,'Autenticação administrativa da API ainda não foi configurada.','ADMIN_AUTH_NOT_CONFIGURED')
  const header=req.headers.authorization||''
  const token=header.startsWith('Bearer ')?header.slice(7):''
  if(!token||!safeEqual(token,expected))throw new HttpError(401,'Credencial administrativa inválida.','ADMIN_UNAUTHORIZED')
}

async function readJson(req){
  let total=0,raw=''
  for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload excede o limite permitido.','PAYLOAD_TOO_LARGE');raw+=chunk}
  if(!raw)return {}
  try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}
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

    if(req.method==='GET'&&path==='/api/editorial/snapshot'){
      const [pages,contents]=await Promise.all([
        editorialService.listPages({publicOnly:true}),
        editorialService.listContents({publicOnly:true}),
      ])
      send(res,200,{pages,contents},cors);return
    }

    if(req.method==='GET'&&path==='/api/editorial/pages'){
      const publicOnly=url.searchParams.get('public')==='1'
      if(!publicOnly)requireAdmin(req)
      const pages=await editorialService.listPages({publicOnly})
      send(res,200,{pages},cors);return
    }
    if(req.method==='POST'&&path==='/api/editorial/pages'){
      requireAdmin(req);const page=await editorialService.createPage(await readJson(req));send(res,201,{page},cors);return
    }
    const pageMatch=path.match(/^\/api\/editorial\/pages\/([^/]+)$/)
    if(pageMatch){
      const id=decode(pageMatch[1])
      if(req.method==='GET'){requireAdmin(req);const page=await editorialService.getPage(id);if(!page)throw new HttpError(404,'Página não encontrada.','PAGE_NOT_FOUND');send(res,200,{page},cors);return}
      if(req.method==='PUT'||req.method==='PATCH'){requireAdmin(req);const page=await editorialService.updatePage(id,await readJson(req));send(res,200,{page},cors);return}
      if(req.method==='DELETE'){requireAdmin(req);await editorialService.deletePage(id);send(res,200,{deleted:true,id},cors);return}
    }

    if(req.method==='GET'&&path==='/api/editorial/contents'){
      const publicOnly=url.searchParams.get('public')==='1'
      if(!publicOnly)requireAdmin(req)
      const contents=await editorialService.listContents({pageId:url.searchParams.get('pageId')||undefined,publicOnly})
      send(res,200,{contents},cors);return
    }
    if(req.method==='POST'&&path==='/api/editorial/contents'){
      requireAdmin(req);const content=await editorialService.createContent(await readJson(req));send(res,201,{content},cors);return
    }
    const contentMatch=path.match(/^\/api\/editorial\/contents\/([^/]+)$/)
    if(contentMatch){
      const id=decode(contentMatch[1])
      if(req.method==='GET'){requireAdmin(req);const content=await editorialService.getContent(id);if(!content)throw new HttpError(404,'Conteúdo não encontrado.','CONTENT_NOT_FOUND');send(res,200,{content},cors);return}
      if(req.method==='PUT'||req.method==='PATCH'){requireAdmin(req);const content=await editorialService.updateContent(id,await readJson(req));send(res,200,{content},cors);return}
      if(req.method==='DELETE'){requireAdmin(req);await editorialService.deleteContent(id);send(res,200,{deleted:true,id},cors);return}
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
