import type {EditorialPage} from '../../features/editorial/model'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
import {getSiteFormBySlug} from '../../features/site-manager/forms/catalog'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {resolveSiteFormOptionSets} from '../../features/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../features/site-manager/forms/SiteFormRenderer'
import {defaultSectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../features/site-manager/usePublicHomeSections'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {ContentSidebarLayout,PageContainer,PageHero,PageSection,PageShell,SectionHeading} from '../../shared/public/PublicPageArchitecture'

export function ContatoPage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const {sections:homeSections}=usePublicHomeSections()
  const hero=useSectionConfiguration(page.id,'contato-hero','Hero de Contato')
  const channelsSection=useSectionConfiguration(page.id,'contato-canais','Canais Oficiais')
  const channels=publicSiteReadModel.socialChannels().slice(0,channelsSection.itemLimit)
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')
  const formDefinition=getSiteFormBySlug('contato')
  const activeForm=formDefinition?.status==='active'?formDefinition:null

  const submit=async({payload,acceptedConsentIds,files,antiSpam}:SiteFormSubmitPayload)=>{
    if(!activeForm)throw new Error('O formulário Contato Comercial não está disponível.')
    await submitSiteForm(activeForm.slug,{payload,acceptedConsentIds,files,antiSpam,source:{entryContext:'contato',page:window.location.pathname,referrer:document.referrer||undefined}})
    return activeForm.successMessage
  }

  const channelsPanel=channelsSection.active?<section className="pl-contact-channels" style={{background:channelsSection.background,color:channelsSection.textColor,textAlign:channelsSection.textAlign}}><SectionHeading eyebrow={channelsSection.eyebrow||'FALE CONOSCO'} title={channelsSection.title||'CANAIS OFICIAIS'} description={channelsSection.description}/>{channels.length?<div className="pl-contact-channel-list">{channels.map(channel=><a href={channel.url} target={channel.url.startsWith('mailto:')?'_self':'_blank'} rel={channel.url.startsWith('mailto:')?undefined:'noreferrer'} key={channel.id}><strong>{channel.label}</strong><span>{channel.network.toUpperCase()}</span></a>)}</div>:<div className="editorial-empty-state"><h2>Nenhum canal público configurado</h2><p>Os canais aparecerão aqui quando forem habilitados na identidade do site.</p></div>}</section>:undefined

  return <PageShell className="contato-page institutional-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant="institutional" breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel||page.title}]}/>
    <main><PageSection><PageContainer><ContentSidebarLayout variant="institutional" sidebar={channelsPanel}>
      <section className="pl-contact-form-region"><SectionHeading eyebrow="CONTATO" title="ENVIE UMA MENSAGEM" description="Preencha o formulário de Contato Comercial. A solicitação aceita segue para o fluxo de Leads do CRM."/>{activeForm?<SiteFormRenderer form={activeForm} mode="public" optionSets={resolveSiteFormOptionSets(activeForm)} onSubmit={submit} submitLabel="Enviar mensagem" note="A solicitação é registrada pelo formulário canônico Contato Comercial e encaminhada ao CRM → Leads."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário indisponível</h2><p>O formulário Contato Comercial está inativo ou ainda não possui uma versão publicada.</p></div>}</section>
    </ContentSidebarLayout></PageContainer></PageSection></main>
  </PageShell>
}
