import {useEffect,useState} from 'react'
import {useAdminAuth} from '../../access/AdminAuthContext'
import {getAdminSiteForm} from './adminClient'
import {getSiteFormById} from './catalog'
import {formDraftRepository} from './draftRepository'
import type {SiteFormDefinition} from './domain'
import {resolveSectionFormId} from './sectionFormMapping'
import {resolveSiteFormOptionSets} from './runtimeOptions'
import {SiteFormRenderer} from './SiteFormRenderer'

export function SectionFormPreview({sectionId}:{sectionId:string}){
  const formId=resolveSectionFormId(sectionId)
  const {status}=useAdminAuth()
  const [form,setForm]=useState<SiteFormDefinition|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let active=true
    const load=async()=>{
      setLoading(true);setError('');setForm(null)
      if(!formId){
        if(active){setError('Esta seção ainda não possui um formulário canônico associado.');setLoading(false)}
        return
      }
      try{
        if(status==='authenticated'){
          const administrative=await getAdminSiteForm(formId)
          if(active)setForm(administrative)
        }else{
          const localDraft=formDraftRepository.get(formId)
          const runtime=getSiteFormById(formId)
          if(active)setForm(localDraft??runtime??null)
        }
      }catch(caught){
        if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a definição real do formulário.')
      }finally{if(active)setLoading(false)}
    }
    void load()
    return()=>{active=false}
  },[formId,status])

  if(loading)return <section className="section-preview-form section-preview-form-shared" aria-busy="true"><p>Carregando formulário real…</p></section>
  if(error)return <section className="section-preview-form section-preview-form-shared" role="status"><p>Preview indisponível: {error}</p></section>
  if(!form)return <section className="section-preview-form section-preview-form-shared" role="status"><p>Preview indisponível: formulário canônico não encontrado.</p></section>

  return <section className="section-preview-form section-preview-form-shared" data-testid="section-form-shared-preview" data-form-id={form.id}>
    <SiteFormRenderer form={form} mode="preview" optionSets={resolveSiteFormOptionSets(form)} submitLabel="Enviar"/>
  </section>
}
