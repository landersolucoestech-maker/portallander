import type { CrmContact, CrmLead, CrmSnapshot } from '../model'

const contacts: readonly CrmContact[] = [
  {id:'rafael-alves',name:'Rafael Alves',personType:'PF',company:'Estúdio Horizonte',role:'Produtor executivo',category:'Produtor',email:'rafael@horizonte.com',phone:'(11) 98888-4102',location:'São Paulo / SP',source:'Indicação',owner:'Deyvisson',status:'Cliente',tags:['Produção','Música'],lastInteraction:'WhatsApp · 28/08/2026',nextFollowUp:'02/09/2026 · 10:00',relatedValue:32500},
  {id:'bruno-lima',name:'Bruno Lima',personType:'PF',company:'BL Eventos',role:'Diretor',category:'Evento / Festival',email:'bruno@bleventos.com',phone:'(21) 97777-2810',location:'Rio de Janeiro / RJ',source:'Evento',owner:'Equipe',status:'Contato',tags:['Eventos','Publicidade'],lastInteraction:'E-mail · 27/08/2026',relatedValue:7500},
  {id:'aline-moreira',name:'Aline Moreira',personType:'PF',company:'PressLab',role:'Assessora de imprensa',category:'Assessoria',email:'aline@presslab.com.br',phone:'(11) 96666-1928',location:'São Paulo / SP',source:'Colabore',owner:'Editorial',status:'Parceiro',tags:['Imprensa','Releases'],lastInteraction:'Release recebido · 29/08/2026',relatedValue:0},
  {id:'aurora-music',name:'Aurora Music',personType:'PJ',company:'Aurora Music',role:'Gravadora / selo',category:'Gravadora / Selo',email:'imprensa@auroramusic.com',phone:'(11) 95555-8410',location:'São Paulo / SP',source:'Prospecção',owner:'Comercial',status:'Contato',tags:['Gravadora','Artistas'],lastInteraction:'E-mail · 26/08/2026',nextFollowUp:'01/09/2026 · 14:30',relatedValue:24000},
  {id:'mariana-santos',name:'Mariana Santos',personType:'PF',company:'Independente',role:'Artista',category:'Artista / Banda',email:'contato@marianasantos.com',phone:'(31) 94444-3319',location:'Belo Horizonte / MG',source:'Colabore',owner:'Editorial',status:'Contato',tags:['Artista','Pop'],lastInteraction:'Conteúdo enviado · 28/08/2026',relatedValue:0},
]

const leads: readonly CrmLead[] = [
  {id:'norte-producoes',name:'Marina Costa',company:'Norte Produções',role:'Marketing',email:'marina@norteproducoes.com',phone:'(11) 93333-1408',location:'São Paulo / SP',leadType:'Marca / Empresa',interest:'Anunciar no Portal Lander',source:'Anuncie Aqui',owner:'Comercial',status:'Qualificado',temperature:'Quente',potentialValue:18000,nextAction:'Enviar proposta de mídia',nextFollowUp:'30/08/2026 · 10:30',campaign:'Mídia Kit Comercial',utmSource:'portal',tags:['Publicidade','Prioridade']},
  {id:'festival-orbita',name:'Caio Martins',company:'Festival Órbita',role:'Produção',email:'caio@festivalorbita.com',phone:'(21) 92222-7914',location:'Rio de Janeiro / RJ',leadType:'Evento / Festival',interest:'Cobertura de evento',source:'Instagram',owner:'Comercial',status:'Proposta',temperature:'Quente',potentialValue:12000,nextAction:'Revisar escopo de cobertura',nextFollowUp:'31/08/2026 · 15:00',tags:['Evento','Cobertura']},
  {id:'marca-nova',name:'Fernanda Paiva',company:'Marca Nova',role:'Brand manager',email:'fernanda@marcanova.com.br',phone:'(11) 91111-6220',location:'São Paulo / SP',leadType:'Anunciante',interest:'Banner / mídia display',source:'Meta Ads',owner:'Comercial',status:'Novo',temperature:'Morno',potentialValue:8500,nextAction:'Primeiro contato',nextFollowUp:'30/08/2026 · 14:00',campaign:'Portal Lander Institucional',utmSource:'instagram',tags:['Anunciante']},
  {id:'selo-azul',name:'Paulo Neri',company:'Selo Azul',role:'A&R',email:'paulo@seloazul.com',phone:'(11) 90000-5291',location:'São Paulo / SP',leadType:'Gravadora / Selo',interest:'Divulgação de lançamento',source:'Indicação',owner:'Editorial',status:'Contatado',temperature:'Morno',potentialValue:4500,nextAction:'Receber briefing do lançamento',nextFollowUp:'02/09/2026 · 11:00',tags:['Gravadora','Lançamento']},
  {id:'agencia-ponto',name:'Larissa Reis',company:'Agência Ponto',role:'Diretora de contas',email:'larissa@agenciaponto.com',phone:'(21) 98800-7711',location:'Rio de Janeiro / RJ',leadType:'Agência',interest:'Publieditorial',source:'Site',owner:'Comercial',status:'Negociação',temperature:'Quente',potentialValue:15000,nextAction:'Ajustar condições comerciais',nextFollowUp:'01/09/2026 · 09:30',tags:['Agência','Publieditorial']},
  {id:'studio-sul',name:'Daniel Rocha',company:'Studio Sul',role:'Sócio',email:'daniel@studiosul.com',phone:'(51) 97710-2201',location:'Porto Alegre / RS',leadType:'Parceiro',interest:'Parceria',source:'Evento',owner:'Deyvisson',status:'Convertido',temperature:'Quente',potentialValue:9000,nextAction:'Relacionamento ativo',nextFollowUp:'05/09/2026 · 16:00',tags:['Parceiro','Produção']},
]

export const demoCrmSnapshot: CrmSnapshot = {
  contacts,
  leads,
  campaigns: [
    {id:'portal-institucional',name:'Portal Lander Institucional',status:'Ativa',channels:'Meta + Google',budget:4800,leads:148},
    {id:'midia-kit-comercial',name:'Mídia Kit Comercial',status:'Planejada',channels:'Meta',budget:2000,leads:null},
    {id:'captacao-parceiros',name:'Captação Parceiros',status:'Ativa',channels:'Google',budget:3200,leads:63},
  ],
  metrics: {
    contacts: contacts.length,
    leads: leads.length,
    clients: contacts.filter(item=>item.status==='Cliente').length,
    qualifiedLeads: leads.filter(item=>['Qualificado','Proposta','Negociação'].includes(item.status)).length,
    hotLeads: leads.filter(item=>item.temperature==='Quente'&&!['Convertido','Perdido'].includes(item.status)).length,
    convertedLeads: leads.filter(item=>item.status==='Convertido').length,
    followUpsDue: leads.filter(item=>item.nextFollowUp).length+contacts.filter(item=>item.nextFollowUp).length,
  },
}
