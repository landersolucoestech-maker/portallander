import assert from 'node:assert/strict'
import {fetchGdeltItems,fetchYouTubeItems} from '../src/contentIngestionCore.js'

const gdelt=await fetchGdeltItems({query:'music Brazil',maxRecords:1,timespan:'24h'})
assert.ok(Array.isArray(gdelt))
console.log(JSON.stringify({GDELT_LIVE:'PASS',items:gdelt.length}))

if(!process.env.YOUTUBE_API_KEY){console.log(JSON.stringify({YOUTUBE_LIVE:'EXTERNALLY_BLOCKED_MISSING_SECRET'}));process.exit(0)}
const youtube=await fetchYouTubeItems({query:'música Brasil',regionCode:'BR',relevanceLanguage:'pt',maxResults:1})
assert.ok(Array.isArray(youtube))
console.log(JSON.stringify({YOUTUBE_LIVE:'PASS',items:youtube.length}))
