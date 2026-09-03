import { useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import InternalApp from './InternalApp'
import { renderPublicSpecialPage } from './publicSpecialPageRegistry'
import { AnunciePage } from '../pages/anuncie/AnunciePage'
import { EditorialContentPage } from '../features/editorial/components/EditorialContentPage'
import { EditorialListingPage } from '../features/editorial/components/EditorialListingPage'
import { StructuredPublicPage } from '../features/editorial/components/StructuredPublicPage'
import { editorialReadModel } from '../features/editorial/repository'
import { PublicHome } from '../pages/home/PublicHome'
import { HomePreviewPage } from '../pages/home/HomePreviewPage'
import { PageContainer,PageSection,PageShell } from '../shared/public/PublicPageArchitecture'
import { PublicNotFound } from '../shared/public/PublicNotFound'

export { PublicHeader, PublicFooter } from '../shared/public/PublicChrome'

export default function PortalApp(){
  const location=useLocation()
  const path=location.pathname
  const segments=useMemo(()=>path.split('/').filter(Boolean).map(decodeURIComponent),[path])

  if(path==='/')return <PublicHome/>
  if(path==='/_preview/home')return <HomePreviewPage/>
  if(path==='/anuncie')return <AnunciePage/>
  if(path.startsWith('/app'))return <InternalApp/>
  if(segments[0]==='noticia'&&segments[1])return <Navigate to={`/noticias/${segments[1]}`} replace/>

  if(segments.length===1){
    const page=editorialReadModel.getPublishedPageBySlug(segments[0])
    if(page){
      const specialPage=renderPublicSpecialPage(page)
      if(specialPage)return specialPage
      if(page.type==='editorial')return <EditorialListingPage page={page}/>
      return <StructuredPublicPage page={page}/>
    }
  }

  if(segments.length===2){
    const page=editorialReadModel.getPublishedPageBySlug(segments[0])
    if(page&&page.type==='editorial'){
      const content=editorialReadModel.getContent(page.id,segments[1])
      if(content)return <EditorialContentPage page={page} content={content}/>
      return <PageShell><main><PageSection><PageContainer><div className="editorial-empty-state"><h1>Conteúdo não encontrado</h1><p>O conteúdo solicitado não existe, está despublicado ou indisponível.</p><Link to={`/${page.slug}`}>Voltar para {page.title}</Link></div></PageContainer></PageSection></main></PageShell>
    }
  }

  return <PublicNotFound/>
}
