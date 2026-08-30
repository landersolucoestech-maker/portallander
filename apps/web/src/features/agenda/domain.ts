export type AgendaViewMode='dia'|'semana'|'mes'|'ano'
export type AgendaEventStatus='agendado'|'confirmado'|'pendente'|'concluido'|'cancelado'
export type AgendaParticipantSource='artist'|'employee'

export interface AgendaParticipant{
 id:string
 source:AgendaParticipantSource
 label:string
 category:string
 email?:string
 phone?:string
}

export interface AgendaLocation{
 id:string
 name:string
 address:string
 contact:string
 phone?:string
 city?:string
 state?:string
}

export interface AgendaChecklistItem{item:string;concluido:boolean}

export interface AgendaEvent{
 id:string
 title:string
 type:string
 status:AgendaEventStatus
 participantIds:string[]
 startsAt:string
 endsAt?:string
 location:string
 locationId?:string
 address?:string
 venueContact?:string
 venuePhone?:string
 venueEmail?:string
 capacity?:number
 fee?:number
 expectedAudience?:number
 description:string
 notes:string
 checklist:AgendaChecklistItem[]
 createdAt:string
 updatedAt:string
}

export type AgendaEventDraft=Omit<AgendaEvent,'id'|'createdAt'|'updatedAt'>
