import type {SiteFormDefinition} from './domain'

export const siteFormRegistry:readonly SiteFormDefinition[]=[
  {
    id:'lead-capture',name:'Captação de Leads',slug:'captacao-leads',version:1,purpose:'lead_capture',status:'draft',source:'system',
    fields:[
      {id:'lead-name',key:'name',label:'Nome',type:'text',required:true,placeholder:'Nome completo',order:1},
      {id:'lead-email',key:'email',label:'E-mail',type:'email',required:true,placeholder:'voce@empresa.com',order:2},
      {id:'lead-phone',key:'phone',label:'Telefone / WhatsApp',type:'tel',required:false,order:3},
      {id:'lead-company',key:'company',label:'Empresa / Marca',type:'text',required:false,order:4},
      {id:'lead-message',key:'message',label:'Como podemos ajudar?',type:'textarea',required:true,order:5},
    ],
    consents:[{id:'lead-privacy',kind:'privacy',label:'Privacidade',required:true,version:'1.0',text:'Autorizo o tratamento dos dados informados para atendimento da minha solicitação.'}],
    routing:{destination:'crm',crm:{origin:'formulario_portal',tags:['site','formulario']}},
    successMessage:'Recebemos seus dados. Nossa equipe entrará em contato.',
  },
  {
    id:'collaborate',name:'Colabore',slug:'colabore',version:1,purpose:'editorial_submission',status:'active',source:'system',
    fields:[
      {id:'collab-name',key:'nome',label:'Seu nome',type:'text',required:true,placeholder:'Nome completo',order:1},
      {id:'collab-email',key:'email',label:'E-mail',type:'email',required:true,order:2},
      {id:'collab-whatsapp',key:'whatsapp',label:'WhatsApp',type:'tel',required:false,order:3},
      {id:'collab-location',key:'local',label:'Cidade / Estado',type:'text',required:false,order:4},
      {id:'collab-title',key:'titulo',label:'Título',type:'text',required:true,order:5},
      {id:'collab-type',key:'tipo',label:'Assunto / Tipo de conteúdo',type:'select',required:true,options:['noticia','video','foto','pauta'],order:6},
      {id:'collab-message',key:'mensagem',label:'Conte a história',type:'textarea',required:true,order:7},
      {id:'collab-source',key:'fonte',label:'Fonte ou link de referência',type:'url',required:false,order:8},
      {id:'collab-file',key:'arquivo',label:'Arquivo de apoio',type:'file',required:false,order:9},
    ],
    consents:[{id:'collab-rights',kind:'content_rights',label:'Autorização de compartilhamento',required:true,version:'1.0',text:'Confirmo que as informações são verdadeiras e que possuo autorização para compartilhar os materiais anexados quando necessário.'}],
    routing:{destination:'content_collaborations',collaboration:{defaultStatus:'received',defaultPriority:'normal'}},
    successMessage:'Material recebido. Nossa equipe editorial fará a triagem.',
  },
]

export const getSiteFormBySlug=(slug:string)=>siteFormRegistry.find(form=>form.slug===slug)
export const getSiteFormById=(id:string)=>siteFormRegistry.find(form=>form.id===id)

// Aliases temporários para consumidores legados; não representam uma segunda fonte de dados.
export const systemForms=siteFormRegistry
export const getSystemFormBySlug=getSiteFormBySlug
