import {lazy,Suspense} from 'react'
import {Navigate,Route,Routes,useLocation,useParams} from 'react-router-dom'

const MediaKitPage=lazy(()=>import('./pages/MediaKitPage').then(module=>({default:module.MediaKitPage})))
const MediaKitPreviewPage=lazy(()=>import('./pages/MediaKitPreviewPage').then(module=>({default:module.MediaKitPreviewPage})))
const GlobalHeroEditorPage=lazy(()=>import('./pages/GlobalHeroEditorPage').then(module=>({default:module.GlobalHeroEditorPage})))
const HomeAdvertisingSectionPage=lazy(()=>import('./pages/HomeAdvertisingSectionPage').then(module=>({default:module.HomeAdvertisingSectionPage})))
const HomeContentSectionPage=lazy(()=>import('./pages/HomeContentSectionPage').then(module=>({default:module.HomeContentSectionPage})))
const HomeFeaturedSectionPage=lazy(()=>import('./pages/HomeFeaturedSectionPage').then(module=>({default:module.HomeFeaturedSectionPage})))
const HomeHeroSectionPage=lazy(()=>import('./pages/HomeHeroSectionPage').then(module=>({default:module.HomeHeroSectionPage})))
const HomeMostReadSectionPage=lazy(()=>import('./pages/HomeMostReadSectionPage').then(module=>({default:module.HomeMostReadSectionPage})))
const HomeNewsletterSectionPage=lazy(()=>import('./pages/HomeNewsletterSectionPage').then(module=>({default:module.HomeNewsletterSectionPage})))
const HomeReleasesSectionPage=lazy(()=>import('./pages/HomeReleasesSectionPage').then(module=>({default:module.HomeReleasesSectionPage})))
const SectionConfigurationPage=lazy(()=>import('./pages/SectionConfigurationPage').then(module=>({default:module.SectionConfigurationPage})))
const SiteCollaborationsPage=lazy(()=>import('./pages/SiteCollaborationsPage').then(module=>({default:module.SiteCollaborationsPage})))
const SiteContentEditorPage=lazy(()=>import('./pages/SiteContentEditorPage').then(module=>({default:module.SiteContentEditorPage})))
const SiteContentsPage=lazy(()=>import('./pages/SiteContentsPage').then(module=>({default:module.SiteContentsPage})))
const SiteFormEditorPage=lazy(()=>import('./pages/SiteFormEditorPage').then(module=>({default:module.SiteFormEditorPage})))
const SiteFormsPage=lazy(()=>import('./pages/SiteFormsPage').then(module=>({default:module.SiteFormsPage})))
const SiteMediaPage=lazy(()=>import('./pages/SiteMediaPage').then(module=>({default:module.SiteMediaPage})))
const SiteSectionsPage=lazy(()=>import('./pages/SiteSectionsPage').then(module=>({default:module.SiteSectionsPage})))

function EnglishPageSectionRedirect(){
  const {pageId='',sectionId=''}=useParams()
  return <Navigate to={`/app/site/paginas/${encodeURIComponent(pageId)}/secoes/${encodeURIComponent(sectionId)}`} replace/>
}

function EnglishEntityRedirect({kind}:{kind:'content'|'forms'}){
  const params=useParams()
  const {search}=useLocation()
  const id=kind==='content'?params.contentId:params.formId
  const canonical=kind==='content'?'conteudos':'formularios'
  return <Navigate to={`/app/site/${canonical}${id?`/${encodeURIComponent(id)}`:''}${search}`} replace/>
}

export default function SiteManagerRoutes(){
  return <Suspense fallback={null}><Routes>
    <Route index element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="home" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>

    <Route path="paginas" element={<SiteSectionsPage/>}/>
    <Route path="paginas/home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>
    <Route path="paginas/home/secoes/hero" element={<HomeHeroSectionPage/>}/>
    <Route path="paginas/home/secoes/publicidade-lateral" element={<HomeAdvertisingSectionPage sectionId="publicidade-lateral"/>}/>
    <Route path="paginas/home/secoes/anuncie-aqui" element={<HomeAdvertisingSectionPage sectionId="anuncie-aqui"/>}/>
    <Route path="paginas/home/secoes/mais-lidas" element={<HomeMostReadSectionPage/>}/>
    <Route path="paginas/home/secoes/em-destaque" element={<HomeFeaturedSectionPage/>}/>
    <Route path="paginas/home/secoes/ultimas-noticias" element={<HomeContentSectionPage sectionId="ultimas-noticias"/>}/>
    <Route path="paginas/home/secoes/lancamentos" element={<HomeReleasesSectionPage/>}/>
    <Route path="paginas/home/secoes/agenda" element={<HomeContentSectionPage sectionId="agenda"/>}/>
    <Route path="paginas/home/secoes/em-alta" element={<HomeContentSectionPage sectionId="em-alta"/>}/>
    <Route path="paginas/home/secoes/newsletter" element={<HomeNewsletterSectionPage/>}/>
    <Route path="paginas/:pageId/secoes/editorial-hero" element={<GlobalHeroEditorPage sectionId="editorial-hero"/>}/>
    <Route path="paginas/:pageId/secoes/institutional-hero" element={<GlobalHeroEditorPage sectionId="institutional-hero"/>}/>
    <Route path="paginas/:pageId/secoes/legal-hero" element={<GlobalHeroEditorPage sectionId="legal-hero"/>}/>
    <Route path="paginas/:pageId/secoes/about-hero" element={<GlobalHeroEditorPage sectionId="about-hero"/>}/>
    <Route path="paginas/:pageId/secoes/contact-hero" element={<GlobalHeroEditorPage sectionId="contact-hero"/>}/>
    <Route path="paginas/:pageId/secoes/collaborate-hero" element={<GlobalHeroEditorPage sectionId="collaborate-hero"/>}/>
    <Route path="paginas/:pageId/secoes/:sectionId" element={<SectionConfigurationPage/>}/>

    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}/>
    <Route path="conteudos/:contentId" element={<SiteContentEditorPage/>}/>
    <Route path="formularios" element={<SiteFormsPage/>}/>
    <Route path="formularios/:formId" element={<SiteFormEditorPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="midia-kit/preview" element={<MediaKitPreviewPage/>}/>

    <Route path="pages" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="pages/:pageId/sections/:sectionId" element={<EnglishPageSectionRedirect/>}/>
    <Route path="content" element={<EnglishEntityRedirect kind="content"/>}/>
    <Route path="content/collaborations" element={<Navigate to="/app/site/conteudos/colaboracoes" replace/>}/>
    <Route path="content/:contentId" element={<EnglishEntityRedirect kind="content"/>}/>
    <Route path="forms" element={<EnglishEntityRedirect kind="forms"/>}/>
    <Route path="forms/:formId" element={<EnglishEntityRedirect kind="forms"/>}/>
    <Route path="media" element={<Navigate to="/app/site/midia" replace/>}/>
    <Route path="media-kit" element={<Navigate to="/app/site/midia-kit" replace/>}/>
    <Route path="media-kit/preview" element={<Navigate to="/app/site/midia-kit/preview" replace/>}/>

    <Route path="sections" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="sections/home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>
    <Route path="sections/home/footer" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="header" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="footer" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="settings" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="*" element={<Navigate to="/app/site/paginas" replace/>}/>
  </Routes></Suspense>}
