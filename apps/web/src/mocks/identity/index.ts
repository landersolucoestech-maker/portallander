import type {AppUser} from '../../shared/data/contracts'
import {mockIds} from '../shared'

export const mockUsers:AppUser[]=[
 {id:mockIds.users.admin,name:'Deyvisson Lander',email:'admin@portallander.com.br',initials:'DL',role:'admin',roleLabel:'Administrador',active:true,avatarUrl:''},
 {id:mockIds.users.editor,name:'Marina Torres',email:'marina.torres@portallander.com.br',initials:'MT',role:'editor',roleLabel:'Editora de Conteúdo',active:true,avatarUrl:''},
 {id:mockIds.users.commercial,name:'Rafael Mendes',email:'rafael.mendes@portallander.com.br',initials:'RM',role:'commercial',roleLabel:'Executivo Comercial',active:true,avatarUrl:''},
 {id:mockIds.users.finance,name:'Camila Rocha',email:'camila.rocha@portallander.com.br',initials:'CR',role:'finance',roleLabel:'Financeiro',active:true,avatarUrl:''},
 {id:mockIds.users.viewer,name:'Bruno Almeida',email:'bruno.almeida@portallander.com.br',initials:'BA',role:'viewer',roleLabel:'Leitura',active:false,avatarUrl:''},
]

export const mockCurrentUserId=mockIds.users.admin
