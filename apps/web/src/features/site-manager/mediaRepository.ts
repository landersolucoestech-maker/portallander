import { siteManagerReadModel, type SiteMediaItem } from './readModel'

export class MediaPersistenceUnavailableError extends Error {
  constructor(){
    super('Biblioteca de mídia indisponível para escrita: nenhum storage persistente foi configurado.')
    this.name='MediaPersistenceUnavailableError'
  }
}

export type MediaUploadInput = {
  file: File
  alt?: string
  caption?: string
}

export interface MediaRepository {
  list(): Promise<readonly SiteMediaItem[]>
  upload(input:MediaUploadInput): Promise<SiteMediaItem>
  remove(id:string): Promise<void>
}

export class ReadOnlyMediaRepository implements MediaRepository {
  async list(){return siteManagerReadModel.media.map(item=>({...item}))}
  async upload():Promise<SiteMediaItem>{throw new MediaPersistenceUnavailableError()}
  async remove():Promise<void>{throw new MediaPersistenceUnavailableError()}
}

export const mediaRepository: MediaRepository = new ReadOnlyMediaRepository()
