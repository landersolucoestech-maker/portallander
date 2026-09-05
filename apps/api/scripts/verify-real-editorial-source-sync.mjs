import assert from 'node:assert/strict'
import {contentIngestionService} from '../src/contentIngestionService.js'

const sources=await contentIngestionService.listSources()
const source=sources.find(item=>item.sourceKey==='music-business-worldwide')
assert.ok(source,'Music Business Worldwide must exist in the production source catalog')
assert.equal(source.provider,'rss')
assert.equal(source.enabled,true,'real-source proof requires the verified MBW feed enabled')
assert.ok(source.feedUrl.startsWith('https://www.musicbusinessworldwide.com/'))

const run=await contentIngestionService.syncSource(source.id)
assert.equal(run.status,'succeeded')
assert.ok(run.received>0,'real RSS sync must receive at least one item')

const candidates=await contentIngestionService.listCandidates({provider:'rss',limit:100})
const created=candidates.filter(candidate=>candidate.sourceId===source.id)
assert.ok(created.length>0,'real RSS sync must create at least one reviewable candidate')
assert.ok(created.every(candidate=>candidate.canonicalUrl.startsWith('http')))
assert.ok(created.every(candidate=>candidate.status==='new'))

console.log(JSON.stringify({REAL_SOURCE_SYNC:'PASS',source:source.name,provider:source.provider,runId:run.id,received:run.received,created:run.created,duplicates:run.duplicates,ignored:run.ignored,errors:run.errors,candidates:created.length,sample:{title:created[0].title,url:created[0].canonicalUrl,category:created[0].suggestedCategory,relevance:created[0].relevanceScore}}))
