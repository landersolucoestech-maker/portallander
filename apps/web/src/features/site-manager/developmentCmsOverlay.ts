import type {EditorialContent,EditorialPage} from '../editorial/model'
import type {ApplicationDataProvider} from '../../shared/data/dataProvider'
import {contentDraftRepository} from './contentDraftRepository'
import {sitePageRepository,type SitePageDraft} from './pageRepository'

const clone=<T>(value:T):T=>structuredClone(value)
const nowIso=()=>new Date().toISOString()

const previewPage=(draft:SitePageDraft):EditorialPage=>({
  id:draft.id,
  title:draft.title,
  navigationLabel:draft.title,
  slug:draft.slug,
  description:'',
  type:'editorial',
  status:'published',
  active:true,
  visibility:'public',
  showInMainMenu:true,
  menuOrder:999,
  order:999,
  parentId:null,
  seo:{noIndex:true},
  createdAt:draft.createdAt??nowIso(),
  updatedAt:draft.updatedAt??nowIso(),
  publishedAt:draft.updatedAt??nowIso(),
})

const previewContent=(content:EditorialContent):EditorialContent=>({
  ...clone(content),
  status:'published',
  active:true,
  publishedAt:content.publishedAt??content.updatedAt??nowIso(),
  seo:{...content.seo,noIndex:true},
})

export function withDevelopmentCmsOverrides(base:ApplicationDataProvider):ApplicationDataProvider{
  const hiddenPageIds=new Set(sitePageRepository.listHiddenPageIds())
  const pageDrafts=sitePageRepository.listDraftPages()
  const pageOverrides=new Map(pageDrafts.filter(page=>page.overridesSystem).map(page=>[page.id,page]))
  const basePages=base.editorial.pages()
  const basePageIds=new Set(basePages.map(page=>page.id))
  const pages:EditorialPage[]=[
    ...basePages.filter(page=>!hiddenPageIds.has(page.id)).map(page=>{
      const override=pageOverrides.get(page.id)
      return override?{...clone(page),title:override.title,navigationLabel:override.title,slug:override.slug,updatedAt:override.updatedAt??page.updatedAt}:clone(page)
    }),
    ...pageDrafts.filter(page=>!page.overridesSystem&&!basePageIds.has(page.id)&&!hiddenPageIds.has(page.id)).map(previewPage),
  ]

  const visiblePageIds=new Set(pages.map(page=>page.id))
  const contents=contentDraftRepository.listEffective(base.editorial.contents()).filter(content=>visiblePageIds.has(content.pageId)).map(previewContent)

  return {
    ...base,
    editorial:{...base.editorial,pages:()=>clone(pages),contents:()=>clone(contents)},
  }
}
