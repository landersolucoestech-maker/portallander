import {createHash,randomUUID} from 'node:crypto'
import {HttpError} from './editorialService.js'

const DEFAULT_ALLOWED=new Set([
  'image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','application/pdf',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const config=()=>({
  url:String(process.env.PORTAL_SUPABASE_URL||'').replace(/\/$/,''),
  key:String(process.env.PORTAL_SUPABASE_SERVICE_ROLE_KEY||''),
  bucket:String(process.env.PORTAL_FORM_UPLOAD_BUCKET||'form-submissions'),
})

const safeName=value=>String(value||'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'arquivo'
const objectUrl=(base,bucket,key)=>`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`

export function assertAttachmentAllowed(file){
  if(!DEFAULT_ALLOWED.has(file.mimeType))throw new HttpError(415,`Tipo de arquivo não permitido: ${file.mimeType}.`,'FORM_FILE_TYPE_NOT_ALLOWED')
}

export async function storePrivateAttachment(submissionId,file){
  assertAttachmentAllowed(file)
  const {url,key,bucket}=config()
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
  const {url,key,bucket}=config()
  if(!url||!key)return
  await fetch(objectUrl(url,bucket,storageKey),{method:'DELETE',headers:{apikey:key,authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)}).catch(()=>undefined)
}
