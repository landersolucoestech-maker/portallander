import {adminApiBase} from '../access/authClient'
import {siteManagerReadModel,type SiteMediaItem} from './readModel'

export class MediaPersistenceUnavailableError extends Error {
  constructor(){
    super('Biblioteca de mídia indisponível para escrita: a API administrativa não está configurada.')
    this.name='MediaPersistenceUnavailableError'
  }
}

export type MediaUploadInput={file:File;alt?:string;caption?:string}

export interface MediaRepository{
  list():Promise<readonly SiteMediaItem[]>
  upload(input:MediaUploadInput):Promise<SiteMediaItem>
  remove(id:string):Promise<void>
}

type ApiErrorBody={message?:string;code?:string}

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new MediaPersistenceUnavailableError()
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...init.headers}})
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new Error(body.message||`A API de mídia respondeu ${response.status}.`)
  return body
}

class ApiMediaRepository implements MediaRepository{
  async list(){const result=await request<{media:SiteMediaItem[]}>('/api/editorial/media');return result.media}
  async upload(input:MediaUploadInput){
    const data=new FormData()
    data.append('file',input.file)
    if(input.alt)data.append('alt',input.alt)
    if(input.caption)data.append('caption',input.caption)
    const result=await request<{media:SiteMediaItem}>('/api/editorial/media',{method:'POST',body:data})
    return result.media
  }
  async remove(id:string){await request(`/api/editorial/media/${encodeURIComponent(id)}`,{method:'DELETE'})}
}

class ReadOnlyMediaRepository implements MediaRepository{
  async list(){return siteManagerReadModel.media.map(item=>({...item}))}
  async upload():Promise<SiteMediaItem>{throw new MediaPersistenceUnavailableError()}
  async remove():Promise<void>{throw new MediaPersistenceUnavailableError()}
}

export const mediaRepository:MediaRepository=adminApiBase()?new ApiMediaRepository():new ReadOnlyMediaRepository()
export const isMediaPersistenceConfigured=()=>Boolean(adminApiBase())
