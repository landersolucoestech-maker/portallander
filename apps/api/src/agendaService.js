import {randomUUID} from 'node:crypto'
import {getPool,withTransaction} from './db.js'
import {HttpError} from './editorialService.js'

const STATUS=new Set(['agendado','confirmado','pendente','concluido','cancelado','realizado','negociacao'])
const text=value=>value===undefined||value===null?'':String(value).trim()
const list=value=>Array.isArray(value)?value.map(String).filter(Boolean):[]
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const numberOrNull=value=>value===undefined||value===null||value===''?null:Number(value)
const iso=value=>value?new Date(value).toISOString():''
const requireDate=(value,label)=>{const parsed=new Date(value);if(!value||Number.isNaN(parsed.getTime()))throw new HttpError(400,`${label} inválida.`,'AGENDA_DATE_INVALID',{field:label});return parsed.toISOString()}
const status=value=>{const normalized=text(value);if(!STATUS.has(normalized))throw new HttpError(400,'Status da agenda inválido.','AGENDA_STATUS_INVALID');return normalized}
const requireTitle=value=>{const normalized=text(value);if(!normalized)throw new HttpError(400,'Título do evento é obrigatório.','AGENDA_TITLE_REQUIRED');return normalized}
const requireType=value=>{const normalized=text(value);if(!normalized)throw new HttpError(400,'Tipo do evento é obrigatório.','AGENDA_TYPE_REQUIRED');return normalized}
const conflict=(actual,expected)=>{if(expected&&new Date(actual).toISOString()!==new Date(expected).toISOString())throw new HttpError(409,'Este evento foi alterado em outra sessão. Reabra o registro antes de salvar.','AGENDA_CONFLICT')}

function normalizeChecklist(value){
  return Array.isArray(value)?value.map(item=>({item:text(object(item).item),concluido:Boolean(object(item).concluido)})).filter(item=>item.item):[]
}
function mapEvent(row){return {
  id:row.id,title:row.title,type:row.event_type,status:row.status,participantIds:list(row.participant_ids),startsAt:iso(row.starts_at),
  ...(row.ends_at?{endsAt:iso(row.ends_at)}:{}),location:row.location,...(row.location_id?{locationId:row.location_id}:{}),
  ...(row.address?{address:row.address}:{}),...(row.venue_contact?{venueContact:row.venue_contact}:{}),...(row.venue_phone?{venuePhone:row.venue_phone}:{}),...(row.venue_email?{venueEmail:row.venue_email}:{}),
  ...(row.capacity!==null?{capacity:Number(row.capacity)}:{}),...(row.fee!==null?{fee:Number(row.fee)}:{}),...(row.expected_audience!==null?{expectedAudience:Number(row.expected_audience)}:{}),
  description:row.description,notes:row.notes,checklist:normalizeChecklist(row.checklist),createdAt:iso(row.created_at),updatedAt:iso(row.updated_at),
}}
function normalize(input,current={}){
  const startsAt=requireDate(input.startsAt??current.startsAt,'startsAt')
  const endsRaw=input.endsAt??current.endsAt??''
  const endsAt=endsRaw?requireDate(endsRaw,'endsAt'):null
  if(endsAt&&new Date(endsAt).getTime()<new Date(startsAt).getTime())throw new HttpError(400,'A data final não pode ser anterior ao início.','AGENDA_DATE_ORDER_INVALID')
  const capacity=numberOrNull(input.capacity??current.capacity),fee=numberOrNull(input.fee??current.fee),expectedAudience=numberOrNull(input.expectedAudience??current.expectedAudience)
  for(const [field,value] of [['capacity',capacity],['fee',fee],['expectedAudience',expectedAudience]])if(value!==null&&(!Number.isFinite(value)||value<0))throw new HttpError(400,`${field} inválido.`,'AGENDA_NUMBER_INVALID',{field})
  return {
    title:requireTitle(input.title??current.title),type:requireType(input.type??current.type),status:status(input.status??current.status??'agendado'),participantIds:list(input.participantIds??current.participantIds),startsAt,endsAt,
    location:text(input.location??current.location),locationId:text(input.locationId??current.locationId)||null,address:text(input.address??current.address),venueContact:text(input.venueContact??current.venueContact),venuePhone:text(input.venuePhone??current.venuePhone),venueEmail:text(input.venueEmail??current.venueEmail),capacity,fee,expectedAudience,
    description:text(input.description??current.description),notes:text(input.notes??current.notes),checklist:normalizeChecklist(input.checklist??current.checklist),
  }
}
async function selectEvent(client,id,{lock=false}={}){const {rows}=await client.query(`select * from agenda_events where id=$1${lock?' for update':''}`,[id]);if(!rows[0])throw new HttpError(404,'Evento da agenda não encontrado.','AGENDA_EVENT_NOT_FOUND');return rows[0]}

export const agendaService={
  async list(){const {rows}=await getPool().query('select * from agenda_events order by starts_at asc,created_at asc');return rows.map(mapEvent)},
  async get(id){return mapEvent(await selectEvent(getPool(),id))},
  async create(input,userId=null){const value=normalize(input);const id=`agenda_evt_${randomUUID()}`;const {rows}=await getPool().query(`insert into agenda_events(id,title,event_type,status,participant_ids,starts_at,ends_at,location,location_id,address,venue_contact,venue_phone,venue_email,capacity,fee,expected_audience,description,notes,checklist,created_by,updated_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$20) returning *`,[id,value.title,value.type,value.status,value.participantIds,value.startsAt,value.endsAt,value.location,value.locationId,value.address,value.venueContact,value.venuePhone,value.venueEmail,value.capacity,value.fee,value.expectedAudience,value.description,value.notes,JSON.stringify(value.checklist),userId]);return mapEvent(rows[0])},
  async update(id,patch,expectedUpdatedAt,userId=null){return withTransaction(async client=>{const row=await selectEvent(client,id,{lock:true}),current=mapEvent(row);conflict(current.updatedAt,expectedUpdatedAt);const value=normalize(patch,current);const {rows}=await client.query(`update agenda_events set title=$2,event_type=$3,status=$4,participant_ids=$5,starts_at=$6,ends_at=$7,location=$8,location_id=$9,address=$10,venue_contact=$11,venue_phone=$12,venue_email=$13,capacity=$14,fee=$15,expected_audience=$16,description=$17,notes=$18,checklist=$19,updated_by=$20 where id=$1 returning *`,[id,value.title,value.type,value.status,value.participantIds,value.startsAt,value.endsAt,value.location,value.locationId,value.address,value.venueContact,value.venuePhone,value.venueEmail,value.capacity,value.fee,value.expectedAudience,value.description,value.notes,JSON.stringify(value.checklist),userId]);return mapEvent(rows[0])})},
  async remove(id){const result=await getPool().query('delete from agenda_events where id=$1',[id]);if(!result.rowCount)throw new HttpError(404,'Evento da agenda não encontrado.','AGENDA_EVENT_NOT_FOUND')},
}
