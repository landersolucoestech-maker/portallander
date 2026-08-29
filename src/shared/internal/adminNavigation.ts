import { BarChart3, CalendarDays, CircleDollarSign, FileSignature, FileText, Globe2, Headphones, Home, Images, LayoutDashboard, Megaphone, MessageSquareText, Newspaper, Palette, PanelsTopLeft, PlugZap, Settings, Tags, Users, UsersRound } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['CRM',Users,'/app/crm/contatos'],
  ['Campanhas',Megaphone,'/app/crm/campanhas'],
  ['Relatórios',BarChart3,'/app/crm/relatorios'],
  ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
]

export const OPERATIONS_NAV: readonly AdminNavItem[] = [
  ['Contabilidade',CircleDollarSign,'/app/operations/accounting'],
  ['Contratos',FileSignature,'/app/operations/contracts'],
  ['Agenda',CalendarDays,'/app/operations/events'],
  ['Integrações',PlugZap,'/app/operations/integrations'],
  ['Marketing',Megaphone,'/app/operations/marketing'],
  ['Atendimento',Headphones,'/app/operations/musicchat'],
  ['Chat Interno',MessageSquareText,'/app/operations/internal-chat'],
  ['Relatórios',BarChart3,'/app/operations/reports'],
  ['RH',UsersRound,'/app/operations/rh'],
  ['Configurações',Settings,'/app/operations/settings'],
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
