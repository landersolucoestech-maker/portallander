import test from 'node:test'
import assert from 'node:assert/strict'
import {assertSafeExternalUrl,parseRssAtom} from './externalSourceProviders.js'

test('parse RSS 2.0',()=>{const result=parseRssAtom(`<?xml version="1.0"?><rss><channel><title>Fonte</title><item><title>Notícia musical</title><link>https://example.com/a</link><guid>g1</guid><description>Resumo</description><pubDate>Fri, 04 Sep 2026 20:00:00 GMT</pubDate></item></channel></rss>`);assert.equal(result.items.length,1);assert.equal(result.items[0].externalId,'g1')})
test('parse Atom',()=>{const result=parseRssAtom(`<feed xmlns="http://www.w3.org/2005/Atom"><title>Fonte</title><entry><id>a1</id><title>Single novo</title><link href="https://example.com/b"/><summary>Resumo</summary><updated>2026-09-04T20:00:00Z</updated></entry></feed>`);assert.equal(result.items[0].externalId,'a1');assert.equal(result.items[0].url,'https://example.com/b')})
test('rejeita XML que não é feed',()=>assert.throws(()=>parseRssAtom('<html></html>'),error=>error.code==='FEED_XML_INVALID'))
test('protege protocolos e destinos privados',async()=>{await assert.rejects(()=>assertSafeExternalUrl('file:///etc/passwd'),error=>error.code==='EXTERNAL_SOURCE_PROTOCOL_FORBIDDEN');await assert.rejects(()=>assertSafeExternalUrl('http://127.0.0.1/feed'),error=>error.code==='EXTERNAL_SOURCE_HOST_FORBIDDEN');await assert.rejects(()=>assertSafeExternalUrl('http://169.254.169.254/latest/meta-data'),error=>error.code==='EXTERNAL_SOURCE_HOST_FORBIDDEN')})
