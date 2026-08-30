import type {AgendaItem} from '../../shared/data/contracts'
import type {AgendaEvent,AgendaLocation,AgendaParticipant} from '../../features/agenda/domain'
import {mockIds} from '../shared'

const owners=[mockIds.users.admin,mockIds.users.editor,mockIds.users.commercial,mockIds.users.finance] as const
const related=[['lead','lead_aurora'],['contract',mockIds.contracts.nexo],['contact',mockIds.contacts.vertice],['invoice','finance_invoice_004'],['content','content_mock_008'],['campaign','campaign_aurora']] as const
const locations=['Sala Comercial','Google Meet','Redação','Financeiro','São Paulo, SP','Rio de Janeiro, RJ'] as const
const statuses:AgendaItem['status'][]=['scheduled','confirmed','completed','cancelled']
export const mockAgendaItems:AgendaItem[]=Array.from({length:32},(_,index)=>{
 const day=1+(index%28),hour=9+(index%8),[relatedEntityType,relatedEntityId]=related[index%related.length]
 const startsAt=`2026-${index<12?'08':'09'}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:00:00.000Z`
 const endsAt=`2026-${index<12?'08':'09'}-${String(day).padStart(2,'0')}T${String(hour+1).padStart(2,'0')}:00:00.000Z`
 return {id:`agenda_${String(index+1).padStart(3,'0')}`,title:['Follow-up comercial','Revisão contratual','Reunião editorial','Conciliação financeira','Planejamento de campanha','Revisão de publicação'][index%6],description:index%5===0?'Reunião com pauta detalhada, responsáveis definidos e dependências registradas para acompanhamento posterior.':'Compromisso operacional da equipe.',startsAt,endsAt,location:locations[index%locations.length],status:statuses[index%statuses.length],ownerUserId:owners[index%owners.length],relatedEntityType,relatedEntityId}
})

export const mockAgendaParticipants:AgendaParticipant[]=[
 {id:'agenda_part_artist_01',source:'artist',label:'Luna Martins',category:'Artista',email:'luna@landerrecords.com',phone:'(11) 99841-2701'},
 {id:'agenda_part_artist_02',source:'artist',label:'Caio Vértice',category:'Artista',email:'caio@landerrecords.com',phone:'(21) 99710-6620'},
 {id:'agenda_part_artist_03',source:'artist',label:'Maya Prado',category:'Artista',email:'maya@landerrecords.com',phone:'(11) 99122-4077'},
 {id:'agenda_part_emp_01',source:'employee',label:'Bruna Teixeira',category:'Produção',email:'bruna@landerrecords.com',phone:'(11) 98811-3204'},
 {id:'agenda_part_emp_02',source:'employee',label:'Rafael Nunes',category:'Comercial',email:'rafael@landerrecords.com',phone:'(11) 98770-5108'},
 {id:'agenda_part_emp_03',source:'employee',label:'Marina Souza',category:'Conteúdo',email:'marina@landerrecords.com',phone:'(21) 99220-6711'},
]

export const mockAgendaLocations:AgendaLocation[]=[
 {id:'agenda_local_01',name:'AudioHouse Studios',address:'Rua Harmonia, 182 — Vila Madalena, São Paulo — SP',contact:'Juliana Moraes',phone:'(11) 3097-4100',city:'São Paulo',state:'SP'},
 {id:'agenda_local_02',name:'Arena Vértice',address:'Av. das Américas, 5800 — Barra da Tijuca, Rio de Janeiro — RJ',contact:'Marcos Lima',phone:'(21) 3410-2280',city:'Rio de Janeiro',state:'RJ'},
 {id:'agenda_local_03',name:'Estúdio Lume',address:'Rua Augusta, 1440 — Consolação, São Paulo — SP',contact:'Paula Ribeiro',phone:'(11) 3141-9012',city:'São Paulo',state:'SP'},
 {id:'agenda_local_04',name:'TV Horizonte',address:'Av. Paulista, 2300 — Bela Vista, São Paulo — SP',contact:'Eduardo Vale',phone:'(11) 3170-8800',city:'São Paulo',state:'SP'},
]

const base=(id:string,title:string,type:string,status:AgendaEvent['status'],startsAt:string,endsAt:string,participantIds:string[],location:string,extras:Partial<AgendaEvent>={}):AgendaEvent=>({id,title,type,status,participantIds,startsAt,endsAt,location,description:'Compromisso operacional com equipe, responsáveis e entregas definidos para acompanhamento na Agenda.',notes:'Confirmar disponibilidade e materiais necessários até 24 horas antes.',checklist:[],createdAt:'2026-08-01T12:00:00.000Z',updatedAt:'2026-08-28T15:00:00.000Z',...extras})

export const mockSchedulerEvents:AgendaEvent[]=[
 base('agenda_evt_001','Gravação do single — Luna Martins','sessoes_estudio','confirmado','2026-08-24T13:00:00.000Z','2026-08-24T17:00:00.000Z',['agenda_part_artist_01','agenda_part_emp_01'],'AudioHouse Studios',{locationId:'agenda_local_01',address:mockAgendaLocations[0].address,venueContact:'Juliana Moraes',venuePhone:'(11) 3097-4100'}),
 base('agenda_evt_002','Ensaio geral — Caio Vértice','ensaios','agendado','2026-08-25T18:00:00.000Z','2026-08-25T20:00:00.000Z',['agenda_part_artist_02','agenda_part_emp_01'],'Sala de Ensaio Lander'),
 base('agenda_evt_003','Podcast Radar Musical','podcasts','confirmado','2026-08-26T14:30:00.000Z','2026-08-26T16:00:00.000Z',['agenda_part_artist_01','agenda_part_emp_03'],'Estúdio Lume',{locationId:'agenda_local_03',address:mockAgendaLocations[2].address,venueContact:'Paula Ribeiro',venuePhone:'(11) 3141-9012'}),
 base('agenda_evt_004','Reunião de campanha — lançamento','reunioes','pendente','2026-08-27T10:00:00.000Z','2026-08-27T11:30:00.000Z',['agenda_part_emp_02','agenda_part_emp_03'],'Sala Comercial'),
 base('agenda_evt_005','Sessão de fotos — campanha inverno','sessoes_fotos','concluido','2026-08-28T12:00:00.000Z','2026-08-28T16:00:00.000Z',['agenda_part_artist_03','agenda_part_emp_03'],'Studio Frame'),
 base('agenda_evt_006','Show — Festival Cidade Viva','shows','confirmado','2026-08-29T21:00:00.000Z','2026-08-29T23:30:00.000Z',['agenda_part_artist_01','agenda_part_emp_01'],'Arena Vértice',{locationId:'agenda_local_02',address:mockAgendaLocations[1].address,venueContact:'Marcos Lima',venuePhone:'(21) 3410-2280',fee:28000,capacity:4800,expectedAudience:4200,checklist:[{item:'Rider técnico aprovado',concluido:true},{item:'Passagens emitidas',concluido:true},{item:'Soundcheck confirmado',concluido:false},{item:'Credenciamento da equipe',concluido:false}]}),
 base('agenda_evt_007','Entrevista — Portal Frequência','entrevistas','agendado','2026-08-30T16:00:00.000Z','2026-08-30T17:00:00.000Z',['agenda_part_artist_02','agenda_part_emp_03'],'Online — Google Meet'),
 base('agenda_evt_008','Programa ao vivo — TV Horizonte','programas_tv','confirmado','2026-08-31T11:00:00.000Z','2026-08-31T13:00:00.000Z',['agenda_part_artist_03','agenda_part_emp_01'],'TV Horizonte',{locationId:'agenda_local_04',address:mockAgendaLocations[3].address,venueContact:'Eduardo Vale',venuePhone:'(11) 3170-8800'}),
 base('agenda_evt_009','Produção de conteúdo — bastidores','producao_conteudo','pendente','2026-09-01T15:00:00.000Z','2026-09-01T18:00:00.000Z',['agenda_part_artist_01','agenda_part_emp_03'],'Lander Records'),
 base('agenda_evt_010','Show corporativo — Nexus','shows','agendado','2026-09-02T19:30:00.000Z','2026-09-02T22:00:00.000Z',['agenda_part_artist_02','agenda_part_emp_01'],'Centro de Eventos Nexus',{fee:18500,capacity:1200,expectedAudience:950}),
 base('agenda_evt_011','Rádio — entrevista manhã','radio','confirmado','2026-09-03T09:00:00.000Z','2026-09-03T10:00:00.000Z',['agenda_part_artist_03','agenda_part_emp_03'],'Rádio Nova FM',{venueContact:'Produção Nova FM',venuePhone:'(11) 3333-9090'}),
 base('agenda_evt_012','Reunião comercial — turnê 2027','reunioes','agendado','2026-09-04T14:00:00.000Z','2026-09-04T15:30:00.000Z',['agenda_part_emp_02','agenda_part_artist_01'],'Sala Comercial'),
 base('agenda_evt_013','Gravação voz final — Maya Prado','sessoes_estudio','pendente','2026-09-07T17:00:00.000Z','2026-09-07T20:00:00.000Z',['agenda_part_artist_03','agenda_part_emp_01'],'AudioHouse Studios',{locationId:'agenda_local_01',address:mockAgendaLocations[0].address}),
 base('agenda_evt_014','Show — Noite Urbana','shows','confirmado','2026-09-10T22:00:00.000Z','2026-09-11T00:00:00.000Z',['agenda_part_artist_02','agenda_part_emp_01'],'Arena Vértice',{locationId:'agenda_local_02',address:mockAgendaLocations[1].address,venueContact:'Marcos Lima',venuePhone:'(21) 3410-2280',fee:32000,capacity:4800,expectedAudience:4500}),
 base('agenda_evt_015','Podcast Especial de Primavera','podcasts','cancelado','2026-09-14T13:00:00.000Z','2026-09-14T14:00:00.000Z',['agenda_part_artist_01'],'Estúdio Lume',{locationId:'agenda_local_03',address:mockAgendaLocations[2].address}),
 base('agenda_evt_016','Sessão de fotos — editorial','sessoes_fotos','agendado','2026-10-06T11:00:00.000Z','2026-10-06T15:00:00.000Z',['agenda_part_artist_02','agenda_part_emp_03'],'Studio Frame'),
 base('agenda_evt_017','Show — Virada Cultural','shows','confirmado','2026-11-21T23:00:00.000Z','2026-11-22T01:00:00.000Z',['agenda_part_artist_03','agenda_part_emp_01'],'Praça Central',{fee:40000,capacity:12000,expectedAudience:10500}),
 base('agenda_evt_018','Reunião anual de planejamento','reunioes','agendado','2026-12-15T13:00:00.000Z','2026-12-15T16:00:00.000Z',['agenda_part_emp_01','agenda_part_emp_02','agenda_part_emp_03'],'Sala Comercial'),
]
