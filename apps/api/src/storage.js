import {createHash,randomUUID} from 'node:crypto'
import {HttpError} from './editorialService.js'

const DEFAULT_ALLOWED=new Set([
  'image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','application/pdf',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const PUBLIC_MEDIA_ALLOWED=new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','application/pdf'])

const baseConfig=()=>({
  url:String(process.env.PORTAL_SUPABASE_URL||'').replace(/\/$/,''),
  key:String(process.env.PORTAL_SUPABASE_SERVICE_ROLE_KEY||''),
})
const formConfig=()=>({...baseConfig(),bucket:String(process.env.PORTAL_FORM_UPLOAD_BUCKET||'form-submissions')})
const mediaConfig=()=>({...baseConfig(),bucket:String(process.env.PORTAL_MEDIA_BUCKET||'site-media')})

const safeName=value=>String(value||'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'arquivo'
const objectUrl=(base,bucket,key)=>`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`
const publicObjectUrl=(base,bucket,key)=>`${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`

export function assertAttachmentAllowed(file){
  if(!DEFAULT_ALLOWED.has(file.mimeType))throw new HttpError(415,`Tipo de arquivo não permitido: ${file.mimeType}.`,'FORM_FILE_TYPE_NOT_ALLOWED')
}

export function assertPublicMediaAllowed(file){
  if(!PUBLIC_MEDIA_ALLOWED.has(file.mimeType))throw new HttpError(415,`Tipo de mídia não permitido: ${file.mimeType}.`,'MEDIA_FILE_TYPE_NOT_ALLOWED')
}

async function ensurePublicMediaBucket(){
  const {url,key,bucket}=mediaConfig()
  if(!url||!key)throw new HttpError(503,'Armazenamento da biblioteca de mídia ainda não está configurado.','MEDIA_STORAGE_NOT_CONFIGURED')
  const lookup=await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(bucket)}`,{headers:{apikey:key,authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)})
  if(lookup.ok)return
  if(lookup.status!==404){const detail=await lookup.text().catch(()=>'');throw new HttpError(502,'Não foi possível validar o bucket de mídia.','MEDIA_STORAGE_BUCKET_CHECK_FAILED',{status:lookup.status,detail:detail.slice(0,300)})}
  const created=await fetch(`${url}/storage/v1/bucket`,{
    method:'POST',
    headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},
    body:JSON.stringify({id:bucket,name:bucket,public:true,file_size_limit:Number(process.env.PORTAL_MEDIA_MAX_FILE_BYTES||25*1024*1024)}),
    signal:AbortSignal.timeout(15000),
  })
  if(!created.ok&&created.status!==409){const detail=await created.text().catch(()=>'');throw new HttpError(502,'Não foi possível preparar o bucket de mídia.','MEDIA_STORAGE_BUCKET_CREATE_FAILED',{status:created.status,detail:detail.slice(0,300)})}
}

export async function storePrivateAttachment(submissionId,file){
  assertAttachmentAllowed(file)
  const {url,key,bucket}=formConfig()
  if(!url||!key)throw new HttpError(503,'Armazenamento privado de anexos ainda não está configurado.','FORM_STORAGE_NOT_CONFIGURED')
  const storageKey=`${submissionId}/${randomUUID()}-${safeName(file.filename)}`
  const response=await fetch(objectUrl(url,bucket,storageKey),{
    method:'POST',
    headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':file.mimeType,'x-upsert':'false'},
    body:file.buffer,
    signal:AbortSignal.timeout(30000),
  })
  if(!response.ok){const text=await response.text().catch(()=>'');throw new HttpError(502,'Falha ao armazenar anexo do formulário.','FORM_STORAGE_FAILED',{status:response.status,detail:text.slice(0,300)})}
  return {storageKey,originalName:file.filename,mimeType:file.mimeType,sizeBytes:file.size,checksum:createHash('sha256').update(file.buffer).digest('hex')}
}

export async function removePrivateAttachment(storageKey){
  const {url,key,bucket}=formConfig()
  if(!url||!key)return
  await fetch(objectUrl(url,bucket,storageKey),{method:'DELETE',headers:{apikey:key,authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)}).catch(()=>undefined)
}

export async function storePublicMediaObject(file){
  assertPublicMediaAllowed(file)
  await ensurePublicMediaBucket()
  const {url,key,bucket}=mediaConfig()
  const storageKey=`library/${new Date().toISOString().slice(0,10)}/${randomUUID()}-${safeName(file.filename)}`
  const response=await fetch(objectUrl(url,bucket,storageKey),{
    method:'POST',
    headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':file.mimeType,'cache-control':'3600','x-upsert':'false'},
    body:file.buffer,
    signal:AbortSignal.timeout(30000),
  })
  if(!response.ok){const text=await response.text().catch(()=>'');throw new HttpError(502,'Falha ao armazenar mídia do Site.','MEDIA_STORAGE_FAILED',{status:response.status,detail:text.slice(0,300)})}
  return {storageKey,originalName:file.filename,mimeType:file.mimeType,sizeBytes:file.size,publicUrl:publicObjectUrl(url,bucket,storageKey)}
}

export async function removePublicMediaObject(storageKey){
  const {url,key,bucket}=mediaConfig()
  if(!url||!key)throw new HttpError(503,'Armazenamento da biblioteca de mídia ainda não está configurado.','MEDIA_STORAGE_NOT_CONFIGURED')
  const response=await fetch(objectUrl(url,bucket,storageKey),{method:'DELETE',headers:{apikey:key,authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)})
  if(!response.ok&&response.status!==404){const text=await response.text().catch(()=>'');throw new HttpError(502,'Falha ao excluir o arquivo da biblioteca.','MEDIA_STORAGE_DELETE_FAILED',{status:response.status,detail:text.slice(0,300)})}
}
