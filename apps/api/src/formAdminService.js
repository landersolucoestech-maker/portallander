import {randomUUID} from 'node:crypto'
import {getPool,withTransaction} from './db.js'
import {HttpError} from './editorialService.js'

const PURPOSES=new Set(['lead_capture','contact','advertising','editorial_submission','newsletter','survey','event_registration','custom'])
const DESTINATIONS=new Set(['crm','content_collaborations','marketing','internal','none'])
const FIELD_TYPES=new Set(['text','email','tel','textarea','select','radio','checkbox','url','file','date','number','hidden'])
const CONSENT_KINDS=new Set(['privacy','marketing','terms','content_rights'])
const text=value=>value===undefined||value===null?'':String(value).trim()
const asObject=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const asArray=value=>Array.isArray(value)?value:[]
const ensure=(condition,status,message,code,details)=>{if(!condition)throw new HttpError(status,message,code,details)}
const slugify=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
const keyify=value=>slugify(value).replace(/-/g,'_')

function normalizeDefinition(input,{key,source='custom',version=1}={}){
  const raw=asObject(input),name=text(raw.name),slug=slugify(raw.slug||raw.name),purpose=text(raw.purpose||'custom'),routing=asObject(raw.routing)
  ensure(name,400,'Informe o nome do formulário.','FORM_NAME_REQUIRED')
  ensure(slug,400,'Informe um slug válido para o formulário.','FORM_SLUG_REQUIRED')
  ensure(PURPOSES.has(purpose),400,'Finalidade de formulário inválida.','FORM_PURPOSE_INVALID')
  const destination=text(routing.destination||'none')
  ensure(DESTINATIONS.has(destination),400,'Destino de formulário inválido.','FORM_DESTINATION_INVALID')

  const fieldKeys=new Set(),fieldIds=new Set()
  const fields=asArray(raw.fields).map((item,index)=>{
    const field=asObject(item),fieldKey=keyify(field.key||field.label),id=text(field.id)||`field-${randomUUID()}`,type=text(field.type||'text')
    ensure(fieldKey,400,`O campo ${index+1} precisa de uma chave válida.`,'FORM_FIELD_KEY_REQUIRED')
    ensure(!fieldKeys.has(fieldKey),400,`A chave de campo “${fieldKey}” está duplicada.`,'FORM_FIELD_KEY_DUPLICATE')
    ensure(!fieldIds.has(id),400,`O identificador de campo “${id}” está duplicado.`,'FORM_FIELD_ID_DUPLICATE')
    ensure(FIELD_TYPES.has(type),400,`Tipo inválido no campo “${field.label||fieldKey}”.`,'FORM_FIELD_TYPE_INVALID')
    fieldKeys.add(fieldKey);fieldIds.add(id)
    const options=asArray(field.options).map(text).filter(Boolean)
    if(['select','radio'].includes(type))ensure(options.length>0,400,`O campo “${field.label||fieldKey}” precisa de opções.`,'FORM_FIELD_OPTIONS_REQUIRED')
    return {id,key:fieldKey,label:text(field.label)||fieldKey,type,required:Boolean(field.required),...(text(field.placeholder)?{placeholder:text(field.placeholder)}:{}),...(text(field.helpText)?{helpText:text(field.helpText)}:{}),...(options.length?{options}:{}),order:Number.isFinite(Number(field.order))?Number(field.order):index+1}
  }).sort((a,b)=>a.order-b.order).map((field,index)=>({...field,order:index+1}))

  const consentIds=new Set()
  const consents=asArray(raw.consents).map(item=>{
    const consent=asObject(item),id=text(consent.id)||`consent-${randomUUID()}`,kind=text(consent.kind||'privacy')
    ensure(!consentIds.has(id),400,`O consentimento “${id}” está duplicado.`,'FORM_CONSENT_ID_DUPLICATE')
    ensure(CONSENT_KINDS.has(kind),400,'Tipo de consentimento inválido.','FORM_CONSENT_KIND_INVALID')
    consentIds.add(id)
    return {id,kind,label:text(consent.label)||'Consentimento',required:Boolean(consent.required),version:text(consent.version)||'1.0',text:text(consent.text)||text(consent.label)}
  })

  if(destination==='crm')ensure(purpose!=='editorial_submission',400,'Submissão editorial não pode ser roteada diretamente para CRM.','FORM_ROUTING_CONFLICT')
  if(destination==='content_collaborations')ensure(purpose==='editorial_submission',400,'Colaborações recebidas exigem finalidade editorial_submission.','FORM_ROUTING_CONFLICT')

  return {id:key||text(raw.id)||`form_${randomUUID()}`,name,slug,version:Number(version)||1,purpose,status:'draft',source,fields,consents,routing:{...routing,destination},successMessage:text(raw.successMessage)||'Recebemos suas informações com sucesso.'}
}

const definitionFromRows=(form,version)=>{
  const meta=asObject(version.definition_meta)
  return {id:form.key,name:text(meta.name)||form.name,slug:text(meta.slug)||form.slug,version:Number(version.version),purpose:text(meta.purpose)||form.purpose,status:version.published_at?form.status:'draft',source:text(meta.source)||form.source,fields:asArray(version.fields),consents:asArray(version.consents),routing:asObject(version.routing),successMessage:text(version.success_message)}
}

async function loadFormAndLatest(client,key){
  const {rows}=await client.query('select * from site_forms where key=$1 limit 1',[key])
  if(!rows.length)return null
  const form=rows[0]
  const versions=(await client.query('select * from site_form_versions where form_id=$1 order by version desc',[form.id])).rows
  return {form,versions,selected:versions.find(version=>!version.published_at)||versions[0]||null}
}

async function assertDraftSlugAvailable(client,slug,key){
  const current=await client.query('select 1 from site_forms where slug=$1 and key<>$2 limit 1',[slug,key])
  ensure(!current.rows.length,409,'Já existe um formulário com este slug.','FORM_SLUG_CONFLICT')
  const drafts=await client.query("select 1 from site_form_versions v join site_forms f on f.id=v.form_id where v.published_at is null and v.definition_meta->>'slug'=$1 and f.key<>$2 limit 1",[slug,key])
  ensure(!drafts.rows.length,409,'Já existe um rascunho de formulário com este slug.','FORM_DRAFT_SLUG_CONFLICT')
}

export const formAdminService={
  async list(){
    const {rows}=await getPool().query(`
      select f.*,v.id as version_id,v.version,v.fields,v.consents,v.routing as version_routing,v.success_message as version_success_message,v.definition_meta,v.published_at as version_published_at,v.created_at as version_created_at
      from site_forms f
      join lateral (
        select * from site_form_versions x where x.form_id=f.id order by (x.published_at is null) desc,x.version desc limit 1
      ) v on true
      order by f.updated_at desc,f.name asc`)
    return rows.map(row=>definitionFromRows(row,{version:row.version,fields:row.fields,consents:row.consents,routing:row.version_routing,success_message:row.version_success_message,definition_meta:row.definition_meta,published_at:row.version_published_at}))
  },

  async get(key){
    const loaded=await loadFormAndLatest(getPool(),key)
    if(!loaded||!loaded.selected)throw new HttpError(404,'Formulário não encontrado.','FORM_DEFINITION_NOT_FOUND')
    return definitionFromRows(loaded.form,loaded.selected)
  },

  async create(input){
    return withTransaction(async client=>{
      const candidate=normalizeDefinition(input,{source:'custom',version:1})
      const key=keyify(candidate.id||candidate.slug)||`form_${randomUUID().replaceAll('-','_')}`
      await assertDraftSlugAvailable(client,candidate.slug,key)
      const existing=await client.query('select 1 from site_forms where key=$1 limit 1',[key])
      ensure(!existing.rows.length,409,'Já existe um formulário com este identificador.','FORM_KEY_CONFLICT')
      const internalSlug=`__draft-${randomUUID()}`
      const {rows}=await client.query(`insert into site_forms(key,name,slug,purpose,status,source,routing,success_message) values($1,$2,$3,$4,'draft','custom',$5,$6) returning *`,[key,candidate.name,internalSlug,candidate.purpose,JSON.stringify({destination:'none'}),candidate.successMessage])
      const form=rows[0]
      const meta={key,name:candidate.name,slug:candidate.slug,purpose:candidate.purpose,source:'custom'}
      const versionRows=await client.query(`insert into site_form_versions(form_id,version,fields,consents,routing,success_message,definition_meta) values($1,1,$2,$3,$4,$5,$6) returning *`,[form.id,JSON.stringify(candidate.fields),JSON.stringify(candidate.consents),JSON.stringify(candidate.routing),candidate.successMessage,JSON.stringify(meta)])
      return definitionFromRows(form,versionRows.rows[0])
    })
  },

  async save(key,input){
    return withTransaction(async client=>{
      const loaded=await loadFormAndLatest(client,key)
      if(!loaded)throw new HttpError(404,'Formulário não encontrado.','FORM_DEFINITION_NOT_FOUND')
      let draft=loaded.versions.find(version=>!version.published_at)
      const nextVersion=draft?.version??Math.max(0,...loaded.versions.map(item=>Number(item.version)))+1
      const candidate=normalizeDefinition(input,{key:loaded.form.key,source:loaded.form.source,version:nextVersion})
      await assertDraftSlugAvailable(client,candidate.slug,loaded.form.key)
      const meta={key:loaded.form.key,name:candidate.name,slug:candidate.slug,purpose:candidate.purpose,source:loaded.form.source}
      if(draft){
        const {rows}=await client.query(`update site_form_versions set fields=$2,consents=$3,routing=$4,success_message=$5,definition_meta=$6 where id=$1 and published_at is null returning *`,[draft.id,JSON.stringify(candidate.fields),JSON.stringify(candidate.consents),JSON.stringify(candidate.routing),candidate.successMessage,JSON.stringify(meta)])
        draft=rows[0]
      }else{
        const {rows}=await client.query(`insert into site_form_versions(form_id,version,fields,consents,routing,success_message,definition_meta) values($1,$2,$3,$4,$5,$6,$7) returning *`,[loaded.form.id,nextVersion,JSON.stringify(candidate.fields),JSON.stringify(candidate.consents),JSON.stringify(candidate.routing),candidate.successMessage,JSON.stringify(meta)])
        draft=rows[0]
      }
      return definitionFromRows(loaded.form,draft)
    })
  },

  async publish(key){
    return withTransaction(async client=>{
      const loaded=await loadFormAndLatest(client,key)
      if(!loaded)throw new HttpError(404,'Formulário não encontrado.','FORM_DEFINITION_NOT_FOUND')
      const draft=loaded.versions.find(version=>!version.published_at)
      if(!draft)throw new HttpError(409,'Não existe rascunho novo para publicar.','FORM_NO_DRAFT_TO_PUBLISH')
      const definition=normalizeDefinition(definitionFromRows(loaded.form,draft),{key:loaded.form.key,source:loaded.form.source,version:draft.version})
      await assertDraftSlugAvailable(client,definition.slug,loaded.form.key)
      await client.query(`update site_forms set name=$2,slug=$3,purpose=$4,status='active',routing=$5,success_message=$6,updated_at=now() where id=$1`,[loaded.form.id,definition.name,definition.slug,definition.purpose,JSON.stringify(definition.routing),definition.successMessage])
      const {rows}=await client.query('update site_form_versions set published_at=now() where id=$1 and published_at is null returning *',[draft.id])
      const updatedForm=(await client.query('select * from site_forms where id=$1',[loaded.form.id])).rows[0]
      return definitionFromRows(updatedForm,rows[0])
    })
  },

  async setStatus(key,status){
    const nextStatus=text(status)
    ensure(['active','inactive'].includes(nextStatus),400,'Status publicado inválido.','FORM_STATUS_INVALID')
    return withTransaction(async client=>{
      const loaded=await loadFormAndLatest(client,key)
      if(!loaded)throw new HttpError(404,'Formulário não encontrado.','FORM_DEFINITION_NOT_FOUND')
      const published=loaded.versions.find(version=>version.published_at)
      ensure(published,409,'Publique uma versão antes de alterar o estado público do formulário.','FORM_NOT_PUBLISHED')
      const {rows}=await client.query('update site_forms set status=$2,updated_at=now() where id=$1 returning *',[loaded.form.id,nextStatus])
      return definitionFromRows(rows[0],published)
    })
  },

  async remove(key){
    return withTransaction(async client=>{
      const loaded=await loadFormAndLatest(client,key)
      if(!loaded)throw new HttpError(404,'Formulário não encontrado.','FORM_DEFINITION_NOT_FOUND')
      ensure(loaded.form.source!=='system',409,'Formulários do sistema não podem ser excluídos.','FORM_SYSTEM_DELETE_FORBIDDEN')
      try{await client.query('delete from site_forms where id=$1',[loaded.form.id])}
      catch(error){if(error?.code==='23503')throw new HttpError(409,'Este formulário possui submissões e não pode ser excluído. Desative-o para preservar o histórico.','FORM_HAS_SUBMISSIONS');throw error}
      return {deleted:true,key}
    })
  },
}

export {normalizeDefinition}
