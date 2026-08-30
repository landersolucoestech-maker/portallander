import {emptyContact,type Attachment,type Contact} from './domain'

export type ContactDraft=ReturnType<typeof emptyContact>&{attachments:Attachment[]}

export const draftFromContact=(contact?:Contact|null):ContactDraft=>contact?{
 entityType:contact.entityType,
 category:contact.category,
 profile:contact.profile,
 name:contact.name,
 company:contact.company,
 role:contact.role,
 email:contact.email,
 phone:contact.phone,
 whatsapp:contact.whatsapp,
 city:contact.city,
 state:contact.state,
 document:contact.document,
 website:contact.website,
 instagram:contact.instagram,
 priority:contact.priority,
 status:contact.status,
 tags:[...contact.tags],
 notes:contact.notes,
 attachments:[...contact.attachments],
}:{...emptyContact(),attachments:[]}
