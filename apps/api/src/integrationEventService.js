import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const PROVIDERS=new Set(['autentique','meta','tiktok','google','spotify','nfe','whatsapp','resend'])
const clean=value=>String(value??'').trim()
const clamp=(value,min,max,fallback)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.trunc(number))):fallback}

export function normalizeIntegrationEvent(input={}){
  const provider=clean(input.provider).toLowerCase()
  const providerEventId=clean(input.providerEventId)
  const eventType=clean(input.eventType)
  const externalObjectId=clean(input.externalObjectId)||null
  const payload=input.payload&&typeof input.payload==='object'&&!Array.isArray(input.payload)?input.payload:{}
  if(!PROVIDERS.has(provider))throw new HttpError(400,'Provider de integração inválido.','INTEGRATION_EVENT_PROVIDER_INVALID')
  if(!providerEventId||providerEventId.length>500)throw new HttpError(400,'Evento do provider sem identificador válido.','INTEGRATION_EVENT_ID_INVALID')
  if(!eventType||eventType.length>200)throw new HttpError(400,'Tipo do evento de integração inválido.','INTEGRATION_EVENT_TYPE_INVALID')
  return {provider,providerEventId,eventType,externalObjectId,payload}
}

export const integrationEventService={
  async record(input){
    const event=normalizeIntegrationEvent(input)
    const {rows}=await getPool().query(`
      insert into integration_events(provider,provider_event_id,event_type,external_object_id,payload)
      values($1,$2,$3,$4,$5::jsonb)
      on conflict(provider,provider_event_id) do nothing
      returning *`,[event.provider,event.providerEventId,event.eventType,event.externalObjectId,JSON.stringify(event.payload)])
    if(rows[0])return {inserted:true,event:rows[0]}
    const existing=await getPool().query('select * from integration_events where provider=$1 and provider_event_id=$2',[event.provider,event.providerEventId])
    return {inserted:false,event:existing.rows[0]||null}
  },

  async claimNext({workerId,provider,leaseSeconds=60}={}){
    const worker=clean(workerId)
    if(!worker||worker.length>200)throw new HttpError(400,'workerId válido é obrigatório para claim.','INTEGRATION_EVENT_WORKER_ID_REQUIRED')
    const normalizedProvider=clean(provider).toLowerCase()||null
    if(normalizedProvider&&!PROVIDERS.has(normalizedProvider))throw new HttpError(400,'Provider de integração inválido.','INTEGRATION_EVENT_PROVIDER_INVALID')
    const lease=clamp(leaseSeconds,5,3600,60)
    await getPool().query(`
      update integration_events
      set processing_state='dead_letter',dead_lettered_at=coalesce(dead_lettered_at,now()),claimed_at=null,claim_expires_at=null,claimed_by=null,updated_at=now()
      where processing_state in ('pending','retry_wait','processing')
        and processing_attempts>=max_attempts
        and (processing_state<>'processing' or claim_expires_at is null or claim_expires_at<=now())`)
    const {rows}=await getPool().query(`
      with candidate as (
        select id from integration_events
        where ($1::text is null or provider=$1)
          and processing_attempts<max_attempts
          and (
            (processing_state in ('pending','retry_wait') and coalesce(next_attempt_at,received_at)<=now())
            or (processing_state='processing' and claim_expires_at is not null and claim_expires_at<=now())
          )
        order by coalesce(next_attempt_at,received_at),received_at,id
        for update skip locked
        limit 1
      )
      update integration_events e
      set processing_state='processing',processing_attempts=e.processing_attempts+1,claimed_by=$2,claimed_at=now(),claim_expires_at=now()+($3||' seconds')::interval,processing_error=null,updated_at=now()
      from candidate
      where e.id=candidate.id
      returning e.*`,[normalizedProvider,worker,String(lease)])
    return rows[0]||null
  },

  async markProcessed(id,{workerId}={}){
    const eventId=clean(id),worker=clean(workerId)||null
    if(!eventId)throw new HttpError(400,'ID interno do evento é obrigatório.','INTEGRATION_EVENT_INTERNAL_ID_REQUIRED')
    const {rows}=await getPool().query(`
      update integration_events
      set processed_at=now(),processing_attempts=processing_attempts+case when processing_state='processing' then 0 else 1 end,
          processing_error=null,processing_state='processed',next_attempt_at=null,claimed_at=null,claim_expires_at=null,claimed_by=null,dead_lettered_at=null,updated_at=now()
      where id=$1 and ($2::text is null or (processing_state='processing' and claimed_by=$2))
      returning *`,[eventId,worker])
    if(!rows[0])throw new HttpError(worker?409:404,worker?'Evento não pertence ao worker informado ou não está em processamento.':'Evento de integração não encontrado.',worker?'INTEGRATION_EVENT_CLAIM_MISMATCH':'INTEGRATION_EVENT_NOT_FOUND')
    return rows[0]
  },

  async markFailed(id,error,{workerId,retryAfterSeconds=60}={}){
    const eventId=clean(id),worker=clean(workerId)||null,message=clean(error instanceof Error?error.message:error).slice(0,2000)||'Falha de processamento.'
    if(!eventId)throw new HttpError(400,'ID interno do evento é obrigatório.','INTEGRATION_EVENT_INTERNAL_ID_REQUIRED')
    const retryAfter=clamp(retryAfterSeconds,5,86400,60)
    const {rows}=await getPool().query(`
      update integration_events
      set processing_attempts=processing_attempts+case when processing_state='processing' then 0 else 1 end,
          processing_error=$3,
          processing_state=case when processing_attempts+case when processing_state='processing' then 0 else 1 end>=max_attempts then 'dead_letter' else 'retry_wait' end,
          next_attempt_at=case when processing_attempts+case when processing_state='processing' then 0 else 1 end>=max_attempts then null else now()+($4||' seconds')::interval end,
          dead_lettered_at=case when processing_attempts+case when processing_state='processing' then 0 else 1 end>=max_attempts then now() else null end,
          claimed_at=null,claim_expires_at=null,claimed_by=null,updated_at=now()
      where id=$1 and ($2::text is null or (processing_state='processing' and claimed_by=$2))
      returning *`,[eventId,worker,message,String(retryAfter)])
    if(!rows[0])throw new HttpError(worker?409:404,worker?'Evento não pertence ao worker informado ou não está em processamento.':'Evento de integração não encontrado.',worker?'INTEGRATION_EVENT_CLAIM_MISMATCH':'INTEGRATION_EVENT_NOT_FOUND')
    return rows[0]
  },

  async requeueDeadLetter(id,{actorId,reason}={}){
    const eventId=clean(id),actor=clean(actorId),why=clean(reason).slice(0,1000)
    if(!eventId)throw new HttpError(400,'ID interno do evento é obrigatório.','INTEGRATION_EVENT_INTERNAL_ID_REQUIRED')
    if(!actor||!why)throw new HttpError(400,'Reprocessamento exige actorId e reason auditáveis.','INTEGRATION_EVENT_REQUEUE_AUDIT_REQUIRED')
    const {rows}=await getPool().query(`
      update integration_events
      set processing_state='pending',processing_attempts=0,processing_error=null,next_attempt_at=now(),dead_lettered_at=null,
          claimed_at=null,claim_expires_at=null,claimed_by=null,requeue_count=requeue_count+1,last_requeued_at=now(),last_requeued_by=$2,last_requeue_reason=$3,updated_at=now()
      where id=$1 and processing_state='dead_letter'
      returning *`,[eventId,actor,why])
    if(!rows[0])throw new HttpError(409,'Somente eventos em dead letter podem ser reprocessados.','INTEGRATION_EVENT_REQUEUE_STATE_INVALID')
    return rows[0]
  },

  async listDeadLetters({provider,limit=100}={}){
    const normalizedProvider=clean(provider).toLowerCase()||null
    if(normalizedProvider&&!PROVIDERS.has(normalizedProvider))throw new HttpError(400,'Provider de integração inválido.','INTEGRATION_EVENT_PROVIDER_INVALID')
    const safeLimit=clamp(limit,1,500,100)
    const {rows}=await getPool().query(`select * from integration_events where processing_state='dead_letter' and ($1::text is null or provider=$1) order by dead_lettered_at desc,received_at desc limit $2`,[normalizedProvider,safeLimit])
    return rows
  },
}
