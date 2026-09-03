import {lazy,Suspense,type ReactNode} from 'react'
import {SPECIAL_LAYOUT_PAGE_SLUGS,type EditorialPage} from '../features/editorial/model'

const SobrePage=lazy(()=>import('../pages/sobre/SobrePage').then(module=>({default:module.SobrePage})))
const ColaborePage=lazy(()=>import('../pages/colabore/ColaborePage').then(module=>({default:module.ColaborePage})))
const ContatoPage=lazy(()=>import('../pages/contato/ContatoPage').then(module=>({default:module.ContatoPage})))

type SpecialPageRenderer=(page:EditorialPage)=>ReactNode
const lazyPage=(node:ReactNode)=><Suspense fallback={null}>{node}</Suspense>

const SPECIAL_PAGE_RENDERERS:Readonly<Record<string,SpecialPageRenderer>>={
  sobre:page=>lazyPage(<SobrePage page={page}/>),
  colabore:()=>lazyPage(<ColaborePage/>),
  contato:page=>lazyPage(<ContatoPage page={page}/>),
}

for(const slug of SPECIAL_LAYOUT_PAGE_SLUGS){
  if(!SPECIAL_PAGE_RENDERERS[slug])throw new Error(`Página especial sem renderer público: ${slug}`)
}

export const PUBLIC_SPECIAL_PAGE_SLUGS=Object.freeze([...SPECIAL_LAYOUT_PAGE_SLUGS])

export function renderPublicSpecialPage(page:EditorialPage):ReactNode|null{
  if(!SPECIAL_LAYOUT_PAGE_SLUGS.has(page.slug))return null
  return SPECIAL_PAGE_RENDERERS[page.slug]?.(page)??null
}
