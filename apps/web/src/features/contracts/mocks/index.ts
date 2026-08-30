import {mockContractCategories,mockContracts,mockContractTemplates,mockContractVariables} from '../../../mocks'

/**
 * Compatibility facade for the Contracts module.
 * Canonical mock records live in src/mocks/contracts and are consumed at runtime through ApplicationDataProvider.
 */
export const contractsMockMeta={source:'global-mock-provider',enabled:true} as const
export const contractsMockRecords=mockContracts
export const contractTemplatesMock=mockContractTemplates
export const contractCategoriesMock=mockContractCategories
export const contractVariablesMock=mockContractVariables
