import type {ContactEntityType,ContactStatus} from './domain'

export const contactEntityTypeOptions:readonly (readonly [ContactEntityType,string])[]=[
 ['pessoa_fisica','Pessoa Física'],
 ['pessoa_juridica','Pessoa Jurídica'],
]

export const contactStatusOptions:readonly (readonly [ContactStatus,string])[]=[
 ['ativo','Ativo'],
 ['inativo','Inativo'],
]
