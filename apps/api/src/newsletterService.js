import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_API='https://api.resend.com'

export function normalizeNewsletterEmail(value){
  const email=String(value??'').trim().toLowerCase()
  if(!EMAIL_RE.test(email)||email.length>254)throw new HttpError(400,'Informe um e-mail válido.','NEWSLETTER_EMAIL_INVALID')
  return email
}

function resendConfig(env=process.env){
  return {
    apiKey:String(env.RESEND_API_KEY||'').trim(),
    segmentId:String(env.RESEND_NEWSLETTER_SEGMENT_ID||'').trim(),
    topicId:String(env.RESEND_NEWSLETTER_TOPIC_ID||'').trim(),
  }
}

async function resendRequest(path,{method='GET',body}={}){
  const {apiKey}=resendConfig()
  if(!apiKey)throw new HttpError(503,'Resend ainda não está configurado no backend.','RESEND_NOT_CONFIGURED')
  const response=await fetch(`${RESEND_API}${path}`,{
    method,
    headers:{Authorization:`Bearer ${apiKey}`,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),
  })
  const payload=await response.json().catch(()=>({}))
  if(!response.ok){
    const message=String(payload?.message||payload?.error||`Resend respondeu ${response.status}.`)
    throw new HttpError(response.status>=500?502:response.status,message,'RESEND_REQUEST_FAILED',{resendStatus:response.status})
  }
  return payload
}

async function ensureResendContact(email){
  const {segmentId,topicId}=resendConfig()
  const body={email,unsubscribed:false}
  if(segmentId)body.segments=[{id:segmentId}]
  if(topicId)body.topics=[{id:topicId,subscription:'opt_in'}]
  try{
    const created=await resendRequest('/contacts',{method:'POST',body})
    return String(created?.id||'')
  }catch(error){
    if(!(error instanceof HttpError)||error.status!==409)throw error
    const existing=await resendRequest(`/contacts/${encodeURIComponent(email)}`)
    const contactId=String(existing?.id||'')
    if(!contactId)throw error
    await resendRequest(`/contacts/${encodeURIComponent(email)}`,{method:'PATCH',body:{unsubscribed:false}})
    if(segmentId)await resendRequest(`/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,{method:'POST'}).catch(segmentError=>{if(!(segmentError instanceof HttpError&&segmentError.status===409))throw segmentError})
    if(topicId)await resendRequest(`/contacts/${encodeURIComponent(email)}/topics`,{method:'PATCH',body:{topics:[{id:topicId,subscription:'opt_in'}]}}).catch(()=>undefined)
    return contactId
  }
}

function subscriberFromRow(row){
  return {
    id:row.id,
    email:row.email,
    status:row.status,
    source:row.source,
    consentVersion:row.consent_version,
    consentAt:row.consent_at?.toISOString?.()??row.consent_at,
    confirmedAt:row.confirmed_at?.toISOString?.()??row.confirmed_at??null,
    unsubscribedAt:row.unsubscribed_at?.toISOString?.()??row.unsubscribed_at??null,
    resendContactId:row.resend_contact_id||null,
    resendSyncedAt:row.resend_synced_at?.toISOString?.()??row.resend_synced_at??null,
    lastSyncError:row.last_sync_error||null,
    createdAt:row.created_at?.toISOString?.()??row.created_at,
    updatedAt:row.updated_at?.toISOString?.()??row.updated_at,
  }
}

export const newsletterService={
  async subscribe({email,source='home-newsletter',consentVersion='v1',metadata={}}){
    const normalized=normalizeNewsletterEmail(email)
    const safeMetadata=metadata&&typeof metadata==='object'&&!Array.isArray(metadata)?metadata:{}
    const {rows}=await getPool().query(`
      insert into newsletter_subscribers(email,status,source,consent_version,consent_at,confirmed_at,unsubscribed_at,metadata,last_sync_error)
      values($1,'active',$2,$3,now(),now(),null,$4::jsonb,null)
      on conflict (lower(email)) do update set
        status='active',source=excluded.source,consent_version=excluded.consent_version,consent_at=now(),confirmed_at=coalesce(newsletter_subscribers.confirmed_at,now()),unsubscribed_at=null,metadata=newsletter_subscribers.metadata||excluded.metadata,last_sync_error=null
      returning *`,[normalized,String(source||'home-newsletter').slice(0,80),String(consentVersion||'v1').slice(0,40),JSON.stringify(safeMetadata)])
    const subscriber=rows[0]
    try{
      const resendContactId=await ensureResendContact(normalized)
      const synced=await getPool().query(`update newsletter_subscribers set resend_contact_id=$2,resend_synced_at=now(),last_sync_error=null where id=$1 returning *`,[subscriber.id,resendContactId||null])
      return {subscriber:subscriberFromRow(synced.rows[0]),synced:true}
    }catch(error){
      const message=error instanceof Error?error.message:'Falha ao sincronizar com Resend.'
      await getPool().query('update newsletter_subscribers set last_sync_error=$2 where id=$1',[subscriber.id,message.slice(0,1000)])
      return {subscriber:subscriberFromRow({...subscriber,last_sync_error:message}),synced:false,warning:'Inscrição salva no Portal, mas a sincronização com o provedor de e-mail está pendente.'}
    }
  },
  async list({limit=100,status}={}){
    const safeLimit=Math.max(1,Math.min(500,Number(limit)||100)),values=[]
    let where=''
    if(status){values.push(String(status));where=`where status=$${values.length}`}
    values.push(safeLimit)
    const {rows}=await getPool().query(`select * from newsletter_subscribers ${where} order by created_at desc limit $${values.length}`,values)
    return rows.map(subscriberFromRow)
  },
  async stats(){
    const {rows}=await getPool().query(`select count(*)::int total,count(*) filter(where status='active')::int active,count(*) filter(where status='unsubscribed')::int unsubscribed,count(*) filter(where last_sync_error is not null)::int sync_errors from newsletter_subscribers`)
    return rows[0]||{total:0,active:0,unsubscribed:0,sync_errors:0}
  },
}
