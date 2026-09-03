import {useMemo,type FormEvent} from 'react'
import {Link,useLocation,useNavigate} from 'react-router-dom'
import {withAdvertisingSectionLayout} from '../../site-manager/advertisingSectionLayout'
import {defaultSectionConfiguration} from '../../site-manager/sectionConfiguration'
import {usePublicHomeSections} from '../../site-manager/usePublicHomeSections'
import {useSectionConfiguration} from '../../site-manager/useSectionConfiguration'
import {AdvertiseHereSection} from '../../../pages/home/components/AdvertiseHereSection'
import {SpotifyReleasesSection} from '../../../pages/home/components/SpotifyReleasesSection'
import {defaultHomeAdConfig} from '../../../pages/home/models/adModel'
import {ContentSidebarLayout,PageContainer,PageHero,PageSection,PageShell,PromotionalRegion} from '../../../shared/public/PublicPageArchitecture'
import {PublicAdvertisementModule,PublicMostReadModule} from '../../../shared/public/PublicEditorialModules'
import {useEditorialSeo} from '../hooks/useEditorialSeo'
import type {EditorialPage} from '../model'
import {editorialReadModel} from '../repository'

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim()

export function EditorialListingPage({page}:{page:EditorialPage}){
  const location=useLocation()
  const navigate=useNavigate()
  const {sections:homeSections}=usePublicHomeSections()
  const heroFallback=useMemo(()=>({title:page.title.toUpperCase(),description:page.description,eyebrow:'AGORA NO PORTAL'}),[page.title,page.description])
  const hero=useSectionConfiguration(page.id,'editorial-hero',page.title,heroFallback)
  const summary=useSectionConfiguration(page.id,'editorial-summary','Resumo da Listagem')
  const advertising=useSectionConfiguration(page.id,'editorial-ad','Publicidade Editorial')
  const template=useSectionConfiguration('editorial-template','editorial-template','Conteúdos / Grid Editorial')
  const params=useMemo(()=>new URLSearchParams(location.search),[location.search])
  const searchQuery=params.get('busca')?.trim()||''
  const category=params.get('categoria')?.trim()||'todos'
  const sort=params.get('ordem')==='antigos'?'antigos':'recentes'
  const currentPage=Math.max(1,Number(params.get('pagina'))||1)
  const baseContents=editorialReadModel.listPageContents(page.id)
  const categories=useMemo(()=>Array.from(new Set(baseContents.map(content=>content.tags[0]).filter((tag):tag is string=>Boolean(tag)))).sort((a,b)=>a.localeCompare(b,'pt-BR')),[baseContents])
  const filteredContents=useMemo(()=>{
    const query=normalize(searchQuery)
    const filtered=baseContents.filter(content=>{
      const categoryMatch=category==='todos'||normalize(content.tags[0]||'')===normalize(category)
      const searchMatch=!query||normalize([content.title,content.subtitle,content.summary,content.author,...content.tags].join(' ')).includes(query)
      return categoryMatch&&searchMatch
    })
    return [...filtered].sort((a,b)=>sort==='antigos'?(a.publishedAt||a.updatedAt).localeCompare(b.publishedAt||b.updatedAt):(b.publishedAt||b.updatedAt).localeCompare(a.publishedAt||a.updatedAt))
  },[baseContents,category,searchQuery,sort])
  const pageSize=Math.max(1,template.itemLimit||12)
  const totalPages=Math.max(1,Math.ceil(filteredContents.length/pageSize))
  const safePage=Math.min(currentPage,totalPages)
  const contents=filteredContents.slice((safePage-1)*pageSize,safePage*pageSize)
  const updateParams=(changes:Record<string,string|null>)=>{
    const next=new URLSearchParams(location.search)
    Object.entries(changes).forEach(([key,value])=>value&&value!=='todos'?next.set(key,value):next.delete(key))
    navigate({pathname:location.pathname,search:next.toString()?`?${next.toString()}`:''})
  }
  const submitSearch=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const value=String(new FormData(event.currentTarget).get('busca')||'').trim();updateParams({busca:value||null,pagina:null})}
  useEditorialSeo(page)

  const mostRead=homeSections['mais-lidas']??defaultSectionConfiguration('mais-lidas','Mais Lidas')
  const releases=homeSections.lancamentos??defaultSectionConfiguration('lancamentos','Lançamentos')
  const advertiseHere=homeSections['anuncie-aqui']??defaultSectionConfiguration('anuncie-aqui','Anuncie Aqui')
  const newsletter=homeSections.newsletter??defaultSectionConfiguration('newsletter','Newsletter')
  const adLayout=withAdvertisingSectionLayout(advertiseHere,'anuncie-aqui')

  return <PageShell className="news-reference-page" newsletterConfiguration={newsletter}>
    <PageHero configuration={hero} variant="editorial" title={searchQuery?'RESULTADOS':undefined} description={searchQuery?`Resultados editoriais para “${searchQuery}”.`:undefined} breadcrumbs={[{label:'Início',to:'/'},{label:page.navigationLabel}]} />
    <main style={{background:template.background,color:template.textColor,textAlign:template.textAlign}}>
      <PageSection><PageContainer>
        <ContentSidebarLayout variant="editorial" sidebar={<><PublicAdvertisementModule configuration={advertising} placement="editorial"/><PublicMostReadModule configuration={mostRead} limit={5}/><SpotifyReleasesSection configuration={releases} variant="sidebar" limit={3}/></>}>
          <div className="pl-editorial-controls" aria-label="Filtros de notícias">
            <div className="pl-category-filters" role="group" aria-label="Categorias"><button type="button" className={category==='todos'?'is-active':''} onClick={()=>updateParams({categoria:null,pagina:null})}>TODOS</button>{categories.map(item=><button type="button" key={item} className={normalize(category)===normalize(item)?'is-active':''} onClick={()=>updateParams({categoria:item,pagina:null})}>{item.toUpperCase()}</button>)}</div>
            <div className="pl-editorial-control-row"><label className="pl-editorial-sort"><span className="sr-only">Ordenação</span><select value={sort} onChange={event=>updateParams({ordem:event.target.value==='antigos'?'antigos':null,pagina:null})}><option value="recentes">Mais recentes</option><option value="antigos">Mais antigos</option></select></label><form className="pl-editorial-search" role="search" onSubmit={submitSearch}><input name="busca" type="search" defaultValue={searchQuery} key={searchQuery} placeholder="Buscar notícias..." aria-label="Buscar notícias"/><button type="submit">BUSCAR</button></form></div>
          </div>
          {!template.active?<section className="editorial-empty-state" role="status"><h2>Seção editorial temporariamente oculta</h2><p>O grid editorial está desativado na configuração de Páginas.</p></section>:filteredContents.length===0?<section className="editorial-empty-state" role="status"><h2>Nenhum resultado encontrado</h2><p>Altere a busca ou os filtros para localizar outros conteúdos.</p><button className="button outline" type="button" onClick={()=>navigate(`/${page.slug}`)}>Limpar filtros</button></section>:<>
            {summary.active&&<div className="editorial-results-summary" role="status" style={{background:summary.background,color:summary.textColor,textAlign:summary.textAlign,borderColor:summary.accentColor}}>{filteredContents.length} conteúdo{filteredContents.length===1?'':'s'}</div>}
            <div className="pl-editorial-card-grid">{contents.map(content=>{const contentPage=editorialReadModel.getPageById(content.pageId);const targetPage=contentPage?.slug||page.slug;return <Link className="pl-card news-reference-card" to={`/${targetPage}/${content.slug}`} key={content.id}><div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${content.coverImage||''})`}}>{content.tags[0]&&<span className="pl-badge">{content.tags[0]}</span>}</div><div className="pl-card-body news-reference-card-body"><h3>{content.title}</h3><p>{content.summary}</p><div className="pl-meta news-reference-meta"><span>{contentPage?.navigationLabel||'Editorial'}</span><span>{content.publishedAt?new Date(content.publishedAt).toLocaleDateString('pt-BR'):'Sem data'}</span><span>{content.author}</span></div></div></Link>})}</div>
            {totalPages>1&&<nav className="pl-pagination" aria-label="Paginação"><button type="button" disabled={safePage<=1} onClick={()=>updateParams({pagina:String(safePage-1)})}>← ANTERIOR</button><div>{Array.from({length:totalPages},(_,index)=>index+1).map(number=><button type="button" key={number} aria-current={number===safePage?'page':undefined} className={number===safePage?'is-active':''} onClick={()=>updateParams({pagina:String(number)})}>{number}</button>)}</div><button type="button" disabled={safePage>=totalPages} onClick={()=>updateParams({pagina:String(safePage+1)})}>PRÓXIMA →</button></nav>}
          </>}
        </ContentSidebarLayout>
      </PageContainer></PageSection>
      {adLayout.active&&<PromotionalRegion><AdvertiseHereSection layout={adLayout} config={{...defaultHomeAdConfig,active:true,title:adLayout.title,subtitle:adLayout.description||adLayout.eyebrow,buttonLabel:adLayout.linkLabel,buttonUrl:adLayout.linkUrl,image:adLayout.imageUrl,imageAlt:adLayout.adImageAlt,align:adLayout.textAlign==='center'?'center':adLayout.textAlign==='right'?'right':'left'}}/></PromotionalRegion>}
    </main>
  </PageShell>
}
