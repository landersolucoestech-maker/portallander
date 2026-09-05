import {hashPassword} from '../src/authService.js'
import {closePool,getPool} from '../src/db.js'
import {normalizeExternalUrl,normalizeTitle,stableHash,titleHash} from '../src/contentIngestionCore.js'

const pool=getPool(),email='e2e-content-ingestion@example.com',password='E2EContent!123',title='E2E Editorial Candidate',sourceKey='e2e-content-ingestion',url='https://example.com/e2e-content-ingestion/story'
try{
  await pool.query('delete from admin_sessions where user_id=$1',['e2e_content_ingestion_owner'])
  await pool.query('delete from admin_users where id=$1',['e2e_content_ingestion_owner'])
  await pool.query('delete from editorial_contents where title=$1',[title])
  await pool.query('delete from content_import_candidates where title=$1',[title])
  const source=(await pool.query(`insert into integration_sources(source_key,provider,name,source_type,category,country,language,url,feed_url,enabled,last_status) values($1,'rss','E2E RSS Source','news','Mercado Musical','BR','pt-BR','https://example.com/','https://example.com/feed.xml',false,'disabled') on conflict(source_key) do update set updated_at=now() returning id`,[sourceKey])).rows[0]
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)', ['e2e_content_ingestion_owner',email,await hashPassword(password),'E2E Content Owner','owner'])
  const normalizedUrl=normalizeExternalUrl(url)
  await pool.query(`insert into content_import_candidates(provider,source_id,source_name,external_id,canonical_url,normalized_url,title,normalized_title,title_hash,description,published_at,language,country,source_type,suggested_category,suggested_tags,relevance_score,relevance_reasons,duplicate_key,provenance,raw_metadata,status) values('rss',$1,'E2E RSS Source','e2e-guid',$2,$3,$4,$5,$6,'Referência externa para validar curadoria sem autopublicação.',now(),'pt-BR','BR','news','Mercado Musical',array['mercado musical'],75,array['e2e-proof'],$7,'[]'::jsonb,'{"fixture":true}'::jsonb,'new')`,[source.id,url,normalizedUrl,title,normalizeTitle(title),titleHash(title),stableHash(normalizedUrl)])
  const page=(await pool.query("select id,title from editorial_pages where page_type='editorial' order by created_at asc limit 1")).rows[0]
  if(!page)throw new Error('Nenhuma página editorial disponível para o E2E.')
  console.log(JSON.stringify({email,password,title,pageId:page.id,pageTitle:page.title}))
} finally {await closePool()}
