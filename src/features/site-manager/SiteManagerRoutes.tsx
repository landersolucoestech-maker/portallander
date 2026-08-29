import { Navigate, Route, Routes } from 'react-router-dom'
import HeroManagerPage from './HeroManagerPage'
import { MediaKitPage } from './pages/MediaKitPage'
import { SiteCategoriesPage } from './pages/SiteCategoriesPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SitePagesPage } from './pages/SitePagesPage'
import { SiteSettingsPage } from './pages/SiteSettingsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route path="/app/site" element={<SiteManagerDashboardPage/>}/>
    <Route path="/app/site/home/hero" element={<HeroManagerPage/>}/>
    <Route path="/app/site/conteudos" element={<SiteContentsPage/>}/>
    <Route path="/app/site/paginas" element={<SitePagesPage/>}/>
    <Route path="/app/site/categorias" element={<SiteCategoriesPage/>}/>
    <Route path="/app/site/midia" element={<SiteMediaPage/>}/>
    <Route path="/app/site/midia-kit" element={<MediaKitPage/>}/>
    <Route path="/app/site/configuracoes" element={<SiteSettingsPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
