import { BarChart3, CalendarDays, CircleDollarSign, FileSignature, FileText, Globe2, Home, Images, LayoutDashboard, Megaphone, MessageSquareText, Newspaper, Palette, PanelsTopLeft, Settings, Tags, Users, UsersRound } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['CRM',Users,'/app/crm/contatos'],
  ['Contratos',FileSignature,'/app/crm/contracts'],
  ['Agenda',CalendarDays,'/app/crm/events'],
  {
    label:'Marketing',
    icon:Megaphone,
    children:[
      ['Visão Geral',LayoutDashboard,'/app/crm/marketing/visao-geral'],
      ['Briefing',FileText,'/app/crm/marketing/briefing'],
      ['Calendário',CalendarDays,'/app/crm/marketing/calendario'],
      ['Campanhas',Megaphone,'/app/crm/marketing/campanhas'],
      ['IA Criativa',Images,'/app/crm/marketing/ia-criativa'],
      ['Métricas',BarChart3,'/app/crm/marketing/metricas'],
      ['Tarefas',Tags,'/app/crm/marketing/tarefas'],
    ],
  },
  ['Chat',MessageSquareText,'/app/crm/chat'],
  ['Relatórios',BarChart3,'/app/crm/reports'],
  ['RH',UsersRound,'/app/crm/rh'],
  {
    label:'Financeiro',
    icon:CircleDollarSign,
    children:[
      ['Visão Financeira',CircleDollarSign,'/app/crm/financeiro'],
      ['Contabilidade',BarChart3,'/app/crm/financeiro/contabilidade'],
    ],
  },
  ['Configurações',Settings,'/app/crm/settings'],
]

export const SITE_MANAGER_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/site'],
  ['Home',Home,'/app/site/home'],
  ['Marca & Logos',Palette,'/app/site/marca'],
  ['Cabeçalho',PanelsTopLeft,'/app/site/cabecalho'],
  ['Páginas',Globe2,'/app/site/paginas'],
  ['Conteúdos',FileText,'/app/site/conteudos'],
  ['Categorias',Tags,'/app/site/categorias'],
  ['Mídia',Images,'/app/site/midia'],
  ['Publicidade',Megaphone,'/app/site/noticias/anuncio'],
  ['Mídia Kit',Newspaper,'/app/site/midia-kit'],
  ['Configurações',Settings,'/app/site/configuracoes'],
]
