import type {EditorialPage} from '../../features/editorial/model'
import {editorialReadModel} from '../../features/editorial/repository'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
import {defaultSectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../features/site-manager/usePublicHomeSections'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {ContentSidebarLayout,PageContainer,PageHero,PageSection,PageShell,SectionHeading} from '../../shared/public/PublicPageArchitecture'

export function SobrePage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const {sections:homeSections}=usePublicHomeSections()
  const hero=useSectionConfiguration(page.id,'sobre-hero','Hero Institucional')
  const body=useSectionConfiguration(page.id,'sobre-conteudo','Conteúdo Institucional')
  const contents=editorialReadModel.listPageContents(page.id)
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')
  return <PageShell className="sobre-page institutional-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant="institutional" breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel||page.title}]}/>
    <main>
      {body.active&&<PageSection><PageContainer><ContentSidebarLayout variant="institutional">
        <article className="pl-institutional-document" style={{background:body.background,color:body.textColor,textAlign:body.textAlign}}>
          <SectionHeading eyebrow={body.eyebrow||'NOSSA HISTÓRIA'} title={body.title||'PORTAL LANDER'} description={contents.length?undefined:body.description||page.description}/>
          {contents.length?contents.map(content=><section className="pl-institutional-content-block" key={content.id}><h2>{content.title}</h2>{content.subtitle&&<p className="pl-institutional-lead">{content.subtitle}</p>}{content.body.map((block,index)=>block.type==='heading'?<h3 key={index}>{block.text}</h3>:block.type==='quote'?<blockquote key={index}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:<p key={index}>{block.text}</p>)}</section>):<p>{body.description||page.description}</p>}
        </article>
      </ContentSidebarLayout></PageContainer></PageSection>}
    </main>
  </PageShell>
}
