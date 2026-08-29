import type { CrmSnapshot } from '../model'

/**
 * Snapshot exclusivamente demonstrativo para validar a experiência do CRM
 * enquanto o projeto não possui backend/banco conectado.
 * Nunca deve ser tratado como fonte persistente ou dado de produção.
 */
export const demoCrmSnapshot: CrmSnapshot = {
  contacts: [
    { id:'marina-costa', name:'Marina Costa', company:'Norte Produções', status:'Lead', owner:'Comercial', relatedValue:18000 },
    { id:'rafael-alves', name:'Rafael Alves', company:'Estúdio Horizonte', status:'Cliente', owner:'Deyvisson', relatedValue:32500 },
    { id:'camila-rocha', name:'Camila Rocha', company:'Aurora Music', status:'Negociação', owner:'Comercial', relatedValue:24000 },
    { id:'bruno-lima', name:'Bruno Lima', company:'BL Eventos', status:'Contato', owner:'Equipe', relatedValue:7500 },
  ],
  activities: [
    { id:'retornar-aurora', time:'10:30', title:'Retornar proposta — Aurora Music', channel:'Ligação' },
    { id:'reuniao-norte', time:'14:00', title:'Reunião — Norte Produções', channel:'Reunião' },
    { id:'followup-bl', time:'16:15', title:'Follow-up — BL Eventos', channel:'WhatsApp' },
  ],
  deals: [
    { id:'aurora-campanha', title:'Campanha institucional', company:'Aurora Music', stage:'Negociação', owner:'Comercial', value:24000, nextAction:'Revisar proposta comercial' },
    { id:'norte-patrocinio', title:'Pacote de mídia', company:'Norte Produções', stage:'Proposta', owner:'Comercial', value:18000, nextAction:'Apresentação às 14:00' },
    { id:'horizonte-retencao', title:'Renovação anual', company:'Estúdio Horizonte', stage:'Fechado', owner:'Deyvisson', value:32500, nextAction:'Onboarding comercial' },
    { id:'bl-divulgacao', title:'Divulgação de evento', company:'BL Eventos', stage:'Contato', owner:'Equipe', value:7500, nextAction:'Confirmar briefing' },
  ],
  metrics: {
    contacts: 248,
    leads: 42,
    clients: 31,
    pipelineValue: 82000,
  },
}
