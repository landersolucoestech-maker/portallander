import {describe,expect,it} from 'vitest'
import {
 mockUsers,mockNotifications,mockContacts,mockLeads,mockContracts,mockContractTemplates,mockContractCategories,mockContractVariables,
 mockFinanceTransactions,mockFinanceInvoices,mockFinanceCategories,mockFinanceRules,mockEditorialPages,mockEditorialContents,mockEditorialMedia,
 mockHomeStories,mockHomeMostRead,mockHomeReleases,mockHomeAgenda,mockAgendaItems,mockAdvertisingCampaigns,mockSocialChannels,mockCollaborationTypes,
 mockDataScenarios,
} from './index'

describe('global mock data coverage',()=>{
 it('ships realistic volumes for operational screens',()=>{
  expect(mockUsers.length).toBeGreaterThanOrEqual(5)
  expect(mockNotifications.length).toBeGreaterThanOrEqual(15)
  expect(mockContacts.length).toBeGreaterThanOrEqual(30)
  expect(mockLeads.length).toBeGreaterThanOrEqual(30)
  expect(mockContracts.length).toBeGreaterThanOrEqual(20)
  expect(mockContractTemplates.length).toBeGreaterThanOrEqual(6)
  expect(mockContractCategories.length).toBeGreaterThanOrEqual(8)
  expect(mockContractVariables.length).toBeGreaterThanOrEqual(20)
  expect(mockFinanceTransactions.length).toBeGreaterThanOrEqual(60)
  expect(mockFinanceInvoices.length).toBeGreaterThanOrEqual(30)
  expect(mockFinanceCategories.length).toBeGreaterThanOrEqual(8)
  expect(mockFinanceRules.length).toBeGreaterThanOrEqual(4)
  expect(mockEditorialPages.length).toBeGreaterThanOrEqual(6)
  expect(mockEditorialContents.length).toBeGreaterThanOrEqual(40)
  expect(mockEditorialMedia.length).toBeGreaterThanOrEqual(20)
  expect(mockHomeStories.length).toBeGreaterThanOrEqual(20)
  expect(mockHomeMostRead.length).toBeGreaterThanOrEqual(8)
  expect(mockHomeReleases.length).toBeGreaterThanOrEqual(10)
  expect(mockHomeAgenda.length).toBeGreaterThanOrEqual(6)
  expect(mockAgendaItems.length).toBeGreaterThanOrEqual(24)
  expect(mockAdvertisingCampaigns.length).toBeGreaterThanOrEqual(12)
  expect(mockSocialChannels.length).toBeGreaterThanOrEqual(4)
  expect(mockCollaborationTypes.length).toBeGreaterThanOrEqual(4)
  expect(Object.keys(mockDataScenarios)).toHaveLength(8)
 })

 it('covers distinct states rather than repeated filler rows',()=>{
  expect(new Set(mockLeads.map(item=>item.status)).size).toBeGreaterThanOrEqual(6)
  expect(new Set(mockLeads.map(item=>item.origin)).size).toBeGreaterThanOrEqual(8)
  expect(new Set(mockContacts.map(item=>item.category)).size).toBeGreaterThanOrEqual(8)
  expect(new Set(mockContracts.map(item=>item.status)).size).toBeGreaterThanOrEqual(8)
  expect(new Set(mockFinanceTransactions.map(item=>item.status)).size).toBeGreaterThanOrEqual(4)
  expect(new Set(mockFinanceTransactions.map(item=>item.category)).size).toBeGreaterThanOrEqual(8)
  expect(new Set(mockFinanceInvoices.map(item=>item.status)).size).toBeGreaterThanOrEqual(4)
  expect(new Set(mockEditorialContents.map(item=>item.status)).size).toBeGreaterThanOrEqual(3)
  expect(mockContacts.some(item=>item.attachments.length>0)).toBe(true)
  expect(mockContacts.some(item=>item.attachments.length===0)).toBe(true)
  expect(mockContracts.some(item=>item.attachments.length>0)).toBe(true)
  expect(mockContracts.some(item=>item.document.versions.length>0)).toBe(true)
  expect(mockFinanceTransactions.some(item=>Boolean(item.notes))).toBe(true)
  expect(mockEditorialContents.some(item=>item.body.length>3)).toBe(true)
 })
})
