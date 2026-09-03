import {useMemo,type FormEvent} from 'react'
import type {EditorialPage} from '../../features/editorial/model'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
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
  const emailChannel=useMemo(()=>channels.find(channel=>channel.url.toLowerCase().startsWith('mailto:')),[channels])
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(!emailChannel)return
    const form=new FormData(event.currentTarget)
    const subject=String(form.get('assunto')||'Contato pelo Portal Lander').trim()
    const name=String(form.get('nome')||'').trim()
    const sender=String(form.get('email')||'').trim()
    const message=String(form.get('mensagem')||'').trim()
    const body=[name&&`Nome: ${name}`,sender&&`E-mail: ${sender}`,'',message].filter(Boolean).join('\n')
    window.location.href=`${emailChannel.url}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  const channelsPanel=channelsSection.active?<section className="pl-contact-channels" style={{background:channelsSection.background,color:channelsSection.textColor,textAlign:channelsSection.textAlign}}><SectionHeading eyebrow={channelsSection.eyebrow||'FALE CONOSCO'} title={channelsSection.title||'CANAIS OFICIAIS'} description={channelsSection.description}/>{channels.length?<div className="pl-contact-channel-list">{channels.map(channel=><a href={channel.url} target={channel.url.startsWith('mailto:')?'_self':'_blank'} rel={channel.url.startsWith('mailto:')?undefined:'noreferrer'} key={channel.id}><strong>{channel.label}</strong><span>{channel.network.toUpperCase()}</span></a>)}</div>:<div className="editorial-empty-state"><h2>Nenhum canal público configurado</h2><p>Os canais aparecerão aqui quando forem habilitados na identidade do site.</p></div>}</section>:undefined

  return <PageShell className="contato-page institutional-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant="institutional" breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel||page.title}]}/>
    <main><PageSection><PageContainer><ContentSidebarLayout variant="institutional" sidebar={channelsPanel}>
      <section className="pl-contact-form-region"><SectionHeading eyebrow="CONTATO" title="ENVIE UMA MENSAGEM" description={emailChannel?'Preencha os campos. Ao enviar, abriremos o seu aplicativo de e-mail utilizando o canal oficial configurado.':'Os canais oficiais estão disponíveis ao lado. O envio por formulário será habilitado quando um canal de e-mail oficial estiver configurado.'}/><form className="pl-contact-form" onSubmit={submit}><label>Nome<input name="nome" autoComplete="name" required/></label><label>E-mail<input name="email" type="email" autoComplete="email" required/></label><label>Assunto<input name="assunto" required/></label><label>Mensagem<textarea name="mensagem" rows={7} required/></label><button className="button" type="submit" disabled={!emailChannel}>ENVIAR MENSAGEM</button>{!emailChannel&&<p className="pl-form-helper" role="status">Configure um canal público do tipo e-mail para habilitar o envio.</p>}</form></section>
    </ContentSidebarLayout></PageContainer></PageSection></main>
  </PageShell>
}
