import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Bell, ChevronDown, FilePlus2, FileStack, LayoutTemplate, LogOut, PanelLeftClose, PanelLeftOpen, Settings, UserPlus, UserRound } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'
import { appReadModel } from '../data/appReadModel'

export type AdminArea = 'crm' | 'contracts' | 'finance' | 'agenda' | 'chat' | 'rh' | 'marketing' | 'reports' | 'settings' | 'cms'
export type AdminNavLink = readonly [label: string, icon: LucideIcon, to: string]
export type AdminNavGroup = {label:string;icon:LucideIcon;to?:string;children:readonly AdminNavLink[]}
export type AdminNavItem = AdminNavLink | AdminNavGroup
export type PageHeaderConfig={title:string;description:string;backTo?:string;backLabel?:string}
export type AdminShellAction={label:string;onClick?:()=>void;disabled?:boolean;disabledReason?:string;variant?:'primary'|'secondary';className?:string;icon?:LucideIcon}

const isNavGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

function HeaderActionButton({action}:{action:AdminShellAction}){
  const secondary=action.variant==='secondary'
  const fallbackIcon:LucideIcon|undefined=action.label==='Templates'?LayoutTemplate:action.label==='Novo Template'||action.label==='Novo Contrato'?FilePlus2:action.label==='Novo Contato'||action.label==='Novo Lead'?UserPlus:action.label==='Contratos'?FileStack:undefined
  const ActionIcon=action.icon??fallbackIcon
  return <button className={`button ${secondary?'outline workspace-header-secondary':'dark workspace-primary-action'} workspace-header-polished-action${action.className?` ${action.className}`:''}`} type="button" onClick={action.onClick} disabled={action.disabled} title={action.disabled?action.disabledReason:undefined}>{ActionIcon&&<ActionIcon size={14} aria-hidden="true"/>}{action.label}</button>
}

function PageHeader({context,header,actions,sidebarCollapsed,onToggleSidebar}:{context:string;header?:PageHeaderConfig;actions:readonly AdminShellAction[];sidebarCollapsed:boolean;onToggleSidebar:()=>void}){
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const notificationsRef=useRef<HTMLDivElement>(null)
  const accountRef=useRef<HTMLDivElement>(null)
  const user=appReadModel.currentUser()
  const notifications=appReadModel.notificationsForCurrentUser()

  useEffect(()=>{
    if(!notificationsOpen&&!accountOpen)return
    const closeOnOutsidePointer=(event:PointerEvent)=>{
      const target=event.target as Node
      if(notificationsOpen&&notificationsRef.current&&!notificationsRef.current.contains(target))setNotificationsOpen(false)
      if(accountOpen&&accountRef.current&&!accountRef.current.contains(target))setAccountOpen(false)
    }
    const closeOnEscape=(event:KeyboardEvent)=>{
      if(event.key!=='Escape')return
      setNotificationsOpen(false)
      setAccountOpen(false)
    }
    document.addEventListener('pointerdown',closeOnOutsidePointer)
    document.addEventListener('keydown',closeOnEscape)
    return()=>{
      document.removeEventListener('pointerdown',closeOnOutsidePointer)
      document.removeEventListener('keydown',closeOnEscape)
    }
  },[notificationsOpen,accountOpen])

  const showHeaderSidebarToggle=header?.title!=='DASHBOARD'

  return <header className={`workspace-top${header?' workspace-top-page':''}`}>
    {header?<div className="workspace-page-heading-row">{header.backTo&&<Link className="workspace-header-back" to={header.backTo}><ArrowLeft size={15}/><span>{header.backLabel||'Voltar'}</span></Link>}{showHeaderSidebarToggle&&<button className="cms-sidebar-toggle workspace-header-sidebar-toggle" type="button" aria-label={sidebarCollapsed?'Expandir menu':'Recolher menu'} aria-pressed={sidebarCollapsed} onClick={onToggleSidebar}>{sidebarCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button>}<div className="workspace-page-heading"><h1>{header.title}</h1><p>{header.description}</p></div></div>:<div className="workspace-page-heading-row"><button className="cms-sidebar-toggle workspace-header-sidebar-toggle" type="button" aria-label={sidebarCollapsed?'Expandir menu':'Recolher menu'} aria-pressed={sidebarCollapsed} onClick={onToggleSidebar}>{sidebarCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button><div className="workspace-identity"><span className="workspace-context">{context}</span></div></div>}
    <div className="workspace-actions">
      {actions.map(action=><HeaderActionButton key={action.label} action={action}/>)}
      <div className="workspace-popover-wrap" ref={notificationsRef}>
        <button className="icon-button notification-button" type="button" aria-label="Abrir notificações" aria-expanded={notificationsOpen} onClick={()=>{setNotificationsOpen(value=>!value);setAccountOpen(false)}}><Bell size={17}/></button>
        {notificationsOpen&&<div className="workspace-popover notifications-popover" role="status"><strong>Notificações</strong>{notifications.length===0?<p>Nenhuma notificação no momento.</p>:notifications.slice(0,4).map(item=><p key={item.id}>{item.title}</p>)}</div>}
      </div>
      <div className="workspace-popover-wrap" ref={accountRef}>
        <button className="account-button" type="button" aria-label="Abrir menu da conta" aria-haspopup="menu" aria-expanded={accountOpen} onClick={()=>{setAccountOpen(value=>!value);setNotificationsOpen(false)}}><span>{user.initials}</span><div><b>{user.name}</b><small>{user.roleLabel}</small></div><ChevronDown size={14}/></button>
        {accountOpen&&<div className="workspace-popover account-popover" role="menu" aria-label="Menu da conta"><Link to="/app/profile" role="menuitem" onClick={()=>setAccountOpen(false)}><UserRound size={15}/><span>Perfil</span></Link><Link to="/app/settings" role="menuitem" onClick={()=>setAccountOpen(false)}><Settings size={15}/><span>Configurações</span></Link><Link className="account-popover-logout" to="/app/login" role="menuitem" onClick={()=>setAccountOpen(false)}><LogOut size={15}/><span>Sair / Logout</span></Link></div>}
      </div>
    </div>
  </header>
}

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:PageHeaderConfig;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const location=useLocation()
  const context=area==='crm'?'CRM':area==='contracts'?'Contratos':area==='finance'?'Financeiro':area==='agenda'?'Agenda':area==='chat'?'Chat':area==='rh'?'RH':area==='marketing'?'Marketing':area==='reports'?'Relatórios':area==='settings'?'Configurações':'Site'
  const [expandedGroups,setExpandedGroups]=useState<Record<string,boolean>>({})
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>typeof window!=='undefined'&&window.sessionStorage.getItem('portal-lander:admin-sidebar-collapsed')==='1')
  const rawActions=headerActions??(headerAction?[headerAction]:[])
  const actions=area==='finance'?rawActions.filter(action=>action.label!=='Automações'):rawActions
  const toggleSidebar=()=>{
    setSidebarCollapsed(current=>{
      const next=!current
      try{window.sessionStorage.setItem('portal-lander:admin-sidebar-collapsed',next?'1':'0')}catch{/* storage indisponível */}
      return next
    })
  }

  return <div className={`app-shell unified-admin-shell${sidebarCollapsed?' admin-sidebar-collapsed':''}`}>
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label="Navegação da Administração">
      <div className="sidebar-head">
        <div className="sidebar-brand-row">
          <Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
        </div>
        {header?.title==='DASHBOARD'?<div className="sidebar-dashboard-heading"><div><strong>Dashboard</strong><small>Visão geral</small></div><button className="cms-sidebar-toggle sidebar-dashboard-toggle" type="button" aria-label={sidebarCollapsed?'Expandir menu':'Recolher menu'} aria-pressed={sidebarCollapsed} onClick={toggleSidebar}>{sidebarCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button></div>:<span>ADMINISTRAÇÃO</span>}
      </div>
      <nav aria-label="Módulos da Administração">
        {items.map(item=>{
          if(isNavGroup(item)){
            const GroupIcon=item.icon
            const activeChild=item.children.some(([, ,to])=>to===location.pathname||(to!=='/app/marketing'&&to!=='/app/site'&&location.pathname.startsWith(`${to}/`)))
            const expanded=expandedGroups[item.label]??activeChild
            return <div className={`sidebar-nav-group${expanded?' expanded':''}`} key={item.label}><button className="sidebar-nav-group-label" type="button" aria-expanded={expanded} onClick={()=>setExpandedGroups(current=>({...current,[item.label]:!expanded}))}><GroupIcon size={17}/><span>{item.label}</span><ChevronDown size={13}/></button>{expanded&&<div className="sidebar-subnav">{item.children.map(([label,Icon,to])=><NavLink end className="sidebar-subnav-link" key={to} to={to}><Icon size={14}/><span>{label}</span></NavLink>)}</div>}</div>
          }
          const [label,Icon,to]=item
          return <NavLink key={to} end={to==='/app/dashboard'||to==='/app/crm'||to==='/app/agenda'||to==='/app/chat'||to==='/app/rh'} to={to}><Icon size={17}/><span>{label}</span></NavLink>
        })}
      </nav>
    </aside>
    <div className="workspace"><PageHeader context={context} header={header} actions={actions} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar}/><main className="workspace-main" id="admin-main" tabIndex={-1}>{children}</main></div>
  </div>
}

export function AdminNotice({title,description}:{title:string;description:string}){return <div className="admin-notice"><div><strong>{title}</strong><p>{description}</p></div></div>}
export function AdminEmpty({title,description}:{title:string;description:string}){return <div className="admin-empty"><strong>{title}</strong><p>{description}</p></div>}
export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>}
