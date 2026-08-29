export type CrmContactStatus = 'Lead' | 'Cliente' | 'Negociação' | 'Contato'
export type CrmDealStage = 'Novo' | 'Contato' | 'Proposta' | 'Negociação' | 'Fechado'
export type CrmCampaignStatus = 'Ativa' | 'Planejada'

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

export interface CrmDeal {
  id: string
  title: string
  company: string
  stage: CrmDealStage
  owner: string
  value: number
  nextAction: string
}

export interface CrmCampaign {
  id: string
  name: string
  status: CrmCampaignStatus
  channels: string
  budget: number
  leads: number | null
}

export interface CrmSnapshot {
  contacts: readonly CrmContact[]
  activities: readonly CrmActivity[]
  deals: readonly CrmDeal[]
  campaigns: readonly CrmCampaign[]
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
