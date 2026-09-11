import assert from 'node:assert/strict'
import test from 'node:test'
import {handleMetricsRequest} from './metricsHttp.js'

function responseFixture(){return {status:null,headers:null,ended:false,writeHead(status,headers){this.status=status;this.headers=headers},end(){this.ended=true}}}
function optionsRequest(path){return {url:path,method:'OPTIONS',headers:{host:'localhost'}}}

test('canonical Metrics handler owns /api/metrics',async()=>{
 const res=responseFixture()
 assert.equal(await handleMetricsRequest(optionsRequest('/api/metrics'),res),true)
 assert.equal(res.status,204)
 assert.equal(res.ended,true)
})

test('legacy marketing Metrics URL is a compatibility alias of the canonical handler',async()=>{
 const res=responseFixture()
 assert.equal(await handleMetricsRequest(optionsRequest('/api/marketing/metrics'),res),true)
 assert.equal(res.status,204)
 assert.equal(res.ended,true)
})

test('Metrics handler ignores unrelated paths',async()=>{
 const res=responseFixture()
 assert.equal(await handleMetricsRequest(optionsRequest('/api/marketing/campaigns'),res),false)
 assert.equal(res.status,null)
 assert.equal(res.ended,false)
})
