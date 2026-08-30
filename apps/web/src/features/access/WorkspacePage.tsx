import { ArrowRight, BriefcaseBusiness, Globe2, LockKeyhole, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portalLogo } from '../../shared/branding/assets/brandAsset'
import {appReadModel} from '../../shared/data/appReadModel'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'

const workspaceIcons={crm:BriefcaseBusiness,'site-manager':Globe2} as const

export function WorkspacePage(){
  const workspaces=appReadModel.workspaces()
  return <main className="access-page workspace-selection-page">
    <header className="workspace-selection-topbar">
      <Link to="/" className="workspace-selection-logo" aria-label="Voltar ao Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
      <div className="workspace-selection-session"><div><span>SESSÃO LOCAL</span><strong>Ambiente de desenvolvimento</strong></div><LockKeyhole size={18} aria-hidden="true"/></div>
    </header>

    <section className="workspace-selection-main">
      <div className="workspace-selection-heading">
        <span className="access-kicker">ÁREA INTERNA · WORKSPACES</span>
        <h1>Escolha onde você quer trabalhar.</h1>
        <p>Os workspaces administrativos permanecem independentes dos módulos implementados dentro deles.</p>
      </div>

      <div className="workspace-selection-grid">
        {workspaces.map(workspace=>{const Icon=workspaceIcons[workspace.slug as keyof typeof workspaceIcons]??BriefcaseBusiness;return <Link to={workspace.route} className="workspace-selection-card" key={workspace.id}>
          <div className="workspace-selection-card-head"><div className="workspace-selection-icon"><Icon size={21} aria-hidden="true"/></div><ArrowRight size={20} aria-hidden="true"/></div>
          <span>{workspace.eyebrow}</span>
          <h2>{workspace.name}</h2>
          <p>{workspace.description}</p>
          <ul>{workspace.capabilities.map(item=><li key={item}>{item}</li>)}</ul>
          <strong>Acessar workspace <ArrowRight size={15} aria-hidden="true"/></strong>
        </Link>})}
      </div>

      <aside className="workspace-selection-footnote"><Settings2 size={18} aria-hidden="true"/><div><strong>Estado atual do acesso</strong><p>{ADMIN_CAPABILITIES.adminAuth.description} Esta tela não representa uma sessão autenticada.</p></div><Link to="/app/login">Voltar ao login</Link></aside>
    </section>
  </main>
}
