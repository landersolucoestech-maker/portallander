import {BookOpen,ContactRound,FileText,Globe2,Home,Images,Landmark,LayoutDashboard,Megaphone,Newspaper,Palette,PanelsTopLeft,ReceiptText,Tags,Zap} from 'lucide-react'
import type {AdminNavItem} from './AdminUi'

export const CRM_WORKSPACE_NAV:readonly AdminNavItem[]=[
 ['Dashboard',LayoutDashboard,'/app/dashboard'],
 ['CRM',ContactRound,'/app/crm'],
 ['Contratos',FileText,'/app/contracts'],
 {label:'Financeiro',icon:Landmark,to:'/app/finance',children:[
  ['Transações',Landmark,'/app/finance'],
  ['Notas Fiscais',ReceiptText,'/app/finance/invoices'],
  ['Contabilidade',BookOpen,'/app/finance/accounting'],
  ['Categorias',Tags,'/app/finance/categories'],
  ['Regras',Zap,'/app/finance/rules'],
 ]},
]

export const SITE_MANAGER_NAV:readonly AdminNavItem[]=[
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
