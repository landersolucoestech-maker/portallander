import {describe,expect,it} from 'vitest'
import {mockRhSeed} from '../../mocks/rh'
describe('rh mock contracts',()=>{
 it('keeps payroll, leaves and documents linked to existing employees',()=>{const ids=new Set(mockRhSeed.employees.map(x=>x.id));expect(mockRhSeed.payroll.every(x=>ids.has(x.employeeId))).toBe(true);expect(mockRhSeed.leaves.every(x=>ids.has(x.employeeId))).toBe(true);expect(mockRhSeed.documents.every(x=>ids.has(x.employeeId))).toBe(true)})
 it('keeps computed payroll values consistent',()=>{expect(mockRhSeed.payroll.every(x=>Math.abs(x.netSalary-(x.grossSalary-x.discounts+x.bonus))<0.001)).toBe(true)})
 it('keeps leave periods valid',()=>{expect(mockRhSeed.leaves.every(x=>x.endDate>=x.startDate&&x.days>0)).toBe(true)})
 it('keeps option catalogs unique',()=>{expect(new Set(mockRhSeed.departments).size).toBe(mockRhSeed.departments.length);expect(new Set(mockRhSeed.documentTypes).size).toBe(mockRhSeed.documentTypes.length);expect(new Set(mockRhSeed.leaveTypes).size).toBe(mockRhSeed.leaveTypes.length)})
})
