export type CrmContactStatus = 'Lead' | 'Cliente' | 'Negociação' | 'Contato'

export interface CrmContact {
  id: string
  name: string
  company: string
  status: CrmContactStatus
  owner: string
  relatedValue: number
}

export interface CrmActivity {
  id: string
  time: string
  title: string
  channel: 'Ligação' | 'Reunião' | 'WhatsApp'
}

export interface CrmSnapshot {
  contacts: readonly CrmContact[]
  activities: readonly CrmActivity[]
  metrics: {
    contacts: number
    leads: number
    clients: number
    pipelineValue: number
  }
}

export const formatCurrency = (value:number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
}).format(value)

export const statusClass = (value:string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/\s+/g,'-')
