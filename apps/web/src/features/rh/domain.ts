export type EmployeeStatus='ativo'|'inativo'|'férias'|'afastado'|'desligado'
export type ContractType='CLT'|'PJ'|'Estágio'|'Temporário'|'Autônomo'
export type PayrollStatus='pendente'|'processado'|'pago'|'cancelado'
export type LeaveStatus='pendente'|'aprovado'|'rejeitado'|'em andamento'|'concluído'

export interface Employee{
 id:string;name:string;email:string;cpf:string;rg:string;birthDate:string;phone:string;address:string;role:string;department:string;contractType:ContractType;admissionDate:string;baseSalary:number;status:EmployeeStatus;linkedUser:string;notes:string;createdAt:string;updatedAt:string
}
export interface PayrollEntry{
 id:string;employeeId:string;referenceMonth:string;grossSalary:number;discounts:number;bonus:number;netSalary:number;paymentDate:string;status:PayrollStatus;notes:string;createdAt:string;updatedAt:string
}
export interface LeaveEntry{
 id:string;employeeId:string;type:string;startDate:string;endDate:string;days:number;status:LeaveStatus;approvedBy:string;notes:string;createdAt:string;updatedAt:string
}
export interface EmployeeDocument{
 id:string;employeeId:string;type:string;fileName:string;fileUrl:string;description:string;createdAt:string
}
export interface RhSeed{employees:Employee[];payroll:PayrollEntry[];leaves:LeaveEntry[];documents:EmployeeDocument[];departments:string[];documentTypes:string[];leaveTypes:string[]}
export const uid=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
export const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
export const dateLabel=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'):'—'
