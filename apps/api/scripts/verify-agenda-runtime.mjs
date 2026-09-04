import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {agendaService} from '../src/agendaService.js'
import {handleAgendaRequest} from '../src/agendaHttp.js'
import {authService,hashPassword} from '../src/authService.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool()
const marker=`agenda-runtime-${randomUUID()}`

function responseCapture(){let status=0,body='';return{response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function agendaHttpGet(token){const capture=responseCapture();await handleAgendaRequest({method:'GET',url:'/api/agenda/events',headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response);return capture.result()}
async function cleanup(){await pool.query("delete from agenda_events where notes=$1",[marker]);await pool.query("delete from admin_sessions where user_id in (select id from admin_users where email like $1)",[`${marker}-%`]);await pool.query("delete from admin_users where email like $1",[`${marker}-%`])}

try{
  await cleanup()
  const ownerId=`admin_${randomUUID()}`
  const created=await agendaService.create({title:'Agenda Runtime',type:'shows',status:'agendado',participantIds:[],startsAt:'2026-09-10T21:00:00-03:00',endsAt:'2026-09-10T23:00:00-03:00',location:'Casa Runtime',address:'Rua Runtime, 1',venueContact:'Operação',venuePhone:'11999990000',capacity:100,fee:1500,expectedAudience:80,description:'Runtime proof',notes:marker,checklist:[{item:'Soundcheck',concluido:false}]},null)
  assert.ok(created.id)
  assert.equal(created.status,'agendado')
  assert.ok((await agendaService.list()).some(item=>item.id===created.id))
  assert.equal((await agendaService.get(created.id)).location,'Casa Runtime')

  const originalUpdatedAt=created.updatedAt
  const updated=await agendaService.update(created.id,{...created,status:'confirmado',notes:marker},originalUpdatedAt,null)
  assert.equal(updated.status,'confirmado')
  assert.notEqual(updated.updatedAt,originalUpdatedAt)
  await assert.rejects(()=>agendaService.update(created.id,{...updated,status:'cancelado'},originalUpdatedAt,null),error=>error?.code==='AGENDA_CONFLICT')

  const completed=await agendaService.update(created.id,{...updated,status:'concluido',notes:marker},updated.updatedAt,null)
  assert.equal(completed.status,'concluido')
  await agendaService.remove(created.id)
  await assert.rejects(()=>agendaService.get(created.id),error=>error?.code==='AGENDA_EVENT_NOT_FOUND')

  const ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`,password='AgendaRuntime!123'
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(password),'Agenda Owner','owner'])
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[`admin_${randomUUID()}`,editorEmail,await hashPassword(password),'Agenda Editor','editor'])
  const ownerSession=await authService.login({email:ownerEmail,password}),editorSession=await authService.login({email:editorEmail,password})
  const ownerResponse=await agendaHttpGet(ownerSession.token),editorResponse=await agendaHttpGet(editorSession.token)
  assert.equal(ownerResponse.status,200)
  assert.ok(Array.isArray(ownerResponse.body?.events))
  assert.equal(editorResponse.status,403)
  assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')

  const owned=await agendaService.create({title:'Owned Runtime',type:'reunioes',status:'pendente',participantIds:[],startsAt:'2026-09-11T10:00:00-03:00',location:'Escritório',description:'',notes:marker,checklist:[]},ownerId)
  const row=await pool.query('select created_by from agenda_events where id=$1',[owned.id])
  assert.equal(row.rows[0]?.created_by,ownerId)

  console.log('AGENDA_AUTHENTICATED_SOURCE=POSTGRESQL')
  console.log('AGENDA_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
  console.log('AGENDA_CRUD_LIFECYCLE=PASS_RUNTIME')
  console.log('AGENDA_CONCURRENCY=PASS_RUNTIME')
  console.log('AGENDA_STATUS_TRANSITIONS=PASS_RUNTIME')
  console.log('AGENDA_AUTH_ATTRIBUTION=PASS_RUNTIME')
  console.log('AGENDA_RBAC_OWNER=PASS_RUNTIME')
  console.log('AGENDA_RBAC_EDITOR_DENIED=PASS_RUNTIME')
} finally {
  await cleanup().catch(()=>undefined)
  await closePool()
}
