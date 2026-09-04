import {BarChart3,LayoutGrid,Megaphone,Newspaper} from 'lucide-react'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {getSiteFormBySlug} from '../../features/site-manager/forms/catalog'
import {resolveSiteFormOptionSets} from '../../features/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../features/site-manager/forms/SiteFormRenderer'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

const formatIcons={home:LayoutGrid,news:Newspaper,campaigns:Megaphone,metrics:BarChart3} as const

export function AnunciePage(){
  const formats=publicSiteReadModel.advertisingFormats()
  const formDefinition=getSiteFormBySlug('anuncie-contato')
  const activeForm=formDefinition?.status==='active'?formDefinition:null
  const submit=async({payload,acceptedConsentIds,files,antiSpam}:SiteFormSubmitPayload)=>{
    if(!activeForm)throw new Error('O formulário comercial não está disponível.')
    await submitSiteForm(activeForm.slug,{payload,acceptedConsentIds,files,antiSpam,source:{page:window.location.pathname,referrer:document.referrer||undefined,campaign:'anuncie'}})
    return activeForm.successMessage
  }

  return <div className="public-page"><PublicHeader/><main className="public-shell editorial-content-page public-info-page"><header className="editorial-detail-header"><span className="editorial-kicker">PUBLICIDADE</span><h1>Anuncie no Portal Lander</h1><p>Espaços publicitários para marcas que querem aparecer dentro do universo da música, cultura urbana e entretenimento.</p></header><section className="public-info-grid">{formats.map(format=>{const Icon=formatIcons[format.iconKey];return <article className="public-info-card" key={format.id}><Icon size={20} aria-hidden="true"/><h2>{format.title}</h2><p>{format.description}</p></article>})}</section><section className="public-info-form-section" aria-labelledby="anuncie-contact-title"><div className="editorial-detail-header"><span className="editorial-kicker">CONTATO COMERCIAL</span><h2 id="anuncie-contact-title">Fale com o Portal Lander</h2><p>Envie os dados da marca e o formato de interesse. A solicitação aceita é registrada no CRM como novo lead comercial, mantendo a submissão de origem vinculada.</p></div>{activeForm?<SiteFormRenderer form={activeForm} mode="public" optionSets={resolveSiteFormOptionSets(activeForm)} onSubmit={submit} submitLabel="Enviar solicitação" note="O envio registra uma solicitação comercial; não representa contratação automática, reserva de inventário ou aprovação de campanha."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário comercial indisponível</h2><p>O formulário de publicidade está inativo ou ainda não possui uma versão publicada.</p></div>}</section></main><PublicFooter/></div>
}
