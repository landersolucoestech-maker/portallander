import type {SettingsSeed} from '../../features/settings/domain'
export const mockSettingsSeed:SettingsSeed={
 company:{legalName:'MusicOS 360 Produções Artísticas LTDA',tradeName:'MusicOS 360',cnpj:'50.056.858/0001-46',address:'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',phone:'(33) 99999-9999',responsible:'Admin MusicOS 360',slug:'minha-gravadora',logoUrl:''},
 automations:[
  {id:'vencimentos',title:'Notificar vencimentos',description:'Alertas de compromissos e vencimentos próximos',enabled:true,email:true,push:true,sms:false,frequency:'diario',preferredTime:'09:00'},
  {id:'renovacoes',title:'Lembrete de renovação',description:'Avisar sobre contratos e renovações',enabled:true,email:true,push:false,sms:false},
  {id:'financeiro',title:'Alerta financeiro',description:'Notificações sobre movimentações financeiras',enabled:false,email:true,push:true,sms:false},
  {id:'backup',title:'Backup automático',description:'Executar rotinas automáticas de segurança',enabled:true,email:false,push:false,sms:false},
  {id:'relatorio',title:'Relatório semanal',description:'Resumo periódico das principais operações',enabled:false,email:true,push:false,sms:false},
 ],
 integrations:[
  {id:'autentique',name:'Autentique',category:'Contratos & Assinaturas',description:'Assinatura eletrônica brasileira — envio e acompanhamento de contratos',status:'available',logo:'A',actionLabel:'Configurar'},
  {id:'ecad',name:'ECAD',category:'Direitos Autorais',description:'Arrecadação de execução pública · Conciliação com catálogo local',status:'available',logo:'E',actionLabel:'Configurar'},
  {id:'abramus',name:'ABRAMUS',category:'Direitos Autorais',description:'Registro e conciliação de obras e fonogramas junto à ABRAMUS.',status:'available',logo:'AB',actionLabel:'Configurar'},
  {id:'ubc',name:'UBC',category:'Direitos Autorais',description:'União Brasileira de Compositores — registro de obras e ISWC',status:'available',logo:'U',actionLabel:'Configurar'},
  {id:'meta',name:'Meta',category:'Marketing & Social',description:'Facebook, Instagram e Meta Ads — mensagens, métricas, publicações, campanhas e resultados da empresa',status:'available',logo:'M',actionLabel:'Conectar'},
  {id:'tiktok',name:'TikTok',category:'Marketing & Social',description:'TikTok for Business e TikTok Ads — mensagens, seguidores, conteúdos, métricas e campanhas',status:'available',logo:'T',actionLabel:'Conectar'},
  {id:'google',name:'Google',category:'Marketing & Social',description:'Google Analytics, Search Console, Google Ads e YouTube — tráfego, anúncios, SEO e desempenho de vídeos',status:'available',logo:'G',actionLabel:'Conectar'},
  {id:'spotify',name:'Spotify',category:'Marketing & Social',description:'Spotify Ads — ouvintes, streams, seguidores e campanhas',status:'available',logo:'S',actionLabel:'Conectar'},
  {id:'nfe',name:'NF-e / SEFAZ',category:'Financeiro & Fiscal',description:'Emissão de NF-e com certificado digital e credenciais SEFAZ da sua empresa',status:'available',logo:'NF',actionLabel:'Configurar'},
  {id:'website',name:'Website / Leads',category:'CRM & Captação',description:'Captação de leads via Pixel, Webhooks e formulários integrados ao CRM',status:'available',logo:'W',actionLabel:'Configurar'},
  {id:'onerpm',name:'ONErpm',category:'Distribuição Digital',description:'Distribuição digital, analytics e gestão de lançamentos',status:'external',logo:'1R',actionLabel:'Acessar portal'},
  {id:'distrokid',name:'DistroKid',category:'Distribuição Digital',description:'Distribuição rápida para plataformas de streaming',status:'external',logo:'DK',actionLabel:'Acessar portal'},
  {id:'symphonic',name:'Symphonic',category:'Distribuição Digital',description:'Distribuição, marketing e gestão de catálogo musical',status:'external',logo:'SY',actionLabel:'Acessar portal'},
  {id:'soundon',name:'SoundOn',category:'Distribuição Digital',description:'Distribuição e monetização integrada ao ecossistema TikTok',status:'external',logo:'SO',actionLabel:'Acessar portal'},
 ],
 users:[
  {id:'u1',name:'Deyvisson Lander',email:'admin@portallander.com.br',role:'Administrador Master',phone:'(33) 99999-9999',createdAt:'2026-08-01',status:'ativo'},
  {id:'u2',name:'Marina Costa',email:'marina@portallander.com.br',role:'Marketing',phone:'(31) 98888-7788',createdAt:'2026-08-08',status:'ativo'},
  {id:'u3',name:'Carlos Mendes',email:'carlos@portallander.com.br',role:'Accounting / Contábil',phone:'(11) 97777-6677',createdAt:'2026-08-12',status:'inativo'},
 ],
 roles:[{id:'r1',slug:'admin_master',name:'Administrador Master',archived:false},{id:'r2',slug:'ar_gestao',name:'A&R / Gestão Artística',archived:false},{id:'r3',slug:'financeiro_contabil',name:'Accounting / Contábil',archived:false},{id:'r4',slug:'juridico',name:'Jurídico',archived:false},{id:'r5',slug:'marketing',name:'Marketing',archived:false},{id:'r6',slug:'artista',name:'Artista',archived:false},{id:'r7',slug:'colaborador',name:'Colaborador / Freelancer',archived:false},{id:'r8',slug:'leitor',name:'Leitor (somente leitura)',archived:false}],
 plans:[
  {id:'indie',name:'Indie',description:'Para labels e publishers independentes',price:149,current:true,features:['CRM e contratos','Agenda e tarefas','Marketing essencial','Relatórios básicos']},
  {id:'pro',name:'Pro',description:'Para distribuidoras e selos em crescimento',price:349,current:false,features:['Tudo do Indie','Contabilidade e P&L','Integrações avançadas','Audit Trail']},
  {id:'enterprise',name:'Enterprise',description:'Para grandes grupos fonográficos',price:799,current:false,features:['Tudo do Pro','Permissões avançadas','Suporte prioritário','Governança multiempresa']},
 ],
 audit:[
  {id:'a1',createdAt:'2026-08-30T18:20:00Z',userId:'u1',actorRole:'owner',action:'company.updated',entity:'company_settings',entityId:'company_1',method:'PATCH',path:'/company-settings',ip:'177.0.0.1',correlationId:'corr-001',before:{tradeName:'Lander'},after:{tradeName:'MusicOS 360'},diff:{tradeName:{from:'Lander',to:'MusicOS 360'}}},
  {id:'a2',createdAt:'2026-08-30T17:10:00Z',userId:'u1',actorRole:'admin',action:'user.created',entity:'users',entityId:'u3',method:'POST',path:'/users/invitations',ip:'177.0.0.1',correlationId:'corr-002',before:null,after:{email:'carlos@portallander.com.br'},diff:null},
  {id:'a3',createdAt:'2026-08-29T14:00:00Z',userId:'u1',actorRole:'owner',action:'integration.connected',entity:'integrations',entityId:'meta',method:'POST',path:'/integrations/meta',ip:'177.0.0.1',correlationId:'corr-003',before:null,after:{status:'connected'},diff:null},
 ],
 publicRegistration:{active:true,received:0},
}
