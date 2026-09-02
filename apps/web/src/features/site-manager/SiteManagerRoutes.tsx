import { Navigate, Route, Routes } from 'react-router-dom'
import { HeroSectionAppearancePage } from './pages/HeroSectionAppearancePage'
import { MediaKitPage } from './pages/MediaKitPage'
import { SiteCollaborationsPage } from './pages/SiteCollaborationsPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteFormsPage } from './pages/SiteFormsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SiteSectionsPage } from './pages/SiteSectionsPage'
import { SiteSettingsPage } from './pages/SiteSettingsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>

    <Route path="home" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/paginas/home/hero" replace/>}/>

    <Route path="paginas" element={<SiteSectionsPage/>}/>
    <Route path="paginas/home/hero" element={<HeroSectionAppearancePage/>}/>

    <Route path="secoes" element={<Navigate to="/app/site/paginas" replace/>}/>
    <Route path="secoes/home/hero" element={<Navigate to="/app/site/paginas/home/hero" replace/>}/>
    <Route path="secoes/home/rodape" element={<Navigate to="/app/site/configuracoes" replace/>}/>

    <Route path="cabecalho" element={<Navigate to="/app/site/configuracoes" replace/>}/>
    <Route path="rodape" element={<Navigate to="/app/site/configuracoes" replace/>}/>
    <Route path="configuracoes" element={<SiteSettingsPage/>}/>
    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}/>
    <Route path="formularios" element={<SiteFormsPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
