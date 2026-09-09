import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {ImportPreview,ReportDefinition,ReportEntity,ReportsSeed} from './domain'
const clone=<T>(value:T):T=>structuredClone(value)
export const reportsRepository={
 snapshot:():ReportsSeed=>clone(getRuntimeDataProvider().reports.seed()),
 reportable:():ReportEntity[]=>reportsRepository.snapshot().entities.filter(x=>x.reportable),
 definitions:():ReportDefinition[]=>reportsRepository.snapshot().definitions,
 preview:(tableName:string):ImportPreview=>clone(reportsRepository.snapshot().importPreview[tableName]??{totalRows:0,validRows:0,invalidRows:0,errors:['Nenhum contrato de importação disponível.'],warnings:[]}),
}
