import {describe,expect,it} from 'vitest'
import {comparePeriods,comparisonLabel} from './periodComparison'

describe('period comparison',()=>{
 it('returns insufficient data instead of inventing a delta',()=>{expect(comparePeriods(null,100)).toEqual({status:'INSUFFICIENT_DATA',current:null,previous:100})})
 it('computes absolute and percentage deltas deterministically',()=>{expect(comparePeriods(120,100)).toEqual({status:'AVAILABLE',current:120,previous:100,absoluteDelta:20,percentageDelta:20,trend:'up'})})
 it('does not divide by zero into a fake percentage',()=>{const result=comparePeriods(10,0);expect(result.status).toBe('AVAILABLE');if(result.status==='AVAILABLE')expect(result.percentageDelta).toBeNull();expect(comparisonLabel(result)).toBe('Variação percentual indisponível')})
 it('treats zero versus zero as a real flat zero comparison',()=>{expect(comparePeriods(0,0)).toEqual({status:'AVAILABLE',current:0,previous:0,absoluteDelta:0,percentageDelta:0,trend:'flat'})})
})
