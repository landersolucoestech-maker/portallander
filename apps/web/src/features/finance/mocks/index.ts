import {mockFinanceCategories,mockFinanceInvoices,mockFinanceRules,mockFinanceTransactions} from '../../../mocks'

/**
 * Compatibility facade for the Finance module.
 * Canonical mock records live in src/mocks/finance and are consumed at runtime through ApplicationDataProvider.
 */
export const financeCategoriesMock=mockFinanceCategories
export const financeTransactionsMock=mockFinanceTransactions
export const financeInvoicesMock=mockFinanceInvoices
export const financeRulesMock=mockFinanceRules
