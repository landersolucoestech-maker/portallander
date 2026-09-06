import {describe,expect,it} from 'vitest'
import {
 mockChatAutomationSettings,
 mockChatInternalConversations,
 mockChatInternalMembers,
 mockChatInternalMessages,
 mockChatSupportConversations,
 mockChatSupportMessages,
} from '@portallander/mockup'

describe('chat mock contracts',()=>{
 it('keeps every support message attached to an existing conversation',()=>{
  const conversationIds=new Set(mockChatSupportConversations.map((item:{id:string})=>item.id))
  expect(mockChatSupportMessages.length).toBeGreaterThan(0)
  expect(mockChatSupportMessages.every((message:{conversationId:string})=>conversationIds.has(message.conversationId))).toBe(true)
 })

 it('keeps internal conversations and messages attached to valid members',()=>{
  const memberIds=new Set(mockChatInternalMembers.map((item:{authUserId:string})=>item.authUserId))
  const conversationIds=new Set(mockChatInternalConversations.map((item:{id:string})=>item.id))

  expect(mockChatInternalConversations.every((conversation:{participants:Array<{authUserId:string}>;createdBy:string})=>
   conversation.participants.length>=2&&
   conversation.participants.every(participant=>memberIds.has(participant.authUserId))&&
   memberIds.has(conversation.createdBy)
  )).toBe(true)

  expect(mockChatInternalMessages.every((message:{conversationId:string;senderAuthUserId:string})=>
   conversationIds.has(message.conversationId)&&memberIds.has(message.senderAuthUserId)
  )).toBe(true)
 })

 it('keeps automation menu ordering unique and linked to existing templates',()=>{
  const templateIds=new Set(mockChatAutomationSettings.templates.map((template:{id:string})=>template.id))
  const orders=mockChatAutomationSettings.menuOptions.map((option:{order:number})=>option.order)

  expect(new Set(orders).size).toBe(orders.length)
  expect(mockChatAutomationSettings.menuOptions.every((option:{responseTemplateId:string})=>templateIds.has(option.responseTemplateId))).toBe(true)
 })

 it('does not mix required and optional questionnaire fields',()=>{
  const required=new Set<string>(mockChatAutomationSettings.requiredFields as string[])
  expect(mockChatAutomationSettings.optionalFields.every((field:string)=>!required.has(field))).toBe(true)
 })
})
