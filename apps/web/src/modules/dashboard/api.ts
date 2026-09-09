import { listAdminEditorialContents,listAdminEditorialPages } from '../editorial/adminClient'
import { editorialReadModel } from '../editorial/repository'
import type { EditorialContent,EditorialPage } from '../editorial/model'
import type { EditorialActivity, PortalDashboard, PortalDashboardItem } from './types'

const toItem=(content:(typeof editorialReadModel.contents)[number]):PortalDashboardItem=>{
  const page=editorialReadModel.getPageById(content.pageId)
  return {
    id:content.id,
    pageId:content.pageId,
    pageSlug:page?.slug??'',
    title:content.title,
    slug:content.slug,
    category:content.tags[0]??'Sem categoria',
    author:content.author,
    coverImage:content.coverImage,
    status:content.status,
    publishedAt:content.publishedAt,
    updatedAt:content.updatedAt,
  }
}

const toAdminActivity=(content:EditorialContent,pages:EditorialPage[]):EditorialActivity=>({
  id:`${content.id}:${content.publishedAt?'published':'updated'}`,
  action:content.publishedAt?'published':'updated',
  title:content.title,
  category:content.tags[0]??'Sem categoria',
  occurred_at:content.publishedAt??content.updatedAt,
  pageSlug:pages.find(page=>page.id===content.pageId)?.slug??'',
  slug:content.slug,
})

function sameMonth(raw:string|undefined,now:Date){
  if(!raw)return false
  const date=new Date(raw)
  return date.getUTCFullYear()===now.getUTCFullYear()&&date.getUTCMonth()===now.getUTCMonth()
}

export const dashboardApi={
  async getOperational():Promise<PortalDashboard>{
    const now=new Date()
    const contents=editorialReadModel.contents
    const published=contents.filter(item=>item.status==='published'&&item.active)
    const recentPublications=[...published].sort((a,b)=>(b.publishedAt??b.updatedAt).localeCompare(a.publishedAt??a.updatedAt)).slice(0,4).map(toItem)
    const recentUpdates=[...contents].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5).map(toItem)
    return {
      published_count:published.length,
      draft_count:contents.filter(item=>item.status==='draft').length,
      archived_count:contents.filter(item=>item.status==='archived').length,
      published_this_month:published.filter(item=>sameMonth(item.publishedAt,now)).length,
      category_count:new Set(contents.flatMap(item=>item.tags)).size,
      page_count:editorialReadModel.pages.length,
      recent_publications:recentPublications,
      recent_updates:recentUpdates,
      generated_at:now.toISOString(),
    }
  },
  async getActivity(limit:number):Promise<EditorialActivity[]>{
    return [...editorialReadModel.contents]
      .sort((a,b)=>(b.publishedAt??b.updatedAt).localeCompare(a.publishedAt??a.updatedAt))
      .slice(0,limit)
      .map(content=>({
        id:`${content.id}:${content.publishedAt?'published':'updated'}`,
        action:content.publishedAt?'published':'updated',
        title:content.title,
        category:content.tags[0]??'Sem categoria',
        occurred_at:content.publishedAt??content.updatedAt,
        pageSlug:editorialReadModel.getPageById(content.pageId)?.slug??'',
        slug:content.slug,
      }))
  },
  async getAdminActivity(limit:number):Promise<EditorialActivity[]>{
    const [contents,pages]=await Promise.all([listAdminEditorialContents(),listAdminEditorialPages()])
    return [...contents]
      .sort((a,b)=>(b.publishedAt??b.updatedAt).localeCompare(a.publishedAt??a.updatedAt))
      .slice(0,limit)
      .map(content=>toAdminActivity(content,pages))
  },
}
