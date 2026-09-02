import {publicSiteReadModel} from '../../../shared/data/publicSiteReadModel'
import type {SiteFormDefinition} from './domain'
import type {SiteFormOptionSets} from './SiteFormRenderer'

export function resolveSiteFormOptionSets(form:SiteFormDefinition):SiteFormOptionSets{
  const collaborationTypes=form.purpose==='editorial_submission'?publicSiteReadModel.collaborationTypes():[]
  const collaborationLabels=new Map(collaborationTypes.map(option=>[option.value,option.label]))
  const sets:SiteFormOptionSets={}

  for(const field of form.fields){
    if(!field.options?.length)continue
    sets[field.key]=field.options.map(value=>({value,label:collaborationLabels.get(value)??value}))
  }

  return sets
}
