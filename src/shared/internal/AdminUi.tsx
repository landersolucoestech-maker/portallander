import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ChevronDown, Gauge } from 'lucide-react'
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
  '/app/crm/events':{
    title:'Agenda',
    description:'Agenda operacional para reuniões, entrevistas, coberturas, follow-ups, compromissos editoriais e comerciais.'
  },
  '/app/crm/marketing/visao-geral':{
    title:'Marketing',
    description:'Visão geral das iniciativas, campanhas e execução do setor.'
  },
  '/app/crm/marketing/briefing':{
    title:'Briefing',
    description:'Estratégia, público, objetivos, mensagens e entregáveis.'
  },
  '/app/crm/marketing/calendario':{
    title:'Marketing · Calendário',
    description:'Planejamento de publicações, campanhas e entregas.'
  },
  '/app/crm/marketing/campanhas':{
    title:'Campanhas',
    description:'Campanhas, canais, orçamento, status e desempenho.'
  },
  '/app/crm/marketing/ia-criativa':{
    title:'IA Criativa',
    description:'Criação, perfil, pitching, tendências, métricas e histórico.'
  },
  '/app/crm/marketing/metricas':{
    title:'Métricas',
    description:'Performance de marketing por campanha e plataforma.'
  }
}

const routeShellClass=(pathname:string)=>{
  if(pathname==='/app/crm/events')return ' app-shell-agenda'
  if(pathname==='/app/crm/marketing/visao-geral')return ' app-shell-marketing-overview'
  if(pathname==='/app/crm/marketing/calendario')return ' app-shell-marketing-calendar'
  return ''
}

export function AdminShell({area,items,children,header,headerAction,headerActions}:{area:AdminArea;items:readonly AdminNavItem[];children:ReactNode;header?:AdminShellHeader;headerAction?:AdminShellAction;headerActions?:readonly AdminShellAction[]}){
  const context=area==='crm'?'CRM':'Gerenciador do Site'
  const location=useLocation()
  const promotedHeader=PROMOTED_HEADERS[location.pathname]
  const effectiveHeader=header??promotedHeader
  const [notificationsOpen,setNotificationsOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const notificationsRef=useRef<HTMLDivElement>(null)
  const actions=headerActions??(headerAction?[headerAction]:[])

  useEffect(()=>{
    if(!notificationsOpen)return
    const closeOnOutsidePointer=(event:PointerEvent)=>{
      if(notificationsRef.current&&!notificationsRef.current.contains(event.target as Node))setNotificationsOpen(false)
    }
    document.addEventListener('pointerdown',closeOnOutsidePointer)
    return()=>document.removeEventListener('pointerdown',closeOnOutsidePointer)
  },[notificationsOpen])

  return <div className={`app-shell${routeShellClass(location.pathname)}`}>
    <a className="admin-skip-link" href="#admin-main">Pular para o conteúdo</a>
    <aside className="sidebar" aria-label={`Navegação do ${context}`}>
      <div className="sidebar-head">
        <Link to="/" className="brand" aria-label="Ir para o Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
        <span>{context}</span>
      </div>
      <nav aria-label={`Seções do ${context}`}>{items.map(item=>{
        if(isNavGroup(item)){
          const GroupIcon=item.icon
          const groupContent=<><GroupIcon size={17} aria-hidden="true"/><span>{item.label}</span><ChevronDown size={13} aria-hidden="true"/></>
          return <div className="sidebar-nav-group" key={item.label}>
            {item.to?<NavLink className="sidebar-nav-group-label" to={item.to}>{groupContent}</NavLink>:<div className="sidebar-nav-group-label">{groupContent}</div>}
            <div className="sidebar-subnav">{item.children.map(([label,Icon,to])=><NavLink className="sidebar-subnav-link" key={to} to={to}><Icon size={14} aria-hidden="true"/><span>{label}</span></NavLink>)}</div>
          </div>
        }
        const [label,Icon,to]=item
        return <NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={17} aria-hidden="true"/><span>{label}</span></NavLink>
      })}</nav>
      <div className="sidebar-bottom"><NavLink to="/app/workspaces"><Building2 size={17} aria-hidden="true"/><span>Trocar workspace</span></NavLink></div>
    </aside>

    <div className="workspace">
      <header className={`workspace-top${effectiveHeader?' workspace-top-page':''}`}>
        {effectiveHeader?<div className="workspace-page-heading"><h1>{effectiveHeader.title}</h1><p>{effectiveHeader.description}</p></div>:<div className="workspace-identity">
          <span className="workspace-name">Portal Lander</span>
          <span className="workspace-divider" aria-hidden="true"/>
          <span className="workspace-context">{context}</span>
        </div>}
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
  const location=useLocation()
  if(PROMOTED_HEADERS[location.pathname])return null
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
