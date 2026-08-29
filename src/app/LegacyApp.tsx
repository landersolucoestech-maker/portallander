import { ArrowRight, BriefcaseBusiness, Globe2 } from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ActivitiesPage, ContactsPage, CrmDashboard, DealsPage, PipelinePage } from '../features/crm/CrmWorkspace'
import { CampaignsPage, FinancePage, ReportsPage } from '../features/crm/CrmOperations'
import { SiteCategories, SiteContents, SiteManagerDashboard, SiteMedia, SitePages } from '../features/site-manager/SiteManagerWorkspace'
import { MediaKitPage, SiteSettingsPage } from '../features/site-manager/SiteManagerOperations'
import '../styles/admin-entry.css'

function WorkspaceHome(){
  return <div className="workspace-picker">
    <div className="picker-copy">
      <span className="kicker">Portal Lander · Área interna</span>
      <h1>Operação em dois workspaces.</h1>
      <p>CRM para relacionamento e operação comercial. Gerenciador do Site para conteúdo, páginas e estrutura editorial.</p>
    </div>
    <div className="workspace-cards">
      <Link to="/app/crm" className="workspace-card"><div className="workspace-icon"><BriefcaseBusiness/></div><span>Relacionamento e vendas</span><h2>CRM</h2><p>Contatos, oportunidades, atividades, pipeline, campanhas e visão financeira da operação.</p><ArrowRight/></Link>
      <Link to="/app/site" className="workspace-card"><div className="workspace-icon"><Globe2/></div><span>Conteúdo e publicação</span><h2>Gerenciador do Site</h2><p>Páginas, conteúdos, categorias, mídia e estrutura editorial do Portal Lander.</p><ArrowRight/></Link>
    </div>
    <Link className="back-site" to="/">← Voltar ao site público</Link>
  </div>
}

export default function LegacyApp(){
  return <Routes>
    <Route path="/app" element={<WorkspaceHome/>}/>
    <Route path="/app/crm" element={<CrmDashboard/>}/>
    <Route path="/app/crm/contatos" element={<ContactsPage/>}/>
    <Route path="/app/crm/negocios" element={<DealsPage/>}/>
    <Route path="/app/crm/atividades" element={<ActivitiesPage/>}/>
    <Route path="/app/crm/pipeline" element={<PipelinePage/>}/>
    <Route path="/app/crm/campanhas" element={<CampaignsPage/>}/>
    <Route path="/app/crm/relatorios" element={<ReportsPage/>}/>
    <Route path="/app/crm/financeiro" element={<FinancePage/>}/>
    <Route path="/app/site" element={<SiteManagerDashboard/>}/>
    <Route path="/app/site/conteudos" element={<SiteContents/>}/>
    <Route path="/app/site/paginas" element={<SitePages/>}/>
    <Route path="/app/site/categorias" element={<SiteCategories/>}/>
    <Route path="/app/site/midia" element={<SiteMedia/>}/>
    <Route path="/app/site/midia-kit" element={<MediaKitPage/>}/>
    <Route path="/app/site/configuracoes" element={<SiteSettingsPage/>}/>
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Routes>
}
