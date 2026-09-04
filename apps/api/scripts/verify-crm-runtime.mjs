import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {crmService} from '../src/crmService.js'
import {closePool,getPool} from '../src/db.js'
import {formService} from '../src/formService.js'
import {handleCrmRequest} from '../src/crmHttp.js'

const pool=getPool()
const marker=`runtime-${randomUUID()}`
const email=`${marker}@example.com`

function responseCapture(){
  let status=0,body=''
  return {
    response:{writeHead(value){status=value},end(value=''){body+=String(value)}},
    result:()=>({status,body:body?JSON.parse(body):null}),
  }
}

async function crmHttpGet(token){
  const capture=responseCapture()
  await handleCrmRequest({method:'GET',url:'/api/crm/leads',headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response)
  return capture.result()
}

async function cleanup(){
  await pool.query("delete from crm_contacts where tags @> array[$1]::text[]",[marker])
  await pool.query("delete from crm_leads where tags @> array[$1]::text[]",[marker])
  await pool.query("delete from form_submissions where request_id like $1",[`crm-runtime-${marker}%`])
  await pool.query("delete from admin_sessions where user_id in (select id from admin_users where email like $1)",[`${marker}-%`])
  await pool.query("delete from admin_users where email like $1",[`${marker}-%`])
}

try{
  await cleanup()

  const created=await crmService.createLead({
    name:'CRM Runtime Lead',email,company:'Portal Runtime',type:'anunciante',service:'banner_publicitario',origin:'site',status:'novo',priority:'alta',temperature:'quente',tags:[marker],attachments:[{id:'att-runtime',name:'brief.txt',type:'text/plain',size:5,dataUrl:'data:text/plain;base64,aGVsbG8=',createdAt:new Date().toISOString()}],
  })
  assert.ok(created.id)
  assert.equal(created.attachments.length,1)
  assert.ok((await crmService.listLeads()).some(item=>item.id===created.id))

  const originalUpdatedAt=created.updatedAt
  const updated=await crmService.updateLead(created.id,{notes:'updated by runtime proof',status:'qualificado'},originalUpdatedAt)
  assert.equal(updated.status,'qualificado')
  assert.notEqual(updated.updatedAt,originalUpdatedAt)
  await assert.rejects(()=>crmService.updateLead(created.id,{notes:'stale write'},originalUpdatedAt),error=>error?.code==='CRM_CONFLICT')

  const interaction=await crmService.addInteraction(created.id,{type:'email',notes:'runtime interaction',responsible:'Runtime'})
  assert.equal(interaction.type,'email')
  assert.ok((await crmService.listLeads()).find(item=>item.id===created.id)?.interactions.some(item=>item.id===interaction.id))

  const bulkA=await crmService.createLead({name:'Bulk A',email:`bulk-a-${email}`,type:'outro',service:'outro',origin:'site',tags:[marker]})
  const bulkB=await crmService.createLead({name:'Bulk B',email:`bulk-b-${email}`,type:'outro',service:'outro',origin:'site',tags:[marker]})
  await crmService.bulkStatus([bulkA.id,bulkB.id],'proposta')
  const bulkState=await crmService.listLeads()
  assert.equal(bulkState.find(item=>item.id===bulkA.id)?.status,'proposta')
  assert.equal(bulkState.find(item=>item.id===bulkB.id)?.status,'proposta')
  await crmService.bulkDeleteLeads([bulkA.id,bulkB.id])
  assert.ok(!(await crmService.listLeads()).some(item=>item.id===bulkA.id||item.id===bulkB.id))

  const contact=await crmService.createContact({entityType:'pessoa_juridica',category:'anunciante',profile:'Marca',name:'Runtime Contact',company:'Portal Runtime',email:`contact-${email}`,priority:'media',status:'ativo',tags:[marker]})
  assert.ok((await crmService.listContacts()).some(item=>item.id===contact.id))
  const contactUpdated=await crmService.updateContact(contact.id,{notes:'contact updated'},contact.updatedAt)
  assert.equal(contactUpdated.notes,'contact updated')
  const timeline=await crmService.addTimeline(contact.id,{type:'note',description:'runtime timeline'})
  assert.ok((await crmService.listContacts()).find(item=>item.id===contact.id)?.timeline.some(item=>item.id===timeline.id))

  const converted=await crmService.convertLead(created.id)
  assert.equal(converted.sourceLeadId,created.id)
  const convertedLead=(await crmService.listLeads()).find(item=>item.id===created.id)
  assert.equal(convertedLead?.convertedContactId,converted.id)
  const fk=await pool.query('select converted_contact_id from crm_leads where id=$1',[created.id])
  assert.equal(fk.rows[0]?.converted_contact_id,converted.id)

  const requestId=`crm-runtime-${marker}-advertising`
  const startedAt=Date.now()-2_000
  const submission=await formService.submit({
    slug:'anuncie-contato',
    payload:{name:'Advertising Runtime',email:`advertising-${email}`,phone:'11999999999',company:'Runtime Brand',type:'anunciante',service:'banner_publicitario',message:'Runtime advertising proof'},
    source:{page:'/anuncie',campaign:'anuncie'},acceptedConsentIds:['ads-privacy'],files:[],ipHash:`ip-${marker}`,userAgent:'crm-runtime-proof',requestId,antiSpam:{honeypot:'',startedAt},
  })
  assert.equal(submission.processingStatus,'accepted')
  assert.ok(submission.routingResults.crmLeadId)
  const routed=await pool.query('select source_submission_id,origin,tags,campaign from crm_leads where id=$1',[submission.routingResults.crmLeadId])
  assert.equal(String(routed.rows[0]?.source_submission_id),submission.id)
  assert.equal(routed.rows[0]?.origin,'formulario_portal')
  assert.ok(routed.rows[0]?.tags.includes('anuncie'))
  assert.equal(routed.rows[0]?.campaign,'anuncie')
  const consent=await pool.query('select accepted from form_submission_consents where submission_id=$1 and consent_key=$2',[submission.id,'ads-privacy'])
  assert.equal(consent.rows[0]?.accepted,true)
  assert.ok((await crmService.listLeads()).some(item=>item.id===submission.routingResults.crmLeadId&&item.sourceSubmissionId===submission.id))
  await assert.rejects(()=>formService.submit({
    slug:'anuncie-contato',payload:{name:'Advertising Runtime',email:`advertising-${email}`,company:'Runtime Brand',type:'anunciante',service:'banner_publicitario',message:'duplicate'},source:{page:'/anuncie',campaign:'anuncie'},acceptedConsentIds:['ads-privacy'],files:[],ipHash:`ip-duplicate-${marker}`,userAgent:'crm-runtime-proof',requestId,antiSpam:{honeypot:'',startedAt:Date.now()-2_000},
  }),error=>error?.code==='23505')
  const requestRows=await pool.query('select count(*)::int as count from form_submissions where request_id=$1',[requestId])
  assert.equal(requestRows.rows[0]?.count,1)

  const ownerPassword='RuntimeOwner!123'
  const editorPassword='RuntimeEditor!123'
  const ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[`admin_${randomUUID()}`,ownerEmail,await hashPassword(ownerPassword),'Runtime Owner','owner'])
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[`admin_${randomUUID()}`,editorEmail,await hashPassword(editorPassword),'Runtime Editor','editor'])
  const ownerSession=await authService.login({email:ownerEmail,password:ownerPassword})
  const editorSession=await authService.login({email:editorEmail,password:editorPassword})
  const ownerResponse=await crmHttpGet(ownerSession.token)
  const editorResponse=await crmHttpGet(editorSession.token)
  assert.equal(ownerResponse.status,200)
  assert.ok(Array.isArray(ownerResponse.body?.leads))
  assert.equal(editorResponse.status,403)
  assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')

  console.log('CRM_AUTHENTICATED_SOURCE=POSTGRESQL')
  console.log('CRM_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
  console.log('CRM_CRUD_LIFECYCLE=PASS_RUNTIME')
  console.log('CRM_CONCURRENCY=PASS_RUNTIME')
  console.log('CRM_CONVERSION_FK=PASS_RUNTIME')
  console.log('CRM_RBAC_OWNER=PASS_RUNTIME')
  console.log('CRM_RBAC_EDITOR_DENIED=PASS_RUNTIME')
  console.log('ADVERTISING_TO_CRM_RUNTIME=PASS_RUNTIME')
  console.log('ADVERTISING_REQUEST_ID_IDEMPOTENCY=PASS_RUNTIME')
} finally {
  await cleanup().catch(()=>undefined)
  await closePool()
}
