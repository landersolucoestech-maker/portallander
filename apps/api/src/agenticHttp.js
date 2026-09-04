import {agentRunService} from './agentRunService.js'
import {describeAgenticPermissions} from './agentPolicyService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'
import {portalSkillRegistry} from './skillRegistry.js'

const MAX_JSON_BYTES=64*1024
const send=(res,status,value,headers={})=>{const body=JSON.stringify(value);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(body)}
function corsHeaders(req){const origin=String(req.headers.origin||'').trim();if(!origin)return {};const configured=(process.env.PORTAL_ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);const allowed=configured.includes(origin)||(configured.length===0&&process.env.NODE_ENV!=='production');if(!allowed)return {};return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Request-Id,Idempotency-Key'}}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload agentic excede o limite.','AGENTIC_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON agentic inválido.','AGENTIC_INVALID_JSON')}}

export async function handleAgenticRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`),path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/agentic'))return false
  const cors=corsHeaders(req)
  if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return true}
  try{
    const actor=await requireAdmin(req)
    if(req.method==='GET'&&path==='/api/agentic/skills'){
      send(res,200,{skills:portalSkillRegistry.list(),permissions:describeAgenticPermissions(),mutationSkillsEnabled:false},cors);return true
    }
    if(req.method==='POST'&&path==='/api/agentic/runs'){
      const body=await readJson(req)
      const idempotencyKey=String(req.headers['idempotency-key']||body.idempotencyKey||'').trim()
      const result=await agentRunService.executeSkillRun({actor,skillId:body.skillId,skillVersion:body.skillVersion,input:body.input,objective:body.objective,idempotencyKey})
      send(res,result.replayed?200:201,result,cors);return true
    }
    const runMatch=path.match(/^\/api\/agentic\/runs\/([^/]+)$/)
    if(req.method==='GET'&&runMatch){send(res,200,await agentRunService.get(decodeURIComponent(runMatch[1])),cors);return true}
    throw new HttpError(404,'Rota agentic não encontrada.','AGENTIC_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500,code=error instanceof HttpError?error.code:'AGENTIC_INTERNAL_ERROR',message=error instanceof HttpError?error.message:'Erro interno do runtime agentic.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})},cors);return true
  }
}
