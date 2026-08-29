export type CrmContactStatus = 'Contato' | 'Cliente' | 'Parceiro' | 'Inativo'
export type CrmLeadStatus = 'Novo' | 'Contatado' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Convertido' | 'Perdido'
export type CrmPersonType = 'PF' | 'PJ'
export type CrmTemperature = 'Frio' | 'Morno' | 'Quente'
export type CrmCampaignStatus = 'Ativa' | 'Planejada'

export interface CrmContact {
  id: string
  name: string
  personType: CrmPersonType
  company: string
  role: string
  category: string
  email: string
  phone: string
  location: string
  source: string
  owner: string
  status: CrmContactStatus
  tags: readonly string[]
  lastInteraction: string
  nextFollowUp?: string
  notes?: string
  relatedValue: number
}

export interface CrmLead {
  id: string
  name: string
  company: string
  role: string
  email: string
  phone: string
  location: string
  leadType: string
  interest: string
  source: string
  owner: string
  status: CrmLeadStatus
  temperature: CrmTemperature
  potentialValue: number
  nextAction: string
  nextFollowUp: string
  campaign?: string
  utmSource?: string
  tags: readonly string[]
  notes?: string
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
  leads: readonly CrmLead[]
  campaigns: readonly CrmCampaign[]
  metrics: {
    contacts: number
    leads: number
    clients: number
    qualifiedLeads: number
    hotLeads: number
    convertedLeads: number
    followUpsDue: number
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
