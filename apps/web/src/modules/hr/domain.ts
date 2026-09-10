export type EmployeeStatus='active'|'inactive'|'vacation'|'leave'|'terminated'
export type ContractType='clt'|'contractor'|'intern'|'temporary'|'self_employed'
export type PayrollStatus='pending'|'processed'|'paid'|'cancelled'
export type LeaveStatus='pending'|'approved'|'rejected'|'in_progress'|'completed'
export type Department='administration'|'sales'|'finance'|'marketing'|'operations'|'technology'
export type EmployeeDocumentType='employment_contract'|'personal_document'|'medical_certificate'|'proof'|'certificate'|'other'
export type LeaveType='vacation'|'medical_certificate'|'medical_leave'|'parental_leave'|'justified_absence'|'leave_of_absence'

export interface Employee{
 id:string;name:string;email:string;cpf:string;rg:string;birthDate:string;phone:string;address:string;role:string;department:Department|string;contractType:ContractType;admissionDate:string;baseSalary:number;status:EmployeeStatus;linkedUser:string;notes:string;createdAt:string;updatedAt:string
}
export interface PayrollEntry{
 id:string;employeeId:string;referenceMonth:string;grossSalary:number;discounts:number;bonus:number;netSalary:number;paymentDate:string;status:PayrollStatus;notes:string;createdAt:string;updatedAt:string
}
export interface LeaveEntry{
 id:string;employeeId:string;type:LeaveType|string;startDate:string;endDate:string;days:number;status:LeaveStatus;approvedBy:string;approvedByUserId?:string|null;approvedByDisplayName?:string;approvedAt?:string|null;notes:string;createdAt:string;updatedAt:string
}
export interface EmployeeDocument{
 id:string;employeeId:string;type:EmployeeDocumentType|string;fileName:string;fileUrl:string;description:string;createdAt:string
}
export interface HrSeed{employees:Employee[];payroll:PayrollEntry[];leaves:LeaveEntry[];documents:EmployeeDocument[];departments:string[];documentTypes:string[];leaveTypes:string[];runtime?:{documentUpload?:{configured:boolean}};meta?:{version:number;updatedAt:string}}

const labels:Record<string,string>={
  active:'Ativo',inactive:'Inativo',vacation:'Férias',leave:'Afastado',terminated:'Desligado',
  clt:'clt',contractor:'contractor',intern:'intern',temporary:'temporary',self_employed:'self_employed',
  pending:'Pendente',processed:'Processado',paid:'Pago',cancelled:'Cancelado',approved:'Aprovado',rejected:'Rejeitado',in_progress:'Em andamento',completed:'Concluído',
  administration:'administration',sales:'sales',finance:'finance',marketing:'Marketing',operations:'operations',technology:'technology',
  employment_contract:'employment_contract',personal_document:'personal_document',medical_certificate:'medical_certificate',proof:'proof',certificate:'certificate',other:'other',
  medical_leave:'Licença médica',parental_leave:'Licença maternidade/paternidade',justified_absence:'Falta justificada',leave_of_absence:'Afastamento'
}
export const hrLabel=(value:string)=>labels[value]??value
export const uid=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
export const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
export const dateLabel=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'):'—'
