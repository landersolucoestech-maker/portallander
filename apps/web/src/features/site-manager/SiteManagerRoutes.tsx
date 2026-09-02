import { Navigate, Route, Routes } from 'react-router-dom'
import { MediaKitPage } from './pages/MediaKitPage'
import { GlobalHeroEditorPage } from './pages/GlobalHeroEditorPage'
import { HomeAdvertisingSectionPage } from './pages/HomeAdvertisingSectionPage'
import { SectionConfigurationPage } from './pages/SectionConfigurationPage'
import { SiteCollaborationsPage } from './pages/SiteCollaborationsPage'
import { SiteContentEditorPage } from './pages/SiteContentEditorPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteFormEditorPage } from './pages/SiteFormEditorPage'
import { SiteFormsPage } from './pages/SiteFormsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SiteSectionsPage } from './pages/SiteSectionsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>
    <Route path="home" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>
    <Route path="paginas" element={<SiteSectionsPage/>}/>
    <Route path="paginas/home/hero" element={<Navigate to="/app/site/paginas/home/secoes/hero" replace/>}/>
    <Route path="paginas/home/secoes/publicidade-lateral" element={<HomeAdvertisingSectionPage sectionId="publicidade-lateral"/>}/>
    <Route path="paginas/home/secoes/anuncie-aqui" element={<HomeAdvertisingSectionPage sectionId="anuncie-aqui"/>}/>
    <Route path="paginas/:pageId/secoes/editorial-hero" element={<GlobalHeroEditorPage sectionId="editorial-hero"/>}/>
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
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
