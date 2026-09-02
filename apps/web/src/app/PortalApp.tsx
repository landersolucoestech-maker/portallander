import { useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import InternalApp from './InternalApp'
import { renderPublicSpecialPage } from './publicSpecialPageRegistry'
import { AnunciePage } from '../pages/anuncie/AnunciePage'
import { EditorialContentPage } from '../features/editorial/components/EditorialContentPage'
import { EditorialListingPage } from '../features/editorial/components/EditorialListingPage'
import { editorialReadModel } from '../features/editorial/repository'
import { PublicHome } from '../pages/home/PublicHome'
import { PublicFooter, PublicHeader } from '../shared/public/PublicChrome'
import { PublicNotFound } from '../shared/public/PublicNotFound'

export { PublicHeader, PublicFooter } from '../shared/public/PublicChrome'

export default function PortalApp(){
  const location=useLocation()
  const path=location.pathname
  const segments=useMemo(()=>path.split('/').filter(Boolean).map(decodeURIComponent),[path])

  if(path==='/')return <PublicHome/>
  if(path==='/anuncie')return <AnunciePage/>
  if(path.startsWith('/app'))return <InternalApp/>
  if(segments[0]==='noticia'&&segments[1])return <Navigate to={`/noticias/${segments[1]}`} replace/>

  if(segments.length===1){
    const publishedPage=editorialReadModel.getPublishedPageBySlug(segments[0])
    if(publishedPage){
      const specialPage=renderPublicSpecialPage(publishedPage)
      if(specialPage)return specialPage
    }
    const page=editorialReadModel.getPageBySlug(segments[0])
    if(page)return <EditorialListingPage page={page}/>
  }

  if(segments.length===2){
    const page=editorialReadModel.getPageBySlug(segments[0])
    if(page){
      const content=editorialReadModel.getContent(page.id,segments[1])
      if(content)return <EditorialContentPage page={page} content={content}/>
      return <div className="public-page"><PublicHeader/><main className="public-shell editorial-empty-state"><h1>Conteúdo não encontrado</h1><p>O conteúdo solicitado não existe, está despublicado ou indisponível.</p><Link to={`/${page.slug}`}>Voltar para {page.title}</Link></main><PublicFooter/></div>
    }
  }

  return <PublicNotFound/>
}
