import type {AgendaItem} from '../../shared/data/contracts'
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
