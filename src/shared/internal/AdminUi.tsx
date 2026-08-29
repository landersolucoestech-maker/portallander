import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, Gauge, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { ADMIN_CAPABILITIES } from './adminCapabilities'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'cms'
export type AdminNavLink = readonly [label: string, icon: LucideIcon, to: string]
export type AdminNavGroup = {label:string;icon:LucideIcon;children:readonly AdminNavLink[]}
export type AdminNavItem = AdminNavLink | AdminNavGroup

type AdminShellHeader={title:string;description:string}
export type AdminShellAction={label:string;onClick?:()=>void;disabled?:boolean;disabledReason?:string;variant?:'primary'|'secondary'}

const isNavGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:AdminShellHeader;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const context=area==='crm'?'CRM':'Gerenciador do Site'
  const [query,setQuery]=useState('')
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const notificationsRef=useRef<HTMLDivElement>(null)
  const normalizedQuery=query.trim().toLocaleLowerCase('pt-BR')
  const flatItems=useMemo(()=>items.flatMap(item=>isNavGroup(item)?item.children:[item]),[items])
  const searchResults=useMemo(()=>normalizedQuery?flatItems.filter(([label])=>label.toLocaleLowerCase('pt-BR').includes(normalizedQuery)).slice(0,6):[],[flatItems,normalizedQuery])
  const actions=headerActions??(headerAction?[headerAction]:[])

  useEffect(()=>{
    if(!notificationsOpen)return
    const closeOnOutsidePointer=(event:PointerEvent)=>{
      if(notificationsRef.current&&!notificationsRef.current.contains(event.target as Node))setNotificationsOpen(false)
    }
    document.addEventListener('pointerdown',closeOnOutsidePointer)
    return()=>document.removeEventListener('pointerdown',closeOnOutsidePointer)
  },[notificationsOpen])

  return <div className="app-shell">
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label={`Navegação do ${context}`}>
      <div className="sidebar-head">
        <Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
        <span>{context}</span>
      </div>
      <nav aria-label={`Seções do ${context}`}>{items.map(item=>{
        if(isNavGroup(item)){
          const GroupIcon=item.icon
          return <div className="sidebar-nav-group" key={item.label}>
            <div className="sidebar-nav-group-label"><GroupIcon size={17} aria-hidden="true"/><span>{item.label}</span><ChevronDown size={13} aria-hidden="true"/></div>
            <div className="sidebar-subnav">{item.children.map(([label,Icon,to])=><NavLink className="sidebar-subnav-link" key={to} to={to}><Icon size={14} aria-hidden="true"/><span>{label}</span></NavLink>)}</div>
          </div>
        }
        const [label,Icon,to]=item
        return <NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={17} aria-hidden="true"/><span>{label}</span></NavLink>
      })}</nav>
      <div className="sidebar-bottom"><NavLink to="/app/workspaces"><Building2 size={17} aria-hidden="true"/><span>Trocar workspace</span></NavLink></div>
    </aside>

    <div className="workspace">
      <header className={`workspace-top${header?' workspace-top-page':''}`}>
        {header?<div className="workspace-page-heading"><h1>{header.title}</h1><p>{header.description}</p></div>:<>
          <div className="workspace-identity">
            <span className="workspace-name">Portal Lander</span>
            <span className="workspace-divider" aria-hidden="true"/>
            <span className="workspace-context">{context}</span>
          </div>
          <div className="workspace-search-wrap">
            <label className="workspace-search">
              <span className="sr-only">Buscar seção no {context}</span>
              <Search size={16} aria-hidden="true"/>
              <input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar uma seção..." autoComplete="off"/>
            </label>
            {normalizedQuery&&<nav className="workspace-search-results" aria-label="Resultados da busca interna">{searchResults.length?searchResults.map(([label,Icon,to])=><Link key={to} to={to} onClick={()=>setQuery('')}><Icon size={15} aria-hidden="true"/><span>{label}</span></Link>):<span className="workspace-search-empty">Nenhuma seção encontrada.</span>}</nav>}
          </div>
        </>}
        <div className="workspace-actions">
          {actions.map(action=><button key={action.label} className={`button ${action.variant==='secondary'?'outline workspace-header-secondary':'dark'} workspace-primary-action`} type="button" onClick={action.onClick} disabled={action.disabled} title={action.disabled?action.disabledReason:undefined}>{action.label}</button>)}
          <div className="workspace-popover-wrap" ref={notificationsRef}>
            <button className="icon-button" type="button" aria-label="Abrir notificações" aria-expanded={notificationsOpen} onClick={()=>{setNotificationsOpen(value=>!value);setAccountOpen(false)}}><Bell size={17} aria-hidden="true"/></button>
            {notificationsOpen&&<div className="workspace-popover notifications-popover" role="status"><strong>{ADMIN_CAPABILITIES.notifications.label}</strong><p>{ADMIN_CAPABILITIES.notifications.description}</p></div>}
          </div>
          <div className="workspace-popover-wrap">
            <button className="account-button" type="button" aria-label="Abrir menu da sessão local" aria-haspopup="menu" aria-expanded={accountOpen} onClick={()=>{setAccountOpen(value=>!value);setNotificationsOpen(false)}}>
              <span aria-hidden="true">PL</span>
              <div><b>Administrador local</b><small>Sem autenticação server-side</small></div>
              <ChevronDown size={14} aria-hidden="true"/>
            </button>
            {accountOpen&&<div className="workspace-popover account-popover" role="menu"><div className="account-popover-note">{ADMIN_CAPABILITIES.adminAuth.description}</div><Link to="/app/workspaces" role="menuitem">Trocar workspace</Link><Link to="/app/login" role="menuitem">Tela de login</Link><Link to="/" role="menuitem">Voltar ao site público</Link></div>}
          </div>
        </div>
      </header>
      <main className="workspace-main" id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  </div>
}

export function AdminPageHeader({eyebrow,title,description,action,disabled=false,disabledReason}:{eyebrow:string;title:string;description?:string;action?:string;disabled?:boolean;disabledReason?:string}){
  const reason=disabledReason||'Requer uma camada persistente ainda não conectada.'
  return <div className="admin-page-header">
    <div className="admin-page-header-copy"><span className="admin-breadcrumb">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>
    {action&&<div className="admin-header-actions"><button className="button dark" type="button" disabled={disabled} title={disabled?reason:undefined} aria-label={disabled?`${action}. Indisponível: ${reason}`:action}>{action}</button></div>}
  </div>
}

export function AdminNotice({title,description}:{title:string;description:string}){
  return <div className="admin-notice"><div><strong>{title}</strong><p>{description}</p></div></div>
}

export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){
  return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon" aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>
}

export function AdminEmpty({title,description}:{title:string;description:string}){
  return <div className="admin-empty"><div className="admin-empty-icon" aria-hidden="true"><Gauge/></div><h2>{title}</h2><p>{description}</p></div>
}
