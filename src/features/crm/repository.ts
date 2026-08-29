import { demoCrmSnapshot } from './data/demoSnapshot'
import type { CrmContact, CrmLead, CrmSnapshot } from './model'

export class CrmPersistenceUnavailableError extends Error {
  constructor() {
    super('Persistência do CRM indisponível: nenhum backend, banco ou API foi configurado para este projeto.')
    this.name = 'CrmPersistenceUnavailableError'
  }
}

export interface CrmRepository {
  getSnapshot(): Promise<CrmSnapshot>
  createContact(input: CrmContact): Promise<CrmContact>
  updateContact(input: CrmContact): Promise<CrmContact>
  deleteContact(id: string): Promise<void>
  createLead(input: CrmLead): Promise<CrmLead>
  updateLead(input: CrmLead): Promise<CrmLead>
  deleteLead(id: string): Promise<void>
}

export class ReadOnlyCrmRepository implements CrmRepository {
  constructor(private readonly snapshot: CrmSnapshot) {}

  async getSnapshot() {
    return {
      contacts: this.snapshot.contacts.map(item=>({...item,tags:[...item.tags],interactions:item.interactions.map(interaction=>({...interaction}))})),
      leads: this.snapshot.leads.map(item=>({...item,tags:[...item.tags],interactions:item.interactions.map(interaction=>({...interaction}))})),
      relationships: this.snapshot.relationships.map(item=>({...item})),
      relatedContent: this.snapshot.relatedContent.map(item=>({...item})),
      metrics: {...this.snapshot.metrics},
    }
  }

  async createContact(): Promise<CrmContact> { throw new CrmPersistenceUnavailableError() }
  async updateContact(): Promise<CrmContact> { throw new CrmPersistenceUnavailableError() }
  async deleteContact(): Promise<void> { throw new CrmPersistenceUnavailableError() }
  async createLead(): Promise<CrmLead> { throw new CrmPersistenceUnavailableError() }
  async updateLead(): Promise<CrmLead> { throw new CrmPersistenceUnavailableError() }
  async deleteLead(): Promise<void> { throw new CrmPersistenceUnavailableError() }
}

export const crmRepository: CrmRepository = new ReadOnlyCrmRepository(demoCrmSnapshot)
export const crmReadModel = demoCrmSnapshot
