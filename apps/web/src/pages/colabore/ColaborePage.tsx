import {CheckCircle2,ShieldCheck} from 'lucide-react'
import {editorialReadModel} from '../../features/editorial/repository'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {getSiteFormBySlug} from '../../features/site-manager/forms/catalog'
import {resolveSiteFormOptionSets} from '../../features/site-manager/forms/runtimeOptions'
import {SiteFormRenderer,type SiteFormSubmitPayload} from '../../features/site-manager/forms/SiteFormRenderer'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

export function ColaborePage(){
  const pageId=editorialReadModel.getPageBySlug('colabore')?.id||'colabore'
  const hero=useSectionConfiguration(pageId,'colabore-hero','Hero Colabore')
  const guidelinesSection=useSectionConfiguration(pageId,'colabore-diretrizes','Diretrizes de Envio')
  const formSection=useSectionConfiguration(pageId,'colabore-formulario','Formulário de Colaboração')
  const guidelines=publicSiteReadModel.collaborationGuidelines().slice(0,guidelinesSection.itemLimit)
  const formDefinition=getSiteFormBySlug('colabore')
  const activeForm=formDefinition?.status==='active'?formDefinition:null

  const submit=async({payload,acceptedConsentIds,files,antiSpam}:SiteFormSubmitPayload)=>{
    if(!activeForm)throw new Error('O formulário Colabore não está disponível.')
    await submitSiteForm(activeForm.slug,{payload,acceptedConsentIds,files,antiSpam,source:{page:window.location.pathname,referrer:document.referrer||undefined}})
    return activeForm.successMessage
  }

  return <div className="public-page colabore-page">
    <PublicHeader/>
    <main>
      {hero.active&&<section className="colabore-hero public-standard-page-hero" style={{background:hero.background,color:hero.textColor,textAlign:hero.textAlign,position:'relative',overflow:'hidden'}}>{hero.imageUrl&&<img src={hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.25}}/>}<div className="public-shell colabore-hero-grid" style={{position:'relative',zIndex:1}}><div className="colabore-hero-copy"><span className="colabore-eyebrow" style={{color:hero.accentColor}}>{hero.eyebrow||'PARTICIPE DO PORTAL'}</span><h1>{hero.title||'SUA HISTÓRIA PODE VIRAR NOTÍCIA.'}</h1><p>{hero.description||'Tem uma pauta, vídeo, foto, denúncia, lançamento ou história relevante? Prepare seu material para análise editorial do Portal Lander.'}</p><div className="colabore-hero-points"><span><ShieldCheck size={17}/> Material sujeito à análise da equipe editorial</span><span><CheckCircle2 size={17}/> Envio não garante publicação</span></div></div></div></section>}
      <section className="public-shell colabore-content">
        {guidelinesSection.active&&<div className="colabore-guidelines" style={{background:guidelinesSection.background,color:guidelinesSection.textColor,textAlign:guidelinesSection.textAlign}}><div className="colabore-guidelines-copy"><span style={{color:guidelinesSection.accentColor}}>{guidelinesSection.eyebrow||'ANTES DE ENVIAR'}</span><h2>{guidelinesSection.title||'O QUE PROCURAMOS'}</h2><p>{guidelinesSection.description||'Conteúdo relevante para notícias, cultura, entretenimento, comportamento, negócios, tecnologia, eventos, lançamentos e acontecimentos de interesse público.'}</p></div>{guidelines.map(item=><div className="colabore-guideline" key={item.id}><b>{String(item.order).padStart(2,'0')}</b><span>{item.title}</span></div>)}</div>}
        {formSection.active&&<div className="colabore-layout" style={{background:formSection.background,color:formSection.textColor,textAlign:formSection.textAlign}}><div className="news-page-intro-copy"><span style={{color:formSection.accentColor}}>ENVIO</span><h2>{formSection.title||'FORMULÁRIO DE ENVIO'}</h2>{formSection.description&&<p>{formSection.description}</p>}</div>{activeForm?<SiteFormRenderer form={activeForm} mode="public" optionSets={resolveSiteFormOptionSets(activeForm)} onSubmit={submit} submitLabel="Enviar material" note="Os materiais enviados são encaminhados ao fluxo editorial de Colaborações recebidas e não são convertidos automaticamente em Leads do CRM."/>:<div className="editorial-empty-state" role="alert"><h2>Formulário indisponível</h2><p>O formulário Colabore está inativo ou ainda não possui uma versão publicada.</p></div>}</div>}
      </section>
    </main>
    <PublicFooter/>
  </div>
}
