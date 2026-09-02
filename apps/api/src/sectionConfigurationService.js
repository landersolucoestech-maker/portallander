import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const MAX_CONFIGURATION_BYTES=512*1024
const text=value=>typeof value==='string'?value.trim():''
const slug=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

export function normalizeSectionConfiguration(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'A configuração da seção deve ser um objeto JSON.','SECTION_CONFIGURATION_INVALID')
  let serialized=''
  try{serialized=JSON.stringify(input)}catch{throw new HttpError(400,'A configuração da seção não é serializável.','SECTION_CONFIGURATION_NOT_SERIALIZABLE')}
  if(Buffer.byteLength(serialized,'utf8')>MAX_CONFIGURATION_BYTES)throw new HttpError(413,'A configuração da seção excede o limite permitido.','SECTION_CONFIGURATION_TOO_LARGE')
  return JSON.parse(serialized)
}

function normalizeSectionSlug(value){
  const clean=slug(value)
  if(!clean)throw new HttpError(400,'Informe um identificador válido para a seção.','SECTION_CONFIGURATION_SLUG_REQUIRED')
  return clean
}

async function resolveOwner(pool,pageKey,{publicOnly=false}={}){
  if(pageKey==='home')return {pageKey:'home'}
  const {rows}=await pool.query('select id,status,active,visibility from editorial_pages where id=$1 limit 1',[pageKey])
  const page=rows[0]
  if(!page)throw new HttpError(404,'Página não encontrada.','PAGE_NOT_FOUND')
  if(publicOnly&&(page.status!=='published'||page.active!==true||page.visibility!=='public'))throw new HttpError(404,'Página pública não encontrada.','PAGE_NOT_FOUND')
  return {pageKey:page.id}
}

const mapRows=rows=>Object.fromEntries(rows.map(row=>[row.section_slug,row.configuration||{}]))

export const sectionConfigurationService={
  async list(pageKey,{publicOnly=false}={}){
    const pool=getPool()
    const owner=await resolveOwner(pool,pageKey,{publicOnly})
    const {rows}=await pool.query('select section_slug,configuration from editorial_section_configurations where page_key=$1 order by section_slug asc',[owner.pageKey])
    return mapRows(rows)
  },

  async get(pageKey,sectionSlug,{publicOnly=false}={}){
    const pool=getPool()
    const owner=await resolveOwner(pool,pageKey,{publicOnly})
    const cleanSlug=normalizeSectionSlug(sectionSlug)
    const {rows}=await pool.query('select configuration from editorial_section_configurations where page_key=$1 and section_slug=$2 limit 1',[owner.pageKey,cleanSlug])
    return rows[0]?.configuration||null
  },

  async save(pageKey,sectionSlug,input){
    const configuration=normalizeSectionConfiguration(input)
    const cleanSlug=normalizeSectionSlug(sectionSlug)
    const pool=getPool(),client=await pool.connect()
    try{
      await client.query('begin')
      const owner=await resolveOwner(client,pageKey)
      await client.query('select pg_advisory_xact_lock(hashtext($1))',[`section-config:${owner.pageKey}:${cleanSlug}`])
      const {rows}=await client.query(
        `insert into editorial_section_configurations(page_key,section_slug,configuration)
         values($1,$2,$3::jsonb)
         on conflict(page_key,section_slug) do update
         set configuration=excluded.configuration,updated_at=now()
         returning configuration`,
        [owner.pageKey,cleanSlug,JSON.stringify(configuration)],
      )
      await client.query('commit')
      return rows[0].configuration
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}
    finally{client.release()}
  },
}
