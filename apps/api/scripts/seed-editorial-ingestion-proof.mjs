import {getPool} from '../src/db.js'
import {editorialService} from '../src/editorialService.js'
import {normalizeExternalUrl,normalizeTitle,titleHash} from '../src/editorialSignals.js'

const pool=getPool()
const title='Prova full-stack — mercado musical brasileiro 2026'
try{
  const pages=await editorialService.listPages()
  const page=pages.find(item=>item.type==='editorial')
  if(!page)throw new Error('Nenhuma página editorial disponível para a prova full-stack.')

  const sourceResult=await pool.query(`
    insert into integration_sources(provider,name,source_type,category,country,language,url,feed_url,enabled,configuration,sync_frequency_minutes,last_status)
    values('rss','Editorial Ingestion Full-Stack Proof','news','Mercado Musical','BR','pt','https://example.com','https://example.com/feed.xml',false,'{}'::jsonb,60,'disabled')
    on conflict(provider,name) do update set updated_at=now()
    returning id`)
  const sourceId=sourceResult.rows[0].id

  const previous=await pool.query('select editorial_content_id from content_import_candidates where title=$1',[title])
  for(const row of previous.rows)if(row.editorial_content_id)await pool.query('delete from editorial_contents where id=$1',[row.editorial_content_id])
  await pool.query('delete from content_import_candidates where title=$1',[title])

  const url='https://example.com/noticias/prova-full-stack-portal-lander'
  const candidate=await pool.query(`
    insert into content_import_candidates(
      source_id,provider,source_name,external_id,canonical_url,normalized_url,title,normalized_title,description,
      author,published_at,language,country,source_type,suggested_category,suggested_tags,relevance_score,duplicate_key,provenance,raw_metadata,status
    ) values(
      $1,'rss','Editorial Ingestion Full-Stack Proof','proof-guid-2026',$2,$3,$4,$5,
      'Candidato de validação criado exclusivamente no PostgreSQL efêmero da CI.','Portal Lander QA',now(),'pt','BR','news',
      'Mercado Musical',array['mercado musical','Brasil'],91,$6,$7::jsonb,'{}'::jsonb,'new'
    ) returning id`,[sourceId,url,normalizeExternalUrl(url),title,normalizeTitle(title),titleHash(title),JSON.stringify([{provider:'rss',sourceId,sourceName:'Editorial Ingestion Full-Stack Proof',externalId:'proof-guid-2026',url,discoveredAt:new Date().toISOString(),metadata:{validation:true}}])])

  console.log(JSON.stringify({EDITORIAL_INGESTION_PROOF_SEEDED:true,candidateId:candidate.rows[0].id,pageId:page.id,pageTitle:page.title,title}))
}finally{
  await pool.end()
}
