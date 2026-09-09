import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

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
const SiteManagerDashboardPage=lazy(()=>import('./pages/SiteManagerDashboardPage').then(module=>({default:module.SiteManagerDashboardPage})))
const SiteMediaPage=lazy(()=>import('./pages/SiteMediaPage').then(module=>({default:module.SiteMediaPage})))
const SiteSectionsPage=lazy(()=>import('./pages/SiteSectionsPage').then(module=>({default:module.SiteSectionsPage})))

export default function SiteManagerRoutes(){
  return <Suspense fallback={null}><Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>
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
    <Route path="paginas/:pageId/secoes/sobre-hero" element={<GlobalHeroEditorPage sectionId="sobre-hero"/>}/>
    <Route path="paginas/:pageId/secoes/contato-hero" element={<GlobalHeroEditorPage sectionId="contato-hero"/>}/>
    <Route path="paginas/:pageId/secoes/colabore-hero" element={<GlobalHeroEditorPage sectionId="colabore-hero"/>}/>
    <Route path="paginas/:pageId/secoes/:sectionId" element={<SectionConfigurationPage/>}/>
    <Route path="secoes" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="secoes/home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>
    <Route path="secoes/home/rodape" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="cabecalho" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="rodape" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="configuracoes" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}/>
    <Route path="conteudos/:contentId" element={<SiteContentEditorPage/>}/>
    <Route path="formularios" element={<SiteFormsPage/>}/>
    <Route path="formularios/:formId" element={<SiteFormEditorPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="midia-kit/preview" element={<MediaKitPreviewPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes></Suspense>
}