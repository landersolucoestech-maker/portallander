import { Navigate, Route, Routes } from 'react-router-dom'
import HeroManagerPage from './HeroManagerPage'
import { SiteContents, SiteManagerDashboard, SitePages } from './SiteManagerWorkspace'
import { SiteCategories, SiteMedia } from './SiteManagerCatalogPages'
import { MediaKitPage, SiteSettingsPage } from './SiteManagerOperations'

export default function SiteManagerRoutes(){
  return <Routes>
    <Route path="/app/site" element={<SiteManagerDashboard/>}/>
    <Route path="/app/site/home/hero" element={<HeroManagerPage/>}/>
    <Route path="/app/site/conteudos" element={<SiteContents/>}/>
    <Route path="/app/site/paginas" element={<SitePages/>}/>
    <Route path="/app/site/categorias" element={<SiteCategories/>}/>
    <Route path="/app/site/midia" element={<SiteMedia/>}/>
    <Route path="/app/site/midia-kit" element={<MediaKitPage/>}/>
    <Route path="/app/site/configuracoes" element={<SiteSettingsPage/>}/>
    <Route path="*" element={<Navigate to="/app/site" replace/>}/>
  </Routes>
}
