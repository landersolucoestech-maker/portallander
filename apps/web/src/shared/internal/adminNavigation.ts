import {BookOpen,CalendarDays,ClipboardList,ContactRound,FileText,Images,Landmark,Layers3,LayoutDashboard,ListChecks,MessageCircle,Megaphone,Newspaper,ReceiptText,Settings,Sparkles,UsersRound} from 'lucide-react'
import type {AdminNavItem} from './AdminUi'

export const UNIFIED_ADMIN_NAV:readonly AdminNavItem[]=[
  ['Dashboard',LayoutDashboard,'/app/dashboard'],
  ['CRM',ContactRound,'/app/crm'],
  {label:'Financeiro',icon:Landmark,to:'/app/finance',children:[
    ['Transações',Landmark,'/app/finance'],
    ['Notas Fiscais',ReceiptText,'/app/finance/invoices'],
    ['Contabilidade',BookOpen,'/app/finance/accounting'],
  ]},
  ['Agenda',CalendarDays,'/app/agenda'],
  ['Chat',MessageCircle,'/app/chat'],
  ['RH',UsersRound,'/app/rh'],
  {label:'Site',icon:Layers3,to:'/app/site',children:[
    ['Conteúdos',FileText,'/app/site/conteudos'],
    ['Mídias',Images,'/app/site/midia'],
    ['Páginas',Layers3,'/app/site/paginas'],
    ['Formulários',ClipboardList,'/app/site/formularios'],
    ['Mídia Kit',Newspaper,'/app/site/midia-kit'],
  ]},
  {label:'Marketing',icon:Megaphone,to:'/app/marketing',children:[
    ['Visão Geral',LayoutDashboard,'/app/marketing'],
    ['Campanhas',Megaphone,'/app/marketing/campanhas'],
    ['Calendário',CalendarDays,'/app/marketing/calendario'],
    ['Tarefas',ListChecks,'/app/marketing/tarefas'],
    ['Briefings',ClipboardList,'/app/marketing/briefings'],
    ['IA Criativa',Sparkles,'/app/marketing/ia-criativa'],
  ]},
  ['Configurações',Settings,'/app/settings'],
]

// Aliases temporários preservam os consumidores atuais durante a migração módulo a módulo.
export const CRM_WORKSPACE_NAV=UNIFIED_ADMIN_NAV
export const SITE_MANAGER_NAV=UNIFIED_ADMIN_NAV
