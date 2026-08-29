import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, Gauge, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'cms'
export type AdminNavItem = readonly [label: string, icon: LucideIcon, to: string]

export function AdminShell({area,items,children}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode}){
  const context=area==='crm'?'CRM':'Gerenciador do Site'
  return <div className="app-shell">
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label={`Navegação do ${context}`}>
      <div className="sidebar-head">
        <Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
        <span>{context}</span>
      </div>
      <nav aria-label={`Seções do ${context}`}>{items.map(([label,Icon,to])=><NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={17} aria-hidden="true"/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={17} aria-hidden="true"/><span>Trocar workspace</span></NavLink></div>
    </aside>

    <div className="workspace">
      <header className="workspace-top">
        <div className="workspace-identity">
          <span className="workspace-name">Portal Lander</span>
          <span className="workspace-divider" aria-hidden="true"/>
          <span className="workspace-context">{context}</span>
        </div>
        <label className="workspace-search">
          <span className="sr-only">Busca interna no {context}</span>
          <Search size={16} aria-hidden="true"/>
          <input type="search" placeholder={area==='crm'?'Buscar contatos, oportunidades...':'Buscar páginas, conteúdos...'}/>
        </label>
        <div className="workspace-actions">
          <button className="icon-button" type="button" aria-label="Abrir notificações"><Bell size={17} aria-hidden="true"/></button>
          <button className="account-button" type="button" aria-label="Abrir menu da conta" aria-haspopup="menu">
            <span aria-hidden="true">DL</span>
            <div><b>Deyvisson</b><small>Administrador</small></div>
            <ChevronDown size={14} aria-hidden="true"/>
          </button>
        </div>
      </header>
      <main className="workspace-main" id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  </div>
}

export function AdminPageHeader({eyebrow,title,description,action,disabled=false}:{eyebrow:string;title:string;description?:string;action?:string;disabled?:boolean}){
  return <div className="admin-page-header">
    <div className="admin-page-header-copy"><span className="admin-breadcrumb">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>
    {action&&<div className="admin-header-actions"><button className="button dark" type="button" disabled={disabled}>{action}</button></div>}
  </div>
}

export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){
  return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon" aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>
}

export function AdminEmpty({title,description}:{title:string;description:string}){
  return <div className="admin-empty"><div className="admin-empty-icon" aria-hidden="true"><Gauge/></div><h2>{title}</h2><p>{description}</p></div>
}
