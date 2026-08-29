import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, Gauge } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'cms'
export type AdminNavItem = readonly [label: string, icon: LucideIcon, to: string]

export function AdminShell({area,items,children}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode}){
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-head"><Link to="/" className="brand"><img src={portalLogo} alt="Portal Lander"/></Link><span>{area==='crm'?'CRM':'SITE'}</span></div><nav>{items.map(([label,Icon,to])=><NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div></aside><div className="workspace"><header className="workspace-top"><div className="workspace-identity"><span className="workspace-name">Portal Lander</span><span className="workspace-divider"/><span className="workspace-context">{area==='crm'?'CRM':'Gerenciador do Site'}</span></div><div className="workspace-actions"><button className="icon-button" type="button" aria-label="Notificações"><Bell size={18}/></button><button className="account-button" type="button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header><main className="workspace-main">{children}</main></div></div>
}

export function AdminPageHeader({eyebrow,title,description,action,disabled=false}:{eyebrow:string;title:string;description?:string;action?:string;disabled?:boolean}){
  return <div className="admin-page-header"><div className="admin-page-header-copy"><span className="admin-breadcrumb">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action&&<div className="admin-header-actions"><button className="button dark" disabled={disabled}>{action}</button></div>}</div>
}

export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){
  return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>
}

export function AdminEmpty({title,description}:{title:string;description:string}){
  return <div className="admin-empty"><div className="admin-empty-icon"><Gauge/></div><h2>{title}</h2><p>{description}</p></div>
}
