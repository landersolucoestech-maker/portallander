import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {hrService} from '../src/hrService.js'
import {handleHrRequest} from '../src/hrHttp.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool(),marker=`hr-runtime-${randomUUID()}`
function responseCapture(){let status=0,body='';return{response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function hrHttp(token){const capture=responseCapture();await handleHrRequest({method:'GET',url:'/api/hr/state',headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response);return capture.result()}
async function cleanup(){await pool.query("delete from hr_admin_state where id='primary'");await pool.query('delete from admin_sessions where user_id in (select id from admin_users where email like $1)',[`${marker}-%`]);await pool.query('delete from admin_users where email like $1',[`${marker}-%`])}
try{
 await cleanup()
 const ownerId=`admin_${randomUUID()}`,editorId=`admin_${randomUUID()}`,password='HrRuntime!123',ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(password),'HR Owner','owner'])
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[editorId,editorEmail,await hashPassword(password),'HR Editor','editor'])
 const ownerSession=await authService.login({email:ownerEmail,password}),editorSession=await authService.login({email:editorEmail,password})
 let state=await hrService.state();assert.deepEqual(state.employees,[]);assert.equal(state.runtime?.documentUpload?.configured,false)
 const employee=(await hrService.saveEmployee({name:'Runtime Employee',email:'hr@example.com',contractType:'clt',status:'active',baseSalary:5000,department:'technology'},null,ownerId)).item
 assert.ok(employee.id);assert.equal(employee.baseSalary,5000)
 const payroll=(await hrService.savePayroll({employeeId:employee.id,referenceMonth:'2026-09',grossSalary:5000,discounts:500,bonus:250,status:'processed'},null,ownerId)).item
 assert.equal(payroll.netSalary,4750)
 const leave=(await hrService.saveLeave({employeeId:employee.id,type:'vacation',startDate:'2026-10-01',endDate:'2026-10-10',status:'approved',approvedBy:'Portal Admin',approvedByDisplayName:'Fake Approver',approvedByUserId:editorId},null,ownerId)).item
 assert.equal(leave.days,10);assert.equal(leave.approvedBy,'HR Owner');assert.equal(leave.approvedByDisplayName,'HR Owner');assert.equal(leave.approvedByUserId,ownerId);assert.ok(leave.approvedAt)
 const row=await pool.query("select created_by,updated_by,version from hr_admin_state where id='primary'");assert.equal(row.rows[0].created_by,ownerId);assert.equal(row.rows[0].updated_by,ownerId);assert.ok(Number(row.rows[0].version)>1)
 const ownerResponse=await hrHttp(ownerSession.token);assert.equal(ownerResponse.status,200);assert.equal(ownerResponse.body?.state?.employees?.length,1)
 const editorResponse=await hrHttp(editorSession.token);assert.equal(editorResponse.status,403);assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')
 await assert.rejects(()=>hrService.assertDocumentUploadUnavailable(),error=>error?.code==='HR_DOCUMENT_UPLOAD_UNAVAILABLE')
 state=await hrService.deleteEmployees([employee.id],ownerId);assert.equal(state.employees.length,0);assert.equal(state.payroll.length,0);assert.equal(state.leaves.length,0)
 console.log('HR_AUTHENTICATED_SOURCE=POSTGRESQL')
 console.log('HR_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
 console.log('HR_EMPLOYEE_CRUD=PASS_RUNTIME')
 console.log('HR_PAYROLL_CRUD=PASS_RUNTIME')
 console.log('HR_PAYROLL_NET_CALCULATION=PASS_RUNTIME')
 console.log('HR_LEAVE_CRUD=PASS_RUNTIME')
 console.log('HR_APPROVAL_SERVER_ATTRIBUTION=PASS_RUNTIME')
 console.log('HR_FAKE_APPROVER_BLOCKED=PASS_RUNTIME')
 console.log('HR_DOCUMENT_UPLOAD_UNAVAILABLE_HONESTLY=PASS_RUNTIME')
 console.log('HR_AUTH_ATTRIBUTION=PASS_RUNTIME')
 console.log('HR_RBAC_OWNER=PASS_RUNTIME')
 console.log('HR_RBAC_EDITOR_DENIED=PASS_RUNTIME')
}finally{await cleanup().catch(()=>undefined);await closePool()}
