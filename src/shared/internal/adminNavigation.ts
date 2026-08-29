import { BarChart3, CalendarDays, CircleDollarSign, FileSignature, FileText, Globe2, Headphones, Home, Images, LayoutDashboard, Megaphone, MessageSquareText, Newspaper, Palette, PanelsTopLeft, PlugZap, Settings, Tags, Users, UsersRound } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['CRM',Users,'/app/crm/contatos'],
  ['Campanhas',Megaphone,'/app/crm/campanhas'],
  ['Contabilidade',CircleDollarSign,'/app/crm/accounting'],
  ['Contratos',FileSignature,'/app/crm/contracts'],
  ['Agenda',CalendarDays,'/app/crm/events'],
  ['Integrações',PlugZap,'/app/crm/integrations'],
  ['Marketing',Megaphone,'/app/crm/marketing'],
  ['Atendimento',Headphones,'/app/crm/musicchat'],
  ['Chat Interno',MessageSquareText,'/app/crm/internal-chat'],
  ['Relatórios',BarChart3,'/app/crm/reports'],
  ['RH',UsersRound,'/app/crm/rh'],
  ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
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
