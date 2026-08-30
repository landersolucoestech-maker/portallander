import {describe,expect,it} from 'vitest'
import {mockUsers} from './identity'
import {mockContacts,mockLeads} from './crm'
import {mockContracts,mockContractCategories,mockContractTemplates} from './contracts'
import {mockFinanceTransactions,mockFinanceInvoices} from './finance'
import {mockEditorialPages,mockEditorialContents} from './editorial'
import {mockAdvertisingCampaigns} from './advertising'
import {mockAgendaItems} from './agenda'
import {mockNotifications} from './notifications'

const ids=<T extends {id:string}>(items:T[])=>new Set(items.map(item=>item.id))
const users=ids(mockUsers),contacts=ids(mockContacts),leads=ids(mockLeads),contracts=ids(mockContracts),categories=ids(mockContractCategories),templates=ids(mockContractTemplates),transactions=ids(mockFinanceTransactions),invoices=ids(mockFinanceInvoices),pages=ids(mockEditorialPages),contents=ids(mockEditorialContents),campaigns=ids(mockAdvertisingCampaigns)

const entitySets:Record<string,Set<string>>={user:users,contact:contacts,lead:leads,contract:contracts,finance_transaction:transactions,invoice:invoices,editorial_content:contents,advertising_campaign:campaigns}

describe('global mock referential integrity',()=>{
 it('keeps lead conversions linked to real CRM contacts',()=>{for(const lead of mockLeads)if(lead.convertedContactId)expect(contacts.has(lead.convertedContactId),`lead ${lead.id} convertedContactId`).toBe(true)})
 it('keeps contracts linked to real contacts and categories',()=>{for(const contract of mockContracts){expect(categories.has(contract.categoryId),`contract ${contract.id} category`).toBe(true);for(const party of contract.parties)if(party.crmContactId)expect(contacts.has(party.crmContactId),`contract ${contract.id} party ${party.id}`).toBe(true)}})
 it('keeps templates linked to real categories',()=>{for(const template of mockContractTemplates)expect(categories.has(template.categoryId),`template ${template.id} category`).toBe(true)})
 it('keeps finance references linked to CRM and contracts',()=>{for(const item of mockFinanceTransactions){if(item.contactRef)expect(contacts.has(item.contactRef),`transaction ${item.id} contactRef`).toBe(true);if(item.supplierRef)expect(contacts.has(item.supplierRef),`transaction ${item.id} supplierRef`).toBe(true);if(item.contractRef)expect(contracts.has(item.contractRef),`transaction ${item.id} contractRef`).toBe(true)}})
 it('keeps editorial content linked to real pages',()=>{for(const content of mockEditorialContents)expect(pages.has(content.pageId),`content ${content.id} pageId`).toBe(true)})
 it('keeps advertising linked to CRM advertisers',()=>{for(const campaign of mockAdvertisingCampaigns)expect(contacts.has(campaign.advertiserContactId),`campaign ${campaign.id} advertiser`).toBe(true)})
 it('keeps agenda owners and supported related entities valid',()=>{for(const item of mockAgendaItems){expect(users.has(item.ownerUserId),`agenda ${item.id} owner`).toBe(true);const set=entitySets[item.relatedEntityType];if(set)expect(set.has(item.relatedEntityId),`agenda ${item.id} related entity`).toBe(true)}})
 it('keeps notification users and entities valid',()=>{for(const notification of mockNotifications){expect(users.has(notification.userId),`notification ${notification.id} user`).toBe(true);const set=entitySets[notification.entityType];expect(set,`notification ${notification.id} entityType ${notification.entityType}`).toBeDefined();expect(set?.has(notification.entityId),`notification ${notification.id} entity`).toBe(true)}})
})
