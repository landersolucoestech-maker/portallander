import { editorialReadModel } from '../editorial/repository'

export type SiteCategorySummary = { name:string; contentCount:number }
export type SiteMediaItem = { id:string; content:string; type:'Capa'|'image'|'video'|'embed'; url:string; caption:string }

function buildCategories(): SiteCategorySummary[] {
  const tagMap=new Map<string,number>()
  editorialReadModel.contents.forEach(content=>content.tags.forEach(tag=>tagMap.set(tag,(tagMap.get(tag)||0)+1)))
  return [...tagMap.entries()].map(([name,contentCount])=>({name,contentCount})).sort((a,b)=>b.contentCount-a.contentCount||a.name.localeCompare(b.name,'pt-BR'))
}

function buildMedia(): SiteMediaItem[] {
  return editorialReadModel.contents.flatMap(content=>[
    ...(content.coverImage?[{id:`cover-${content.id}`,content:content.title,type:'Capa' as const,url:content.coverImage,caption:content.coverImageAlt||'Imagem de capa'}]:[]),
    ...content.media.map((media,index)=>({id:`media-${content.id}-${index}`,content:content.title,type:media.type,url:media.url,caption:media.caption||'—'})),
  ])
}

export const siteManagerReadModel = {
  get pages(){return editorialReadModel.pages},
  get contents(){return editorialReadModel.contents},
  get categories(){return buildCategories()},
  get media(){return buildMedia()},
  get publishedContents(){return editorialReadModel.contents.filter(content=>content.status==='published'&&content.active)},
  get menuPages(){return editorialReadModel.pages.filter(page=>page.showInMainMenu)},
}
