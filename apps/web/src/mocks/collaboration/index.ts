import type {CollaborationTypeOption} from '../../shared/data/contracts'

export const mockCollaborationTypes:CollaborationTypeOption[]=[
 {value:'noticia',label:'Notícia / Pauta',active:true},
 {value:'video',label:'Vídeo',active:true},
 {value:'foto',label:'Foto / Galeria',active:true},
 {value:'pauta',label:'Sugestão de Pauta',active:true},
]

export const mockCollaborationGuidelines=[
 {id:'guideline_verifiable',order:1,title:'Informação clara e verificável'},
 {id:'guideline_source',order:2,title:'Material original ou com fonte identificada'},
 {id:'guideline_context',order:3,title:'Contexto suficiente para análise editorial'},
] as const
