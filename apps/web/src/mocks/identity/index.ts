import type {AppUser,WorkspaceDescriptor} from '../../shared/data/contracts'
import {mockIds} from '../shared'

export const mockUsers:AppUser[]=[
 {id:mockIds.users.admin,name:'Deyvisson Lander',email:'admin@portallander.com.br',initials:'DL',role:'admin',roleLabel:'Administrador',active:true,avatarUrl:''},
 {id:mockIds.users.editor,name:'Marina Torres',email:'marina.torres@portallander.com.br',initials:'MT',role:'editor',roleLabel:'Editora de Conteúdo',active:true,avatarUrl:''},
 {id:mockIds.users.commercial,name:'Rafael Mendes',email:'rafael.mendes@portallander.com.br',initials:'RM',role:'commercial',roleLabel:'Executivo Comercial',active:true,avatarUrl:''},
 {id:mockIds.users.finance,name:'Camila Rocha',email:'camila.rocha@portallander.com.br',initials:'CR',role:'finance',roleLabel:'Financeiro',active:true,avatarUrl:''},
 {id:mockIds.users.viewer,name:'Bruno Almeida',email:'bruno.almeida@portallander.com.br',initials:'BA',role:'viewer',roleLabel:'Leitura',active:false,avatarUrl:''},
]

export const mockCurrentUserId=mockIds.users.admin
export const mockWorkspaces:WorkspaceDescriptor[]=[
 {id:'workspace_admin',name:'CRM',slug:'crm',description:'Workspace administrativo para relacionamento comercial, contratos e operação financeira.',eyebrow:'WORKSPACE ADMINISTRATIVO',route:'/app/crm',capabilities:['CRM e relacionamento','Contratos','Financeiro'],active:true},
 {id:'workspace_site',name:'Gerenciador do Site',slug:'site-manager',description:'Páginas, conteúdos, categorias, mídia, identidade visual, Home e publicidade do Portal Lander.',eyebrow:'CONTEÚDO E PUBLICAÇÃO',route:'/app/site',capabilities:['Conteúdo editorial','Home e publicidade','Marca e estrutura do portal'],active:true},
 {id:'workspace_archive',name:'Arquivo Institucional',slug:'arquivo-institucional',description:'Workspace histórico em modo leitura para materiais arquivados.',eyebrow:'ARQUIVO',route:'/app/workspaces',capabilities:['Consulta histórica'],active:false},
]
