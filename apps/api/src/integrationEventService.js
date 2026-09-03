import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const PROVIDERS=new Set(['autentique','meta','tiktok','google','spotify','nfe','whatsapp','resend'])
const clean=value=>String(value??'').trim()

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
  async markProcessed(id){
    const eventId=clean(id)
    if(!eventId)throw new HttpError(400,'ID interno do evento é obrigatório.','INTEGRATION_EVENT_INTERNAL_ID_REQUIRED')
    const {rows}=await getPool().query(`update integration_events set processed_at=now(),processing_attempts=processing_attempts+1,processing_error=null,updated_at=now() where id=$1 returning *`,[eventId])
    if(!rows[0])throw new HttpError(404,'Evento de integração não encontrado.','INTEGRATION_EVENT_NOT_FOUND')
    return rows[0]
  },
  async markFailed(id,error){
    const eventId=clean(id),message=clean(error instanceof Error?error.message:error).slice(0,2000)||'Falha de processamento.'
    if(!eventId)throw new HttpError(400,'ID interno do evento é obrigatório.','INTEGRATION_EVENT_INTERNAL_ID_REQUIRED')
    const {rows}=await getPool().query(`update integration_events set processing_attempts=processing_attempts+1,processing_error=$2,updated_at=now() where id=$1 returning *`,[eventId,message])
    if(!rows[0])throw new HttpError(404,'Evento de integração não encontrado.','INTEGRATION_EVENT_NOT_FOUND')
    return rows[0]
  },
}
