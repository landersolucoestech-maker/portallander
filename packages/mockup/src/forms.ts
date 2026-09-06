import {SYSTEM_FORM_DEFINITIONS} from '../../shared/systemFormCatalog.js'

const contactIdentity=SYSTEM_FORM_DEFINITIONS['lead-capture']
const collaborateIdentity=SYSTEM_FORM_DEFINITIONS.collaborate

const systemForms=[
  {
    id:contactIdentity.key,name:contactIdentity.name,slug:contactIdentity.slug,version:2,purpose:contactIdentity.purpose,status:'active' as const,source:'system' as const,
    fields:[
      {id:'contact-name',key:'name',label:'Nome',type:'text' as const,required:true,placeholder:'Nome completo',order:1},
      {id:'contact-email',key:'email',label:'E-mail',type:'email' as const,required:true,placeholder:'voce@empresa.com',order:2},
      {id:'contact-phone',key:'phone',label:'Telefone / WhatsApp',type:'tel' as const,required:false,order:3},
      {id:'contact-company',key:'company',label:'Empresa / Marca',type:'text' as const,required:false,order:4},
      {id:'contact-type',key:'type',label:'Perfil comercial',type:'select' as const,required:false,options:['empresa_marca','agencia_publicidade','anunciante','patrocinador','parceiro_comercial','outro'],order:5},
      {id:'contact-service',key:'service',label:'Interesse comercial',type:'select' as const,required:false,options:['materia_patrocinada','banner_publicitario','campanha_publicitaria','patrocinio','parceria_comercial','outro'],order:6},
      {id:'contact-message',key:'message',label:'Como podemos ajudar?',type:'textarea' as const,required:true,order:7},
    ],
    consents:[{id:'contact-privacy',kind:'privacy' as const,label:'Privacidade',required:true,version:'2.0',text:'Autorizo o tratamento dos dados informados para atendimento da minha solicitação comercial.'}],
    routing:{destination:'crm' as const,crm:{origin:'formulario_portal',tags:['site','formulario','contato-comercial']}},
    successMessage:'Recebemos sua solicitação. Nossa equipe comercial entrará em contato.',
  },
  {
    id:collaborateIdentity.key,name:collaborateIdentity.name,slug:collaborateIdentity.slug,version:2,purpose:collaborateIdentity.purpose,status:'active' as const,source:'system' as const,
    fields:[
      {id:'collab-name',key:'nome',label:'Seu nome',type:'text' as const,required:true,placeholder:'Nome completo',order:1},
      {id:'collab-email',key:'email',label:'E-mail',type:'email' as const,required:true,order:2},
      {id:'collab-whatsapp',key:'whatsapp',label:'WhatsApp',type:'tel' as const,required:false,order:3},
      {id:'collab-company',key:'empresa',label:'Empresa / Marca',type:'text' as const,required:false,order:4},
      {id:'collab-location',key:'local',label:'Cidade / Estado',type:'text' as const,required:false,order:5},
      {id:'collab-title',key:'titulo',label:'Título / assunto',type:'text' as const,required:true,order:6},
      {id:'collab-type',key:'tipo',label:'Tipo de solicitação',type:'select' as const,required:true,options:['noticia','video','foto','pauta','publicidade','patrocinio','parceria_comercial','conteudo_patrocinado'],order:7},
      {id:'collab-message',key:'mensagem',label:'Conte sua proposta',type:'textarea' as const,required:true,order:8},
      {id:'collab-source',key:'fonte',label:'Fonte ou link de referência',type:'url' as const,required:false,order:9},
      {id:'collab-file',key:'arquivo',label:'Arquivo de apoio',type:'file' as const,required:false,order:10},
    ],
    consents:[
      {id:'collab-privacy',kind:'privacy' as const,label:'Privacidade',required:true,version:'2.0',text:'Autorizo o tratamento dos dados informados para triagem da minha solicitação.'},
      {id:'collab-rights',kind:'content_rights' as const,label:'Autorização de compartilhamento',required:true,version:'2.0',text:'Confirmo que possuo autorização para compartilhar as informações e os materiais enviados.'},
    ],
    routing:{destination:'content_collaborations' as const,collaboration:{defaultStatus:'received' as const,defaultPriority:'normal' as const}},
    successMessage:'Recebemos sua solicitação. Nossa equipe fará a triagem em Colaborações recebidas.',
  },
] as const

export type MockupSystemForm=typeof systemForms[number]
export function getMockupSystemForms(scenario='full'){
  if(scenario==='full')return structuredClone(systemForms)
  if(scenario==='empty'||scenario==='errors')return []
  throw new Error(`Unknown mockup scenario: ${scenario}`)
}
