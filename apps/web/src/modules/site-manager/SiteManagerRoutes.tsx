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
    <Route path="home" element={<Navigate to="/app/site/pages" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/pages/home/sections/hero" replace/>}/>
    <Route path="pages" element={<SiteSectionsPage/>}/>
    <Route path="pages/home/hero" element={<Navigate to="/app/site/pages/home/sections/hero" replace/>}/>
    <Route path="pages/home/sections/hero" element={<HomeHeroSectionPage/>}/>
    <Route path="pages/home/sections/sidebar-advertising" element={<HomeAdvertisingSectionPage sectionId="sidebar-advertising"/>}/>
    <Route path="pages/home/sections/advertising-cta" element={<HomeAdvertisingSectionPage sectionId="advertising-cta"/>}/>
    <Route path="pages/home/sections/most-read" element={<HomeMostReadSectionPage/>}/>
    <Route path="pages/home/sections/featured" element={<HomeFeaturedSectionPage/>}/>
    <Route path="pages/home/sections/latest-news" element={<HomeContentSectionPage sectionId="latest-news"/>}/>
    <Route path="pages/home/sections/releases" element={<HomeReleasesSectionPage/>}/>
    <Route path="pages/home/sections/agenda" element={<HomeContentSectionPage sectionId="agenda"/>}/>
    <Route path="pages/home/sections/trending" element={<HomeContentSectionPage sectionId="trending"/>}/>
    <Route path="pages/home/sections/newsletter" element={<HomeNewsletterSectionPage/>}/>
    <Route path="pages/:pageId/sections/editorial-hero" element={<GlobalHeroEditorPage sectionId="editorial-hero"/>}/>
    <Route path="pages/:pageId/sections/institutional-hero" element={<GlobalHeroEditorPage sectionId="institutional-hero"/>}/>
    <Route path="pages/:pageId/sections/legal-hero" element={<GlobalHeroEditorPage sectionId="legal-hero"/>}/>
    <Route path="pages/:pageId/sections/about-hero" element={<GlobalHeroEditorPage sectionId="about-hero"/>}/>
    <Route path="pages/:pageId/sections/contact-hero" element={<GlobalHeroEditorPage sectionId="contact-hero"/>}/>
    <Route path="pages/:pageId/sections/collaborate-hero" element={<GlobalHeroEditorPage sectionId="collaborate-hero"/>}/>
    <Route path="pages/:pageId/sections/:sectionId" element={<SectionConfigurationPage/>}/>
    <Route path="sections" element={<Navigate to="/app/site/pages" replace/>}/>
    <Route path="sections/home/hero" element={<Navigate to="/app/site/pages/home/sections/hero" replace/>}/>
    <Route path="sections/home/footer" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="header" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="footer" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="settings" element={<Navigate to="/app/settings" replace/>}/>
    <Route path="content" element={<SiteContentsPage/>}/>
    <Route path="content/collaborations" element={<SiteCollaborationsPage/>}/>
    <Route path="content/:contentId" element={<SiteContentEditorPage/>}/>
    <Route path="forms" element={<SiteFormsPage/>}/>
    <Route path="forms/:formId" element={<SiteFormEditorPage/>}/>
    <Route path="media" element={<SiteMediaPage/>}/>
    <Route path="media-kit" element={<MediaKitPage/>}/>
    <Route path="media-kit/preview" element={<MediaKitPreviewPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes></Suspense>}
