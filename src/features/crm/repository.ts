import type { CrmActivity, CrmContact, CrmDeal, CrmSnapshot } from './model'

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
  createDeal(input: CrmDeal): Promise<CrmDeal>
  updateDeal(input: CrmDeal): Promise<CrmDeal>
  deleteDeal(id: string): Promise<void>
  createActivity(input: CrmActivity): Promise<CrmActivity>
  updateActivity(input: CrmActivity): Promise<CrmActivity>
  deleteActivity(id: string): Promise<void>
}

export class ReadOnlyCrmRepository implements CrmRepository {
  constructor(private readonly snapshot: CrmSnapshot) {}

  async getSnapshot() {
    return {
      contacts: this.snapshot.contacts.map(item => ({...item})),
      activities: this.snapshot.activities.map(item => ({...item})),
      deals: this.snapshot.deals.map(item => ({...item})),
      metrics: {...this.snapshot.metrics},
    }
  }

  async createContact(): Promise<CrmContact> { throw new CrmPersistenceUnavailableError() }
  async updateContact(): Promise<CrmContact> { throw new CrmPersistenceUnavailableError() }
  async deleteContact(): Promise<void> { throw new CrmPersistenceUnavailableError() }
  async createDeal(): Promise<CrmDeal> { throw new CrmPersistenceUnavailableError() }
  async updateDeal(): Promise<CrmDeal> { throw new CrmPersistenceUnavailableError() }
  async deleteDeal(): Promise<void> { throw new CrmPersistenceUnavailableError() }
  async createActivity(): Promise<CrmActivity> { throw new CrmPersistenceUnavailableError() }
  async updateActivity(): Promise<CrmActivity> { throw new CrmPersistenceUnavailableError() }
  async deleteActivity(): Promise<void> { throw new CrmPersistenceUnavailableError() }
}
