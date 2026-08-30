import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { portalLogo } from '../branding/assets/brandAsset'

export type AdminArea = 'crm' | 'contracts' | 'cms'
export type AdminNavLink = readonly [label: string, icon: LucideIcon, to: string]
export type AdminNavGroup = {label:string;icon:LucideIcon;to?:string;children:readonly AdminNavLink[]}
export type AdminNavItem = AdminNavLink | AdminNavGroup

type AdminShellHeader={title:string;description:string}
export type AdminShellAction={label:string;onClick?:()=>void;disabled?:boolean;disabledReason?:string;variant?:'primary'|'secondary'}

const isNavGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:AdminShellHeader;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const context=area==='crm'?'CRM':area==='contracts'?'Contratos':'Gerenciador do Site'
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const notificationsRef=useRef<HTMLDivElement>(null)
  const accountRef=useRef<HTMLDivElement>(null)
  const actions=headerActions??(headerAction?[headerAction]:[])

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

  const renderActions=()=>actions.map(action=><button key={action.label} className={`button ${action.variant==='secondary'?'outline workspace-header-secondary':'dark'} workspace-primary-action`} type="button" onClick={action.onClick} disabled={action.disabled} title={action.disabled?action.disabledReason:undefined}>{action.label}</button>)

  return <div className="workspace-shell">
    <aside className="workspace-sidebar">
      <div className="workspace-brand"><img src={portalLogo} alt="Portal Lander"/></div>
      <nav className="workspace-nav">{items.map((item,index)=>isNavGroup(item)?<div className="workspace-nav-group" key={`${item.label}-${index}`}><div className="workspace-nav-group-label">{item.label}</div>{item.children.map(([label,Icon,to])=><NavLink to={to} key={to} end={to==='/app/site'} className={({isActive})=>`workspace-nav-item${isActive?' active':''}`}><Icon size={17}/><span>{label}</span></NavLink>)}</div>:<NavLink to={item[2]} key={item[2]} end={item[2]==='/app/site'} className={({isActive})=>`workspace-nav-item${isActive?' active':''}`}><item.1 size={17}/><span>{item[0]}</span></NavLink>)}</nav>
    </aside>
    <div className="workspace-stage">
      <header className="workspace-header">
        <div className="workspace-header-copy"><span>{context}</span><h1>{header?.title??context}</h1>{header?.description&&<p>{header.description}</p>}</div>
        <div className="workspace-header-actions">{renderActions()}<div className="workspace-notifications" ref={notificationsRef}><button className="icon-button notification-button" type="button" aria-label="Notificações" onClick={()=>{setNotificationsOpen(v=>!v);setAccountOpen(false)}}><Bell size={18}/></button>{notificationsOpen&&<div className="workspace-dropdown notification-dropdown"><strong>Notificações</strong><p>Nenhuma notificação nova.</p></div>}</div><div className="workspace-account" ref={accountRef}><button className="workspace-account-button" type="button" onClick={()=>{setAccountOpen(v=>!v);setNotificationsOpen(false)}}><span className="workspace-account-avatar"><UserRound size={18}/></span><span><small>Administrador</small><strong>Deyvisson Lander</strong></span><ChevronDown size={15}/></button>{accountOpen&&<div className="workspace-dropdown account-dropdown"><Link to="/app/profile"><UserRound size={15}/>Meu perfil</Link><Link to="/app/settings"><Settings size={15}/>Configurações</Link><Link to="/app/login"><LogOut size={15}/>Sair</Link></div>}</div></div>
      </header>
      <main className="workspace-main">{children}</main>
    </div>
  </div>
}

export function WorkspaceCard({icon:Icon,title,description,to}:{icon:LucideIcon;title:string;description:string;to:string}){return <Link className="workspace-card" to={to}><span className="workspace-card-icon"><Icon size={22}/></span><div><strong>{title}</strong><p>{description}</p></div><Building2 size={16}/></Link>}
