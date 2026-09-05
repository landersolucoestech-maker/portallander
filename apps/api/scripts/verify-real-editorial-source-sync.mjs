import assert from 'node:assert/strict'
import {contentIngestionService} from '../src/contentIngestionService.js'
import {closePool,getPool} from '../src/db.js'

const pool=getPool()
try{
  const sources=await contentIngestionService.listSources()
  const source=sources.find(item=>item.sourceKey==='music-business-worldwide')
  assert.ok(source,'Music Business Worldwide must exist in the production source catalog')
  assert.equal(source.provider,'rss')
  assert.equal(source.enabled,true,'real-source proof requires the verified MBW feed enabled')
  assert.ok(source.feedUrl.startsWith('https://www.musicbusinessworldwide.com/'))

  const first=await contentIngestionService.syncSource(source.id)
  assert.equal(first.status,'succeeded')
  assert.ok(first.received>0,'real RSS sync must receive at least one item')

  const candidates=await contentIngestionService.listCandidates({provider:'rss',limit:200})
  const created=candidates.filter(candidate=>candidate.sourceId===source.id)
  assert.ok(created.length>0,'real RSS sync must create at least one reviewable candidate')
  assert.ok(created.every(candidate=>/^https?:\/\//i.test(candidate.canonicalUrl)))
  assert.ok(created.every(candidate=>candidate.status==='new'))
  const sample=created[0]
  const beforeCount=Number((await pool.query('select count(*)::int as count from content_import_candidates where source_id=$1 and normalized_url=$2',[source.id,sample.normalizedUrl])).rows[0]?.count||0)
  assert.equal(beforeCount,1,'sample URL must exist exactly once after first live sync')

  const second=await contentIngestionService.syncSource(source.id)
  assert.equal(second.status,'succeeded')
  assert.ok(second.received>0,'second real RSS sync must still receive the live feed')
  assert.ok(second.duplicates>0,'second real RSS sync must recognize already-ingested feed items')
  const afterCount=Number((await pool.query('select count(*)::int as count from content_import_candidates where source_id=$1 and normalized_url=$2',[source.id,sample.normalizedUrl])).rows[0]?.count||0)
  assert.equal(afterCount,1,'dedup must not create a second candidate for the same normalized URL')

  console.log(JSON.stringify({
    REAL_SOURCE_SYNC:'PASS',source:source.name,provider:source.provider,
    first:{runId:first.id,received:first.received,created:first.created,duplicates:first.duplicates,ignored:first.ignored,errors:first.errors},
    second:{runId:second.id,received:second.received,created:second.created,duplicates:second.duplicates,ignored:second.ignored,errors:second.errors},
    candidate:{title:sample.title,url:sample.canonicalUrl,publishedAt:sample.publishedAt,category:sample.suggestedCategory,status:sample.status,relevance:sample.relevanceScore},
    dedup:{normalizedUrl:sample.normalizedUrl,countBefore:beforeCount,countAfter:afterCount},
  }))
} finally {await closePool()}
