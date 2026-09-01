import { Navigate, Route, Routes } from 'react-router-dom'
import { BrandAssetsManagerPage } from './pages/BrandAssetsManagerPage'
import { FooterSectionManagerPage } from './pages/FooterSectionManagerPage'
import { HeaderBrandManagerPage } from './pages/HeaderBrandManagerPage'
import { HeroSectionAppearancePage } from './pages/HeroSectionAppearancePage'
import { MediaKitPage } from './pages/MediaKitPage'
import { NewsAdManagerPage } from './pages/NewsAdManagerPage'
import { SiteCategoriesPage } from './pages/SiteCategoriesPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SitePagesPage } from './pages/SitePagesPage'
import { SiteSectionsPage } from './pages/SiteSectionsPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>

    <Route path="home" element={<Navigate to="/app/site/secoes" replace/>}/>
    <Route path="home/hero" element={<Navigate to="/app/site/secoes/home/hero" replace/>}/>
    <Route path="home/anuncio" element={<Navigate to="/app/site/noticias/anuncio" replace/>}/>

    <Route path="secoes" element={<SiteSectionsPage/>}/>
    <Route path="secoes/home/hero" element={<HeroSectionAppearancePage/>}/>
    <Route path="secoes/home/rodape" element={<FooterSectionManagerPage/>}/>

    <Route path="marca" element={<BrandAssetsManagerPage/>}/>
    <Route path="cabecalho" element={<HeaderBrandManagerPage/>}/>
    <Route path="conteudos" element={<SiteContentsPage/>}/>
    <Route path="paginas" element={<SitePagesPage/>}/>
    <Route path="categorias" element={<SiteCategoriesPage/>}/>
    <Route path="midia" element={<SiteMediaPage/>}/>
    <Route path="noticias/anuncio" element={<NewsAdManagerPage/>}/>
    <Route path="midia-kit" element={<MediaKitPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
