import { ArrowRight, BriefcaseBusiness, Globe2 } from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import CrmRoutes from '../features/crm/CrmRoutes'
import SiteManagerRoutes from '../features/site-manager/SiteManagerRoutes'
import '../styles/admin-entry.css'

function WorkspaceHome(){
  return <div className="workspace-picker">
    <div className="picker-copy">
      <span className="kicker">Portal Lander · Área interna</span>
      <h1>Operação em dois workspaces.</h1>
      <p>CRM para relacionamento e operação comercial. Gerenciador do Site para conteúdo, páginas e estrutura editorial.</p>
    </div>
    <div className="workspace-cards">
      <Link to="/app/crm" className="workspace-card"><div className="workspace-icon"><BriefcaseBusiness aria-hidden="true"/></div><span>Relacionamento e vendas</span><h2>CRM</h2><p>Contatos, oportunidades, atividades, pipeline, campanhas e visão financeira da operação.</p><ArrowRight aria-hidden="true"/></Link>
      <Link to="/app/site" className="workspace-card"><div className="workspace-icon"><Globe2 aria-hidden="true"/></div><span>Conteúdo e publicação</span><h2>Gerenciador do Site</h2><p>Páginas, conteúdos, categorias, mídia e estrutura editorial do Portal Lander.</p><ArrowRight aria-hidden="true"/></Link>
    </div>
    <Link className="back-site" to="/">← Voltar ao site público</Link>
  </div>
}

export default function InternalApp(){
  return <Routes>
    <Route path="/app" element={<WorkspaceHome/>}/>
    <Route path="/app/crm/*" element={<CrmRoutes/>}/>
    <Route path="/app/site/*" element={<SiteManagerRoutes/>}/>
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Routes>
}
