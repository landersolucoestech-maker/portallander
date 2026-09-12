import {BarChart3,LayoutGrid,Megaphone,Newspaper} from 'lucide-react'
import {submitSiteForm} from '../../modules/site-manager/forms/client'
import {getSiteFormBySlug} from '../../modules/site-manager/forms/catalog'
import {resolveSiteFormOptionSets} from '../../modules/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../modules/site-manager/forms/SiteFormRenderer'
import {siteAppearanceStyle,useSiteAppearance} from '../../shared/branding/useSiteAppearance'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

const formatIcons={home:LayoutGrid,news:Newspaper,campaigns:Megaphone,metrics:BarChart3} as const

export function AdvertisePage(){
  const appearance=useSiteAppearance()
  const formats=publicSiteReadModel.advertisingFormats()
  const formDefinition=getSiteFormBySlug('collaborate')
  const activeForm=formDefinition?.status==='active'?formDefinition:null
  const submit=async({payload,acceptedConsentIds,files,antiSpam}:SiteFormSubmitPayload)=>{
    if(!activeForm)throw new Error('O formulário Colabore / Anuncie não está disponível.')
    await submitSiteForm(activeForm.slug,{payload,acceptedConsentIds,files,antiSpam,source:{entryContext:'advertise',page:window.location.pathname,referrer:document.referrer||undefined,campaign:'advertise'}})
    return activeForm.successMessage
  }

  return <div className="public-page" style={siteAppearanceStyle(appearance)}><PublicHeader/><main className="public-shell editorial-content-page public-info-page"><header className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE</span><h1>Anuncie no Portal Lander</h1><p>Espaços publicitários para marcas que querem aparecer dentro do universo da música, cultura urbana e entretenimento.</p></header><section className="public-info-grid">{formats.map(format=>{const Icon=formatIcons[format.iconKey];return <article className="public-info-card" key={format.id}><Icon size={20} aria-hidden="true"/><h2>{format.title}</h2><p>{format.description}</p></article>})}</section><section className="public-info-form-section" aria-labelledby="advertise-contact-title"><div className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE E PARCERIAS</span><h2 id="advertise-contact-title">Fale com o Portal Lander</h2><p>Envie os dados da marca e o formato de interesse. A solicitação segue pelo formulário canônico Colabore / Anuncie para a triagem em Colaborações recebidas.</p></div>{activeForm?<SiteFormRenderer form={activeForm} mode="public" optionSets={resolveSiteFormOptionSets(activeForm)} onSubmit={submit} submitLabel="Enviar solicitação" note="O envio registra uma solicitação de publicidade ou parceria em Colaborações recebidas; não cria Lead no CRM."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário indisponível</h2><p>O formulário Colabore / Anuncie está inativo ou ainda não possui uma versão publicada.</p></div>}</section></main><PublicFooter/></div>
}
