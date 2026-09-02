import type {PublicEditorialSnapshot} from '../../features/editorial/apiClient'
import type {ApplicationDataProvider} from './dataProvider'

const clone=<T>(value:T):T=>structuredClone(value)

export function withEditorialSnapshot(base:ApplicationDataProvider,snapshot:PublicEditorialSnapshot):ApplicationDataProvider{
  const basePages=base.editorial.pages()
  const apiPageSlugs=new Set(snapshot.pages.map(page=>page.slug))
  const replacedBasePageIds=new Set(basePages.filter(page=>apiPageSlugs.has(page.slug)).map(page=>page.id))
  const mergedPages=[...basePages.filter(page=>!apiPageSlugs.has(page.slug)),...snapshot.pages]
  const apiContentKeys=new Set(snapshot.contents.map(content=>`${content.pageId}:${content.slug}`))
  const mergedContents=[
    ...base.editorial.contents().filter(content=>!replacedBasePageIds.has(content.pageId)&&!apiContentKeys.has(`${content.pageId}:${content.slug}`)),
    ...snapshot.contents,
  ]

  return {
    ...base,
    kind:'api',
    editorial:{
      ...base.editorial,
      pages:()=>clone(mergedPages),
      contents:()=>clone(mergedContents),
    },
  }
}
