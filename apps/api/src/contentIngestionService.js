import {getPool} from './db.js'
import {editorialService,HttpError,normalizeSlug} from './editorialService.js'
import {assertSafeExternalUrl,classifyCandidate,fetchGdeltItems,fetchYouTubeItems,likelySameStory,normalizeExternalUrl,normalizeTitle,parseSyndicationFeed,safeExternalFetch,scoreCandidate,stableHash,titleHash} from './contentIngestionCore.js'

const PROVIDERS=new Set(['rss','gdelt','youtube','official_source'])
const STATUSES=new Set(['new','reviewing','approved','rejected','ignored','converted'])
const clean=value=>String(value??'').trim()
const iso=value=>value?new Date(value).toISOString():null
const json=value=>JSON.stringify(value??null)
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const clampFrequency=value=>Math.min(10080,Math.max(15,Number(value)||60))

function sourceFromRow(row){if(!row)return null;return {id:row.id,sourceKey:row.source_key,provider:row.provider,name:row.name,sourceType:row.source_type,category:row.category||'',country:row.country||'',language:row.language||'',url:row.url||'',feedUrl:row.feed_url||'',enabled:Boolean(row.enabled),configuration:row.configuration||{},syncFrequencyMinutes:Number(row.sync_frequency_minutes),lastSyncAt:iso(row.last_sync_at),nextSyncAt:iso(row.next_sync_at),lastStatus:row.last_status,lastImportedCount:Number(row.last_imported_count),lastError:row.last_error||'',createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)}}
function syncRunFromRow(row){if(!row)return null;return {id:row.id,sourceId:row.source_id,provider:row.provider,startedAt:iso(row.started_at),finishedAt:iso(row.finished_at),status:row.status,received:Number(row.received),created:Number(row.created),duplicates:Number(row.duplicates),ignored:Number(row.ignored),errors:Number(row.errors),errorSummary:row.error_summary||'',metadata:row.metadata||{}}}
function candidateFromRow(row){if(!row)return null;return {id:row.id,provider:row.provider,sourceId:row.source_id,sourceName:row.source_name,externalId:row.external_id||'',canonicalUrl:row.canonical_url,normalizedUrl:row.normalized_url,title:row.title,description:row.description||'',imageUrl:row.image_url||'',author:row.author||'',publishedAt:iso(row.published_at),discoveredAt:iso(row.discovered_at),language:row.language||'',country:row.country||'',sourceType:row.source_type,suggestedCategory:row.suggested_category||'',suggestedTags:row.suggested_tags||[],detectedEntities:row.detected_entities||{},relevanceScore:Number(row.relevance_score),relevanceReasons:row.relevance_reasons||[],duplicateKey:row.duplicate_key||'',provenance:Array.isArray(row.provenance)?row.provenance:[],rawMetadata:row.raw_metadata||{},status:row.status,reviewedAt:iso(row.reviewed_at),reviewedBy:row.reviewed_by||null,editorialContentId:row.editorial_content_id||null,createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)}}

async function validateSourceInput(input,existing={}){
  const value={...existing,...object(input)},provider=clean(value.provider)
  if(!PROVIDERS.has(provider))throw new HttpError(400,'Provider editorial inválido.','EDITORIAL_SOURCE_PROVIDER_INVALID')
  const name=clean(value.name);if(!name)throw new HttpError(400,'Nome da fonte é obrigatório.','EDITORIAL_SOURCE_NAME_REQUIRED')
  const sourceKey=clean(value.sourceKey)||normalizeSlug(name);if(!/^[a-z0-9][a-z0-9-]{2,79}$/.test(sourceKey))throw new HttpError(400,'Chave da fonte inválida.','EDITORIAL_SOURCE_KEY_INVALID')
  let url=clean(value.url),feedUrl=clean(value.feedUrl)
  if(url)url=normalizeExternalUrl(url)
  if(feedUrl){await assertSafeExternalUrl(feedUrl);feedUrl=normalizeExternalUrl(feedUrl)}
  if(['rss','official_source'].includes(provider)&&value.enabled&&!feedUrl)throw new HttpError(400,'Fonte RSS/official_source ativa exige feed RSS/Atom legítimo.','EDITORIAL_SOURCE_FEED_REQUIRED')
  return {sourceKey,provider,name,sourceType:clean(value.sourceType)||'news',category:clean(value.category),country:clean(value.country),language:clean(value.language),url,feedUrl,enabled:Boolean(value.enabled),configuration:object(value.configuration),syncFrequencyMinutes:clampFrequency(value.syncFrequencyMinutes)}
}

function provenanceEntry(source,item){return {provider:source.provider,sourceId:source.id,sourceKey:source.sourceKey,sourceName:source.name,externalId:item.externalId||null,url:item.canonicalUrl,discoveredAt:new Date().toISOString()}}
function normalizedItem(source,item){
  const title=clean(item.title),canonicalUrl=normalizeExternalUrl(item.canonicalUrl),publishedAt=item.publishedAt?new Date(item.publishedAt).toISOString():null
  const classification=classifyCandidate({...item,provider:source.provider,sourceType:source.sourceType,sourceCategory:source.category}),relevance=scoreCandidate({...item,provider:source.provider,sourceType:source.sourceType,country:item.country||source.country,language:item.language||source.language,publishedAt})
  const tags=[...new Set([...relevance.matches,classification.toLowerCase().replace(/\s*\/\s*/g,'-')])].slice(0,16)
  return {provider:source.provider,sourceId:source.id,sourceName:source.name,externalId:clean(item.externalId)||null,canonicalUrl,normalizedUrl:canonicalUrl,title,normalizedTitle:normalizeTitle(title),titleHash:titleHash(title),description:clean(item.description).slice(0,1200),imageUrl:clean(item.imageUrl)||null,author:clean(item.author)||null,publishedAt,language:clean(item.language)||source.language||null,country:clean(item.country)||source.country||null,sourceType:source.sourceType,suggestedCategory:classification,suggestedTags:tags,detectedEntities:{terms:relevance.matches},relevanceScore:relevance.score,relevanceReasons:relevance.reasons,duplicateKey:stableHash(canonicalUrl),provenance:[provenanceEntry(source,{...item,canonicalUrl})],rawMetadata:object(item.rawMetadata)}
}

async function recentCandidates(client,item){
  const reference=item.publishedAt||new Date().toISOString()
  const {rows}=await client.query(`select * from content_import_candidates where published_at is null or published_at between $1::timestamptz-interval '72 hours' and $1::timestamptz+interval '72 hours' order by relevance_score desc,discovered_at desc limit 80`,[reference])
  return rows
}
async function findDuplicate(client,item){
  if(item.externalId){const exact=await client.query('select * from content_import_candidates where provider=$1 and source_id=$2 and external_id=$3 limit 1',[item.provider,item.sourceId,item.externalId]);if(exact.rows[0])return exact.rows[0]}
  const url=await client.query('select * from content_import_candidates where normalized_url=$1 limit 1',[item.normalizedUrl]);if(url.rows[0])return url.rows[0]
  const hash=await client.query(`select * from content_import_candidates where title_hash=$1 and (published_at is null or $2::timestamptz is null or published_at between $2::timestamptz-interval '72 hours' and $2::timestamptz+interval '72 hours') order by discovered_at desc limit 1`,[item.titleHash,item.publishedAt]);if(hash.rows[0])return hash.rows[0]
  const recent=await recentCandidates(client,item);return recent.find(row=>likelySameStory({title:row.title,publishedAt:row.published_at},{title:item.title,publishedAt:item.publishedAt}))||null
}
async function mergeDuplicate(client,row,item){
  const current=Array.isArray(row.provenance)?row.provenance:[],incoming=item.provenance[0],already=current.some(entry=>entry?.provider===incoming.provider&&entry?.sourceId===incoming.sourceId&&entry?.externalId===incoming.externalId&&entry?.url===incoming.url)
  const crossProvider=!current.some(entry=>entry?.provider===item.provider),nextScore=Math.min(100,Math.max(Number(row.relevance_score)||0,item.relevanceScore)+(crossProvider?10:0))
  const {rows}=await client.query(`update content_import_candidates set provenance=$2::jsonb,relevance_score=$3,relevance_reasons=(select array(select distinct unnest(relevance_reasons || $4::text[]))),updated_at=now() where id=$1 returning *`,[row.id,json(already?current:[...current,incoming]),nextScore,crossProvider?['multi-provider-signal:10']:[]])
  return candidateFromRow(rows[0])
}
async function insertCandidate(client,item){
  const duplicate=await findDuplicate(client,item);if(duplicate)return {created:false,duplicate:true,candidate:await mergeDuplicate(client,duplicate,item)}
  try{
    const {rows}=await client.query(`insert into content_import_candidates(provider,source_id,source_name,external_id,canonical_url,normalized_url,title,normalized_title,title_hash,description,image_url,author,published_at,language,country,source_type,suggested_category,suggested_tags,detected_entities,relevance_score,relevance_reasons,duplicate_key,provenance,raw_metadata) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20,$21,$22,$23::jsonb,$24::jsonb) returning *`,[item.provider,item.sourceId,item.sourceName,item.externalId,item.canonicalUrl,item.normalizedUrl,item.title,item.normalizedTitle,item.titleHash,item.description,item.imageUrl,item.author,item.publishedAt,item.language,item.country,item.sourceType,item.suggestedCategory,item.suggestedTags,json(item.detectedEntities),item.relevanceScore,item.relevanceReasons,item.duplicateKey,json(item.provenance),json(item.rawMetadata)])
    return {created:true,duplicate:false,candidate:candidateFromRow(rows[0])}
  }catch(error){if(error?.code!=='23505')throw error;const raced=await client.query('select * from content_import_candidates where normalized_url=$1 limit 1',[item.normalizedUrl]);if(!raced.rows[0])throw error;return {created:false,duplicate:true,candidate:await mergeDuplicate(client,raced.rows[0],item)}}
}

async function fetchSourceItems(source){
  if(source.provider==='gdelt')return fetchGdeltItems(source.configuration)
  if(source.provider==='youtube')return fetchYouTubeItems(source.configuration)
  if(source.provider==='rss'||source.provider==='official_source'){
    if(!source.feedUrl)throw new HttpError(409,'A fonte ainda não possui feed RSS/Atom configurado.','EDITORIAL_SOURCE_FEED_REQUIRED')
    const response=await safeExternalFetch(source.feedUrl)
    if(/text\/html/i.test(response.contentType))throw new HttpError(422,'A URL configurada retornou HTML; configure um feed RSS/Atom legítimo.','EDITORIAL_SOURCE_NOT_A_FEED')
    return parseSyndicationFeed(response.body,{feedUrl:response.url,sourceName:source.name})
  }
  throw new HttpError(400,'Provider editorial não suportado.','EDITORIAL_SOURCE_PROVIDER_INVALID')
}

export const contentIngestionService={
  async providerStatus(){
    const {rows}=await getPool().query('select provider,count(*)::int as total,count(*) filter(where enabled)::int as enabled,max(last_sync_at) as last_sync_at from integration_sources group by provider')
    const status=Object.fromEntries(rows.map(row=>[row.provider,{implemented:true,total:Number(row.total),enabled:Number(row.enabled),lastSyncAt:iso(row.last_sync_at)}]))
    return {rss:{implemented:true,configured:(status.rss?.total||0)>0,...status.rss},official_source:{implemented:true,configured:(status.official_source?.total||0)>0,...status.official_source},gdelt:{implemented:true,configured:true,cost:'free',...status.gdelt},youtube:{implemented:true,configured:Boolean(process.env.YOUTUBE_API_KEY),credential:'backend-only',...status.youtube},spotify:{implemented:true,reused:true,managedBy:'existing-spotifyReleaseService'}}
  },
  async listSources(){const {rows}=await getPool().query('select * from integration_sources order by provider,name');return rows.map(sourceFromRow)},
  async getSource(id){const {rows}=await getPool().query('select * from integration_sources where id=$1',[id]);if(!rows[0])throw new HttpError(404,'Fonte não encontrada.','EDITORIAL_SOURCE_NOT_FOUND');return sourceFromRow(rows[0])},
  async createSource(input){
    const value=await validateSourceInput(input)
    try{const {rows}=await getPool().query(`insert into integration_sources(source_key,provider,name,source_type,category,country,language,url,feed_url,enabled,configuration,sync_frequency_minutes,last_status,next_sync_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,case when $10 then now() else null end) returning *`,[value.sourceKey,value.provider,value.name,value.sourceType,value.category||null,value.country||null,value.language||null,value.url||null,value.feedUrl||null,value.enabled,json(value.configuration),value.syncFrequencyMinutes,value.enabled?'never_synced':value.feedUrl?'disabled':'configuration_required']);return sourceFromRow(rows[0])}catch(error){if(error?.code==='23505')throw new HttpError(409,'Já existe uma fonte com essa chave.','EDITORIAL_SOURCE_KEY_CONFLICT');throw error}
  },
  async updateSource(id,input){const existing=await this.getSource(id),value=await validateSourceInput(input,existing),status=value.enabled?'never_synced':value.feedUrl?'disabled':'configuration_required';const {rows}=await getPool().query(`update integration_sources set source_key=$2,provider=$3,name=$4,source_type=$5,category=$6,country=$7,language=$8,url=$9,feed_url=$10,enabled=$11,configuration=$12::jsonb,sync_frequency_minutes=$13,last_status=case when enabled is distinct from $11 or feed_url is distinct from $10 then $14 else last_status end,next_sync_at=case when $11 then coalesce(next_sync_at,now()) else null end,updated_at=now() where id=$1 returning *`,[id,value.sourceKey,value.provider,value.name,value.sourceType,value.category||null,value.country||null,value.language||null,value.url||null,value.feedUrl||null,value.enabled,json(value.configuration),value.syncFrequencyMinutes,status]);return sourceFromRow(rows[0])},
  async syncSource(id){
    const pool=getPool(),claimed=await pool.query(`update integration_sources set last_status='syncing',last_error=null,updated_at=now() where id=$1 and enabled=true and (last_status<>'syncing' or updated_at<now()-interval '15 minutes') returning *`,[id]);if(!claimed.rows[0]){const source=await this.getSource(id);if(!source.enabled)throw new HttpError(409,'A fonte está desativada.','EDITORIAL_SOURCE_DISABLED');throw new HttpError(409,'A fonte já está sincronizando.','EDITORIAL_SOURCE_SYNC_IN_PROGRESS')}
    const source=sourceFromRow(claimed.rows[0]),runResult=await pool.query(`insert into integration_source_sync_runs(source_id,provider) values($1,$2) returning *`,[source.id,source.provider]),run=runResult.rows[0]
    try{
      const items=await fetchSourceItems(source),configuredMin=Number(source.configuration?.minRelevanceScore),minScore=Number.isFinite(configuredMin)?Math.min(100,Math.max(0,configuredMin)):15;let created=0,duplicates=0,ignored=0,errors=0
      for(const raw of items){
        try{const item=normalizedItem(source,raw);if(item.relevanceScore<minScore){ignored+=1;continue}const result=await insertCandidate(pool,item);if(result.created)created+=1;else duplicates+=1}catch(error){errors+=1;console.error('content-ingestion-item-error',{sourceId:source.id,provider:source.provider,message:error instanceof Error?error.message:String(error)})}
      }
      const finished=await pool.query(`update integration_source_sync_runs set finished_at=now(),status='succeeded',received=$2,created=$3,duplicates=$4,ignored=$5,errors=$6,metadata=$7::jsonb where id=$1 returning *`,[run.id,items.length,created,duplicates,ignored,errors,json({sourceKey:source.sourceKey})])
      await pool.query(`update integration_sources set last_sync_at=now(),next_sync_at=now()+(sync_frequency_minutes::text||' minutes')::interval,last_status='succeeded',last_imported_count=$2,last_error=null,updated_at=now() where id=$1`,[source.id,created])
      return syncRunFromRow(finished.rows[0])
    }catch(error){const message=error instanceof Error?error.message:'Falha de sincronização';await pool.query(`update integration_source_sync_runs set finished_at=now(),status='failed',errors=1,error_summary=$2 where id=$1`,[run.id,message]).catch(()=>undefined);await pool.query(`update integration_sources set last_sync_at=now(),next_sync_at=now()+(sync_frequency_minutes::text||' minutes')::interval,last_status='failed',last_error=$2,updated_at=now() where id=$1`,[source.id,message]).catch(()=>undefined);throw error}
  },
  async syncDue(){const {rows}=await getPool().query(`select id from integration_sources where enabled=true and (next_sync_at is null or next_sync_at<=now()) order by next_sync_at nulls first limit 10`);const results=[];for(const row of rows){try{results.push({sourceId:row.id,ok:true,run:await this.syncSource(row.id)})}catch(error){results.push({sourceId:row.id,ok:false,error:error instanceof Error?error.message:String(error)})}}return results},
  async listSyncRuns({sourceId,limit=20}={}){const values=[],where=sourceId?(values.push(sourceId),'where source_id=$1'):'';values.push(Math.min(100,Math.max(1,Number(limit)||20)));const {rows}=await getPool().query(`select * from integration_source_sync_runs ${where} order by started_at desc limit $${values.length}`,values);return rows.map(syncRunFromRow)},
  async listCandidates({status,provider,limit=100,offset=0}={}){const clauses=[],values=[];if(status){if(!STATUSES.has(status))throw new HttpError(400,'Status de candidato inválido.','EDITORIAL_CANDIDATE_STATUS_INVALID');values.push(status);clauses.push(`status=$${values.length}`)}if(provider){values.push(provider);clauses.push(`provider=$${values.length}`)}values.push(Math.min(200,Math.max(1,Number(limit)||100)));const limitParam=values.length;values.push(Math.max(0,Number(offset)||0));const {rows}=await getPool().query(`select * from content_import_candidates ${clauses.length?`where ${clauses.join(' and ')}`:''} order by case status when 'new' then 0 when 'reviewing' then 1 when 'approved' then 2 else 3 end,relevance_score desc,published_at desc nulls last,discovered_at desc limit $${limitParam} offset $${values.length}`,values);return rows.map(candidateFromRow)},
  async getCandidate(id){const {rows}=await getPool().query('select * from content_import_candidates where id=$1',[id]);if(!rows[0])throw new HttpError(404,'Candidato editorial não encontrado.','EDITORIAL_CANDIDATE_NOT_FOUND');return candidateFromRow(rows[0])},
  async setCandidateStatus(id,status,actor){
    if(!STATUSES.has(status)||status==='converted')throw new HttpError(400,'Transição editorial inválida.','EDITORIAL_CANDIDATE_STATUS_INVALID')
    const current=await this.getCandidate(id);if(current.status==='converted')throw new HttpError(409,'Candidato já convertido em conteúdo.','EDITORIAL_CANDIDATE_ALREADY_CONVERTED')
    const allowed={reviewing:new Set(['new']),approved:new Set(['new','reviewing','rejected']),rejected:new Set(['new','reviewing','approved']),ignored:new Set(['new','reviewing','approved','rejected'])}
    if(!allowed[status]?.has(current.status))throw new HttpError(409,'Transição de status não permitida.','EDITORIAL_CANDIDATE_TRANSITION_INVALID',{from:current.status,to:status})
    const reviewer=clean(actor?.user?.id)||null,{rows}=await getPool().query('update content_import_candidates set status=$2,reviewed_at=now(),reviewed_by=$3,updated_at=now() where id=$1 returning *',[id,status,reviewer]);return candidateFromRow(rows[0])
  },
  async convertCandidate(id,{pageId,author}={},actor){
    const candidate=await this.getCandidate(id);if(candidate.status!=='approved')throw new HttpError(409,'Apenas candidatos aprovados podem ser convertidos.','EDITORIAL_CANDIDATE_NOT_APPROVED');if(candidate.editorialContentId)throw new HttpError(409,'Candidato já possui conteúdo editorial associado.','EDITORIAL_CANDIDATE_ALREADY_CONVERTED')
    const targetPage=clean(pageId);if(!targetPage)throw new HttpError(400,'Página editorial de destino é obrigatória.','EDITORIAL_CANDIDATE_PAGE_REQUIRED')
    const slug=`${normalizeSlug(candidate.title)}-${candidate.id.slice(0,8)}`,sourceReference={provider:candidate.provider,sourceName:candidate.sourceName,url:candidate.canonicalUrl,externalId:candidate.externalId||null,candidateId:candidate.id}
    const created=await editorialService.createContent({pageId:targetPage,title:candidate.title,slug,summary:candidate.description,body:[],author:clean(author)||clean(actor?.user?.displayName)||clean(actor?.user?.email),status:'draft',active:false,tags:candidate.suggestedTags,media:[],seo:{noIndex:true,sourceReference}})
    try{const {rows}=await getPool().query(`update content_import_candidates set status='converted',reviewed_at=coalesce(reviewed_at,now()),reviewed_by=coalesce(reviewed_by,$2),editorial_content_id=$3,updated_at=now() where id=$1 and status='approved' and editorial_content_id is null returning *`,[id,clean(actor?.user?.id)||null,created.id]);if(!rows[0])throw new HttpError(409,'Candidato foi alterado durante a conversão.','EDITORIAL_CANDIDATE_CONVERSION_CONFLICT');return {candidate:candidateFromRow(rows[0]),content:created}}catch(error){await editorialService.deleteContent(created.id).catch(()=>undefined);throw error}
  },
  async ingestForTest(sourceId,items){const source=await this.getSource(sourceId),results=[];for(const raw of items){const item=normalizedItem(source,raw);results.push(await insertCandidate(getPool(),item))}return results},
}
