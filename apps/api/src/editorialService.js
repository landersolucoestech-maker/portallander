import {getPool,withTransaction} from './db.js'

export class HttpError extends Error{
  constructor(status,message,code='API_ERROR',details){super(message);this.name='HttpError';this.status=status;this.code=code;this.details=details}
}

const PAGE_TYPES=new Set(['editorial','institutional','special'])
const STATUSES=new Set(['draft','published','archived'])
const VISIBILITIES=new Set(['public','private'])
const SPECIAL_SLUGS=new Set(['sobre','colabore','contato'])

export const normalizeSlug=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[“”"'’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

function ensure(condition,status,message,code,details){if(!condition)throw new HttpError(status,message,code,details)}
function iso(value){return value instanceof Date?value.toISOString():value?new Date(value).toISOString():undefined}

export function pageFromRow(row){return {id:row.id,title:row.title,navigationLabel:row.navigation_label,slug:row.slug,description:row.description,coverImage:row.cover_image||undefined,type:row.page_type,status:row.status,active:row.active,visibility:row.visibility,showInMainMenu:row.show_in_main_menu,menuOrder:row.menu_order,order:row.sort_order,parentId:row.parent_id,seo:row.seo??{},createdAt:iso(row.created_at),updatedAt:iso(row.updated_at),publishedAt:iso(row.published_at)}}
export function contentFromRow(row){return {id:row.id,pageId:row.page_id,title:row.title,slug:row.slug,subtitle:row.subtitle||undefined,summary:row.summary,body:Array.isArray(row.body)?row.body:[],coverImage:row.cover_image||undefined,coverImageAlt:row.cover_image_alt||undefined,author:row.author,status:row.status,active:row.active,tags:Array.isArray(row.tags)?row.tags:[],media:Array.isArray(row.media)?row.media:[],seo:row.seo??{},createdAt:iso(row.created_at),updatedAt:iso(row.updated_at),publishedAt:iso(row.published_at)}}

function normalizePage(input,existing={}){
  const value={...existing,...input}
  const slug=normalizeSlug(value.slug||value.title)
  ensure(value.title&&String(value.title).trim(),400,'Título da página é obrigatório.','PAGE_TITLE_REQUIRED')
  ensure(slug,400,'Slug da página é obrigatório.','PAGE_SLUG_REQUIRED')
  const type=value.type??'editorial'
  ensure(PAGE_TYPES.has(type),400,'Tipo de página inválido.','PAGE_TYPE_INVALID')
  if(SPECIAL_SLUGS.has(slug))ensure(type!=='editorial',400,'Este slug pertence a uma página de layout especial.','PAGE_SPECIAL_LAYOUT_REQUIRED')
  else ensure(type==='editorial',400,'Somente Sobre, Colabore e Contato podem usar layout não editorial.','PAGE_LAYOUT_CLASSIFICATION_INVALID')
  const status=value.status??'draft',visibility=value.visibility??'private'
  ensure(STATUSES.has(status),400,'Status de página inválido.','PAGE_STATUS_INVALID')
  ensure(VISIBILITIES.has(visibility),400,'Visibilidade inválida.','PAGE_VISIBILITY_INVALID')
  const published=status==='published'
  return {...value,title:String(value.title).trim(),navigationLabel:String(value.navigationLabel||value.title).trim(),slug,description:String(value.description??''),type,status,visibility:published?'public':visibility,active:published?true:Boolean(value.active),showInMainMenu:Boolean(value.showInMainMenu),menuOrder:Number(value.menuOrder)||0,order:Number(value.order)||0,parentId:value.parentId||null,seo:value.seo&&typeof value.seo==='object'?value.seo:{},publishedAt:published?(value.publishedAt||new Date().toISOString()):undefined}
}

function normalizeContent(input,existing={}){
  const value={...existing,...input}
  ensure(value.pageId,400,'Página do conteúdo é obrigatória.','CONTENT_PAGE_REQUIRED')
  ensure(value.title&&String(value.title).trim(),400,'Título do conteúdo é obrigatório.','CONTENT_TITLE_REQUIRED')
  const slug=normalizeSlug(value.slug||value.title)
  ensure(slug,400,'Slug do conteúdo é obrigatório.','CONTENT_SLUG_REQUIRED')
  const status=value.status??'draft'
  ensure(STATUSES.has(status),400,'Status de conteúdo inválido.','CONTENT_STATUS_INVALID')
  const published=status==='published'
  return {...value,pageId:String(value.pageId),title:String(value.title).trim(),slug,subtitle:value.subtitle?String(value.subtitle):undefined,summary:String(value.summary??''),body:Array.isArray(value.body)?value.body:[],author:String(value.author??''),status,active:published?true:Boolean(value.active),tags:Array.isArray(value.tags)?value.tags.map(String):[],media:Array.isArray(value.media)?value.media:[],seo:value.seo&&typeof value.seo==='object'?value.seo:{},publishedAt:published?(value.publishedAt||new Date().toISOString()):undefined}
}

function translateDatabaseError(error){
  if(error instanceof HttpError)return error
  if(error?.code==='23505')return new HttpError(409,'Já existe um registro com este slug.','SLUG_CONFLICT')
  if(error?.code==='23503')return new HttpError(409,'A operação viola uma dependência existente.','DEPENDENCY_CONFLICT')
  if(error?.code==='23514')return new HttpError(400,'Os dados violam uma regra de integridade.','INTEGRITY_CONSTRAINT')
  return error
}

export const editorialService={
  async listPages({publicOnly=false}={}){
    const where=publicOnly?"where status='published' and active=true and visibility='public'":''
    const {rows}=await getPool().query(`select * from editorial_pages ${where} order by sort_order asc, menu_order asc, title asc`)
    return rows.map(pageFromRow)
  },
  async listContents({pageId,publicOnly=false}={}){
    const clauses=[],values=[]
    if(pageId){values.push(pageId);clauses.push(`page_id=$${values.length}`)}
    if(publicOnly)clauses.push("status='published' and active=true")
    const where=clauses.length?`where ${clauses.join(' and ')}`:''
    const {rows}=await getPool().query(`select * from editorial_contents ${where} order by published_at desc nulls last, updated_at desc`,values)
    return rows.map(contentFromRow)
  },
  async getPage(id){const {rows}=await getPool().query('select * from editorial_pages where id=$1',[id]);return rows[0]?pageFromRow(rows[0]):null},
  async getContent(id){const {rows}=await getPool().query('select * from editorial_contents where id=$1',[id]);return rows[0]?contentFromRow(rows[0]):null},
  async createPage(input){
    const value=normalizePage(input)
    try{const {rows}=await getPool().query(`insert into editorial_pages(id,title,navigation_label,slug,description,cover_image,page_type,status,active,visibility,show_in_main_menu,menu_order,sort_order,parent_id,seo,published_at) values(coalesce($1,gen_random_uuid()::text),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning *`,[value.id||null,value.title,value.navigationLabel,value.slug,value.description,value.coverImage||null,value.type,value.status,value.active,value.visibility,value.showInMainMenu,value.menuOrder,value.order,value.parentId,JSON.stringify(value.seo),value.publishedAt||null]);return pageFromRow(rows[0])}catch(error){throw translateDatabaseError(error)}
  },
  async updatePage(id,input){
    const existing=await this.getPage(id);ensure(existing,404,'Página não encontrada.','PAGE_NOT_FOUND')
    const value=normalizePage(input,existing)
    try{const {rows}=await getPool().query(`update editorial_pages set title=$2,navigation_label=$3,slug=$4,description=$5,cover_image=$6,page_type=$7,status=$8,active=$9,visibility=$10,show_in_main_menu=$11,menu_order=$12,sort_order=$13,parent_id=$14,seo=$15,published_at=$16 where id=$1 returning *`,[id,value.title,value.navigationLabel,value.slug,value.description,value.coverImage||null,value.type,value.status,value.active,value.visibility,value.showInMainMenu,value.menuOrder,value.order,value.parentId,JSON.stringify(value.seo),value.publishedAt||null]);return pageFromRow(rows[0])}catch(error){throw translateDatabaseError(error)}
  },
  async deletePage(id){
    return withTransaction(async client=>{const found=await client.query('select id from editorial_pages where id=$1 for update',[id]);ensure(found.rowCount,404,'Página não encontrada.','PAGE_NOT_FOUND');const dependent=await client.query('select count(*)::int as count from editorial_contents where page_id=$1',[id]);const count=dependent.rows[0]?.count??0;ensure(count===0,409,'A página possui conteúdos vinculados e não pode ser excluída até que essas dependências sejam tratadas.','PAGE_HAS_CONTENTS',{contentCount:count});await client.query('delete from editorial_pages where id=$1',[id])})
  },
  async createContent(input){
    const value=normalizeContent(input)
    const page=await this.getPage(value.pageId);ensure(page,400,'Página editorial de destino não existe.','CONTENT_PAGE_NOT_FOUND');ensure(page.type==='editorial',400,'Conteúdo só pode ser associado a uma página editorial.','CONTENT_PAGE_NOT_EDITORIAL')
    try{const {rows}=await getPool().query(`insert into editorial_contents(id,page_id,title,slug,subtitle,summary,body,cover_image,cover_image_alt,author,status,active,tags,media,seo,published_at) values(coalesce($1,gen_random_uuid()::text),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning *`,[value.id||null,value.pageId,value.title,value.slug,value.subtitle||null,value.summary,JSON.stringify(value.body),value.coverImage||null,value.coverImageAlt||null,value.author,value.status,value.active,value.tags,JSON.stringify(value.media),JSON.stringify(value.seo),value.publishedAt||null]);return contentFromRow(rows[0])}catch(error){throw translateDatabaseError(error)}
  },
  async updateContent(id,input){
    const existing=await this.getContent(id);ensure(existing,404,'Conteúdo não encontrado.','CONTENT_NOT_FOUND')
    const value=normalizeContent(input,existing),page=await this.getPage(value.pageId);ensure(page&&page.type==='editorial',400,'Página editorial de destino inválida.','CONTENT_PAGE_NOT_EDITORIAL')
    try{const {rows}=await getPool().query(`update editorial_contents set page_id=$2,title=$3,slug=$4,subtitle=$5,summary=$6,body=$7,cover_image=$8,cover_image_alt=$9,author=$10,status=$11,active=$12,tags=$13,media=$14,seo=$15,published_at=$16 where id=$1 returning *`,[id,value.pageId,value.title,value.slug,value.subtitle||null,value.summary,JSON.stringify(value.body),value.coverImage||null,value.coverImageAlt||null,value.author,value.status,value.active,value.tags,JSON.stringify(value.media),JSON.stringify(value.seo),value.publishedAt||null]);return contentFromRow(rows[0])}catch(error){throw translateDatabaseError(error)}
  },
  async deleteContent(id){const result=await getPool().query('delete from editorial_contents where id=$1',[id]);ensure(result.rowCount,404,'Conteúdo não encontrado.','CONTENT_NOT_FOUND')},
}
