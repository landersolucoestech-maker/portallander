import assert from 'node:assert/strict'
import {getPool} from '../src/db.js'
import {formAdminService} from '../src/formAdminService.js'
import {formPublicService} from '../src/formPublicService.js'
import {formService} from '../src/formService.js'

const pool=getPool()
const query=(text,values=[])=>pool.query(text,values)

try{
  const operational=(await query("select key,name,slug,purpose,status,retired_at,routing from site_forms where source='system' and retired_at is null order by key")).rows
  assert.equal(operational.length,2)
  assert.deepEqual(operational.map(row=>row.key),['collaborate','lead-capture'])
  assert.equal(operational.find(row=>row.key==='lead-capture')?.name,'Contato Comercial')
  assert.equal(operational.find(row=>row.key==='lead-capture')?.routing?.destination,'crm')
  assert.equal(operational.find(row=>row.key==='collaborate')?.name,'Colabore / Anuncie')
  assert.equal(operational.find(row=>row.key==='collaborate')?.routing?.destination,'content_collaborations')

  const retired=(await query("select key,retired_at from site_forms where key='advertising-inquiry'")).rows[0]
  assert.ok(retired?.retired_at)

  const legacy=(await query("select request_id,source from form_submissions where request_id in ('forms-proof-legacy-ad','forms-proof-legacy-ambiguous') order by request_id")).rows
  assert.equal(legacy.length,2)
  const explicit=legacy.find(row=>row.request_id==='forms-proof-legacy-ad')
  const ambiguous=legacy.find(row=>row.request_id==='forms-proof-legacy-ambiguous')
  assert.equal(explicit?.source?.legacyClassification,'advertising')
  assert.equal(explicit?.source?.canonicalFormKey,'collaborate')
  assert.equal(explicit?.source?.entryContext,'anuncie')
  assert.equal(ambiguous?.source?.legacyClassification,'ambiguous')
  assert.equal(ambiguous?.source?.canonicalFormKey,undefined)

  const adminSystem=(await formAdminService.list()).filter(form=>form.source==='system')
  assert.equal(adminSystem.length,2)
  assert.deepEqual(adminSystem.map(form=>form.id).sort(),['collaborate','lead-capture'])
  assert.equal(adminSystem.some(form=>form.id==='advertising-inquiry'),false)

  const publicSystem=(await formPublicService.listPublished()).filter(form=>form.source==='system')
  assert.equal(publicSystem.length,2)
  assert.deepEqual(publicSystem.map(form=>form.id).sort(),['collaborate','lead-capture'])

  await assert.rejects(
    query("insert into site_forms(key,name,slug,purpose,status,source,routing,success_message) values('third-system-proof','Terceiro','third-system-proof','custom','active','system','{}'::jsonb,'')"),
    error=>error?.code==='23514',
  )
  await assert.rejects(
    query("insert into site_forms(key,name,slug,purpose,status,source,routing,success_message) values('custom-reserved-proof','Custom','anuncie','custom','draft','custom','{}'::jsonb,'')"),
    error=>error?.code==='23514',
  )

  const antiSpam=()=>({honeypot:'',startedAt:Date.now()-5000})
  const contact=await formService.submit({
    slug:'contato',version:2,
    payload:{name:'Contato Runtime',email:'contato-runtime@example.test',message:'Interesse comercial de runtime.'},
    source:{entryContext:'contato',page:'/contato'},acceptedConsentIds:['contact-privacy'],files:[],
    ipHash:'forms-proof-contact-ip',userAgent:'forms-runtime-proof',requestId:'forms-proof-contact',antiSpam:antiSpam(),
  })
  assert.ok(contact.routingResults.crmLeadId)
  assert.equal(contact.routingResults.collaborationId,undefined)
  assert.equal(contact.source.entryContext,'contato')

  const colabore=await formService.submit({
    slug:'colabore',version:2,
    payload:{nome:'Colabore Runtime',email:'colabore-runtime@example.test',titulo:'Pauta de runtime',tipo:'pauta',mensagem:'Proposta editorial de runtime.'},
    source:{entryContext:'colabore',page:'/colabore'},acceptedConsentIds:['collab-privacy','collab-rights'],files:[],
    ipHash:'forms-proof-colabore-ip',userAgent:'forms-runtime-proof',requestId:'forms-proof-colabore',antiSpam:antiSpam(),
  })
  assert.ok(colabore.routingResults.collaborationId)
  assert.equal(colabore.routingResults.crmLeadId,undefined)
  assert.equal(colabore.source.entryContext,'colabore')

  const anuncie=await formService.submit({
    slug:'anuncie',version:2,
    payload:{nome:'Anuncie Runtime',email:'anuncie-runtime@example.test',empresa:'Marca Runtime',titulo:'Campanha Runtime',tipo:'publicidade',mensagem:'Solicitação publicitária de runtime.'},
    source:{entryContext:'anuncie',page:'/anuncie',campaign:'anuncie'},acceptedConsentIds:['collab-privacy','collab-rights'],files:[],
    ipHash:'forms-proof-anuncie-ip',userAgent:'forms-runtime-proof',requestId:'forms-proof-anuncie',antiSpam:antiSpam(),
  })
  assert.ok(anuncie.routingResults.collaborationId)
  assert.equal(anuncie.routingResults.crmLeadId,undefined)
  assert.equal(anuncie.source.entryContext,'anuncie')
  assert.equal(anuncie.formId,colabore.formId)
  assert.equal(anuncie.formVersionId,colabore.formVersionId)

  const destinations=(await query("select s.request_id,(select count(*)::int from crm_leads l where l.source_submission_id=s.id) crm_count,(select count(*)::int from content_collaborations c where c.submission_id=s.id) collaboration_count from form_submissions s where s.request_id in ('forms-proof-contact','forms-proof-colabore','forms-proof-anuncie') order by s.request_id")).rows
  const contactDestination=destinations.find(row=>row.request_id==='forms-proof-contact')
  const colaboreDestination=destinations.find(row=>row.request_id==='forms-proof-colabore')
  const anuncieDestination=destinations.find(row=>row.request_id==='forms-proof-anuncie')
  assert.deepEqual([contactDestination?.crm_count,contactDestination?.collaboration_count],[1,0])
  assert.deepEqual([colaboreDestination?.crm_count,colaboreDestination?.collaboration_count],[0,1])
  assert.deepEqual([anuncieDestination?.crm_count,anuncieDestination?.collaboration_count],[0,1])

  console.log(JSON.stringify({
    migration030:'PASS',
    operationalSystemForms:operational.map(({key,name,slug})=>({key,name,slug})),
    adminSystemFormCount:adminSystem.length,
    publicSystemFormCount:publicSystem.length,
    retiredLegacy:retired.key,
    historical:{classified:explicit.source.legacyClassification,ambiguous:ambiguous.source.legacyClassification,lost:0},
    routing:{contact:contactDestination,colabore:colaboreDestination,anuncie:anuncieDestination},
    sharedCanonicalForm:{colaboreFormId:colabore.formId,anuncieFormId:anuncie.formId,same:colabore.formId===anuncie.formId},
  },null,2))
}finally{
  await pool.end()
}
