import {describe,expect,it} from 'vitest'
import {mockHrSeed as rawMockHrSeed} from '@portallander/mockup'

type HrSeed={
 employees:Array<{id:string}>
 payroll:Array<{employeeId:string;netSalary:number;grossSalary:number;discounts:number;bonus:number}>
 leaves:Array<{employeeId:string;startDate:string;endDate:string;days:number}>
 documents:Array<{employeeId:string}>
 departments:string[]
 documentTypes:string[]
 leaveTypes:string[]
}
const mockHrSeed=rawMockHrSeed as HrSeed

describe('rh mock contracts',()=>{
 it('keeps payroll, leaves and documents linked to existing employees',()=>{const ids=new Set(mockHrSeed.employees.map(x=>x.id));expect(mockHrSeed.payroll.every(x=>ids.has(x.employeeId))).toBe(true);expect(mockHrSeed.leaves.every(x=>ids.has(x.employeeId))).toBe(true);expect(mockHrSeed.documents.every(x=>ids.has(x.employeeId))).toBe(true)})
 it('keeps computed payroll values consistent',()=>{expect(mockHrSeed.payroll.every(x=>Math.abs(x.netSalary-(x.grossSalary-x.discounts+x.bonus))<0.001)).toBe(true)})
 it('keeps leave periods valid',()=>{expect(mockHrSeed.leaves.every(x=>x.endDate>=x.startDate&&x.days>0)).toBe(true)})
 it('keeps option catalogs unique',()=>{expect(new Set(mockHrSeed.departments).size).toBe(mockHrSeed.departments.length);expect(new Set(mockHrSeed.documentTypes).size).toBe(mockHrSeed.documentTypes.length);expect(new Set(mockHrSeed.leaveTypes).size).toBe(mockHrSeed.leaveTypes.length)})
})
