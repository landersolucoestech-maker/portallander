import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {contentIngestionService} from '../src/contentIngestionService.js'
import {handleContentIngestionRequest} from '../src/contentIngestionHttp.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool(),marker=`ingestion-runtime-${randomUUID()}`,title=`Runtime Editorial Candidate ${marker}`
const ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`,ownerPassword='RuntimeOwner!123',editorPassword='RuntimeEditor!123'

function responseCapture(){let status=0,body='';return {response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function httpGet(token,path,authorization){const capture=responseCapture();await handleContentIngestionRequest({method:'GET',url:path,headers:{host:'localhost',...(token?{cookie:`portal_lander_session=${encodeURIComponent(token)}`}:{}) ,...(authorization?{authorization}: {})},socket:{}},capture.response);return capture.result()}
async function cleanup(){await pool.query('delete from editorial_contents where title like $1',[`%${marker}%`]);await pool.query('delete from content_import_candidates where title like $1',[`%${marker}%`]);await pool.query('delete from integration_sources where source_key like $1',[`${marker}%`]);await pool.query('delete from admin_sessions where user_id in (select id from admin_users where email like $1)',[`${marker}-%`]);await pool.query('delete from admin_users where email like $1',[`${marker}-%`])}

try{
  await cleanup()
  const sourceA=(await pool.query(`insert into integration_sources(source_key,provider,name,source_type,category,country,language,url,feed_url,enabled,last_status) values($1,'rss',$2,'news','Mercado Musical','BR','pt-BR','https://example.com/','https://example.com/feed.xml',false,'disabled') returning id`,[`${marker}-rss`,'Runtime Ingestion RSS'])).rows[0]
  const sourceB=(await pool.query(`insert into integration_sources(source_key,provider,name,source_type,category,country,language,url,enabled,last_status) values($1,'gdelt',$2,'news_discovery','Mercado Musical','BR','en','https://www.gdeltproject.org/',false,'disabled') returning id`,[`${marker}-gdelt`,'Runtime Ingestion GDELT'])).rows[0]
  const publishedAt=new Date().toISOString(),canonical=`https://example.com/${marker}/story?utm_source=rss`
  const [first]=await contentIngestionService.ingestForTest(sourceA.id,[{externalId:'guid-1',title,canonicalUrl:canonical,description:'Spotify, artistas e streaming movimentam o mercado musical brasileiro.',publishedAt}])
  assert.equal(first.created,true)
  const [sameGuid]=await contentIngestionService.ingestForTest(sourceA.id,[{externalId:'guid-1',title,canonicalUrl:`https://example.com/${marker}/other`,description:'duplicate guid',publishedAt}])
  assert.equal(sameGuid.duplicate,true)
  const [sameUrl]=await contentIngestionService.ingestForTest(sourceB.id,[{externalId:'gdelt-1',title:`${title} — cobertura internacional`,canonicalUrl:`https://example.com/${marker}/story`,publishedAt,country:'BR'}])
  assert.equal(sameUrl.duplicate,true)
  assert.ok(sameUrl.candidate.provenance.some(entry=>entry.provider==='rss'))
  assert.ok(sameUrl.candidate.provenance.some(entry=>entry.provider==='gdelt'))
  assert.ok(sameUrl.candidate.relevanceReasons.includes('multi-provider-signal:10'))
  const [sameTitle]=await contentIngestionService.ingestForTest(sourceB.id,[{externalId:'gdelt-title',title,canonicalUrl:`https://another.example/${marker}/same-title`,publishedAt}])
  assert.equal(sameTitle.duplicate,true)
  const distinctTitle=`Festival independente anuncia programação de rap ${marker}`
  const [distinct]=await contentIngestionService.ingestForTest(sourceB.id,[{externalId:'gdelt-distinct',title:distinctTitle,canonicalUrl:`https://example.net/${marker}/festival`,publishedAt}])
  assert.equal(distinct.created,true)
  const count=await pool.query('select count(*)::int as count from content_import_candidates where title like $1',[`%${marker}%`])
  assert.equal(count.rows[0].count,2)

  const ownerId=`admin_${randomUUID()}`,editorId=`admin_${randomUUID()}`
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(ownerPassword),'Runtime Owner','owner'])
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[editorId,editorEmail,await hashPassword(editorPassword),'Runtime Editor','editor'])
  const ownerSession=await authService.login({email:ownerEmail,password:ownerPassword}),editorSession=await authService.login({email:editorEmail,password:editorPassword})
  const ownerActor={user:{id:ownerId,email:ownerEmail,displayName:'Runtime Owner',role:'owner'}},candidateId=first.candidate.id
  const reviewing=await contentIngestionService.setCandidateStatus(candidateId,'reviewing',ownerActor);assert.equal(reviewing.status,'reviewing')
  const approved=await contentIngestionService.setCandidateStatus(candidateId,'approved',ownerActor);assert.equal(approved.status,'approved')
  const page=(await pool.query("select id from editorial_pages where page_type='editorial' order by created_at asc limit 1")).rows[0];assert.ok(page?.id)
  const converted=await contentIngestionService.convertCandidate(candidateId,{pageId:page.id},ownerActor)
  assert.equal(converted.candidate.status,'converted');assert.equal(converted.content.status,'draft');assert.equal(converted.content.active,false);assert.equal(converted.content.publishedAt,undefined)
  const draft=await pool.query('select status,active,published_at,seo from editorial_contents where id=$1',[converted.content.id]);assert.equal(draft.rows[0].status,'draft');assert.equal(draft.rows[0].active,false);assert.equal(draft.rows[0].published_at,null);assert.equal(draft.rows[0].seo?.sourceReference?.candidateId,candidateId)

  const ownerResponse=await httpGet(ownerSession.token,'/api/editorial/import-candidates?limit=5');assert.equal(ownerResponse.status,200);assert.ok(Array.isArray(ownerResponse.body?.candidates))
  const editorResponse=await httpGet(editorSession.token,'/api/editorial/import-candidates?limit=5');assert.equal(editorResponse.status,403);assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')
  const previousLegacy=process.env.PORTAL_ADMIN_TOKEN;process.env.PORTAL_ADMIN_TOKEN='runtime-legacy-token-secret'
  const legacyResponse=await httpGet(null,'/api/editorial/import-candidates?limit=5','Bearer runtime-legacy-token-secret');assert.equal(legacyResponse.status,403);assert.equal(legacyResponse.body?.code,'ATTRIBUTABLE_ADMIN_SESSION_REQUIRED')
  if(previousLegacy===undefined)delete process.env.PORTAL_ADMIN_TOKEN;else process.env.PORTAL_ADMIN_TOKEN=previousLegacy

  console.log('EDITORIAL_INGESTION_POSTGRESQL=PASS_RUNTIME')
  console.log('EDITORIAL_DEDUP_GUID=PASS_RUNTIME')
  console.log('EDITORIAL_DEDUP_URL=PASS_RUNTIME')
  console.log('EDITORIAL_DEDUP_TITLE=PASS_RUNTIME')
  console.log('EDITORIAL_DEDUP_CROSS_PROVIDER=PASS_RUNTIME')
  console.log('EDITORIAL_DISTINCT_STORY_PRESERVED=PASS_RUNTIME')
  console.log('EDITORIAL_CURATION=PASS_RUNTIME')
  console.log('EDITORIAL_CONVERSION_DRAFT_ONLY=PASS_RUNTIME')
  console.log('EDITORIAL_RBAC_OWNER=PASS_RUNTIME')
  console.log('EDITORIAL_RBAC_EDITOR_DENIED=PASS_RUNTIME')
  console.log('EDITORIAL_LEGACY_TOKEN_DENIED=PASS_RUNTIME')
} finally {await cleanup().catch(()=>undefined);await closePool()}
