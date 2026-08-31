import { Navigate, Route, Routes } from 'react-router-dom'
import HeroManagerPage from './HeroManagerPage'
import { BrandAssetsManagerPage } from './pages/BrandAssetsManagerPage'
import { HeaderBrandManagerPage } from './pages/HeaderBrandManagerPage'
import { HomeAdManagerPage } from './pages/HomeAdManagerPage'
import { HomeManagerPage } from './pages/HomeManagerPage'
import { HomeSectionManagerPage } from './pages/HomeSectionManagerPage'
import { MediaKitPage } from './pages/MediaKitPage'
import { NewsAdManagerPage } from './pages/NewsAdManagerPage'
import { SiteCategoriesPage } from './pages/SiteCategoriesPage'
import { SiteContentsPage } from './pages/SiteContentsPage'
import { SiteManagerDashboardPage } from './pages/SiteManagerDashboardPage'
import { SiteMediaPage } from './pages/SiteMediaPage'
import { SitePagesPage } from './pages/SitePagesPage'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route index element={<SiteManagerDashboardPage/>}/>
    <Route path="home" element={<HomeManagerPage/>}/>
    <Route path="home/hero" element={<HeroManagerPage/>}/>
    <Route path="home/barra-agora" element={<HomeSectionManagerPage section="ticker"/>}/>
    <Route path="home/grid-principal" element={<HomeSectionManagerPage section="grid"/>}/>
    <Route path="home/ranking" element={<HomeSectionManagerPage section="ranking"/>}/>
    <Route path="home/publicidade-lateral" element={<HomeSectionManagerPage section="side-ad"/>}/>
    <Route path="home/destaques" element={<HomeSectionManagerPage section="secondary"/>}/>
    <Route path="home/em-alta" element={<HomeSectionManagerPage section="trending"/>}/>
    <Route path="home/banner-horizontal" element={<HomeSectionManagerPage section="banner"/>}/>
    <Route path="home/videos" element={<HomeSectionManagerPage section="videos"/>}/>
    <Route path="home/agenda" element={<HomeSectionManagerPage section="agenda"/>}/>
    <Route path="home/newsletter" element={<HomeSectionManagerPage section="newsletter"/>}/>
    <Route path="home/footer" element={<HomeSectionManagerPage section="footer"/>}/>
    <Route path="home/anuncio" element={<HomeAdManagerPage/>}/>
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
