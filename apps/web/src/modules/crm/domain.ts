export type LeadStatus='novo'|'contato_realizado'|'qualificado'|'proposta'|'negociacao'|'fechado'|'perdido'
export type LeadType='empresa_marca'|'agencia_publicidade'|'assessoria_imprensa'|'agencia_comunicacao'|'anunciante'|'patrocinador'|'produtora'|'organizador_evento'|'artista_personalidade'|'criador_influenciador'|'parceiro_comercial'|'prestador_servico'|'instituicao'|'outro'
export type LeadService='publieditorial'|'materia_patrocinada'|'publicacao_comercial'|'banner_publicitario'|'campanha_publicitaria'|'divulgacao_evento'|'divulgacao_lancamento'|'cobertura_evento'|'entrevista'|'producao_conteudo'|'patrocinio'|'parceria_comercial'|'design'|'marketing'|'desenvolvimento_web'|'consultoria'|'outro'
export type LeadOrigin='site'|'formulario_portal'|'whatsapp'|'email'|'instagram'|'facebook'|'linkedin'|'indicacao'|'prospeccao_ativa'|'evento'|'parceiro'|'campanha'|'google'|'outro'
export type Priority='baixa'|'media'|'alta'|'estrategica'
export type Temperature='frio'|'morno'|'quente'
export type InteractionType='reuniao'|'email'|'whatsapp'|'ligacao'|'follow_up'|'proposta'|'contrato'|'nota'
export type ContactEntityType='pessoa_fisica'|'pessoa_juridica'
export type ContactCategory='cliente'|'anunciante'|'parceiro'|'fornecedor'|'prestador_servico'|'assessoria_agencia'|'fonte_editorial'|'patrocinador'|'instituicao'|'investidor'|'outro'
export type ContactStatus='ativo'|'inativo'

export type Attachment={id:string;name:string;type:string;size:number;dataUrl:string;createdAt:string}
export type Interaction={id:string;type:InteractionType;notes:string;responsible:string;createdAt:string}
export type TimelineEntry={id:string;type:string;description:string;createdAt:string}

export type Lead={
 id:string;name:string;company:string;email:string;phone:string;city:string;state:string;role:string;website:string;instagram:string;
 type:LeadType;service:LeadService;description:string;origin:LeadOrigin;status:LeadStatus;priority:Priority;responsible:string;campaign:string;
 nextFollowUp:string;estimatedValue:number|'';temperature:Temperature;serviceDetails:Record<string,string>;notes:string;tags:string[];
 attachments:Attachment[];interactions:Interaction[];createdAt:string;updatedAt:string;convertedContactId?:string
}

export type Contact={
 id:string;entityType:ContactEntityType;category:ContactCategory;profile:string;name:string;company:string;role:string;email:string;phone:string;whatsapp:string;
 city:string;state:string;document:string;website:string;instagram:string;priority:Priority;status:ContactStatus;tags:string[];notes:string;
 attachments:Attachment[];timeline:TimelineEntry[];createdAt:string;updatedAt:string;sourceLeadId?:string
}

export type CrmState={version:1;leads:Lead[];contacts:Contact[]}
export type LeadFilters={search:string;status:string;type:string;service:string;origin:string;priority:string;temperature:string}
export type ContactFilters={search:string;entityType:string;category:string;profile:string;status:string;priority:string}

export const leadStatusOptions:[LeadStatus,string][]=[['novo','Novo'],['contato_realizado','Contato realizado'],['qualificado','Qualificado'],['proposta','Proposta'],['negociacao','Negociação'],['fechado','Fechado'],['perdido','Perdido']]
export const leadTypeOptions:[LeadType,string][]=[['empresa_marca','Empresa / Marca'],['agencia_publicidade','Agência de Publicidade'],['assessoria_imprensa','Assessoria de Imprensa'],['agencia_comunicacao','Agência de Comunicação'],['anunciante','Anunciante'],['patrocinador','Patrocinador'],['produtora','Produtora'],['organizador_evento','Organizador de Evento'],['artista_personalidade','Artista / Personalidade'],['criador_influenciador','Criador / Influenciador'],['parceiro_comercial','Parceiro Comercial'],['prestador_servico','Prestador de Serviço'],['instituicao','Instituição'],['outro','Outro']]
export const serviceOptions:[LeadService,string][]=[['publieditorial','Publieditorial'],['materia_patrocinada','Matéria Patrocinada'],['publicacao_comercial','Publicação Comercial'],['banner_publicitario','Banner Publicitário'],['campanha_publicitaria','Campanha Publicitária'],['divulgacao_evento','Divulgação de Evento'],['divulgacao_lancamento','Divulgação de Lançamento'],['cobertura_evento','Cobertura de Evento'],['entrevista','Entrevista'],['producao_conteudo','Produção de Conteúdo'],['patrocinio','Patrocínio'],['parceria_comercial','Parceria Comercial'],['design','Serviços de Design'],['marketing','Serviços de Marketing'],['desenvolvimento_web','Desenvolvimento Web'],['consultoria','Consultoria'],['outro','Outro']]
export const originOptions:[LeadOrigin,string][]=[['site','Site'],['formulario_portal','Formulário do Portal'],['whatsapp','WhatsApp'],['email','Email'],['instagram','Instagram'],['facebook','Facebook'],['linkedin','LinkedIn'],['indicacao','Indicação'],['prospeccao_ativa','Prospecção ativa'],['evento','Evento'],['parceiro','Parceiro'],['campanha','Campanha'],['google','Google'],['outro','Outro']]
export const priorityOptions:[Priority,string][]=[['baixa','Baixa'],['media','Média'],['alta','Alta'],['estrategica','Estratégica']]
export const temperatureOptions:[Temperature,string][]=[['frio','Frio'],['morno','Morno'],['quente','Quente']]
export const interactionOptions:[InteractionType,string][]=[['reuniao','Reunião'],['email','Email'],['whatsapp','WhatsApp'],['ligacao','Ligação'],['follow_up','Follow-up'],['proposta','Proposta'],['contrato','Contrato'],['nota','Nota']]
export const contactCategoryOptions:[ContactCategory,string][]=[['cliente','Cliente'],['anunciante','Anunciante'],['parceiro','Parceiro'],['fornecedor','Fornecedor'],['prestador_servico','Prestador de Serviços'],['assessoria_agencia','Assessoria / Agência'],['fonte_editorial','Fonte / Contato Editorial'],['patrocinador','Patrocinador'],['instituicao','Instituição'],['investidor','Investidor'],['outro','Outro']]

export const contactProfiles:Record<ContactEntityType,Partial<Record<ContactCategory,string[]>>>= {
 pessoa_fisica:{
  cliente:['Cliente individual','Representante','Outro'],anunciante:['Representante de marca','Executivo de mídia','Outro'],parceiro:['Parceiro comercial','Influenciador','Outro'],
  fornecedor:['Fornecedor individual','Outro'],prestador_servico:['Designer','Fotógrafo','Jornalista','Videomaker','Desenvolvedor','Consultor','Outro'],
  assessoria_agencia:['Assessor','Atendimento','Executivo de conta','Outro'],fonte_editorial:['Artista','Empresário','Assessor','Jornalista','Influenciador','Especialista','Porta-voz','Outro'],
  patrocinador:['Representante','Outro'],instituicao:['Representante institucional','Porta-voz','Outro'],investidor:['Investidor','Representante','Outro'],outro:['Outro']
 },
 pessoa_juridica:{
  cliente:['Empresa','Marca','Agência','Produtora','Organizador de Evento','Outro'],anunciante:['Marca','Empresa','Agência de Publicidade','Produtora','Outro'],
  parceiro:['Agência de Publicidade','Assessoria de Imprensa','Agência de Comunicação','Produtora Audiovisual','Plataforma','Veículo de Comunicação','Outro'],
  fornecedor:['Empresa de tecnologia','Gráfica','Locadora','Produtora','Fornecedor geral','Outro'],prestador_servico:['Agência','Estúdio','Produtora Audiovisual','Consultoria','Outro'],
  assessoria_agencia:['Assessoria de Imprensa','Agência de Comunicação','Agência de Publicidade','Outro'],fonte_editorial:['Assessoria de Imprensa','Agência de Comunicação','Instituição','Outro'],
  patrocinador:['Marca','Empresa','Instituição','Outro'],instituicao:['Órgão público','ONG','Associação','Universidade','Outro'],investidor:['Fundo de investimento','Empresa','Outro'],outro:['Outro']
 }
}

export const serviceDetailFields:Partial<Record<LeadService,{key:string;label:string;type?:'date'|'number'}[]>>={
 divulgacao_evento:[{key:'eventName',label:'Nome do evento'},{key:'eventDate',label:'Data do evento',type:'date'},{key:'venue',label:'Local'},{key:'eventCity',label:'Cidade'},{key:'eventState',label:'Estado'},{key:'capacity',label:'Público / capacidade',type:'number'},{key:'materials',label:'Materiais disponíveis'}],
 cobertura_evento:[{key:'eventName',label:'Nome do evento'},{key:'eventDate',label:'Data do evento',type:'date'},{key:'venue',label:'Local'},{key:'briefing',label:'Briefing da cobertura'}],
 publieditorial:[{key:'subject',label:'Assunto'},{key:'provisionalTitle',label:'Título provisório'},{key:'desiredDate',label:'Data desejada',type:'date'},{key:'format',label:'Formato'},{key:'briefing',label:'Briefing'},{key:'cta',label:'CTA'}],
 materia_patrocinada:[{key:'subject',label:'Assunto'},{key:'desiredDate',label:'Data desejada',type:'date'},{key:'briefing',label:'Briefing'},{key:'cta',label:'CTA'}],
 publicacao_comercial:[{key:'subject',label:'Assunto'},{key:'desiredDate',label:'Data desejada',type:'date'},{key:'format',label:'Formato'},{key:'briefing',label:'Briefing'}],
 campanha_publicitaria:[{key:'campaignName',label:'Nome da campanha'},{key:'period',label:'Período'},{key:'objective',label:'Objetivo'},{key:'formats',label:'Formatos'},{key:'budget',label:'Orçamento',type:'number'},{key:'channels',label:'Canais'}],
 banner_publicitario:[{key:'period',label:'Período'},{key:'placement',label:'Posição desejada'},{key:'destinationUrl',label:'URL de destino'},{key:'materials',label:'Materiais disponíveis'}]
}

export const label=(options:readonly (readonly [string,string])[],value:string)=>options.find(([v])=>v===value)?.[1]??value
export const emptyLead=():Omit<Lead,'id'|'createdAt'|'updatedAt'|'attachments'|'interactions'>=>({name:'',company:'',email:'',phone:'',city:'',state:'',role:'',website:'',instagram:'',type:'empresa_marca',service:'publieditorial',description:'',origin:'site',status:'novo',priority:'media',responsible:'',campaign:'',nextFollowUp:'',estimatedValue:'',temperature:'morno',serviceDetails:{},notes:'',tags:[]})
export const emptyContact=():Omit<Contact,'id'|'createdAt'|'updatedAt'|'attachments'|'timeline'>=>({entityType:'pessoa_juridica',category:'cliente',profile:'Empresa',name:'',company:'',role:'',email:'',phone:'',whatsapp:'',city:'',state:'',document:'',website:'',instagram:'',priority:'media',status:'ativo',tags:[],notes:''})
