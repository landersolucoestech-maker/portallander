import { Navigate, Route, Routes } from 'react-router-dom'
import { FooterSectionManagerPage } from './pages/FooterSectionManagerPage'
import { HeroSectionAppearancePage } from './pages/HeroSectionAppearancePage'
import { MediaKitPage } from './pages/MediaKitPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SiteSectionsPage } from './pages/SiteSectionsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>

    <Route path="home" element={<Navigate to="/app/site/secoes" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/secoes/home/hero" replace/>}/>

    <Route path="secoes" element={<SiteSectionsPage/>}/>
    <Route path="secoes/home/hero" element={<HeroSectionAppearancePage/>}/>
    <Route path="secoes/home/rodape" element={<FooterSectionManagerPage/>}/>

    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
