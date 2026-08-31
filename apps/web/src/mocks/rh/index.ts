import type {RhSeed} from '../../features/rh/domain'

export const mockRhSeed:RhSeed={
 departments:['Administrativo','Comercial','Financeiro','Marketing','Operações','Tecnologia'],
 documentTypes:['Contrato de Trabalho','Documento Pessoal','Atestado','Comprovante','Certificado','Outro'],
 leaveTypes:['férias','atestado','licença médica','licença maternidade/paternidade','falta justificada','afastamento'],
 employees:[
  {id:'emp_001',name:'Mariana Costa',email:'mariana.costa@lander.local',cpf:'***.842.***-**',rg:'45.***.***-2',birthDate:'1991-04-18',phone:'(11) 98844-2010',address:'São Paulo - SP',role:'Coordenadora Administrativa',department:'Administrativo',contractType:'CLT',admissionDate:'2022-02-14',baseSalary:6800,status:'ativo',linkedUser:'Mariana Costa',notes:'Responsável pela rotina administrativa.',createdAt:'2022-02-14T12:00:00.000Z',updatedAt:'2026-08-20T12:00:00.000Z'},
  {id:'emp_002',name:'Rafael Martins',email:'rafael.martins@lander.local',cpf:'***.331.***-**',rg:'38.***.***-9',birthDate:'1988-11-02',phone:'(11) 97731-1188',address:'Guarulhos - SP',role:'Executivo Comercial',department:'Comercial',contractType:'CLT',admissionDate:'2023-05-08',baseSalary:5200,status:'ativo',linkedUser:'Rafael Martins',notes:'Carteira B2B.',createdAt:'2023-05-08T12:00:00.000Z',updatedAt:'2026-08-19T12:00:00.000Z'},
  {id:'emp_003',name:'Camila Nunes',email:'camila.nunes@lander.local',cpf:'***.514.***-**',rg:'50.***.***-1',birthDate:'1996-07-25',phone:'(11) 96620-4190',address:'Osasco - SP',role:'Analista Financeira',department:'Financeiro',contractType:'CLT',admissionDate:'2024-01-15',baseSalary:4900,status:'férias',linkedUser:'Camila Nunes',notes:'Férias programadas em agosto.',createdAt:'2024-01-15T12:00:00.000Z',updatedAt:'2026-08-10T12:00:00.000Z'},
  {id:'emp_004',name:'Lucas Almeida',email:'lucas.almeida@lander.local',cpf:'***.227.***-**',rg:'41.***.***-7',birthDate:'1993-03-12',phone:'(11) 95518-7712',address:'São Paulo - SP',role:'Desenvolvedor Full Stack',department:'Tecnologia',contractType:'PJ',admissionDate:'2025-03-03',baseSalary:9500,status:'ativo',linkedUser:'Lucas Almeida',notes:'Contrato PJ mensal.',createdAt:'2025-03-03T12:00:00.000Z',updatedAt:'2026-08-22T12:00:00.000Z'},
  {id:'emp_005',name:'Beatriz Souza',email:'beatriz.souza@lander.local',cpf:'***.109.***-**',rg:'47.***.***-4',birthDate:'1998-09-30',phone:'(11) 94409-3021',address:'Santo André - SP',role:'Assistente de Marketing',department:'Marketing',contractType:'CLT',admissionDate:'2025-06-09',baseSalary:3600,status:'afastado',linkedUser:'',notes:'Afastamento temporário registrado.',createdAt:'2025-06-09T12:00:00.000Z',updatedAt:'2026-08-23T12:00:00.000Z'}
 ],
 payroll:[
  {id:'pay_001',employeeId:'emp_001',referenceMonth:'2026-08',grossSalary:6800,discounts:842.35,bonus:500,netSalary:6457.65,paymentDate:'2026-08-30',status:'pago',notes:'Folha regular.',createdAt:'2026-08-25T12:00:00.000Z',updatedAt:'2026-08-30T12:00:00.000Z'},
  {id:'pay_002',employeeId:'emp_002',referenceMonth:'2026-08',grossSalary:5200,discounts:628.2,bonus:900,netSalary:5471.8,paymentDate:'',status:'processado',notes:'Comissão do período incluída.',createdAt:'2026-08-25T12:00:00.000Z',updatedAt:'2026-08-28T12:00:00.000Z'},
  {id:'pay_003',employeeId:'emp_003',referenceMonth:'2026-08',grossSalary:4900,discounts:571.9,bonus:0,netSalary:4328.1,paymentDate:'',status:'pendente',notes:'Aguardando fechamento.',createdAt:'2026-08-25T12:00:00.000Z',updatedAt:'2026-08-25T12:00:00.000Z'}
 ],
 leaves:[
  {id:'leave_001',employeeId:'emp_003',type:'férias',startDate:'2026-08-18',endDate:'2026-09-01',days:15,status:'aprovado',approvedBy:'Admin Portal',notes:'Período aprovado.',createdAt:'2026-07-20T12:00:00.000Z',updatedAt:'2026-07-22T12:00:00.000Z'},
  {id:'leave_002',employeeId:'emp_005',type:'licença médica',startDate:'2026-08-24',endDate:'2026-09-07',days:15,status:'em andamento',approvedBy:'Admin Portal',notes:'Documento médico anexado.',createdAt:'2026-08-24T12:00:00.000Z',updatedAt:'2026-08-24T12:00:00.000Z'},
  {id:'leave_003',employeeId:'emp_002',type:'férias',startDate:'2026-10-05',endDate:'2026-10-19',days:15,status:'pendente',approvedBy:'',notes:'Solicitação futura.',createdAt:'2026-08-27T12:00:00.000Z',updatedAt:'2026-08-27T12:00:00.000Z'}
 ],
 documents:[
  {id:'doc_001',employeeId:'emp_001',type:'Contrato de Trabalho',fileName:'contrato-mariana-costa.pdf',fileUrl:'#',description:'Contrato vigente',createdAt:'2022-02-14T12:00:00.000Z'},
  {id:'doc_002',employeeId:'emp_003',type:'Comprovante',fileName:'comprovante-ferias-camila.pdf',fileUrl:'#',description:'Aviso de férias',createdAt:'2026-07-22T12:00:00.000Z'}
 ]
}
