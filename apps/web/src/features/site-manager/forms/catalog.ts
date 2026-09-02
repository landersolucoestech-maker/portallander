import type {SiteFormDefinition} from './domain'

export const systemForms:readonly SiteFormDefinition[]=[
  {
    id:'lead-capture',
    name:'Captação de Leads',
    slug:'captacao-leads',
    purpose:'lead_capture',
    status:'draft',
    source:'system',
    fields:[],
    consents:[],
    routing:{destination:'crm',crm:{origin:'formulario_portal'}},
    successMessage:'Recebemos seus dados. Nossa equipe entrará em contato.',
  },
  {
    id:'collaborate',
    name:'Colabore',
    slug:'colabore',
    purpose:'editorial_submission',
    status:'inactive',
    source:'system',
    fields:[],
    consents:[],
    routing:{destination:'content_collaborations',collaboration:{defaultStatus:'received',defaultPriority:'normal'}},
    successMessage:'Material recebido para análise editorial.',
  },
]
