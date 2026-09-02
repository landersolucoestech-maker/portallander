import {createHmac,randomUUID} from 'node:crypto'
import {getPool,withTransaction} from './db.js'
import {HttpError} from './editorialService.js'
import {removePrivateAttachment,storePrivateAttachment} from './storage.js'

const COLLAB_TYPES=new Set(['noticia','video','foto','pauta'])
const COLLAB_PRIORITIES=new Set(['low','normal','high'])
const LEAD_ORIGINS=new Set(['site','formulario_portal','whatsapp','email','instagram','facebook','linkedin','indicacao','prospeccao_ativa','evento','parceiro','campanha','google','outro'])
const LEAD_TYPES=new Set(['empresa_marca','agencia_publicidade','assessoria_imprensa','agencia_comunicacao','anunciante','patrocinador','produtora','organizador_evento','artista_personalidade','criador_influenciador','parceiro_comercial','prestador_servico','instituicao','outro'])
const LEAD_SERVICES=new Set(['publieditorial','materia_patrocinada','publicacao_comercial','banner_publicitario','campanha_publicitaria','divulgacao_evento','divulgacao_lancamento','cobertura_evento','entrevista','producao_conteudo','patrocinio','parceria_comercial','design','marketing','desenvolvimento_web','consultoria','outro'])

const ensure=(condition,status,message,code,details)=>{if(!condition)throw new HttpError(status,message,code,details)}
const asObject=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const asArray=value=>Array.isArray(value)?value:[]
const text=value=>value===undefined||value===null?'':String(value).trim()

export function hashClientIp(ip){
  const secret=String(process.env.PORTAL_IP_HASH_SECRET||'')
  if(!secret)throw new HttpError(503,'Proteção anti-spam ainda não está configurada.','FORM_SPAM_PROTECTION_NOT_CONFIGURED')
  return createHmac('sha256',secret).update(String(ip||'unknown')).digest('hex')
}

async function getPublishedForm(slug,requestedVersion){
  const values=[slug],versionClause=requestedVersion?`and v.version=$2`:''
  if(requestedVersion)values.push(Number(requestedVersion))
  const {rows}=await getPool().query(`
    select f.id as form_id,f.key,f.name,f.slug,f.purpose,f.status,f.source,
           v.id as form_version_id,v.version,v.fields,v.consents,v.routing,v.success_message,v.published_at
      from site_forms f
      join site_form_versions v on v.form_id=f.id
     where f.slug=$1 and f.status='active' and v.published_at is not null ${versionClause}
     order by v.version desc
     limit 1`,values)
  ensure(rows.length,404,'Formulário ativo/publicado não encontrado.','FORM_NOT_FOUND')
  const row=rows[0]
  return {...row,fields:asArray(row.fields),consents:asArray(row.consents),routing:asObject(row.routing)}
}

function validateSubmission(form,payload,acceptedConsentIds,files){
  const accepted=new Set(acceptedConsentIds.map(String))
  const normalized={}
  for(const field of form.fields){
    const key=text(field.key),type=text(field.type),value=payload[key]
    if(type==='file'){
      if(field.required)ensure(files.length>0,400,`Envie o campo obrigatório: ${field.label}.`,'FORM_FILE_REQUIRED',{field:key})
      continue
    }
    const stringValue=text(value)
    if(field.required)ensure(stringValue!=='',400,`Preencha o campo obrigatório: ${field.label}.`,'FORM_VALIDATION',{field:key})
    if(stringValue&&['select','radio'].includes(type)&&Array.isArray(field.options))ensure(field.options.map(String).includes(stringValue),400,`Opção inválida para ${field.label}.`,'FORM_OPTION_INVALID',{field:key})
    if(stringValue&&type==='email')ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue),400,`E-mail inválido em ${field.label}.`,'FORM_EMAIL_INVALID',{field:key})
    if(stringValue&&type==='url'){try{new URL(stringValue)}catch{throw new HttpError(400,`URL inválida em ${field.label}.`,'FORM_URL_INVALID',{field:key})}}
    normalized[key]=type==='checkbox'?Boolean(value):stringValue
  }
  for(const consent of form.consents)if(consent.required)ensure(accepted.has(String(consent.id)),400,`É necessário aceitar: ${consent.label}.`,'FORM_CONSENT_REQUIRED',{consentId:consent.id})
  return {payload:normalized,accepted}
}

async function enforceRateLimit(ipHash){
  const limit=Math.max(1,Number(process.env.PORTAL_FORM_RATE_LIMIT_PER_MINUTE||5))
  const {rows}=await getPool().query("select count(*)::int as count from form_submissions where ip_hash=$1 and submitted_at > now()-interval '1 minute'",[ipHash])
  ensure((rows[0]?.count??0)<limit,429,'Muitas tentativas de envio. Aguarde um momento e tente novamente.','FORM_RATE_LIMITED')
}

async function routeToCollaboration(client,submissionId,payload,routing){
  const type=text(payload.tipo||payload.type)
  ensure(COLLAB_TYPES.has(type),400,'Tipo de colaboração inválido.','COLLABORATION_TYPE_INVALID')
  const priorityCandidate=text(routing?.collaboration?.defaultPriority||'normal')
  const priority=COLLAB_PRIORITIES.has(priorityCandidate)?priorityCandidate:'normal'
  const {rows}=await client.query(`
    insert into content_collaborations(submission_id,type,title,description,submitter_name,submitter_email,submitter_phone,location,source_url,status,priority,tags)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,'received',$10,$11)
    returning id`,[
      submissionId,type,text(payload.titulo||payload.title),text(payload.mensagem||payload.message),text(payload.nome||payload.name),text(payload.email),text(payload.whatsapp||payload.phone),
      text(payload.local||payload.location),text(payload.fonte||payload.sourceUrl),priority,[],
    ])
  return rows[0].id
}

async function routeToCrm(client,submissionId,payload,source,routing){
  const crm=asObject(routing.crm),originCandidate=text(crm.origin||'formulario_portal'),origin=LEAD_ORIGINS.has(originCandidate)?originCandidate:'formulario_portal'
  const typeCandidate=text(payload.type||'outro'),leadType=LEAD_TYPES.has(typeCandidate)?typeCandidate:'outro'
  const serviceCandidate=text(payload.service||'outro'),service=LEAD_SERVICES.has(serviceCandidate)?serviceCandidate:'outro'
  const tags=[...new Set(asArray(crm.tags).map(String).filter(Boolean))]
  const {rows}=await client.query(`
    insert into crm_leads(id,name,company,email,phone,city,state,role,website,instagram,lead_type,service,description,origin,status,priority,responsible,campaign,temperature,service_details,notes,tags,source_submission_id)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'novo','media',$15,$16,'morno',$17,$18,$19,$20)
    returning id`,[
      `lead_${randomUUID()}`,text(payload.name||payload.nome),text(payload.company),text(payload.email),text(payload.phone||payload.whatsapp),text(payload.city),text(payload.state),text(payload.role),text(payload.website),text(payload.instagram),
      leadType,service,text(payload.message||payload.description||payload.mensagem),origin,text(crm.responsible),text(source.campaign),JSON.stringify({}),text(payload.notes),tags,submissionId,
    ])
  return rows[0].id
}

export const formService={
  async submit({slug,version,payload,source,acceptedConsentIds,files,ipHash,userAgent,requestId}){
    const form=await getPublishedForm(slug,version)
    await enforceRateLimit(ipHash)
    const validated=validateSubmission(form,asObject(payload),asArray(acceptedConsentIds),files)
    const submissionId=randomUUID(),uploaded=[]
    try{
      for(const file of files)uploaded.push(await storePrivateAttachment(submissionId,file))
      return await withTransaction(async client=>{
        await client.query(`insert into form_submissions(id,form_id,form_version_id,payload,source,processing_status,routing_results,request_id,spam_score,ip_hash,user_agent) values($1,$2,$3,$4,$5,'validating','{}'::jsonb,$6,0,$7,$8)`,[
          submissionId,form.form_id,form.form_version_id,JSON.stringify(validated.payload),JSON.stringify(asObject(source)),requestId||null,ipHash,userAgent||'',
        ])
        const consentSnapshot=[]
        for(const consent of form.consents){
          const accepted=validated.accepted.has(String(consent.id)),acceptedAt=accepted?new Date().toISOString():null
          const {rows}=await client.query(`insert into form_submission_consents(submission_id,consent_key,kind,version,text_snapshot,accepted,accepted_at) values($1,$2,$3,$4,$5,$6,$7) returning id`,[
            submissionId,String(consent.id),String(consent.kind),String(consent.version),String(consent.text),accepted,acceptedAt,
          ])
          consentSnapshot.push({id:rows[0].id,consentId:String(consent.id),version:String(consent.version),text:String(consent.text),accepted,acceptedAt:acceptedAt||''})
        }
        const attachmentIds=[]
        for(const attachment of uploaded){
          const {rows}=await client.query(`insert into form_submission_attachments(submission_id,storage_key,original_name,mime_type,size_bytes,checksum,scan_status) values($1,$2,$3,$4,$5,$6,'pending') returning id`,[
            submissionId,attachment.storageKey,attachment.originalName,attachment.mimeType,attachment.sizeBytes,attachment.checksum,
          ])
          attachmentIds.push(rows[0].id)
        }
        const routing=asObject(form.routing),results={}
        if(routing.destination==='content_collaborations')results.collaborationId=await routeToCollaboration(client,submissionId,validated.payload,routing)
        else if(routing.destination==='crm')results.crmLeadId=await routeToCrm(client,submissionId,validated.payload,asObject(source),routing)
        else if(!['none','internal','marketing'].includes(String(routing.destination||'none')))throw new HttpError(500,'Destino de formulário não suportado.','FORM_ROUTING_INVALID')
        await client.query(`update form_submissions set processing_status='accepted',routing_results=$2,processed_at=now() where id=$1`,[submissionId,JSON.stringify(results)])
        return {id:submissionId,formId:form.form_id,formVersionId:form.form_version_id,submittedAt:new Date().toISOString(),payload:validated.payload,source:asObject(source),consentSnapshot,attachmentIds,processingStatus:'accepted',routingResults:results,successMessage:form.success_message}
      })
    }catch(error){
      await Promise.all(uploaded.map(item=>removePrivateAttachment(item.storageKey)))
      throw error
    }
  },

  async listCollaborations(){
    const {rows}=await getPool().query(`
      select c.*,s.form_id,f.name as form_name,
        coalesce((select array_agg(a.id::text order by a.created_at) from form_submission_attachments a where a.submission_id=c.submission_id),'{}'::text[]) as attachment_ids
      from content_collaborations c
      join form_submissions s on s.id=c.submission_id
      join site_forms f on f.id=s.form_id
      order by c.created_at desc`)
    return rows.map(row=>({id:row.id,submissionId:row.submission_id,formId:row.form_id,title:row.title,type:row.type,submitterName:row.submitter_name,submitterEmail:row.submitter_email,submitterPhone:row.submitter_phone,location:row.location,sourceUrl:row.source_url,message:row.description,attachmentIds:row.attachment_ids||[],status:row.status,priority:row.priority,assignedTo:row.assigned_user_id||undefined,tags:row.tags||[],receivedAt:row.created_at?.toISOString?.()||row.created_at,updatedAt:row.updated_at?.toISOString?.()||row.updated_at,publishedContentId:row.published_content_id||undefined}))
  },
}
