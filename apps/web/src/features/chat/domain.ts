export type ChatArea='internal'|'support'
export type SupportChannel='whatsapp'|'instagram'|'facebook'|'tiktok'|'site'|'custom'
export type SupportStatus='nova'|'aguardando_atendimento'|'em_atendimento'|'aguardando_cliente'|'resolvida'|'arquivada'
export type DeadlineState='on_track'|'at_risk'|'overdue'
export type MessageDeliveryStatus='sending'|'sent'|'failed'|'internal_only'
export type InternalConversationType='direct'|'group'
export type ChatPriority='baixa'|'media'|'alta'|'critica'
export type ChatNotificationChannel='in_app'|'whatsapp'|'sms'

export interface ChatAttachment{id:string;name:string;type:string;size:number;dataUrl?:string}
export interface SupportMessage{id:string;conversationId:string;sender:'customer'|'agent'|'system';author:string;body:string;time:string;createdAt:string;attachments?:ChatAttachment[];deliveryStatus?:MessageDeliveryStatus;deliveryError?:string;externalId?:string;internalNote?:boolean}
export interface SupportCrmSummary{existingCustomer:boolean;lead:string;openDeal:string;stage:string}
export interface SupportConversation{id:string;customer:string;handle:string;phone:string;instagram:string;email:string;originLabel:string;channel:SupportChannel;queue:string;sector:string;status:SupportStatus;assignee:string;protocol:string;sla:number;remainingTimeLabel:string;deadlineState:DeadlineState;tags:string[];assunto?:string;lastMessage:string;lastMessageAt:string;createdAt:string;lastReplyAt:string;unread:number;value:string;crmSummary:SupportCrmSummary;auditTrail:string[];updatedAt:string}
export interface InternalMember{authUserId:string;fullName:string|null;email:string}
export interface InternalParticipant extends InternalMember{lastReadAt:string|null}
export interface InternalConversation{id:string;type:InternalConversationType;name:string|null;createdBy:string;createdAt:string;updatedAt:string;participants:InternalParticipant[]}
export interface InternalMessage{id:string;conversationId:string;senderAuthUserId:string;body:string;createdAt:string;editedAt:string|null}
export interface ChatMenuOption{id:string;order:number;label:string;responseTemplateId:string;queue:string;sector:string;defaultAssignee?:string|null;tags:string[];priority:ChatPriority;active:boolean;requiredFields?:string[];optionalFields?:string[]}
export interface ChatTemplate{id:string;title:string;body:string}
export interface ChatEscalationRule{id:string;afterMinutes:number;level:string;recipientRole:'supervisor'|'manager'|string;recipientUserId?:string|null;channels:ChatNotificationChannel[];active:boolean}
export interface ChatAutomationSettings{enabled:boolean;welcomeMessage:string;mainMenuMessage:string;menuOptions:ChatMenuOption[];templates:ChatTemplate[];requiredFields:string[];optionalFields:string[];invalidOptionMessage:string;absenceMessage:string;outOfHoursMessage:string;closingMessage:string;returnToMenuRule:{enabled:boolean;commands:string[]};escalationRules:ChatEscalationRule[];notificationChannels:Record<ChatNotificationChannel,boolean>;supervisorUserId:string|null;managerUserId:string|null;updatedAt:string}
export interface ChatSeed{supportConversations:SupportConversation[];supportMessages:SupportMessage[];internalMembers:InternalMember[];internalConversations:InternalConversation[];internalMessages:InternalMessage[];quickReplies:string[];automation:ChatAutomationSettings}
