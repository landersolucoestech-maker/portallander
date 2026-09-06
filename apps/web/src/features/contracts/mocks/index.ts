import {mockContractCategories,mockContracts,mockContractTemplates,mockContractVariables} from '@portallander/mockup'

/** Compatibility facade. Canonical reusable Contracts development data lives in @portallander/mockup. */
export const contractsMockMeta={source:'global-mock-provider',enabled:true} as const
export const contractsMockRecords=mockContracts
export const contractTemplatesMock=mockContractTemplates
export const contractCategoriesMock=mockContractCategories
export const contractVariablesMock=mockContractVariables
