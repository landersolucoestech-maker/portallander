import type {AgendaEventStatus,AgendaViewMode} from './domain'

export const AGENDA_VIEW_OPTIONS:{value:AgendaViewMode;label:string}[]=[
 {value:'dia',label:'Dia'},
 {value:'semana',label:'Semana'},
 {value:'mes',label:'Mês'},
 {value:'ano',label:'Ano'},
]

export const AGENDA_EVENT_TYPES=[
 {value:'reuniao',label:'Reunião'},
 {value:'follow_up_comercial',label:'Follow-up comercial'},
 {value:'compromisso',label:'Compromisso'},
 {value:'prazo_vencimento',label:'Prazo / vencimento'},
 {value:'contrato',label:'Contrato'},
 {value:'financeiro',label:'Financeiro'},
 {value:'nota_fiscal',label:'Nota fiscal'},
 {value:'producao_conteudo',label:'Produção de conteúdo'},
 {value:'evento_institucional',label:'Evento institucional'},
 {value:'outro',label:'Outro'},
] as const

export const AGENDA_STATUS_OPTIONS:{value:AgendaEventStatus;label:string}[]=[
 {value:'agendado',label:'Agendado'},
 {value:'confirmado',label:'Confirmado'},
 {value:'pendente',label:'Pendente'},
 {value:'concluido',label:'Concluído'},
 {value:'cancelado',label:'Cancelado'},
]

export const AGENDA_LOCATION_TYPES=new Set(['reuniao','compromisso','producao_conteudo','evento_institucional','outro'])
export const AGENDA_CRM_LOCATION_TYPES=new Set(['reuniao','compromisso','evento_institucional'])
export const agendaTypeLabel=(value:string)=>AGENDA_EVENT_TYPES.find(item=>item.value===value)?.label??value.replace(/_/g,' ').replace(/\b\w/g,char=>char.toUpperCase())
export const agendaStatusLabel=(value:string)=>AGENDA_STATUS_OPTIONS.find(item=>item.value===value)?.label??value
