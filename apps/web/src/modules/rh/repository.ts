import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {uid,type Employee,type EmployeeDocument,type LeaveEntry,type PayrollEntry,type RhSeed} from './domain'
const STORAGE_KEY='portal-lander:rh:v1'
const EVENT='portal-lander:rh:changed'
const clone=<T>(value:T):T=>structuredClone(value)
const seed=():RhSeed=>getRuntimeDataProvider().rh.seed()
const read=():RhSeed=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw) as RhSeed:seed()}catch{return seed()}}
const write=(state:RhSeed)=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent(EVENT));return clone(state)}
const stamp=()=>new Date().toISOString()
const daysBetween=(start:string,end:string)=>{if(!start||!end)return 0;const a=new Date(`${start}T00:00:00`).getTime(),b=new Date(`${end}T00:00:00`).getTime();return Number.isFinite(a)&&Number.isFinite(b)?Math.max(0,Math.round((b-a)/86400000)+1):0}
export const rhRepository={
 eventName:EVENT,snapshot:()=>clone(read()),
 saveEmployee(input:Omit<Employee,'id'|'createdAt'|'updatedAt'>,id?:string){const state=read(),now=stamp();if(id){state.employees=state.employees.map(x=>x.id===id?{...x,...input,updatedAt:now}:x)}else state.employees.unshift({...input,id:uid('emp'),createdAt:now,updatedAt:now});return write(state)},
 deleteEmployees(ids:string[]){const state=read(),set=new Set(ids);state.employees=state.employees.filter(x=>!set.has(x.id));state.payroll=state.payroll.filter(x=>!set.has(x.employeeId));state.leaves=state.leaves.filter(x=>!set.has(x.employeeId));state.documents=state.documents.filter(x=>!set.has(x.employeeId));return write(state)},
 savePayroll(input:Omit<PayrollEntry,'id'|'createdAt'|'updatedAt'|'netSalary'>,id?:string){const state=read(),now=stamp(),netSalary=Math.max(0,input.grossSalary-input.discounts+input.bonus),value={...input,netSalary};if(id)state.payroll=state.payroll.map(x=>x.id===id?{...x,...value,updatedAt:now}:x);else state.payroll.unshift({...value,id:uid('pay'),createdAt:now,updatedAt:now});return write(state)},
 deletePayroll(ids:string[]){const state=read(),set=new Set(ids);state.payroll=state.payroll.filter(x=>!set.has(x.id));return write(state)},
 saveLeave(input:Omit<LeaveEntry,'id'|'createdAt'|'updatedAt'|'days'>,id?:string){const state=read(),now=stamp(),value={...input,days:daysBetween(input.startDate,input.endDate)};if(id)state.leaves=state.leaves.map(x=>x.id===id?{...x,...value,updatedAt:now}:x);else state.leaves.unshift({...value,id:uid('leave'),createdAt:now,updatedAt:now});return write(state)},
 setLeaveStatus(id:string,status:LeaveEntry['status']){const state=read(),now=stamp();state.leaves=state.leaves.map(x=>x.id===id?{...x,status,approvedBy:status==='aprovado'?'Admin Portal':x.approvedBy,updatedAt:now}:x);return write(state)},
 deleteLeaves(ids:string[]){const state=read(),set=new Set(ids);state.leaves=state.leaves.filter(x=>!set.has(x.id));return write(state)},
 addDocument(input:Omit<EmployeeDocument,'id'|'createdAt'>){const state=read();state.documents.unshift({...input,id:uid('doc'),createdAt:stamp()});return write(state)},
 deleteDocument(id:string){const state=read();state.documents=state.documents.filter(x=>x.id!==id);return write(state)},
 reset(){localStorage.removeItem(STORAGE_KEY);window.dispatchEvent(new CustomEvent(EVENT))},
}
