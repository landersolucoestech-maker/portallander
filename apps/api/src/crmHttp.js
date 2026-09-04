import {crmService} from './crmService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=6*1024*1024
const decode=value=>decodeURIComponent(value)
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload CRM excede o limite permitido.','CRM_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

export async function handleCrmRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/crm'))return false
  try{
    await requireAdmin(req)

    if(path==='/api/crm/leads'&&req.method==='GET'){send(res,200,{leads:await crmService.listLeads()});return true}
    if(path==='/api/crm/leads'&&req.method==='POST'){send(res,201,{lead:await crmService.createLead(await readJson(req))});return true}
    if(path==='/api/crm/leads/bulk-delete'&&req.method==='POST'){const body=await readJson(req);await crmService.bulkDeleteLeads(body.ids);send(res,200,{deleted:true});return true}
    if(path==='/api/crm/leads/bulk-status'&&req.method==='POST'){const body=await readJson(req);await crmService.bulkStatus(body.ids,body.status);send(res,200,{updated:true});return true}
    const interactionMatch=path.match(/^\/api\/crm\/leads\/([^/]+)\/interactions$/)
    if(interactionMatch&&req.method==='POST'){send(res,201,{interaction:await crmService.addInteraction(decode(interactionMatch[1]),await readJson(req))});return true}
    const convertMatch=path.match(/^\/api\/crm\/leads\/([^/]+)\/convert$/)
    if(convertMatch&&req.method==='POST'){send(res,200,{contact:await crmService.convertLead(decode(convertMatch[1]))});return true}
    const leadMatch=path.match(/^\/api\/crm\/leads\/([^/]+)$/)
    if(leadMatch){const id=decode(leadMatch[1]);if(req.method==='PATCH'||req.method==='PUT'){const body=await readJson(req);send(res,200,{lead:await crmService.updateLead(id,body.patch??body,body.expectedUpdatedAt)});return true}if(req.method==='DELETE'){await crmService.deleteLead(id);send(res,200,{deleted:true,id});return true}}

    if(path==='/api/crm/contacts'&&req.method==='GET'){send(res,200,{contacts:await crmService.listContacts()});return true}
    if(path==='/api/crm/contacts'&&req.method==='POST'){send(res,201,{contact:await crmService.createContact(await readJson(req))});return true}
    if(path==='/api/crm/contacts/bulk-delete'&&req.method==='POST'){const body=await readJson(req);await crmService.bulkDeleteContacts(body.ids);send(res,200,{deleted:true});return true}
    const timelineMatch=path.match(/^\/api\/crm\/contacts\/([^/]+)\/timeline$/)
    if(timelineMatch&&req.method==='POST'){send(res,201,{entry:await crmService.addTimeline(decode(timelineMatch[1]),await readJson(req))});return true}
    const contactMatch=path.match(/^\/api\/crm\/contacts\/([^/]+)$/)
    if(contactMatch){const id=decode(contactMatch[1]);if(req.method==='PATCH'||req.method==='PUT'){const body=await readJson(req);send(res,200,{contact:await crmService.updateContact(id,body.patch??body,body.expectedUpdatedAt)});return true}if(req.method==='DELETE'){await crmService.deleteContact(id);send(res,200,{deleted:true,id});return true}}

    throw new HttpError(404,'Rota CRM não encontrada.','CRM_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API CRM.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})})
    return true
  }
}
