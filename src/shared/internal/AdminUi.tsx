import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ADMIN_CAPABILITIES } from './adminCapabilities'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'cms'
export type AdminNavLink = readonly [label: string, icon: LucideIcon, to: string]
export type AdminNavGroup = {label:string;icon:LucideIcon;to?:string;children:readonly AdminNavLink[]}
export type AdminNavItem = AdminNavLink | AdminNavGroup

type AdminShellHeader={title:string;description:string}
export type AdminShellAction={label:string;onClick?:()=>void;disabled?:boolean;disabledReason?:string;variant?:'primary'|'secondary'}

const isNavGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)
const PROMOTED_HEADERS:Record<string,AdminShellHeader>={
  '/app/crm/contatos':{title:'Contatos',description:'Relacionamentos e oportunidades comerciais.'}
}
const routeShellClass=(pathname:string)=>pathname==='/app/crm/contatos'?' app-shell-crm-contacts':''

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:AdminShellHeader;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const context=area==='crm'?'CRM':'Gerenciador do Site'
  const location=useLocation()
  const effectiveHeader=header??PROMOTED_HEADERS[location.pathname]
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const [contactsCreateLabel,setContactsCreateLabel]=useState('Novo Contato')
  const notificationsRef=useRef<HTMLDivElement>(null)
  const actions=headerActions??(headerAction?[headerAction]:[])
  const isContactsRoute=location.pathname==='/app/crm/contatos'

  useEffect(()=>{
    if(!notificationsOpen)return
    const closeOnOutsidePointer=(event:PointerEvent)=>{if(notificationsRef.current&&!notificationsRef.current.contains(event.target as Node))setNotificationsOpen(false)}
    document.addEventListener('pointerdown',closeOnOutsidePointer)
    return()=>document.removeEventListener('pointerdown',closeOnOutsidePointer)
  },[notificationsOpen])

  useEffect(()=>{
    if(!isContactsRoute)return
    const syncLabel=()=>{const active=document.querySelector('.app-shell-crm-contacts .zip-tabs button.active');setContactsCreateLabel(active?.textContent?.trim()==='Leads'?'Novo Lead':'Novo Contato')}
    syncLabel();document.addEventListener('click',syncLabel);return()=>document.removeEventListener('click',syncLabel)
  },[isContactsRoute])

  const triggerContactsCreate=()=>document.querySelector<HTMLButtonElement>('.app-shell-crm-contacts .zip-toolbar .zip-button')?.click()
  const renderActions=()=>actions.map(action=><button key={action.label} className={`button ${action.variant==='secondary'?'outline workspace-header-secondary':'dark'} workspace-primary-action`} type="button" onClick={action.onClick} disabled={action.disabled} title={action.disabled?action.disabledReason:undefined}>{action.label}</button>)

  return <div className={`app-shell${routeShellClass(location.pathname)}`}>
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label={`Navegação do ${context}`}>
      <div className="sidebar-head"><Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link><span>{context}</span></div>
      <nav aria-label={`Seções do ${context}`}>{items.map(item=>{
        if(isNavGroup(item)){const GroupIcon=item.icon;const groupContent=<><GroupIcon size={17}/><span>{item.label}</span><ChevronDown size={13}/></>;return <div className="sidebar-nav-group" key={item.label}>{item.to?<NavLink className="sidebar-nav-group-label" to={item.to}>{groupContent}</NavLink>:<div className="sidebar-nav-group-label">{groupContent}</div>}<div className="sidebar-subnav">{item.children.map(([label,Icon,to])=><NavLink className="sidebar-subnav-link" key={to} to={to}><Icon size={14}/><span>{label}</span></NavLink>)}</div></div>}
        const [label,Icon,to]=item;return <NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={17}/><span>{label}</span></NavLink>
      })}</nav>
      <div className="sidebar-bottom"><NavLink to="/app/workspaces"><Building2 size={17}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className={`workspace-top${effectiveHeader?' workspace-top-page':''}`}>
        {effectiveHeader?<div className="workspace-page-heading"><h1>{effectiveHeader.title}</h1><p>{effectiveHeader.description}</p></div>:<div className="workspace-identity"><span className="workspace-name">Portal Lander</span><span className="workspace-divider"/><span className="workspace-context">{context}</span></div>}
        <div className="workspace-actions">{renderActions()}{isContactsRoute&&<button className="button dark workspace-primary-action crm-header-create" type="button" onClick={triggerContactsCreate}>{contactsCreateLabel}</button>}<div className="workspace-popover-wrap" ref={notificationsRef}><button className="icon-button" type="button" aria-label="Abrir notificações" aria-expanded={notificationsOpen} onClick={()=>{setNotificationsOpen(value=>!value);setAccountOpen(false)}}><Bell size={17}/></button>{notificationsOpen&&<div className="workspace-popover notifications-popover" role="status"><strong>{ADMIN_CAPABILITIES.notifications.label}</strong><p>{ADMIN_CAPABILITIES.notifications.description}</p></div>}</div><div className="workspace-popover-wrap"><button className="account-button" type="button" aria-label="Abrir menu da sessão local" aria-haspopup="menu" aria-expanded={accountOpen} onClick={()=>{setAccountOpen(value=>!value);setNotificationsOpen(false)}}><span>PL</span><div><b>Administrador local</b><small>Sem autenticação server-side</small></div><ChevronDown size={14}/></button>{accountOpen&&<div className="workspace-popover account-popover" role="menu"><div className="account-popover-note">{ADMIN_CAPABILITIES.adminAuth.description}</div><Link to="/app/workspaces" role="menuitem">Trocar workspace</Link><Link to="/app/login" role="menuitem">Tela de login</Link><Link to="/" role="menuitem">Voltar ao site público</Link></div>}</div></div>
      </header>
      <main className="workspace-main" id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  </div>
}

export function AdminPageHeader({eyebrow,title,description,action,disabled=false,disabledReason}:{eyebrow:string;title:string;description?:string;action?:string;disabled?:boolean;disabledReason?:string}){const location=useLocation();if(PROMOTED_HEADERS[location.pathname])return null;const reason=disabledReason||'Requer uma camada persistente ainda não conectada.';return <div className="admin-page-header"><div className="admin-page-header-copy"><span className="admin-breadcrumb">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action&&<div className="admin-header-actions"><button className="button dark" type="button" disabled={disabled} title={disabled?reason:undefined}>{action}</button></div>}</div>}
export function AdminNotice({title,description}:{title:string;description:string}){return <div className="admin-notice"><div><strong>{title}</strong><p>{description}</p></div></div>}
export function AdminEmpty({title,description}:{title:string;description:string}){return <div className="admin-empty"><strong>{title}</strong><p>{description}</p></div>}
export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>}
