import {CheckCircle2,ShieldCheck} from 'lucide-react'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {getSiteFormBySlug} from '../../features/site-manager/forms/catalog'
import {resolveSiteFormOptionSets} from '../../features/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../features/site-manager/forms/SiteFormRenderer'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

const formDefinition=getSiteFormBySlug('colabore')

export function ColaborePage(){
  const guidelines=publicSiteReadModel.collaborationGuidelines()

  const submit=async({payload,acceptedConsentIds,files}:SiteFormSubmitPayload)=>{
    if(!formDefinition)throw new Error('O formulário Colabore não está configurado.')
    await submitSiteForm(formDefinition.slug,{payload,acceptedConsentIds,files,source:{page:window.location.pathname,referrer:document.referrer||undefined}})
    return formDefinition.successMessage
  }

  return <div className="public-page colabore-page">
    <PublicHeader/>
    <main>
      <section className="colabore-hero public-standard-page-hero"><div className="public-shell colabore-hero-grid"><div className="colabore-hero-copy"><span className="colabore-eyebrow">PARTICIPE DO PORTAL</span><h1>SUA HISTÓRIA<br/><em>PODE VIRAR NOTÍCIA.</em></h1><p>Tem uma pauta, vídeo, foto, denúncia, lançamento ou história relevante? Prepare seu material para análise editorial do Portal Lander.</p><div className="colabore-hero-points"><span><ShieldCheck size={17}/> Material sujeito à análise da equipe editorial</span><span><CheckCircle2 size={17}/> Envio não garante publicação</span></div></div></div></section>
      <section className="public-shell colabore-content">
        <div className="colabore-guidelines"><div className="colabore-guidelines-copy"><span>ANTES DE ENVIAR</span><h2>O QUE PROCURAMOS</h2><p>Conteúdo relevante para notícias, cultura, entretenimento, comportamento, negócios, tecnologia, eventos, lançamentos e acontecimentos de interesse público.</p></div>{guidelines.map(item=><div className="colabore-guideline" key={item.id}><b>{String(item.order).padStart(2,'0')}</b><span>{item.title}</span></div>)}</div>
        <div className="colabore-layout">{formDefinition?<SiteFormRenderer form={formDefinition} mode="public" optionSets={resolveSiteFormOptionSets(formDefinition)} onSubmit={submit} submitLabel="Enviar material" note="Os materiais enviados são encaminhados ao fluxo editorial de Colaborações recebidas e não são convertidos automaticamente em Leads do CRM."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário indisponível</h2><p>A definição do formulário Colabore não foi encontrada.</p></div>}</div>
      </section>
    </main>
    <PublicFooter/>
  </div>
}
