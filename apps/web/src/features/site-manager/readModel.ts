import { editorialReadModel } from '../editorial/repository'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'

export type SiteCategorySummary = { name:string; contentCount:number }
export type SiteMediaItem = { id:string; type:string; name:string; url:string; size:number; createdAt:string; alt?:string; caption?:string }

function buildCategories(): SiteCategorySummary[] {
  const tagMap=new Map<string,number>()
  editorialReadModel.contents.forEach(content=>content.tags.forEach(tag=>tagMap.set(tag,(tagMap.get(tag)||0)+1)))
  return [...tagMap.entries()].map(([name,contentCount])=>({name,contentCount})).sort((a,b)=>b.contentCount-a.contentCount||a.name.localeCompare(b.name,'pt-BR'))
}

function buildMedia():SiteMediaItem[]{
  return getRuntimeDataProvider().editorial.media().map(item=>({...item}))
    .sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
}

export const siteManagerReadModel = {
  get pages(){return editorialReadModel.pages},
  get contents(){return editorialReadModel.contents},
  get categories(){return buildCategories()},
  get media(){return buildMedia()},
  get publishedContents(){return editorialReadModel.contents.filter(content=>content.status==='published'&&content.active)},
  get menuPages(){return editorialReadModel.pages.filter(page=>page.showInMainMenu)},
  getPageById(id:string){return editorialReadModel.getPageById(id)},
  countContents(pageId:string){return editorialReadModel.countContents(pageId)},
}
