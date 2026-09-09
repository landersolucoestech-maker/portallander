import {useMemo} from 'react'
import {defaultSectionConfiguration,LEGAL_PAGE_SLUGS} from '../../site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../site-manager/usePublicHomeSections'
import {useSectionConfiguration} from '../../site-manager/useSectionConfiguration'
import {ContentSidebarLayout,PageContainer,PageHero,PageSection,PageShell,SectionHeading} from '../../../shared/public/PublicPageArchitecture'
import {useEditorialSeo} from '../hooks/useEditorialSeo'
import type {EditorialContent,EditorialPage} from '../model'
import {editorialReadModel} from '../repository'

function contentBlocks(contents:EditorialContent[]){return contents.flatMap(content=>content.body.map((block,index)=>({...block,id:`${content.id}-${index}`})))}
function anchorFor(value:string,index:number){const slug=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');return slug||`secao-${index+1}`}

export function StructuredPublicPage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const {sections:homeSections}=usePublicHomeSections()
  const isLegal=LEGAL_PAGE_SLUGS.has(page.slug)
  const heroId=isLegal?'legal-hero':'institutional-hero'
  const bodyId=isLegal?'legal-document':'institutional-body'
  const hero=useSectionConfiguration(page.id,heroId,isLegal?'Hero Legal':'Hero Institucional',{title:page.title.toUpperCase(),eyebrow:isLegal?'DOCUMENTO':'INSTITUCIONAL',description:page.description})
  const body=useSectionConfiguration(page.id,bodyId,isLegal?'Documento Legal':'Conteúdo Institucional',{title:page.title,description:page.description,itemLimit:isLegal?50:20,columns:1})
  const contents=editorialReadModel.listPageContents(page.id)
  const blocks=useMemo(()=>contentBlocks(contents),[contents])
  const headings=blocks.filter((block):block is Extract<(typeof blocks)[number],{type:'heading'}>=>block.type==='heading')
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')

  const article=<article className={isLegal?'pl-legal-document':'pl-institutional-document'} style={{background:body.background,color:body.textColor,textAlign:body.textAlign}}>{body.eyebrow&&<span className="pl-page-eyebrow" style={{color:body.accentColor}}>{body.eyebrow}</span>}<SectionHeading title={body.title||page.title} description={blocks.length?undefined:body.description||page.description}/>{blocks.length?blocks.map((block,index)=>block.type==='heading'?<section key={block.id} id={anchorFor(block.text,index)}><h2>{block.text}</h2></section>:block.type==='quote'?<blockquote key={block.id}><p>{block.text}</p>{block.attribution&&<cite>{block.attribution}</cite>}</blockquote>:<p key={block.id}>{block.text}</p>):<p>{body.description||page.description}</p>}</article>
  const toc=isLegal&&headings.length>1?<nav className="pl-document-toc" aria-label="Índice do documento"><strong>NESTA PÁGINA</strong>{headings.map((heading,index)=><a key={`${heading.id}-toc`} href={`#${anchorFor(heading.text,index)}`}>{heading.text}</a>)}</nav>:undefined

  return <PageShell className={isLegal?'legal-page':'institutional-page'} newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant={isLegal?'legal':'institutional'} breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel||page.title}]}/>
    <main><PageSection><PageContainer><ContentSidebarLayout variant={isLegal?'legal':'institutional'} sidebar={toc}>{article}</ContentSidebarLayout></PageContainer></PageSection></main>
  </PageShell>
}
