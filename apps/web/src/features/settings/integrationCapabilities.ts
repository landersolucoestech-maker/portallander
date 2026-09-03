export type IntegrationProviderId=
  |'autentique'
  |'meta'
  |'tiktok'
  |'google'
  |'spotify'
  |'nfe'
  |'whatsapp'
  |'resend'

export type IntegrationImplementationState='implemented'|'partial'|'planned'

export type IntegrationCapability={
  id:IntegrationProviderId
  name:string
  category:string
  description:string
  state:IntegrationImplementationState
  implementedCapabilities:readonly string[]
  missingCapabilities:readonly string[]
}

export const INTEGRATION_CAPABILITIES:Record<IntegrationProviderId,IntegrationCapability>={
  autentique:{
    id:'autentique',
    name:'Autentique',
    category:'Contratos & Assinaturas',
    description:'Assinatura eletrônica brasileira — envio e acompanhamento de contratos.',
    state:'partial',
    implementedCapabilities:['adapter backend autenticado por token','cliente GraphQL com timeout e erros normalizados','teste administrativo de conectividade'],
    missingCapabilities:['envio multipart de documentos e signatários','consulta de status de documento','webhooks','cancelamento/arquivamento','download do documento assinado','persistência do vínculo contrato↔documento externo'],
  },
  meta:{
    id:'meta',
    name:'Meta',
    category:'Marketing & Social',
    description:'Facebook, Instagram e Meta Ads — mensagens, métricas, publicações, campanhas e resultados da empresa.',
    state:'planned',
    implementedCapabilities:[],
    missingCapabilities:['OAuth Meta','Facebook Pages','Instagram Business','mensagens suportadas pela API','publicações','Insights','Meta Ads','webhooks'],
  },
  tiktok:{
    id:'tiktok',
    name:'TikTok',
    category:'Marketing & Social',
    description:'TikTok for Business e TikTok Ads — mensagens, seguidores, conteúdos, métricas e campanhas.',
    state:'planned',
    implementedCapabilities:[],
    missingCapabilities:['OAuth TikTok','conta Business','conteúdos','métricas','seguidores','TikTok Ads','webhooks'],
  },
  google:{
    id:'google',
    name:'Google',
    category:'Marketing & Analytics',
    description:'Google Analytics, Search Console, Google Ads e YouTube — tráfego, anúncios, SEO e desempenho de vídeos.',
    state:'planned',
    implementedCapabilities:[],
    missingCapabilities:['OAuth Google','Google Analytics','Search Console','Google Ads','YouTube Data/Analytics','refresh de credenciais','sincronização e webhooks quando aplicável'],
  },
  spotify:{
    id:'spotify',
    name:'Spotify',
    category:'Música & Marketing',
    description:'Spotify — lançamentos, ouvintes, streams, seguidores e campanhas.',
    state:'partial',
    implementedCapabilities:['OAuth Spotify','tokens criptografados e refresh','vínculo de playlist','sincronização de lançamentos da playlist','cache normalizado em PostgreSQL'],
    missingCapabilities:['ouvintes','streams','seguidores','métricas de audiência','campanhas e resultados de mídia'],
  },
  nfe:{
    id:'nfe',
    name:'NF-e / SEFAZ',
    category:'Financeiro & Fiscal',
    description:'Emissão de NF-e com certificado digital e credenciais fiscais da empresa.',
    state:'planned',
    implementedCapabilities:[],
    missingCapabilities:['certificado digital','homologação/produção','geração e assinatura XML','autorização SEFAZ','consulta','cancelamento','eventos e rejeições','armazenamento seguro de XML/protocolo'],
  },
  whatsapp:{
    id:'whatsapp',
    name:'WhatsApp',
    category:'Mensagens',
    description:'WhatsApp Business Platform — mensagens, templates, webhooks e status de entrega.',
    state:'partial',
    implementedCapabilities:['adapter backend para Meta Graph API','validação de credenciais/Phone Number ID','envio de mensagem de texto','normalização de destinatário','timeouts e erros normalizados'],
    missingCapabilities:['templates','recebimento por webhook','verificação/assinatura de webhook','status de entrega/leitura','persistência de conversas e mensagens','reconciliação de falhas'],
  },
  resend:{
    id:'resend',
    name:'Resend',
    category:'E-mail',
    description:'E-mails transacionais e newsletter — contatos, templates, envios e eventos de entrega.',
    state:'partial',
    implementedCapabilities:['sincronização de contatos da newsletter','segmento/tópico opcional','persistência de estado de sincronização no PostgreSQL'],
    missingCapabilities:['envio transacional genérico','templates gerenciados pelo Portal','webhooks de delivered/bounced/complained','reconciliação de unsubscribe/suppression','observabilidade de entrega'],
  },
}

export const REQUIRED_INTEGRATION_PROVIDER_IDS=Object.freeze(Object.keys(INTEGRATION_CAPABILITIES) as IntegrationProviderId[])

export const integrationImplementationLabel=(state:IntegrationImplementationState)=>state==='implemented'?'Implementada':state==='partial'?'Parcial':'Planejada'
