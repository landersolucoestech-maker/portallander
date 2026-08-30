import type {AgendaEventStatus,AgendaViewMode} from './domain'

export const AGENDA_VIEW_OPTIONS:{value:AgendaViewMode;label:string}[]=[
 {value:'dia',label:'Dia'},
 {value:'semana',label:'Semana'},
 {value:'mes',label:'Mês'},
 {value:'ano',label:'Ano'},
]

export const AGENDA_EVENT_TYPES=[
 {value:'sessoes_estudio',label:'Sessões de estúdio'},
 {value:'ensaios',label:'Ensaios'},
 {value:'sessoes_fotos',label:'Sessões de fotos'},
 {value:'shows',label:'Shows'},
 {value:'entrevistas',label:'Entrevistas'},
 {value:'podcasts',label:'Podcasts'},
 {value:'programas_tv',label:'Programas de TV'},
 {value:'radio',label:'Rádio'},
 {value:'producao_conteudo',label:'Produção de conteúdo'},
 {value:'reunioes',label:'Reuniões'},
] as const

export const AGENDA_STATUS_OPTIONS:{value:AgendaEventStatus;label:string}[]=[
 {value:'agendado',label:'Agendado'},
 {value:'confirmado',label:'Confirmado'},
 {value:'pendente',label:'Pendente'},
 {value:'concluido',label:'Concluído'},
 {value:'cancelado',label:'Cancelado'},
]

export const AGENDA_FILTER_STATUS_OPTIONS=[
 {value:'confirmado',label:'Confirmado'},
 {value:'pendente',label:'Pendente'},
 {value:'agendado',label:'Agendado'},
 {value:'realizado',label:'Realizado'},
 {value:'cancelado',label:'Cancelado'},
 {value:'negociacao',label:'Negociação'},
] as const

export const AGENDA_ARTIST_RELATED_TYPES=new Set(['sessoes_estudio','ensaios','sessoes_fotos','shows','entrevistas','podcasts','programas_tv','radio','producao_conteudo'])
export const AGENDA_CRM_LOCATION_TYPES=new Set(['shows','programas_tv','radio','podcasts'])
export const agendaTypeLabel=(value:string)=>AGENDA_EVENT_TYPES.find(item=>item.value===value)?.label??value.replace(/_/g,' ').replace(/\b\w/g,char=>char.toUpperCase())
export const agendaStatusLabel=(value:string)=>AGENDA_STATUS_OPTIONS.find(item=>item.value===value)?.label??AGENDA_FILTER_STATUS_OPTIONS.find(item=>item.value===value)?.label??value
