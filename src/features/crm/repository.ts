import { demoCrmSnapshot } from './data/demoSnapshot'
import type { CrmActivity, CrmCampaign, CrmContact, CrmDeal, CrmSnapshot } from './model'

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
  createCampaign(input: CrmCampaign): Promise<CrmCampaign>
  updateCampaign(input: CrmCampaign): Promise<CrmCampaign>
  deleteCampaign(id: string): Promise<void>
}

export class ReadOnlyCrmRepository implements CrmRepository {
  constructor(private readonly snapshot: CrmSnapshot) {}

  async getSnapshot() {
    return {
      contacts: this.snapshot.contacts.map(item => ({...item})),
      activities: this.snapshot.activities.map(item => ({...item})),
      deals: this.snapshot.deals.map(item => ({...item})),
      campaigns: this.snapshot.campaigns.map(item => ({...item})),
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
  async createCampaign(): Promise<CrmCampaign> { throw new CrmPersistenceUnavailableError() }
  async updateCampaign(): Promise<CrmCampaign> { throw new CrmPersistenceUnavailableError() }
  async deleteCampaign(): Promise<void> { throw new CrmPersistenceUnavailableError() }
}

export const crmRepository: CrmRepository = new ReadOnlyCrmRepository(demoCrmSnapshot)

/**
 * Read model síncrono temporário para a UI atual.
 * Quando a API real existir, esta exportação deve ser substituída por estado carregado
 * do backend sem alterar os componentes consumidores.
 */
export const crmReadModel = demoCrmSnapshot
