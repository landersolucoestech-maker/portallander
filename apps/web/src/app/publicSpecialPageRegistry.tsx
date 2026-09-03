import type {ReactNode} from 'react'
import {SPECIAL_LAYOUT_PAGE_SLUGS,type EditorialPage} from '../features/editorial/model'
import {LazyColaborePage,LazyContatoPage,LazySobrePage} from './PublicSpecialPageRenderers'

type SpecialPageRenderer=(page:EditorialPage)=>ReactNode

const SPECIAL_PAGE_RENDERERS:Readonly<Record<string,SpecialPageRenderer>>={
  sobre:page=><LazySobrePage page={page}/>,
  colabore:()=> <LazyColaborePage/>,
  contato:page=><LazyContatoPage page={page}/>,
}

for(const slug of SPECIAL_LAYOUT_PAGE_SLUGS){
  if(!SPECIAL_PAGE_RENDERERS[slug])throw new Error(`Página especial sem renderer público: ${slug}`)
}

export const PUBLIC_SPECIAL_PAGE_SLUGS=Object.freeze([...SPECIAL_LAYOUT_PAGE_SLUGS])

export function renderPublicSpecialPage(page:EditorialPage):ReactNode|null{
  if(!SPECIAL_LAYOUT_PAGE_SLUGS.has(page.slug))return null
  return SPECIAL_PAGE_RENDERERS[page.slug]?.(page)??null
}
