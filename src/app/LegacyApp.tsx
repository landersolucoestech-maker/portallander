import { ArrowRight, BriefcaseBusiness, Globe2 } from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ContactsPage, CrmDashboard, CrmPlaceholder } from '../features/crm/CrmWorkspace'
import { SiteContents, SiteManagerDashboard, SiteManagerPlaceholder, SitePages } from '../features/site-manager/SiteManagerWorkspace'

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

const crmPlaceholders = [
  ['negocios','Negócios'],
  ['atividades','Atividades'],
  ['pipeline','Pipeline comercial'],
  ['campanhas','Campanhas'],
  ['relatorios','Relatórios'],
  ['financeiro','Financeiro'],
] as const

const sitePlaceholders = [
  ['midia','Mídia'],
  ['categorias','Categorias'],
  ['midia-kit','Mídia Kit'],
  ['configuracoes','Configurações'],
] as const

export default function LegacyApp(){
  return <Routes>
    <Route path="/app" element={<WorkspaceHome/>}/>
    <Route path="/app/crm" element={<CrmDashboard/>}/>
    <Route path="/app/crm/contatos" element={<ContactsPage/>}/>
    {crmPlaceholders.map(([path,title])=><Route key={path} path={`/app/crm/${path}`} element={<CrmPlaceholder title={title}/>}/>)}
    <Route path="/app/site" element={<SiteManagerDashboard/>}/>
    <Route path="/app/site/conteudos" element={<SiteContents/>}/>
    <Route path="/app/site/paginas" element={<SitePages/>}/>
    {sitePlaceholders.map(([path,title])=><Route key={path} path={`/app/site/${path}`} element={<SiteManagerPlaceholder title={title}/>}/>)}
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Routes>
}
