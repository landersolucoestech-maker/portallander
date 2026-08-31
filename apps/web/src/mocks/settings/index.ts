import type {SettingsSeed} from '../../features/settings/domain'
const role=(id:string,slug:string,name:string,description:string,system=false,permissions:string[]=['Visualizar','Criar','Editar'])=>({id,slug,name,description,archived:false,system,permissions})
export const mockSettingsSeed:SettingsSeed={
 company:{legalName:'MusicOS 360 Produções Artísticas LTDA',tradeName:'MusicOS 360',cnpj:'50.056.858/0001-46',address:'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',phone:'(33) 99999-9999',responsible:'Admin MusicOS 360',slug:'minha-gravadora',logoUrl:''},
 automations:[
  {id:'vencimentos',title:'Contrato próximo do vencimento',description:'Notificar 30, 15 e 7 dias antes do vencimento',enabled:true,email:true,push:true,sms:false,frequency:'diario',preferredTime:'09:00'},
  {id:'renovacoes',title:'Sugestão automática de renovação',description:'Disparada quando o contrato entra no período final',enabled:true,email:true,push:false,sms:false},
  {id:'financeiro',title:'Alerta de saldo baixo',description:'Configurável por valor mínimo',enabled:false,email:true,push:true,sms:false},
  {id:'backup',title:'Backup automático',description:'Executar rotinas automáticas de segurança',enabled:true,email:false,push:false,sms:false},
  {id:'relatorio',title:'Relatório semanal de atividades',description:'Atividades, financeiro e contratos',enabled:false,email:true,push:false,sms:false},
 ],
 integrations:[
  {id:'autentique',name:'Autentique',category:'Contratos & Assinaturas',description:'Assinatura eletrônica brasileira — envio e acompanhamento de contratos',status:'available',logo:'A',actionLabel:'Configurar'},
  {id:'meta',name:'Meta',category:'Marketing & Social',description:'Facebook, Instagram e Meta Ads — mensagens, métricas, publicações, campanhas e resultados da empresa',status:'available',logo:'M',actionLabel:'Conectar'},
  {id:'tiktok',name:'TikTok',category:'Marketing & Social',description:'TikTok for Business e TikTok Ads — mensagens, seguidores, conteúdos, métricas e campanhas',status:'available',logo:'T',actionLabel:'Conectar'},
  {id:'google',name:'Google',category:'Marketing & Social',description:'Google Analytics, Search Console, Google Ads e YouTube — tráfego, anúncios, SEO e desempenho de vídeos',status:'available',logo:'G',actionLabel:'Conectar'},
  {id:'spotify',name:'Spotify',category:'Marketing & Social',description:'Spotify Ads — ouvintes, streams, seguidores e campanhas',status:'available',logo:'S',actionLabel:'Conectar'},
  {id:'nfe',name:'NF-e / SEFAZ',category:'Financeiro & Fiscal',description:'Emissão de NF-e com certificado digital e credenciais SEFAZ da sua empresa',status:'available',logo:'NF',actionLabel:'Configurar'},
  {id:'website',name:'Website / Leads',category:'CRM & Captação',description:'Captação de leads via Pixel, Webhooks e formulários integrados ao CRM',status:'available',logo:'W',actionLabel:'Configurar'},
 ],
 users:[
  {id:'u1',name:'Deyvisson Lander',email:'admin@portallander.com.br',role:'Administrador Master',phone:'(33) 99999-9999',createdAt:'2026-08-01',status:'ativo'},
  {id:'u2',name:'Marina Costa',email:'marina@portallander.com.br',role:'Marketing',phone:'(31) 98888-7788',createdAt:'2026-08-08',status:'ativo'},
  {id:'u3',name:'Carlos Mendes',email:'carlos@portallander.com.br',role:'Accounting / Contábil',phone:'(11) 97777-6677',createdAt:'2026-08-12',status:'inativo'},
 ],
 roles:[role('r1','admin_master','Administrador Master','Acesso total a todos os módulos e configurações do sistema.',true,['Visualizar','Criar','Editar','Excluir','Administrar']),role('r2','ar_gestao','A&R / Gestão Artística','Gestão de artistas, projetos, lançamentos e repertório.'),role('r3','financeiro_contabil','Accounting / Contábil','Acesso ao módulo Accounting: transações e notas fiscais.'),role('r4','juridico','Jurídico','Gestão de contratos, licenciamentos e questões legais.'),role('r5','marketing','Marketing','Campanhas, métricas e gestão de conteúdo promocional.'),role('r6','artista','Artista','Acesso restrito aos próprios dados e projetos vinculados.'),role('r7','colaborador','Colaborador / Freelancer','Acesso limitado a tarefas específicas designadas.'),role('r8','leitor','Leitor (somente leitura)','Visualização sem permissão de edição ou criação.',false,['Visualizar'])],
 invites:[{id:'i1',email:'convite@portallander.com.br',role:'Marketing',status:'pendente'}],
 audit:[
  {id:'a1',createdAt:'2026-08-30T18:20:00Z',userId:'u1',actorRole:'owner',action:'company.updated',entity:'company_settings',entityId:'company_1',method:'PATCH',path:'/company-settings',ip:'177.0.0.1',correlationId:'corr-001',before:{tradeName:'Lander'},after:{tradeName:'MusicOS 360'},diff:{tradeName:{from:'Lander',to:'MusicOS 360'}}},
  {id:'a2',createdAt:'2026-08-30T17:10:00Z',userId:'u1',actorRole:'admin',action:'user.created',entity:'users',entityId:'u3',method:'POST',path:'/users/invitations',ip:'177.0.0.1',correlationId:'corr-002',before:null,after:{email:'carlos@portallander.com.br'},diff:null},
  {id:'a3',createdAt:'2026-08-29T14:00:00Z',userId:'u1',actorRole:'owner',action:'integration.connected',entity:'integrations',entityId:'meta',method:'POST',path:'/integrations/meta',ip:'177.0.0.1',correlationId:'corr-003',before:null,after:{status:'connected'},diff:null},
 ],
}
