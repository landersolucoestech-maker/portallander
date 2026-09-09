import type {DeadlineState,SupportChannel,SupportStatus} from './domain'
export const SUPPORT_CHANNEL_OPTIONS:readonly {value:SupportChannel;label:string}[]=[
 {value:'whatsapp',label:'WhatsApp'},{value:'instagram',label:'Instagram DM'},{value:'facebook',label:'Facebook DM'},{value:'tiktok',label:'TikTok DM'},{value:'site',label:'Site'},{value:'custom',label:'Canal Futuro'},
]
export const SUPPORT_STATUS_OPTIONS:readonly {value:SupportStatus;label:string}[]=[
 {value:'nova',label:'Nova'},{value:'aguardando_atendimento',label:'Aguardando Atendimento'},{value:'em_atendimento',label:'Em Atendimento'},{value:'aguardando_cliente',label:'Aguardando Cliente'},{value:'resolvida',label:'Resolvida'},{value:'arquivada',label:'Arquivada'},
]
export const DEADLINE_LABEL:Record<DeadlineState,string>={on_track:'Dentro do prazo',at_risk:'Próximo do vencimento',overdue:'Prazo vencido'}
export const TEAM_MEMBERS=['Ana Mendes','Lucas Araujo','Bianca Rocha','Sem responsável'] as const
export const AUTOMATION_TABS=[['mensagens','Mensagens'],['menu','Menu e filas'],['escalonamento','Escalonamento'],['templates','Templates']] as const
export const channelLabel=(value:SupportChannel)=>SUPPORT_CHANNEL_OPTIONS.find(item=>item.value===value)?.label??value
export const statusLabel=(value:SupportStatus)=>SUPPORT_STATUS_OPTIONS.find(item=>item.value===value)?.label??value
