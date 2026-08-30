import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, FilePlus2, FileStack, LayoutTemplate, LogOut, UserPlus, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'contracts' | 'finance' | 'cms'
export type AdminNavLink = readonly [label: string, icon: LucideIcon, to: string]
export type AdminNavGroup = {label:string;icon:LucideIcon;to?:string;children:readonly AdminNavLink[]}
export type AdminNavItem = AdminNavLink | AdminNavGroup

export type PageHeaderConfig={title:string;description:string}
export type AdminShellAction={label:string;onClick?:()=>void;disabled?:boolean;disabledReason?:string;variant?:'primary'|'secondary';className?:string;icon?:LucideIcon}

const isNavGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

function HeaderActionButton({action}:{action:AdminShellAction}){
  const fallbackIcon:LucideIcon|undefined=action.label==='Templates'?LayoutTemplate:action.label==='Novo Template'||action.label==='Novo Contrato'?FilePlus2:action.label==='Novo Contato'||action.label==='Novo Lead'?UserPlus:action.label==='Contratos'?FileStack:undefined
  const ActionIcon=action.icon??fallbackIcon
  return <button className={`button ${action.variant==='secondary'?'outline workspace-header-secondary':'dark'} workspace-primary-action workspace-header-polished-action${action.className?` ${action.className}`:''}`} type="button" onClick={action.onClick} disabled={action.disabled} title={action.disabled?action.disabledReason:undefined}>{ActionIcon&&<ActionIcon size={14} aria-hidden="true"/>}{action.label}</button>
}

function PageHeader({context,header,actions}:{context:string;header?:PageHeaderConfig;actions:readonly AdminShellAction[]}){
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const notificationsRef=useRef<HTMLDivElement>(null)
  const accountRef=useRef<HTMLDivElement>(null)

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

  return <header className={`workspace-top${header?' workspace-top-page':''}`}>
    {header?<div className="workspace-page-heading"><h1>{header.title}</h1><p>{header.description}</p></div>:<div className="workspace-identity"><span className="workspace-name">Portal Lander</span><span className="workspace-divider"/><span className="workspace-context">{context}</span></div>}
    <div className="workspace-actions">
      {actions.map(action=><HeaderActionButton key={action.label} action={action}/>)}
      <div className="workspace-popover-wrap" ref={notificationsRef}><button className="icon-button notification-button" type="button" aria-label="Abrir notificações" aria-expanded={notificationsOpen} onClick={()=>{setNotificationsOpen(value=>!value);setAccountOpen(false)}}><Bell size={17}/></button>{notificationsOpen&&<div className="workspace-popover notifications-popover" role="status"><strong>Notificações</strong><p>Nenhuma notificação no momento.</p></div>}</div>
      <div className="workspace-popover-wrap" ref={accountRef}><button className="account-button" type="button" aria-label="Abrir menu da conta" aria-haspopup="menu" aria-expanded={accountOpen} onClick={()=>{setAccountOpen(value=>!value);setNotificationsOpen(false)}}><span>PL</span><div><b>Administrador</b><small>Deyvisson Lander</small></div><ChevronDown size={14}/></button>{accountOpen&&<div className="workspace-popover account-popover" role="menu" aria-label="Menu da conta"><Link to="/app/profile" role="menuitem" onClick={()=>setAccountOpen(false)}><UserRound size={15}/><span>Meu perfil</span></Link><Link className="account-popover-logout" to="/app/login" role="menuitem" onClick={()=>setAccountOpen(false)}><LogOut size={15}/><span>Sair</span></Link></div>}</div>
    </div>
  </header>
}

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:PageHeaderConfig;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const context=area==='crm'?'CRM':area==='contracts'?'Contratos':area==='finance'?'Financeiro':'Gerenciador do Site'
  const [expandedGroups,setExpandedGroups]=useState<Record<string,boolean>>({})
  const rawActions=headerActions??(headerAction?[headerAction]:[])
  const actions=area==='finance'?rawActions.filter(action=>action.label!=='Automações'):rawActions

  return <div className="app-shell">
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label={`Navegação do ${context}`}>
      <div className="sidebar-head"><Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link><span>{context}</span></div>
      <nav aria-label={`Seções do ${context}`}>{items.map(item=>{
        if(isNavGroup(item)){
          const GroupIcon=item.icon,expanded=expandedGroups[item.label]===true
          return <div className={`sidebar-nav-group${expanded?' expanded':''}`} key={item.label}>
            <button className="sidebar-nav-group-label" type="button" aria-expanded={expanded} onClick={()=>setExpandedGroups(current=>({...current,[item.label]:!expanded}))}><GroupIcon size={17}/><span>{item.label}</span><ChevronDown size={13}/></button>
            {expanded&&<div className="sidebar-subnav">{item.children.map(([label,Icon,to])=><NavLink end className="sidebar-subnav-link" key={to} to={to}><Icon size={14}/><span>{label}</span></NavLink>)}</div>}
          </div>
        }
        const [label,Icon,to]=item;return <NavLink key={to} end={to==='/app/site'} to={to}><Icon size={17}/><span>{label}</span></NavLink>
      })}</nav>
      <div className="sidebar-bottom"><NavLink to="/app/workspaces"><Building2 size={17}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <PageHeader context={context} header={header} actions={actions}/>
      <main className="workspace-main" id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  </div>
}

export function AdminNotice({title,description}:{title:string;description:string}){return <div className="admin-notice"><div><strong>{title}</strong><p>{description}</p></div></div>}
export function AdminEmpty({title,description}:{title:string;description:string}){return <div className="admin-empty"><strong>{title}</strong><p>{description}</p></div>}
export function AdminKpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){return <div className="admin-kpi"><div className="admin-kpi-top"><span className="admin-kpi-label">{label}</span><span className="admin-kpi-icon">{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>}
