import {publicSiteReadModel} from '../../../shared/data/publicSiteReadModel'
import type {SiteFormDefinition} from './domain'
import type {SiteFormOptionSets} from './SiteFormRenderer'

const canonicalLabels:Record<string,string>={
  anunciante:'Anunciante / Marca',
  patrocinador:'Patrocinador',
  agencia_publicidade:'Agência de Publicidade',
  parceiro_comercial:'Parceiro Comercial',
  banner_publicitario:'Banner publicitário',
  materia_patrocinada:'Matéria patrocinada',
  campanha_publicitaria:'Campanha publicitária',
  publicacao_comercial:'Publicação comercial',
  publicidade:'Publicidade',
  patrocinio:'Patrocínio',
  parceria_comercial:'Parceria comercial',
  conteudo_patrocinado:'Conteúdo patrocinado',
  outro:'Outro',
}

export function resolveSiteFormOptionSets(form:SiteFormDefinition):SiteFormOptionSets{
  const collaborationTypes=form.purpose==='editorial_submission'?publicSiteReadModel.collaborationTypes():[]
  const collaborationLabels=new Map<string,string>(collaborationTypes.map(option=>[option.value,option.label]))
  const sets:SiteFormOptionSets={}

  for(const field of form.fields){
    if(!field.options?.length)continue
    sets[field.key]=field.options.map(value=>({value,label:collaborationLabels.get(value)??canonicalLabels[value]??value}))
  }

  return sets
}
