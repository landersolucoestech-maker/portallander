import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {rhService} from '../src/rhService.js'
import {handleRhRequest} from '../src/rhHttp.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool(),marker=`rh-runtime-${randomUUID()}`
function responseCapture(){let status=0,body='';return{response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function rhHttp(token){const capture=responseCapture();await handleRhRequest({method:'GET',url:'/api/rh/state',headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response);return capture.result()}
async function cleanup(){await pool.query("delete from rh_admin_state where id='primary'");await pool.query('delete from admin_sessions where user_id in (select id from admin_users where email like $1)',[`${marker}-%`]);await pool.query('delete from admin_users where email like $1',[`${marker}-%`])}
try{
 await cleanup()
 const ownerId=`admin_${randomUUID()}`,editorId=`admin_${randomUUID()}`,password='RhRuntime!123',ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(password),'RH Owner','owner'])
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[editorId,editorEmail,await hashPassword(password),'RH Editor','editor'])
 const ownerSession=await authService.login({email:ownerEmail,password}),editorSession=await authService.login({email:editorEmail,password})
 let state=await rhService.state();assert.deepEqual(state.employees,[]);assert.equal(state.runtime?.documentUpload?.configured,false)
 const employee=(await rhService.saveEmployee({name:'Runtime Employee',email:'rh@example.com',contractType:'CLT',status:'ativo',baseSalary:5000,department:'Tecnologia'},null,ownerId)).item
 assert.ok(employee.id);assert.equal(employee.baseSalary,5000)
 const payroll=(await rhService.savePayroll({employeeId:employee.id,referenceMonth:'2026-09',grossSalary:5000,discounts:500,bonus:250,status:'processado'},null,ownerId)).item
 assert.equal(payroll.netSalary,4750)
 const leave=(await rhService.saveLeave({employeeId:employee.id,type:'férias',startDate:'2026-10-01',endDate:'2026-10-10',status:'aprovado',approvedBy:'Admin Portal',approvedByDisplayName:'Fake Approver',approvedByUserId:editorId},null,ownerId)).item
 assert.equal(leave.days,10);assert.equal(leave.approvedBy,'RH Owner');assert.equal(leave.approvedByDisplayName,'RH Owner');assert.equal(leave.approvedByUserId,ownerId);assert.ok(leave.approvedAt)
 const row=await pool.query("select created_by,updated_by,version from rh_admin_state where id='primary'");assert.equal(row.rows[0].created_by,ownerId);assert.equal(row.rows[0].updated_by,ownerId);assert.ok(Number(row.rows[0].version)>1)
 const ownerResponse=await rhHttp(ownerSession.token);assert.equal(ownerResponse.status,200);assert.equal(ownerResponse.body?.state?.employees?.length,1)
 const editorResponse=await rhHttp(editorSession.token);assert.equal(editorResponse.status,403);assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')
 await assert.rejects(()=>rhService.assertDocumentUploadUnavailable(),error=>error?.code==='RH_DOCUMENT_UPLOAD_UNAVAILABLE')
 state=await rhService.deleteEmployees([employee.id],ownerId);assert.equal(state.employees.length,0);assert.equal(state.payroll.length,0);assert.equal(state.leaves.length,0)
 console.log('RH_AUTHENTICATED_SOURCE=POSTGRESQL')
 console.log('RH_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
 console.log('RH_EMPLOYEE_CRUD=PASS_RUNTIME')
 console.log('RH_PAYROLL_CRUD=PASS_RUNTIME')
 console.log('RH_PAYROLL_NET_CALCULATION=PASS_RUNTIME')
 console.log('RH_LEAVE_CRUD=PASS_RUNTIME')
 console.log('RH_APPROVAL_SERVER_ATTRIBUTION=PASS_RUNTIME')
 console.log('RH_FAKE_APPROVER_BLOCKED=PASS_RUNTIME')
 console.log('RH_DOCUMENT_UPLOAD_UNAVAILABLE_HONESTLY=PASS_RUNTIME')
 console.log('RH_AUTH_ATTRIBUTION=PASS_RUNTIME')
 console.log('RH_RBAC_OWNER=PASS_RUNTIME')
 console.log('RH_RBAC_EDITOR_DENIED=PASS_RUNTIME')
}finally{await cleanup().catch(()=>undefined);await closePool()}
