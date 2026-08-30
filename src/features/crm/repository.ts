import type {Attachment,Contact,CrmState,Interaction,InteractionType,Lead,TimelineEntry} from './domain'

const STORAGE_KEY='portal-lander:crm:v1'
const emptyState:CrmState={version:1,leads:[],contacts:[]}
const now=()=>new Date().toISOString()
const id=(prefix:string)=>`${prefix}_${crypto.randomUUID()}`

function read():CrmState{
 try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return structuredClone(emptyState);const parsed=JSON.parse(raw) as CrmState;return parsed?.version===1?parsed:structuredClone(emptyState)}catch{return structuredClone(emptyState)}
}
function write(state:CrmState){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('portal-lander:crm:changed'))}
function conflict(actual:string,expected?:string){if(expected&&expected!==actual)throw new Error('CONFLICT: Este registro foi alterado em outra sessão. Reabra o registro antes de salvar.')}
function normalizeText(s:string){return s.trim().toLocaleLowerCase('pt-BR')}
function normalizePhone(s:string){return s.replace(/\D/g,'')}

export const crmRepository={
 listLeads:()=>read().leads.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),
 listContacts:()=>read().contacts.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),
 createLead(input:Omit<Lead,'id'|'createdAt'|'updatedAt'|'attachments'|'interactions'> & {attachments?:Attachment[]}):Lead{
  const state=read(),stamp=now();const lead:Lead={...input,id:id('lead'),createdAt:stamp,updatedAt:stamp,attachments:input.attachments??[],interactions:[]};state.leads.unshift(lead);write(state);return lead
 },
 updateLead(leadId:string,patch:Partial<Lead>,expectedUpdatedAt?:string):Lead{
  const state=read(),index=state.leads.findIndex(x=>x.id===leadId);if(index<0)throw new Error('Lead não encontrado.');conflict(state.leads[index].updatedAt,expectedUpdatedAt);const updated={...state.leads[index],...patch,id:leadId,updatedAt:now()};state.leads[index]=updated;write(state);return updated
 },
 deleteLead(leadId:string){const state=read();state.leads=state.leads.filter(x=>x.id!==leadId);write(state)},
 bulkDeleteLeads(ids:string[]){const state=read(),set=new Set(ids);state.leads=state.leads.filter(x=>!set.has(x.id));write(state)},
 bulkStatus(ids:string[],status:Lead['status']){const state=read(),set=new Set(ids),stamp=now();state.leads=state.leads.map(x=>set.has(x.id)?{...x,status,updatedAt:stamp}:x);write(state)},
 addInteraction(leadId:string,type:InteractionType,notes:string,responsible:string):Interaction{
  const state=read(),lead=state.leads.find(x=>x.id===leadId);if(!lead)throw new Error('Lead não encontrado.');const interaction:Interaction={id:id('interaction'),type,notes:notes.trim(),responsible:responsible.trim(),createdAt:now()};lead.interactions=[interaction,...lead.interactions];lead.updatedAt=now();write(state);return interaction
 },
 createContact(input:Omit<Contact,'id'|'createdAt'|'updatedAt'|'attachments'|'timeline'> & {attachments?:Attachment[],timeline?:TimelineEntry[]}):Contact{
  const state=read(),stamp=now();const contact:Contact={...input,id:id('contact'),createdAt:stamp,updatedAt:stamp,attachments:input.attachments??[],timeline:input.timeline??[{id:id('timeline'),type:'created',description:'Contato criado no CRM',createdAt:stamp}]};state.contacts.unshift(contact);write(state);return contact
 },
 updateContact(contactId:string,patch:Partial<Contact>,expectedUpdatedAt?:string):Contact{
  const state=read(),index=state.contacts.findIndex(x=>x.id===contactId);if(index<0)throw new Error('Contato não encontrado.');conflict(state.contacts[index].updatedAt,expectedUpdatedAt);const previous=state.contacts[index],stamp=now();const updated={...previous,...patch,id:contactId,updatedAt:stamp,timeline:[{id:id('timeline'),type:'updated',description:'Dados do contato atualizados',createdAt:stamp},...previous.timeline]};state.contacts[index]=updated;write(state);return updated
 },
 deleteContact(contactId:string){const state=read();state.contacts=state.contacts.filter(x=>x.id!==contactId);write(state)},
 bulkDeleteContacts(ids:string[]){const state=read(),set=new Set(ids);state.contacts=state.contacts.filter(x=>!set.has(x.id));write(state)},
 addTimeline(contactId:string,type:string,description:string):TimelineEntry{
  const state=read(),contact=state.contacts.find(x=>x.id===contactId);if(!contact)throw new Error('Contato não encontrado.');const entry={id:id('timeline'),type,description:description.trim(),createdAt:now()};contact.timeline=[entry,...contact.timeline];contact.updatedAt=now();write(state);return entry
 },
 convertLead(leadId:string):Contact{
  const state=read(),lead=state.leads.find(x=>x.id===leadId);if(!lead)throw new Error('Lead não encontrado.');if(lead.convertedContactId){const existing=state.contacts.find(x=>x.id===lead.convertedContactId);if(existing)return existing}
  const email=normalizeText(lead.email),phone=normalizePhone(lead.phone);const existing=state.contacts.find(x=>(email&&normalizeText(x.email)===email)||(phone&&normalizePhone(x.phone||x.whatsapp)===phone));if(existing){lead.convertedContactId=existing.id;lead.status='fechado';lead.updatedAt=now();write(state);return existing}
  const stamp=now(),contact:Contact={id:id('contact'),entityType:lead.company?'pessoa_juridica':'pessoa_fisica',category:'cliente',profile:lead.company?'Empresa':'Cliente individual',name:lead.name,company:lead.company,role:lead.role,email:lead.email,phone:lead.phone,whatsapp:lead.phone,city:lead.city,state:lead.state,document:'',website:lead.website,instagram:lead.instagram,priority:lead.priority,status:'ativo',tags:[...lead.tags],notes:lead.notes,attachments:[...lead.attachments],timeline:[{id:id('timeline'),type:'conversion',description:`Convertido do lead ${lead.name}`,createdAt:stamp}],createdAt:stamp,updatedAt:stamp,sourceLeadId:lead.id};state.contacts.unshift(contact);lead.convertedContactId=contact.id;lead.status='fechado';lead.updatedAt=stamp;write(state);return contact
 }
}

export async function filesToAttachments(files:FileList|File[]):Promise<Attachment[]>{
 const list=Array.from(files);const max=2*1024*1024;for(const file of list)if(file.size>max)throw new Error(`O arquivo ${file.name} excede 2 MB.`)
 return Promise.all(list.map(file=>new Promise<Attachment>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error(`Falha ao ler ${file.name}.`));reader.onload=()=>resolve({id:id('attachment'),name:file.name,type:file.type||'application/octet-stream',size:file.size,dataUrl:String(reader.result),createdAt:now()});reader.readAsDataURL(file)})))
}
