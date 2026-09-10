import {BarChart3,BookOpen,CalendarDays,ClipboardList,ContactRound,FileText,Images,Landmark,Layers3,LayoutDashboard,ListChecks,MessageCircle,Megaphone,Newspaper,ReceiptText,Settings,Sparkles,UsersRound} from 'lucide-react'
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
  ['RH',UsersRound,'/app/hr'],
  ['Métricas',BarChart3,'/app/metrics'],
  {label:'Site',icon:Layers3,to:'/app/site/pages',children:[
    ['Conteúdos',FileText,'/app/site/content'],
    ['Mídias',Images,'/app/site/media'],
    ['Páginas',Layers3,'/app/site/pages'],
    ['Formulários',ClipboardList,'/app/site/forms'],
    ['Mídia Kit',Newspaper,'/app/site/media-kit'],
  ]},
  {label:'Marketing',icon:Megaphone,to:'/app/marketing',children:[
    ['Visão Geral',LayoutDashboard,'/app/marketing'],
    ['Campanhas',Megaphone,'/app/marketing/campaigns'],
    ['Calendário',CalendarDays,'/app/marketing/calendar'],
    ['Tarefas',ListChecks,'/app/marketing/tasks'],
    ['Briefings',ClipboardList,'/app/marketing/briefings'],
    ['IA Criativa',Sparkles,'/app/marketing/creative-ai'],
  ]},
  ['Configurações',Settings,'/app/settings'],
]

export const SITE_MANAGER_NAV=UNIFIED_ADMIN_NAV
