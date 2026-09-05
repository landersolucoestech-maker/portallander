import assert from 'node:assert/strict'
import {hashPassword} from '../src/authService.js'
import {closePool,getPool} from '../src/db.js'

const apiBase=String(process.env.E2E_API_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'')
const legacyToken=String(process.env.PORTAL_ADMIN_TOKEN||'')
const pool=getPool()
const password='MarketingMetrics!123'
const users=[
  {id:'e2e_metrics_owner',email:'e2e-metrics-owner@example.com',role:'owner'},
  {id:'e2e_metrics_admin',email:'e2e-metrics-admin@example.com',role:'admin'},
  {id:'e2e_metrics_editor',email:'e2e-metrics-editor@example.com',role:'editor'},
]
const contentId='e2e_marketing_metrics_content'
const submissionId='00000000-0000-4000-8000-000000000991'

function isoDate(date){return date.toISOString().slice(0,10)}
function shiftDate(date,days){const next=new Date(date);next.setUTCDate(next.getUTCDate()+days);return next}
async function json(response){return response.json().catch(()=>({}))}
async function login(email){
  const response=await fetch(`${apiBase}/api/auth/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})})
  const body=await json(response)
  assert.equal(response.status,200,`login failed for ${email}: ${JSON.stringify(body)}`)
  const setCookie=response.headers.get('set-cookie')||''
  const cookie=setCookie.split(';')[0]
  assert.ok(cookie.includes('='),'session cookie missing')
  return cookie
}
async function metrics(cookie,query='range=30d',headers={}){
  const response=await fetch(`${apiBase}/api/marketing/metrics?${query}`,{headers:{accept:'application/json',...(cookie?{cookie}:{}),...headers}})
  return {response,body:await json(response)}
}

try{
  const passwordHash=await hashPassword(password)
  for(const user of users){
    await pool.query('delete from admin_sessions where user_id=$1',[user.id])
    await pool.query('delete from admin_users where id=$1',[user.id])
    await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[user.id,user.email,passwordHash,`E2E ${user.role}`,user.role])
  }

  const page=(await pool.query("select id from editorial_pages where page_type='editorial' order by created_at asc limit 1")).rows[0]
  assert.ok(page?.id,'an editorial page is required for the metrics runtime proof')
  await pool.query('delete from editorial_contents where id=$1',[contentId])
  await pool.query(`insert into editorial_contents(id,page_id,title,slug,summary,body,author,status,active,tags,media,seo,published_at)
    values($1,$2,'E2E Marketing Metrics Published','e2e-marketing-metrics-published','Persisted editorial metric proof.','[]'::jsonb,'E2E','published',true,'{}'::text[],'[]'::jsonb,'{}'::jsonb,now())`,[contentId,page.id])

  const form=(await pool.query(`select f.id as form_id,v.id as version_id from site_forms f join site_form_versions v on v.form_id=f.id where v.published_at is not null order by v.version desc limit 1`)).rows[0]
  assert.ok(form?.form_id&&form?.version_id,'a published site form is required for the conversion metrics proof')
  await pool.query('delete from form_submissions where id=$1',[submissionId])
  await pool.query(`insert into form_submissions(id,form_id,form_version_id,payload,source,processing_status,routing_results,request_id,spam_score,ip_hash,user_agent,processed_at)
    values($1,$2,$3,'{}'::jsonb,'{"proof":"marketing-metrics-runtime"}'::jsonb,'accepted','{}'::jsonb,'e2e-marketing-metrics',0,null,'runtime-proof',now())`,[submissionId,form.form_id,form.version_id])

  const ownerCookie=await login(users[0].email)
  const adminCookie=await login(users[1].email)
  const editorCookie=await login(users[2].email)

  for(const [label,cookie] of [['owner',ownerCookie],['admin',adminCookie]]){
    const {response,body}=await metrics(cookie)
    assert.equal(response.status,200,`${label} should access marketing metrics`)
    assert.equal(body.ga4?.status,'unavailable')
    assert.equal(body.ga4?.reason,'GA4_NOT_CONFIGURED')
    assert.ok(body.editorial?.counts?.published>=1,'persisted editorial metrics must remain available without GA4')
    assert.ok(body.conversions?.total>=1,'persisted conversion metrics must remain available without GA4')
  }

  const editor=await metrics(editorCookie)
  assert.equal(editor.response.status,403)
  assert.equal(editor.body.code,'ADMIN_FORBIDDEN')

  const anonymous=await metrics('')
  assert.equal(anonymous.response.status,401)
  assert.equal(anonymous.body.code,'ADMIN_UNAUTHORIZED')

  assert.ok(legacyToken,'PORTAL_ADMIN_TOKEN must be set in the runtime proof')
  const legacy=await metrics('','range=30d',{authorization:`Bearer ${legacyToken}`})
  assert.equal(legacy.response.status,403)
  assert.equal(legacy.body.code,'ATTRIBUTABLE_ADMIN_SESSION_REQUIRED')

  const now=new Date(),customEnd=isoDate(now),customStart=isoDate(shiftDate(now,-6))
  for(const query of ['range=today','range=7d','range=30d','range=90d',`range=custom&startDate=${customStart}&endDate=${customEnd}`]){
    const result=await metrics(ownerCookie,query)
    assert.equal(result.response.status,200,`valid range failed: ${query} ${JSON.stringify(result.body)}`)
  }
  for(const query of ['range=invalid','range=custom','range=custom&startDate=2026-09-01','range=custom&endDate=2026-09-05','range=custom&startDate=2026-09-05&endDate=2026-09-01']){
    const result=await metrics(ownerCookie,query)
    assert.equal(result.response.status,400,`invalid range was accepted: ${query}`)
  }

  const requestId='e2e-marketing-request-id'
  const preflight=await fetch(`${apiBase}/api/marketing/metrics`,{method:'OPTIONS',headers:{origin:'http://127.0.0.1:4173','access-control-request-method':'GET','x-request-id':requestId}})
  assert.equal(preflight.status,204)
  assert.equal(preflight.headers.get('access-control-allow-origin'),'http://127.0.0.1:4173')
  assert.equal(preflight.headers.get('access-control-allow-credentials'),'true')
  assert.equal(preflight.headers.get('x-request-id'),requestId)

  const allowed=await fetch(`${apiBase}/health`,{headers:{origin:'http://127.0.0.1:4173','x-request-id':requestId}})
  assert.equal(allowed.status,200)
  assert.equal(allowed.headers.get('access-control-allow-origin'),'http://127.0.0.1:4173')
  assert.equal(allowed.headers.get('access-control-allow-credentials'),'true')
  assert.equal(allowed.headers.get('x-request-id'),requestId)

  const denied=await fetch(`${apiBase}/health`,{headers:{origin:'https://disallowed.example'}})
  assert.equal(denied.status,200)
  assert.equal(denied.headers.get('access-control-allow-origin'),null)
  assert.equal(denied.headers.get('access-control-allow-credentials'),null)

  console.log(JSON.stringify({MARKETING_METRICS_RUNTIME:'PASS',RBAC:{owner:200,admin:200,editor:403,anonymous:401,legacyToken:403},GA4:'GA4_NOT_CONFIGURED',editorialPersisted:true,conversionPersisted:true,ranges:['today','7d','30d','90d','custom'],cors:{allowed:true,disallowed:true,preflight:true,requestId:true}}))
} finally {
  await closePool()
}
