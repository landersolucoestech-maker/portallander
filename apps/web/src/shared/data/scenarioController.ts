import type {DataScenarioName} from './contracts'
import {getRuntimeDataProvider} from './runtimeDataProvider'

const allowed:readonly DataScenarioName[]=['success','loading','empty','error','partial','large','permission-denied','offline']
const isScenario=(value:string|null):value is DataScenarioName=>Boolean(value&&allowed.includes(value as DataScenarioName))

export const scenarioController={
 current(){return getRuntimeDataProvider().getScenario()},
 set(name:DataScenarioName){getRuntimeDataProvider().setScenario(name)},
 reset(){getRuntimeDataProvider().setScenario('success')},
 bootstrapFromLocation(location:Pick<Location,'search'|'hash'>=window.location){
  const search=new URLSearchParams(location.search)
  const hashQuery=location.hash.includes('?')?new URLSearchParams(location.hash.slice(location.hash.indexOf('?')+1)):null
  const requested=search.get('dataScenario')??hashQuery?.get('dataScenario')??null
  if(isScenario(requested))this.set(requested)
  return this.current()
 },
 options:allowed,
}
