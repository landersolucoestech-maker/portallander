import { BarChart3, CalendarDays, CircleDollarSign, FileSignature, FileText, Globe2, Home, Images, LayoutDashboard, Megaphone, MessageSquareText, Newspaper, Palette, PanelsTopLeft, Settings, Tags, Users, UsersRound } from 'lucide-react'
import type { AdminNavItem } from './AdminUi'

export const CRM_NAV: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['CRM',Users,'/app/crm/contatos'],
  {
    label:'Contratos',
    icon:FileSignature,
    children:[
      ['Contratos',FileSignature,'/app/crm/contracts'],
      ['Templates de Contrato',FileText,'/app/crm/contracts/templates'],
      ['Variáveis de Template',Tags,'/app/crm/contracts/variaveis'],
      ['Categorias de Contrato',Tags,'/app/crm/contracts/categorias'],
    ],
  },
  ['Agenda',CalendarDays,'/app/crm/events'],
  {
    label:'Marketing',
    icon:Megaphone,
    children:[
      ['Visão Geral',LayoutDashboard,'/app/crm/marketing/visao-geral'],
      ['Briefings',FileText,'/app/crm/marketing/briefing'],
      ['Calendário',CalendarDays,'/app/crm/marketing/calendario'],
      ['Campanhas',Megaphone,'/app/crm/marketing/campanhas'],
      ['IA Criativa',Images,'/app/crm/marketing/ia-criativa'],
      ['Métricas',BarChart3,'/app/crm/marketing/metricas'],
      ['Tarefas',Tags,'/app/crm/marketing/tarefas'],
    ],
  },
  {
    label:'Chat',
    icon:MessageSquareText,
    children:[
      ['MusicChat',MessageSquareText,'/app/crm/chat'],
      ['Automações do MusicChat',Settings,'/app/crm/chat/automacoes'],
    ],
  },
  ['Relatórios',BarChart3,'/app/crm/reports'],
  ['RH',UsersRound,'/app/crm/rh'],
  {
    label:'Financeiro',
    icon:CircleDollarSign,
    children:[
      ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
      ['Contabilidade',BarChart3,'/app/crm/financeiro/contabilidade'],
      ['Notas Fiscais',FileText,'/app/crm/financeiro/nota-fiscal'],
      ['Categorias Financeiras',Tags,'/app/crm/financeiro/categorias'],
      ['Automações Financeiras',Settings,'/app/crm/financeiro/regras'],
      ['Regras de Categorização Financeira',Settings,'/app/crm/financeiro/regras-transacao'],
    ],
  },
  {
    label:'Configurações',
    icon:Settings,
    children:[
      ['Configurações',Settings,'/app/crm/settings'],
      ['Meu Perfil',Users,'/app/crm/settings/perfil'],
      ['Usuários',UsersRound,'/app/crm/settings/usuarios'],
      ['Audit Trail',FileText,'/app/crm/settings/audit-trail'],
      ['Billing',CircleDollarSign,'/app/crm/settings/billing'],
    ],
  },
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
