import type {DataScenario,DataScenarioName} from '../../shared/data/contracts'

const scenario=(name:DataScenarioName,patch:Partial<DataScenario>={}):DataScenario=>({name,latencyMs:0,failDomains:[],emptyDomains:[],partialDomains:[],permissionDeniedDomains:[],offline:false,largeDataset:false,...patch})
export const mockDataScenarios:Record<DataScenarioName,DataScenario>={
 success:scenario('success'),
 loading:scenario('loading',{latencyMs:1800}),
 empty:scenario('empty',{emptyDomains:['crm','contracts','finance','editorial','agenda','notifications']}),
 error:scenario('error',{failDomains:['crm','contracts','finance','editorial']}),
 partial:scenario('partial',{partialDomains:['crm','finance','editorial']}),
 large:scenario('large',{largeDataset:true}),
 'permission-denied':scenario('permission-denied',{permissionDeniedDomains:['finance','contracts']}),
 offline:scenario('offline',{offline:true,failDomains:['notifications','crm','contracts','finance','editorial','home','agenda','advertising','collaboration','dashboard']}),
}
export const DEFAULT_MOCK_SCENARIO:DataScenarioName='success'
