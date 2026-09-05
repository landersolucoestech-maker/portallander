import { lazy, Suspense, useMemo, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { renderPublicSpecialPage } from './publicSpecialPageRegistry'
import { editorialReadModel } from '../features/editorial/repository'
import { PageContainer,PageSection,PageShell } from '../shared/public/PublicPageArchitecture'
import { PublicNotFound } from '../shared/public/PublicNotFound'

const InternalApp=lazy(()=>import('./InternalApp'))
const PublicHome=lazy(()=>import('../pages/home/PublicHome').then(module=>({default:module.PublicHome})))
const AnunciePage=lazy(()=>import('../pages/anuncie/AnunciePage').then(module=>({default:module.AnunciePage})))
const EditorialContentPage=lazy(()=>import('../features/editorial/components/EditorialContentPage').then(module=>({default:module.EditorialContentPage})))
const EditorialListingPage=lazy(()=>import('../features/editorial/components/EditorialListingPage').then(module=>({default:module.EditorialListingPage})))
const StructuredPublicPage=lazy(()=>import('../features/editorial/components/StructuredPublicPage').then(module=>({default:module.StructuredPublicPage})))
const HomePreviewPage=lazy(()=>import('../pages/home/HomePreviewPage').then(module=>({default:module.HomePreviewPage})))
const deferred=(node:ReactNode)=><Suspense fallback={null}>{node}</Suspense>

export { PublicHeader, PublicFooter } from '../shared/public/PublicChrome'

export default function PortalApp(){
  const location=useLocation()
  const path=location.pathname
  const segments=useMemo(()=>path.split('/').filter(Boolean).map(decodeURIComponent),[path])

  if(path==='/')return deferred(<PublicHome/>)
  if(path==='/_preview/home')return deferred(<HomePreviewPage/>)
  if(path==='/anuncie')return deferred(<AnunciePage/>)
  if(path.startsWith('/app'))return deferred(<InternalApp/>)
  if(segments[0]==='noticia'&&segments[1])return <Navigate to={`/noticias/${segments[1]}`} replace/>

  if(segments.length===1){
    const page=editorialReadModel.getPublishedPageBySlug(segments[0])
    if(page){
      const specialPage=renderPublicSpecialPage(page)
      if(specialPage)return specialPage
      if(page.type==='editorial')return deferred(<EditorialListingPage page={page}/>)
      return deferred(<StructuredPublicPage page={page}/>)
    }
  }

  if(segments.length===2){
    const page=editorialReadModel.getPublishedPageBySlug(segments[0])
    if(page&&page.type==='editorial'){
      const content=editorialReadModel.getContent(page.id,segments[1])
      if(content)return deferred(<EditorialContentPage page={page} content={content}/>)
      return <PageShell><main><PageSection><PageContainer><div className="editorial-empty-state"><h1>Conteúdo não encontrado</h1><p>O conteúdo solicitado não existe, está despublicado ou indisponível.</p><Link to={`/${page.slug}`}>Voltar para {page.title}</Link></div></PageContainer></PageSection></main></PageShell>
    }
  }

  return <PublicNotFound/>
}
