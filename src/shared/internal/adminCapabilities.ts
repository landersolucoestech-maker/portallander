export type CapabilityState = 'available' | 'browser-local' | 'unavailable'

export type AdminCapability = {
  state: CapabilityState
  label: string
  description: string
}

export const ADMIN_CAPABILITIES = {
  crmPersistence: {
    state:'unavailable',
    label:'Persistência do CRM',
    description:'Nenhum backend, banco ou API do CRM está conectado.',
  },
  editorialPersistence: {
    state:'unavailable',
    label:'Persistência editorial',
    description:'Páginas e conteúdos utilizam atualmente um snapshot read-only empacotado no frontend.',
  },
  mediaStorage: {
    state:'unavailable',
    label:'Storage de mídia',
    description:'Não existe biblioteca de uploads persistente conectada.',
  },
  heroPersistence: {
    state:'browser-local',
    label:'Persistência do Hero',
    description:'O editor do Hero salva somente no armazenamento local deste navegador.',
  },
  homeAdPersistence: {
    state:'browser-local',
    label:'Persistência do anúncio da Home',
    description:'O editor do anúncio principal da Home salva somente no armazenamento local deste navegador.',
  },
  headerBrandPersistence: {
    state:'browser-local',
    label:'Persistência da logo do cabeçalho',
    description:'A configuração da marca do cabeçalho salva somente no armazenamento local deste navegador.',
  },
  footerBrandPersistence: {
    state:'browser-local',
    label:'Persistência da logo do rodapé',
    description:'A configuração da marca do rodapé salva somente no armazenamento local deste navegador.',
  },
  adminAuth: {
    state:'unavailable',
    label:'Autenticação administrativa',
    description:'Não existe autenticação/autorização server-side para proteger a área administrativa.',
  },
  analytics: {
    state:'unavailable',
    label:'Analytics',
    description:'Não existe uma fonte de métricas reais conectada aos dashboards.',
  },
  notifications: {
    state:'unavailable',
    label:'Notificações',
    description:'O sino do admin possui interface, mas nenhuma fonte persistente de eventos está conectada.',
  },
} as const satisfies Record<string,AdminCapability>

export const capabilityStatusLabel=(state:CapabilityState)=>state==='available'?'Disponível':state==='browser-local'?'Local':'Pendente'
export const capabilityStatusClass=(state:CapabilityState)=>state==='available'?'published':state==='browser-local'?'negociacao':'draft'
