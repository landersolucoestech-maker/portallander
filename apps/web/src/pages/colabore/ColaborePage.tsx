import {CheckCircle2,ShieldCheck} from 'lucide-react'
import {editorialReadModel} from '../../features/editorial/repository'
import {defaultSectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../features/site-manager/usePublicHomeSections'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {getSiteFormBySlug} from '../../features/site-manager/forms/catalog'
import {resolveSiteFormOptionSets} from '../../features/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../features/site-manager/forms/SiteFormRenderer'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PageContainer,PageHero,PageSection,PageShell,SectionHeading} from '../../shared/public/PublicPageArchitecture'

export function ColaborePage(){
  const page=editorialReadModel.getPageBySlug('colabore')
  const pageId=page?.id||'colabore'
  const {sections:homeSections}=usePublicHomeSections()
  const hero=useSectionConfiguration(pageId,'colabore-hero','Hero Colabore')
  const guidelinesSection=useSectionConfiguration(pageId,'colabore-diretrizes','Diretrizes de Envio')
  const formSection=useSectionConfiguration(pageId,'colabore-formulario','Formulário de Colaboração')
  const guidelines=publicSiteReadModel.collaborationGuidelines().slice(0,guidelinesSection.itemLimit)
  const formDefinition=getSiteFormBySlug('colabore')
  const activeForm=formDefinition?.status==='active'?formDefinition:null
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')

  const submit=async({payload,acceptedConsentIds,files,antiSpam}:SiteFormSubmitPayload)=>{
    if(!activeForm)throw new Error('O formulário Colabore não está disponível.')
    await submitSiteForm(activeForm.slug,{payload,acceptedConsentIds,files,antiSpam,source:{page:window.location.pathname,referrer:document.referrer||undefined}})
    return activeForm.successMessage
  }

  return <PageShell className="colabore-page special-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant="institutional" breadcrumbs={[{label:'Início',to:'/'},{label:page?.navigationLabel||'Colabore'}]}/>
    <main>
      <PageSection><PageContainer>
        <div className="pl-special-intro-points"><span><ShieldCheck size={17}/> Material sujeito à análise da equipe editorial</span><span><CheckCircle2 size={17}/> Envio não garante publicação</span></div>
        {guidelinesSection.active&&<section className="colabore-guidelines" style={{background:guidelinesSection.background,color:guidelinesSection.textColor,textAlign:guidelinesSection.textAlign}}><SectionHeading eyebrow={guidelinesSection.eyebrow||'ANTES DE ENVIAR'} title={guidelinesSection.title||'O QUE PROCURAMOS'} description={guidelinesSection.description}/>{guidelines.map(item=><div className="colabore-guideline" key={item.id}><b>{String(item.order).padStart(2,'0')}</b><span>{item.title}</span></div>)}</section>}
        {formSection.active&&<section className="colabore-layout" style={{background:formSection.background,color:formSection.textColor,textAlign:formSection.textAlign}}><SectionHeading eyebrow="ENVIO" title={formSection.title||'FORMULÁRIO DE ENVIO'} description={formSection.description}/>{activeForm?<SiteFormRenderer form={activeForm} mode="public" optionSets={resolveSiteFormOptionSets(activeForm)} onSubmit={submit} submitLabel="Enviar material" note="Os materiais enviados são encaminhados ao fluxo editorial de Colaborações recebidas e não são convertidos automaticamente em Leads do CRM."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário indisponível</h2><p>O formulário Colabore está inativo ou ainda não possui uma versão publicada.</p></div>}</section>}
      </PageContainer></PageSection>
    </main>
  </PageShell>
}
