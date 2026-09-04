import {getPool} from './db.js'

const asObject=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const asArray=value=>Array.isArray(value)?value:[]

export const formPublicService={
  async listPublished(){
    const {rows}=await getPool().query(`
      select f.key,f.name,f.slug,f.purpose,f.status,f.source,
             v.version,v.fields,v.consents,v.routing,v.success_message,v.definition_meta
      from site_forms f
      join lateral (
        select * from site_form_versions x
        where x.form_id=f.id and x.published_at is not null
        order by x.version desc
        limit 1
      ) v on true
      order by f.name asc`)
    return rows.map(row=>{
      const meta=asObject(row.definition_meta)
      return {
        id:String(row.key),
        name:String(meta.name||row.name),
        slug:String(meta.slug||row.slug),
        version:Number(row.version),
        purpose:String(meta.purpose||row.purpose),
        status:String(row.status),
        source:String(meta.source||row.source),
        fields:asArray(row.fields),
        consents:asArray(row.consents),
        routing:asObject(row.routing),
        successMessage:String(row.success_message||''),
        appearance:asObject(meta.appearance),
      }
    })
  },
}
