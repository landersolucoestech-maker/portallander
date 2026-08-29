import type { LucideIcon } from 'lucide-react'
import { BarChart3, CalendarDays, CircleDollarSign, FileSignature, Headphones, Megaphone, MessageSquareText, PlugZap, Settings, UsersRound } from 'lucide-react'

export type OperationsModuleKey='accounting'|'contracts'|'events'|'integrations'|'marketing'|'musicchat'|'internal-chat'|'reports'|'rh'|'settings'

export interface OperationsModuleDefinition {
  key: OperationsModuleKey
  title: string
  eyebrow: string
  description: string
  icon: LucideIcon
  capabilities: readonly string[]
  kpis: readonly {label:string;value:string;detail:string}[]
  rows: readonly {primary:string;secondary:string;status:string;meta:string}[]
  note: string
}

export const OPERATIONS_MODULES: readonly OperationsModuleDefinition[] = [
  {
    key:'accounting',title:'Contabilidade',eyebrow:'FINANCEIRO E FISCAL',icon:CircleDollarSign,
    description:'Visão financeira, transações, categorias, regras de classificação e preparação para emissão/gestão fiscal do Portal Lander.',
    capabilities:['Transações financeiras','Categorias financeiras','Regras de categorização','Notas fiscais','Visão contábil e gráficos'],
    kpis:[{label:'Receitas',value:'R$ 28.400',detail:'Snapshot demonstrativo'},{label:'Despesas',value:'R$ 9.850',detail:'Snapshot demonstrativo'},{label:'Saldo',value:'R$ 18.550',detail:'Snapshot demonstrativo'},{label:'Notas fiscais',value:'7',detail:'Documentos demonstrativos'}],
    rows:[{primary:'Publicidade Portal Lander',secondary:'Receita · Anunciante',status:'Recebido',meta:'R$ 8.500'},{primary:'Cobertura Festival Órbita',secondary:'Receita · Evento',status:'Previsto',meta:'R$ 12.000'},{primary:'Ferramentas e serviços',secondary:'Despesa · Operação',status:'Pago',meta:'R$ 2.480'}],
    note:'O ZIP foi usado como referência para regras financeiras, transações e nota fiscal. Nenhum lançamento é persistido até existir backend financeiro real.'
  },
  {
    key:'contracts',title:'Contratos',eyebrow:'DOCUMENTOS E ASSINATURAS',icon:FileSignature,
    description:'Gestão de contratos comerciais, editoriais, publicidade, parcerias, templates, variáveis e assinatura eletrônica.',
    capabilities:['Contratos','Templates','Variáveis e categorias','Pré-visualização de documento','Timeline documental','Envio para assinatura'],
    kpis:[{label:'Contratos',value:'12',detail:'Snapshot demonstrativo'},{label:'Em assinatura',value:'3',detail:'Aguardando conclusão'},{label:'Ativos',value:'7',detail:'Relacionamentos vigentes'},{label:'Templates',value:'5',detail:'Modelos preparados'}],
    rows:[{primary:'Pacote de mídia · Norte Produções',secondary:'Publicidade',status:'Em assinatura',meta:'Autentique futuro'},{primary:'Cobertura · Festival Órbita',secondary:'Evento',status:'Rascunho',meta:'Escopo em revisão'},{primary:'Parceria · Studio Sul',secondary:'Parceria',status:'Ativo',meta:'Vigente'}],
    note:'A estrutura segue a ideia de wizard, templates, timeline e assinatura do arquivo, adaptada aos contratos do Portal Lander. Assinatura real depende de integração oficial.'
  },
  {
    key:'events',title:'Agenda',eyebrow:'AGENDA E COMPROMISSOS',icon:CalendarDays,
    description:'Agenda operacional para reuniões, entrevistas, coberturas, follow-ups, compromissos editoriais e comerciais.',
    capabilities:['Calendário','Criação de compromisso','Participantes','Tipos de evento','Visualização de agenda','Vínculo futuro com CRM'],
    kpis:[{label:'Hoje',value:'4',detail:'Compromissos demonstrativos'},{label:'Esta semana',value:'11',detail:'Agenda demonstrativa'},{label:'Entrevistas',value:'3',detail:'Pautas previstas'},{label:'Follow-ups',value:'5',detail:'CRM relacionado'}],
    rows:[{primary:'Follow-up Norte Produções',secondary:'Comercial · Marina Costa',status:'Hoje',meta:'10:30'},{primary:'Revisão Festival Órbita',secondary:'Cobertura editorial',status:'Amanhã',meta:'15:00'},{primary:'Entrevista Mariana Santos',secondary:'Editorial',status:'Planejado',meta:'03/09 · 14:00'}],
    note:'A agenda aproveita a ideia de scheduler, participantes e tipos de evento do ZIP. Integração com calendário externo será feita apenas quando houver provedor real.'
  },
  {
    key:'integrations',title:'Integrações',eyebrow:'PROVEDORES E APIs',icon:PlugZap,
    description:'Central para configurar e acompanhar provedores oficiais usados pelo Portal Lander em comunicação, mídia, documentos, fiscal e analytics.',
    capabilities:['WhatsApp / Meta','Instagram e Facebook','Resend','Autentique / Clicksign','NFS-e','Google Ads','YouTube e TikTok','Analytics e monitoramento'],
    kpis:[{label:'Disponíveis',value:'8',detail:'Integrações planejadas'},{label:'Conectadas',value:'0',detail:'Nenhuma credencial real'},{label:'OAuth',value:'4',detail:'Fluxos futuros'},{label:'Webhooks',value:'0',detail:'Backend necessário'}],
    rows:[{primary:'Meta',secondary:'Instagram · Facebook · Mensagens · Conteúdo · Ads',status:'Não conectado',meta:'OAuth oficial'},{primary:'WhatsApp',secondary:'Atendimento e mensagens',status:'Não conectado',meta:'Meta Cloud API'},{primary:'Resend',secondary:'E-mail transacional e operacional',status:'Não conectado',meta:'API key'},{primary:'Autentique / Clicksign',secondary:'Assinatura eletrônica',status:'Não conectado',meta:'API oficial'},{primary:'NFS-e',secondary:'Emissão e consulta fiscal',status:'Não conectado',meta:'Provedor fiscal'}],
    note:'Nenhuma integração está sendo simulada como ativa. A tela representa a arquitetura de adapters/providers inspirada pelo ZIP e preparada para credenciais reais.'
  },
  {
    key:'marketing',title:'Marketing',eyebrow:'CAMPANHAS E CONTEÚDO',icon:Megaphone,
    description:'Planejamento de marketing do Portal Lander com briefing, calendário, campanhas, ideias criativas, métricas e tarefas.',
    capabilities:['Visão geral','Briefings','Calendário de marketing','Campanhas','Ideias criativas','Métricas','Tarefas'],
    kpis:[{label:'Campanhas ativas',value:'2',detail:'Snapshot demonstrativo'},{label:'Briefings',value:'4',detail:'Em preparação'},{label:'Tarefas abertas',value:'9',detail:'Operação demonstrativa'},{label:'Leads atribuídos',value:'211',detail:'Dados demonstrativos'}],
    rows:[{primary:'Portal Lander Institucional',secondary:'Meta + Google',status:'Ativa',meta:'Aquisição e marca'},{primary:'Mídia Kit Comercial',secondary:'Meta',status:'Planejada',meta:'Captação de anunciantes'},{primary:'Calendário editorial setembro',secondary:'Conteúdo + social',status:'Em preparação',meta:'12 pautas'}],
    note:'A estrutura é inspirada nas áreas Visão Geral, Briefing, Calendário, Campanhas, IA Criativa, Métricas e Tarefas do ZIP, adaptadas ao portal.'
  },
  {
    key:'musicchat',title:'Atendimento',eyebrow:'MENSAGENS E TRIAGEM',icon:Headphones,
    description:'Central de atendimento para futuras conversas de WhatsApp, Instagram, Facebook e outros canais oficiais.',
    capabilities:['Inbox unificada','Nova conversa','Triagem','Filas','Regras de escalonamento','Automações de atendimento','Central de suporte'],
    kpis:[{label:'Conversas abertas',value:'8',detail:'Snapshot demonstrativo'},{label:'Aguardando',value:'3',detail:'Fila demonstrativa'},{label:'Em atendimento',value:'4',detail:'Fila demonstrativa'},{label:'Resolvidas hoje',value:'6',detail:'Snapshot demonstrativo'}],
    rows:[{primary:'Marina Costa',secondary:'WhatsApp · Comercial',status:'Aguardando',meta:'2 min'},{primary:'Aline Moreira',secondary:'Instagram · Editorial',status:'Em atendimento',meta:'8 min'},{primary:'Festival Órbita',secondary:'WhatsApp · Cobertura',status:'Aberto',meta:'15 min'}],
    note:'O módulo adota as ideias de filas, triagem, regras e automações do MusicChat, mas mensagens reais só existirão após conexão com APIs oficiais.'
  },
  {
    key:'internal-chat',title:'Chat Interno',eyebrow:'COMUNICAÇÃO DA EQUIPE',icon:MessageSquareText,
    description:'Conversas internas entre áreas do Portal Lander para coordenar editorial, comercial, marketing e operação.',
    capabilities:['Conversas internas','Nova conversa','Participantes','Contexto por área','Vínculos futuros com CRM e conteúdo'],
    kpis:[{label:'Conversas',value:'6',detail:'Snapshot demonstrativo'},{label:'Não lidas',value:'4',detail:'Snapshot demonstrativo'},{label:'Editorial',value:'3',detail:'Conversas por área'},{label:'Comercial',value:'2',detail:'Conversas por área'}],
    rows:[{primary:'Cobertura Festival Órbita',secondary:'Editorial + Comercial',status:'Ativa',meta:'5 participantes'},{primary:'Mídia Kit 2026',secondary:'Comercial + Marketing',status:'Ativa',meta:'3 participantes'},{primary:'Pautas da semana',secondary:'Editorial',status:'Ativa',meta:'4 participantes'}],
    note:'Esta área vem da ideia do musicchat-interno do ZIP e é separada do atendimento externo. Persistência e presença em tempo real dependem de backend.'
  },
  {
    key:'reports',title:'Relatórios',eyebrow:'ANÁLISE CONSOLIDADA',icon:BarChart3,
    description:'Relatórios consolidados do Portal Lander cruzando CRM, marketing, financeiro, editorial e operação.',
    capabilities:['Relatórios executivos','Importação futura','Filtros por período','CRM e aquisição','Receita e publicidade','Conteúdo e audiência','Exportação futura'],
    kpis:[{label:'Relatórios',value:'7',detail:'Visões preparadas'},{label:'Fontes',value:'5',detail:'Módulos relacionados'},{label:'Atualização',value:'Manual',detail:'Sem backend analítico'},{label:'Exportações',value:'0',detail:'Integração futura'}],
    rows:[{primary:'Aquisição e conversão',secondary:'CRM + Marketing',status:'Disponível',meta:'Snapshot'},{primary:'Publicidade e receita',secondary:'CRM + Financeiro',status:'Disponível',meta:'Snapshot'},{primary:'Conteúdo e relacionamentos',secondary:'Editorial + CRM',status:'Disponível',meta:'Snapshot'}],
    note:'O módulo consolida a ideia de relatórios/importação do ZIP sem substituir relatórios especializados já existentes em cada workspace.'
  },
  {
    key:'rh',title:'RH',eyebrow:'EQUIPE E PESSOAS',icon:UsersRound,
    description:'Gestão administrativa da equipe do Portal Lander: colaboradores, férias, ausências e preparação para folha.',
    capabilities:['Funcionários e colaboradores','Férias e ausências','Folha de pagamento futura','Perfis e vínculo','Documentação administrativa'],
    kpis:[{label:'Colaboradores',value:'8',detail:'Snapshot demonstrativo'},{label:'Ativos',value:'8',detail:'Snapshot demonstrativo'},{label:'Ausências',value:'1',detail:'Período demonstrativo'},{label:'Folha',value:'Não conectada',detail:'Sem processamento real'}],
    rows:[{primary:'Equipe Editorial',secondary:'3 colaboradores',status:'Ativo',meta:'Conteúdo'},{primary:'Equipe Comercial',secondary:'2 colaboradores',status:'Ativo',meta:'Publicidade'},{primary:'Operação e Administração',secondary:'3 colaboradores',status:'Ativo',meta:'Backoffice'}],
    note:'Foram aproveitadas as ideias de funcionário, férias/ausências, folha e visualização do RH do ZIP. Dados reais exigem backend e controles de acesso adequados.'
  },
  {
    key:'settings',title:'Configurações',eyebrow:'ADMINISTRAÇÃO DO SISTEMA',icon:Settings,
    description:'Configurações administrativas do backoffice: perfil, usuários, permissões futuras, auditoria, cobrança e estado das integrações.',
    capabilities:['Perfil administrativo','Usuários','Permissões futuras','Auditoria','Billing futuro','Status de integrações','Identidade operacional'],
    kpis:[{label:'Usuários',value:'3',detail:'Snapshot demonstrativo'},{label:'Perfis',value:'3',detail:'Admin · Editorial · Comercial'},{label:'Integrações ativas',value:'0',detail:'Nenhuma credencial real'},{label:'Auditoria',value:'Local',detail:'Sem trilha persistente'}],
    rows:[{primary:'Administrador',secondary:'Acesso total futuro',status:'Planejado',meta:'Permissões reais pendentes'},{primary:'Editorial',secondary:'Conteúdo e relacionamento',status:'Planejado',meta:'RBAC futuro'},{primary:'Comercial',secondary:'CRM, marketing e financeiro',status:'Planejado',meta:'RBAC futuro'}],
    note:'A área aproveita Perfil, Usuários, Billing e Audit Trail do ZIP, mas não simula autenticação, RBAC ou cobrança enquanto esses serviços não existirem.'
  },
] as const

export const operationsModuleByKey=(key:string)=>OPERATIONS_MODULES.find(module=>module.key===key)
