import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {chatService} from '../src/chatService.js'
import {handleChatRequest} from '../src/chatHttp.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool(),marker=`chat-runtime-${randomUUID()}`
function responseCapture(){let status=0,body='';return{response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function chatHttp(token,path='/api/chat/state'){const capture=responseCapture();await handleChatRequest({method:'GET',url:path,headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response);return capture.result()}
async function cleanup(){
 await pool.query("delete from chat_admin_state where id='primary'")
 await pool.query('delete from admin_sessions where user_id in (select id from admin_users where email like $1)',[`${marker}-%`])
 await pool.query('delete from admin_users where email like $1',[`${marker}-%`])
}

try{
 await cleanup()
 delete process.env.WHATSAPP_ACCESS_TOKEN
 delete process.env.WHATSAPP_PHONE_NUMBER_ID
 delete process.env.WHATSAPP_GRAPH_API_VERSION
 const ownerId=`admin_${randomUUID()}`,adminId=`admin_${randomUUID()}`,editorId=`admin_${randomUUID()}`,password='ChatRuntime!123'
 const ownerEmail=`${marker}-owner@example.com`,adminEmail=`${marker}-admin@example.com`,editorEmail=`${marker}-editor@example.com`
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(password),'Chat Owner','owner'])
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[adminId,adminEmail,await hashPassword(password),'Chat Admin','admin'])
 await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[editorId,editorEmail,await hashPassword(password),'Chat Editor','editor'])
 const ownerSession=await authService.login({email:ownerEmail,password}),editorSession=await authService.login({email:editorEmail,password})

 const created=await chatService.createSupport({customer:'Runtime Cliente',phone:'5511999999999'},ownerId)
 assert.ok(created.conversation.id)
 assert.equal(created.conversation.assignee,'Chat Owner')
 let state=await chatService.sendSupport(created.conversation.id,{body:marker},ownerId)
 let message=state.supportMessages.find(item=>item.body===marker)
 assert.equal(message?.author,'Chat Owner')
 assert.equal(message?.deliveryStatus,'unavailable')
 assert.equal(state.runtime?.whatsapp?.configured,false)
 assert.equal(state.runtime?.audioRecording?.configured,false)
 assert.equal(state.runtime?.escalation?.configured,false)
 assert.equal(state.runtime?.attachments?.configured,false)

 state=await chatService.addTag(created.conversation.id,'Runtime',ownerId)
 assert.ok(state.supportConversations.find(item=>item.id===created.conversation.id)?.tags.includes('Runtime'))
 state=await chatService.transfer(created.conversation.id,'Chat Admin',ownerId)
 assert.equal(state.supportConversations.find(item=>item.id===created.conversation.id)?.assignee,'Chat Admin')
 state=await chatService.setStatus(created.conversation.id,'em_atendimento',ownerId)
 assert.equal(state.supportConversations.find(item=>item.id===created.conversation.id)?.status,'em_atendimento')
 state=await chatService.markCrm(created.conversation.id,{existingCustomer:true,lead:'Runtime Lead'},ownerId)
 assert.equal(state.supportConversations.find(item=>item.id===created.conversation.id)?.crmSummary.lead,'Runtime Lead')

 state=await chatService.createInternal([adminId],ownerId)
 const internal=state.internalConversations[0]
 assert.ok(internal?.participants.some(item=>item.authUserId===ownerId))
 assert.ok(internal?.participants.some(item=>item.authUserId===adminId))
 state=await chatService.sendInternal(internal.id,'Runtime internal message',ownerId)
 assert.ok(state.internalMessages.some(item=>item.conversationId===internal.id&&item.body==='Runtime internal message'&&item.senderAuthUserId===ownerId))

 state=await chatService.saveAutomation({...state.automation,enabled:true,welcomeMessage:'Runtime draft'},ownerId)
 assert.equal(state.automation.enabled,false)
 assert.equal(state.automation.welcomeMessage,'Runtime draft')

 const row=await pool.query("select created_by,updated_by,version from chat_admin_state where id='primary'")
 assert.equal(row.rows[0]?.created_by,ownerId)
 assert.equal(row.rows[0]?.updated_by,ownerId)
 assert.ok(Number(row.rows[0]?.version)>1)

 const ownerResponse=await chatHttp(ownerSession.token)
 assert.equal(ownerResponse.status,200)
 assert.equal(ownerResponse.body?.state?.supportConversations?.length,1)
 const editorResponse=await chatHttp(editorSession.token)
 assert.equal(editorResponse.status,403)
 assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')

 await assert.rejects(()=>chatService.sendSupport(created.conversation.id,{body:'attachment',attachments:[{id:'x',name:'fake.webm',type:'audio/webm',size:64000}]},ownerId),error=>error?.code==='CHAT_ATTACHMENTS_UNAVAILABLE')

 console.log('CHAT_AUTHENTICATED_SOURCE=POSTGRESQL')
 console.log('CHAT_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
 console.log('CHAT_SUPPORT_PERSISTENCE=PASS_RUNTIME')
 console.log('CHAT_INTERNAL_PERSISTENCE=PASS_RUNTIME')
 console.log('CHAT_SERVER_AUTHORSHIP=PASS_RUNTIME')
 console.log('CHAT_WHATSAPP_UNAVAILABLE_STATE=PASS_RUNTIME')
 console.log('CHAT_AUDIO_FAKE_BLOCKED=PASS_RUNTIME')
 console.log('CHAT_ATTACHMENTS_FAKE_BLOCKED=PASS_RUNTIME')
 console.log('CHAT_ESCALATION_RUNTIME_GUARD=PASS_RUNTIME')
 console.log('CHAT_AUTOMATION_DRAFT_PERSISTENCE=PASS_RUNTIME')
 console.log('CHAT_RBAC_OWNER=PASS_RUNTIME')
 console.log('CHAT_RBAC_EDITOR_DENIED=PASS_RUNTIME')
} finally {
 await cleanup().catch(()=>undefined)
 await closePool()
}
