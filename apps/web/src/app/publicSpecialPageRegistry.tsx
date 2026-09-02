import type {ReactNode} from 'react'
import type {EditorialPage} from '../features/editorial/model'
import {ColaborePage} from '../pages/colabore/ColaborePage'
import {ContatoPage} from '../pages/contato/ContatoPage'
import {SobrePage} from '../pages/sobre/SobrePage'

type SpecialPageRenderer=(page:EditorialPage)=>ReactNode

const SPECIAL_PAGE_RENDERERS:Readonly<Record<string,SpecialPageRenderer>>={
  sobre:page=><SobrePage page={page}/>,
  colabore:()=> <ColaborePage/>,
  contato:page=><ContatoPage page={page}/>,
}

export const PUBLIC_SPECIAL_PAGE_SLUGS=Object.freeze(Object.keys(SPECIAL_PAGE_RENDERERS))

export function renderPublicSpecialPage(page:EditorialPage):ReactNode|null{
  if(page.type==='editorial')return null
  return SPECIAL_PAGE_RENDERERS[page.slug]?.(page)??null
}
