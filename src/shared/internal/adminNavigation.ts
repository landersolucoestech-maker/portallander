import { FileText, Globe2, Home, Images, LayoutDashboard, Megaphone, Newspaper, Palette, PanelsTopLeft, Tags } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_WORKSPACE_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
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
]
