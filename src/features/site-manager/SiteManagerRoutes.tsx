import { Navigate, Route, Routes } from 'react-router-dom'
import HeroManagerPage from './HeroManagerPage'
import { BrandAssetsManagerPage } from './pages/BrandAssetsManagerPage'
import { HeaderBrandManagerPage } from './pages/HeaderBrandManagerPage'
import { HomeAdManagerPage } from './pages/HomeAdManagerPage'
import { HomeManagerPage } from './pages/HomeManagerPage'
import { MediaKitPage } from './pages/MediaKitPage'
import { NewsAdManagerPage } from './pages/NewsAdManagerPage'
import { SiteCategoriesPage } from './pages/SiteCategoriesPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SitePagesPage } from './pages/SitePagesPage'
import { SiteSettingsPage } from './pages/SiteSettingsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>
    <Route path="home" element={<HomeManagerPage/>}/>
    <Route path="home/hero" element={<HeroManagerPage/>}/>
    <Route path="home/anuncio" element={<HomeAdManagerPage/>}/>
    <Route path="marca" element={<BrandAssetsManagerPage/>}/>
    <Route path="cabecalho" element={<HeaderBrandManagerPage/>}/>
    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="paginas" element={<SitePagesPage/>}/>
    <Route path="categorias" element={<SiteCategoriesPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="noticias/anuncio" element={<NewsAdManagerPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="configuracoes" element={<SiteSettingsPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
