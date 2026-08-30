import {describe,expect,it} from 'vitest'
import {
 mockChatAutomationSettings,
 mockChatInternalConversations,
 mockChatInternalMembers,
 mockChatInternalMessages,
 mockChatSupportConversations,
 mockChatSupportMessages,
} from '../../mocks/chat'

describe('chat mock contracts',()=>{
 it('keeps every support message attached to an existing conversation',()=>{
  const conversationIds=new Set(mockChatSupportConversations.map(item=>item.id))
  expect(mockChatSupportMessages.length).toBeGreaterThan(0)
  expect(mockChatSupportMessages.every(message=>conversationIds.has(message.conversationId))).toBe(true)
 })

 it('keeps internal conversations and messages attached to valid members',()=>{
  const memberIds=new Set(mockChatInternalMembers.map(item=>item.authUserId))
  const conversationIds=new Set(mockChatInternalConversations.map(item=>item.id))

  expect(mockChatInternalConversations.every(conversation=>
   conversation.participants.length>=2&&
   conversation.participants.every(participant=>memberIds.has(participant.authUserId))&&
   memberIds.has(conversation.createdBy)
  )).toBe(true)

  expect(mockChatInternalMessages.every(message=>
   conversationIds.has(message.conversationId)&&memberIds.has(message.senderAuthUserId)
  )).toBe(true)
 })

 it('keeps automation menu ordering unique and linked to existing templates',()=>{
  const templateIds=new Set(mockChatAutomationSettings.templates.map(template=>template.id))
  const orders=mockChatAutomationSettings.menuOptions.map(option=>option.order)

  expect(new Set(orders).size).toBe(orders.length)
  expect(mockChatAutomationSettings.menuOptions.every(option=>templateIds.has(option.responseTemplateId))).toBe(true)
 })

 it('does not mix required and optional questionnaire fields',()=>{
  const required=new Set(mockChatAutomationSettings.requiredFields)
  expect(mockChatAutomationSettings.optionalFields.every(field=>!required.has(field))).toBe(true)
 })
})
