import test from 'node:test'
import assert from 'node:assert/strict'
import {buildInstagramPublicationPayload,createInstagramImageContainer,getInstagramPublishedMedia,publishInstagramMediaContainer,suggestInstagramHashtags,waitInstagramMediaContainer} from './instagramMarketingProvider.js'

const env={INSTAGRAM_ACCESS_TOKEN:'test-token',INSTAGRAM_USER_ID:'17841400000000000',META_GRAPH_API_VERSION:'v24.0'}
const jsonResponse=(payload,status=200)=>({ok:status>=200&&status<300,status,json:async()=>payload})

test('buildInstagramPublicationPayload keeps copy and hashtags separate until provider boundary',()=>{
  const result=buildInstagramPublicationPayload({copy:'Legenda da notícia',hashtags:['#Funk','#Rio']})
  assert.equal(result.caption,'Legenda da notícia\n\n#funk #rio')
  assert.deepEqual(result.hashtags,['#funk','#rio'])
})

test('buildInstagramPublicationPayload rejects duplicate hashtags and provider caption overflow',()=>{
  assert.throws(()=>buildInstagramPublicationPayload({copy:'Legenda',hashtags:['#funk','#FUNK']}),error=>error?.code==='INSTAGRAM_HASHTAGS_INVALID')
  assert.throws(()=>buildInstagramPublicationPayload({copy:'x'.repeat(2199),hashtags:['#abc']}),error=>error?.code==='INSTAGRAM_CAPTION_TOO_LONG')
})

test('suggestInstagramHashtags exposes Meta lookup as exact-match capability',async()=>{
  let requested=''
  const fetchImpl=async url=>{requested=String(url);return jsonResponse({data:[{id:'hashtag-1'}]})}
  const result=await suggestInstagramHashtags('#Funk',{env,fetchImpl})
  assert.equal(result.available,true)
  assert.equal(result.capability,'exact_lookup')
  assert.equal(result.matched,true)
  assert.deepEqual(result.suggestions,[{tag:'#funk',source:'instagram',externalId:'hashtag-1'}])
  assert.match(requested,/ig_hashtag_search\?user_id=/)
  assert.match(requested,/q=funk/)
})

test('Instagram image publishing uses container, processing status and media_publish without mixing domain fields',async()=>{
  const calls=[]
  const fetchImpl=async(url,init={})=>{
    calls.push({url:String(url),method:init.method||'GET',body:String(init.body||'')})
    if(String(url).endsWith('/17841400000000000/media'))return jsonResponse({id:'creation-1'})
    if(String(url).includes('/creation-1?fields='))return jsonResponse({status_code:'FINISHED'})
    if(String(url).endsWith('/17841400000000000/media_publish'))return jsonResponse({id:'media-1'})
    if(String(url).includes('/media-1?fields='))return jsonResponse({id:'media-1',permalink:'https://www.instagram.com/p/example/',timestamp:'2026-09-14T20:00:00+0000',media_type:'IMAGE'})
    return jsonResponse({error:{message:'unexpected'}},400)
  }
  const created=await createInstagramImageContainer({imageUrl:'https://cdn.example.com/news.png',caption:'Legenda\n\n#funk'},{env,fetchImpl})
  await waitInstagramMediaContainer(created.creationId,{env,fetchImpl,sleepImpl:async()=>{}})
  const published=await publishInstagramMediaContainer(created.creationId,{env,fetchImpl})
  const media=await getInstagramPublishedMedia(published.mediaId,{env,fetchImpl})
  assert.equal(created.creationId,'creation-1')
  assert.equal(published.mediaId,'media-1')
  assert.equal(media.permalink,'https://www.instagram.com/p/example/')
  assert.equal(calls.filter(call=>call.url.endsWith('/17841400000000000/media')).length,1)
  assert.equal(calls.filter(call=>call.url.endsWith('/17841400000000000/media_publish')).length,1)
  assert.match(calls[0].body,/image_url=https%3A%2F%2Fcdn.example.com%2Fnews.png/)
  assert.match(calls.at(-2).body,/creation_id=creation-1/)
})

test('Instagram provider refuses publishing when backend credentials are absent',async()=>{
  await assert.rejects(()=>createInstagramImageContainer({imageUrl:'https://cdn.example.com/news.png',caption:'Legenda'},{env:{},fetchImpl:async()=>jsonResponse({})}),error=>error?.code==='INSTAGRAM_NOT_CONFIGURED')
})
