import {getPool} from './db.js'
import {HttpError} from './editorialService.js'
import {removePublicMediaObject,storePublicMediaObject} from './storage.js'

const mapRow=row=>({
  id:row.id,
  type:row.mime_type,
  name:row.name,
  url:row.public_url,
  size:Number(row.size_bytes),
  alt:row.alt_text||'',
  caption:row.caption||'',
  createdAt:new Date(row.created_at).toISOString(),
})

export const mediaService={
  async list(){
    const {rows}=await getPool().query('select id,storage_key,name,mime_type,size_bytes,public_url,alt_text,caption,created_at from editorial_media order by created_at desc')
    return rows.map(mapRow)
  },

  async upload({file,alt='',caption='',createdBy=null}){
    if(!file)throw new HttpError(400,'Selecione um arquivo para enviar.','MEDIA_FILE_REQUIRED')
    const stored=await storePublicMediaObject(file)
    try{
      const {rows}=await getPool().query(
        `insert into editorial_media(storage_key,name,mime_type,size_bytes,public_url,alt_text,caption,created_by)
         values($1,$2,$3,$4,$5,$6,$7,$8)
         returning id,storage_key,name,mime_type,size_bytes,public_url,alt_text,caption,created_at`,
        [stored.storageKey,stored.originalName,stored.mimeType,stored.sizeBytes,stored.publicUrl,String(alt||'').trim(),String(caption||'').trim(),createdBy],
      )
      return mapRow(rows[0])
    }catch(error){
      await removePublicMediaObject(stored.storageKey).catch(()=>undefined)
      throw error
    }
  },

  async remove(id){
    const pool=getPool()
    const {rows}=await pool.query('select id,storage_key from editorial_media where id=$1',[id])
    const item=rows[0]
    if(!item)throw new HttpError(404,'Mídia não encontrada.','MEDIA_NOT_FOUND')
    await removePublicMediaObject(item.storage_key)
    await pool.query('delete from editorial_media where id=$1',[id])
  },
}
