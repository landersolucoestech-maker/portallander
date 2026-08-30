import type {ContractCategory,ContractTemplate,ContractVariable,VariableGroup} from '../domain'

export const contractsMockMeta={source:'mock',enabled:true} as const
export const contractsMockRecords=[] as const
export const contractTemplatesMock:ContractTemplate[]=[]

export const contractCategoriesMock:ContractCategory[]=['Comercial','Publicidade','Editorial','Conteúdo','Prestação de Serviços','Parcerias','Fornecedores','Jurídico','Institucional','Outro'].map((name,index)=>({id:`category_${index+1}`,name,description:'',active:true,order:index+1,createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'}))

const variable=(group:VariableGroup,key:string,name:string,required=false):ContractVariable=>({id:`variable_${group}_${key}`.toLowerCase(),name,key:`{{${group}.${key}}}`,group,description:'',type:'text',required,defaultValue:'',active:true,createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'})

export const contractVariablesMock:ContractVariable[]=[
 variable('CONTRATANTE','NAME','Nome do contratante',true),variable('CONTRATANTE','COMPANY_NAME','Razão social do contratante'),variable('CONTRATANTE','TRADE_NAME','Nome fantasia do contratante'),variable('CONTRATANTE','CPF','CPF do contratante'),variable('CONTRATANTE','CNPJ','CNPJ do contratante'),variable('CONTRATANTE','EMAIL','E-mail do contratante'),variable('CONTRATANTE','PHONE','Telefone do contratante'),variable('CONTRATANTE','ADDRESS','Endereço do contratante'),variable('CONTRATANTE','CITY','Cidade do contratante'),variable('CONTRATANTE','STATE','Estado do contratante'),variable('CONTRATANTE','REPRESENTATIVE_NAME','Representante do contratante'),variable('CONTRATANTE','REPRESENTATIVE_ROLE','Cargo do representante'),
 variable('CONTRATADA','NAME','Nome da contratada'),variable('CONTRATADA','COMPANY_NAME','Razão social da contratada'),variable('CONTRATADA','CNPJ','CNPJ da contratada'),variable('CONTRATADA','EMAIL','E-mail da contratada'),variable('CONTRATADA','ADDRESS','Endereço da contratada'),variable('CONTRATADA','REPRESENTATIVE_NAME','Representante da contratada'),
 variable('CONTRACT','TITLE','Título do contrato',true),variable('CONTRACT','NUMBER','Número do contrato'),variable('CONTRACT','TYPE','Tipo do contrato',true),variable('CONTRACT','CATEGORY','Categoria'),variable('CONTRACT','START_DATE','Data de início'),variable('CONTRACT','END_DATE','Data de término'),variable('CONTRACT','OBJECT','Objeto do contrato'),variable('CONTRACT','DURATION','Vigência'),
 variable('PAYMENT','AMOUNT','Valor'),variable('PAYMENT','AMOUNT_IN_WORDS','Valor por extenso'),variable('PAYMENT','CURRENCY','Moeda'),variable('PAYMENT','METHOD','Forma de pagamento'),variable('PAYMENT','INSTALLMENTS','Parcelas'),variable('PAYMENT','DUE_DATE','Vencimento'),variable('PAYMENT','PERIODICITY','Periodicidade'),
 variable('SERVICE','NAME','Serviço'),variable('SERVICE','DESCRIPTION','Descrição do serviço'),variable('SERVICE','QUANTITY','Quantidade'),variable('SERVICE','START_DATE','Início do serviço'),variable('SERVICE','END_DATE','Fim do serviço'),
 variable('CAMPAIGN','NAME','Nome da campanha'),variable('CAMPAIGN','PERIOD','Período da campanha'),variable('CAMPAIGN','OBJECTIVE','Objetivo da campanha'),variable('CAMPAIGN','CHANNELS','Canais'),variable('CAMPAIGN','FORMATS','Formatos'),variable('CAMPAIGN','BUDGET','Orçamento'),
 variable('EVENT','NAME','Nome do evento'),variable('EVENT','DATE','Data do evento'),variable('EVENT','LOCATION','Local do evento'),variable('EVENT','CITY','Cidade do evento'),variable('EVENT','STATE','Estado do evento'),variable('EVENT','COVERAGE_SCOPE','Escopo da cobertura'),
 variable('CONTENT','TITLE','Título do conteúdo'),variable('CONTENT','SUBJECT','Assunto'),variable('CONTENT','FORMAT','Formato'),variable('CONTENT','PUBLICATION_DATE','Data de publicação'),variable('CONTENT','CTA','CTA'),variable('CONTENT','URL','URL'),
 variable('SIGNATURE','CONTRATANTE','Assinatura do contratante'),variable('SIGNATURE','CONTRATADA','Assinatura da contratada'),variable('SIGNATURE','REPRESENTATIVE','Assinatura do representante'),
]
