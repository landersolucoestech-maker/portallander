import { BarChart3, BriefcaseBusiness, CalendarDays, CircleDollarSign, FileText, Globe2, Images, LayoutDashboard, Megaphone, Newspaper, PanelsTopLeft, Settings, Tags, TrendingUp, Users } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['Contatos',Users,'/app/crm/contatos'],
  ['Negócios',BriefcaseBusiness,'/app/crm/negocios'],
  ['Atividades',CalendarDays,'/app/crm/atividades'],
  ['Pipeline',TrendingUp,'/app/crm/pipeline'],
  ['Campanhas',Megaphone,'/app/crm/campanhas'],
  ['Relatórios',BarChart3,'/app/crm/relatorios'],
  ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
]

export const SITE_MANAGER_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/site'],
  ['Hero da Home',PanelsTopLeft,'/app/site/home/hero'],
  ['Páginas',Globe2,'/app/site/paginas'],
  ['Conteúdos',FileText,'/app/site/conteudos'],
  ['Categorias',Tags,'/app/site/categorias'],
  ['Mídia',Images,'/app/site/midia'],
  ['Mídia Kit',Newspaper,'/app/site/midia-kit'],
  ['Configurações',Settings,'/app/site/configuracoes'],
]
