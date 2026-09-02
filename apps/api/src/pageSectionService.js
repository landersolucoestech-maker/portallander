import {randomUUID} from 'node:crypto'
import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const text=value=>typeof value==='string'?value.trim():''
const slug=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

export function normalizePageSections(input){
  if(!Array.isArray(input))throw new HttpError(400,'A composição de seções deve ser uma lista.','PAGE_SECTIONS_INVALID')
  const seen=new Set()
  return input.map((value,index)=>{
    if(!value||typeof value!=='object')throw new HttpError(400,`Seção inválida na posição ${index+1}.`,'PAGE_SECTION_INVALID')
    const name=text(value.name)
    const cleanSlug=slug(value.slug||name)
    if(!name)throw new HttpError(400,`Informe o nome da seção na posição ${index+1}.`,'PAGE_SECTION_NAME_REQUIRED')
    if(!cleanSlug)throw new HttpError(400,`Informe um identificador válido para a seção na posição ${index+1}.`,'PAGE_SECTION_SLUG_REQUIRED')
    if(seen.has(cleanSlug))throw new HttpError(409,`A seção “${cleanSlug}” está duplicada.`,'PAGE_SECTION_SLUG_DUPLICATE')
    seen.add(cleanSlug)
    return {id:text(value.id)||`section-${randomUUID()}`,name,slug:cleanSlug,order:index}
  })
}

async function resolveOwner(pool,pageKey){
  if(pageKey==='home')return {pageKey:'home',pageId:null}
  const {rows}=await pool.query('select id,page_type from editorial_pages where id=$1 limit 1',[pageKey])
  const page=rows[0]
  if(!page)throw new HttpError(404,'Página não encontrada.','PAGE_NOT_FOUND')
  if(page.page_type==='editorial')throw new HttpError(409,'Páginas editoriais herdam o template de Notícias e não aceitam composição própria.','EDITORIAL_PAGE_SECTIONS_INHERITED')
  return {pageKey:page.id,pageId:page.id}
}

const mapRow=row=>({id:row.id,name:row.name,slug:row.slug})

export const pageSectionService={
  async list(pageKey){
    const pool=getPool()
    await resolveOwner(pool,pageKey)
    const {rows}=await pool.query('select id,name,slug from editorial_page_sections where page_key=$1 order by sort_order asc,created_at asc',[pageKey])
    return rows.map(mapRow)
  },

  async replace(pageKey,input){
    const sections=normalizePageSections(input)
    const pool=getPool(),client=await pool.connect()
    try{
      await client.query('begin')
      const owner=await resolveOwner(client,pageKey)
      await client.query('select pg_advisory_xact_lock(hashtext($1))',[`page-sections:${owner.pageKey}`])
      await client.query('delete from editorial_page_sections where page_key=$1',[owner.pageKey])
      for(const section of sections){
        await client.query(
          'insert into editorial_page_sections(id,page_key,page_id,name,slug,sort_order) values($1,$2,$3,$4,$5,$6)',
          [section.id,owner.pageKey,owner.pageId,section.name,section.slug,section.order],
        )
      }
      await client.query('commit')
      return sections.map(({order,...section})=>section)
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}
    finally{client.release()}
  },
}
