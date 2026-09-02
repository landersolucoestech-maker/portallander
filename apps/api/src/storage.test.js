import assert from 'node:assert/strict'
import test from 'node:test'
import {assertPublicMediaAllowed,detectImageMime} from './storage.js'

const file=(mimeType,bytes)=>({mimeType,buffer:Buffer.from(bytes),filename:'upload.bin',size:bytes.length})

test('detects supported image signatures',()=>{
  assert.equal(detectImageMime(Buffer.from([0xff,0xd8,0xff,0xe0])),'image/jpeg')
  assert.equal(detectImageMime(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'image/png')
  assert.equal(detectImageMime(Buffer.from('RIFFxxxxWEBP','ascii')),'image/webp')
  assert.equal(detectImageMime(Buffer.from('GIF89a','ascii')),'image/gif')
})

test('rejects an image whose declared MIME differs from its bytes',()=>{
  assert.throws(()=>assertPublicMediaAllowed(file('image/png',[0xff,0xd8,0xff,0xe0])),error=>error?.code==='MEDIA_FILE_MIME_MISMATCH')
})

test('rejects malformed image bytes even with an allowed MIME',()=>{
  assert.throws(()=>assertPublicMediaAllowed(file('image/webp',[1,2,3,4,5,6,7,8,9])),error=>error?.code==='MEDIA_FILE_SIGNATURE_INVALID')
})

test('accepts matching PNG bytes',()=>{
  assert.doesNotThrow(()=>assertPublicMediaAllowed(file('image/png',[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0])))
})
