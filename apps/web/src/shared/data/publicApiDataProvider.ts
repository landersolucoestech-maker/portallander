import type {PublicEditorialSnapshot} from '../../features/editorial/apiClient'
import type {EditorialContent,EditorialPage} from '../../features/editorial/model'
import type {MarketingSeed} from '../../features/marketing/domain'
import type {SettingsSeed} from '../../features/settings/domain'
import type {HomeAdConfig} from '../../pages/home/models/adModel'
import type {HeroArticleSource,HeroCarouselConfig,HeroSlide} from '../../pages/home/models/heroModel'
import {portalLogo} from '../branding/assets/brandAsset'
import type {ApplicationDataProvider} from './dataProvider'

const clone=<T>(value:T):T=>structuredClone(value)
const apiScenario={name:'success' as const,latencyMs:0,failDomains:[],emptyDomains:[],partialDomains:[],permissionDeniedDomains:[],offline:false,largeDataset:false}
const emptyMarketing:MarketingSeed={campaigns:[],contents:[],tasks:[],briefings:[],metrics:[],aiHistory:[],activities:[],platforms:[],contentTypes:[],taskTypes:[],briefingTypes:[],owners:[],departments:[]}
const emptySettings:SettingsSeed={company:{legalName:'',tradeName:'',cnpj:'',address:'',phone:'',responsible:'',slug:'',logoUrl:''},automations:[],integrations:[],users:[],roles:[],invites:[],audit:[]}
const disabledHomeAd:HomeAdConfig={active:false,title:'',subtitle:'',buttonLabel:'',buttonUrl:'',image:'',imageAlt:'',logo:'',logoAlt:'',logoWidth:120,height:250,contentWidth:1200,align:'center'}
const disabledNewsAd={active:false,label:'',title:'',subtitle:'',buttonLabel:'',buttonUrl:'',openInNewTab:false,image:'',imageAlt:'',background:'transparent',advertiser:'',campaign:'',startDate:'',endDate:'',height:250,contentWidth:1200,align:'center' as const}

function pageById(pages:EditorialPage[]){return new Map(pages.map(page=>[page.id,page]))}
function publishedAt(content:EditorialContent){return content.publishedAt||content.updatedAt||content.createdAt}
function sortedContents(snapshot:PublicEditorialSnapshot){return [...snapshot.contents].sort((a,b)=>new Date(publishedAt(b)).getTime()-new Date(publishedAt(a)).getTime())}
function storyMeta(content:EditorialContent){const date=new Date(publishedAt(content));const dateLabel=Number.isNaN(date.getTime())?'':date.toLocaleDateString('pt-BR');return [content.author,dateLabel].filter(Boolean).join(' • ')}
function heroArticles(snapshot:PublicEditorialSnapshot):HeroArticleSource[]{
 const pages=pageById(snapshot.pages)
 return sortedContents(snapshot).slice(0,12).map(content=>{const page=pages.get(content.pageId);return{id:content.id,title:content.title,slug:content.slug,category:page?.navigationLabel||page?.title||'',summary:content.summary,image:content.coverImage||'',imageAlt:content.coverImageAlt||'',url:page?`/${page.slug}/${content.slug}`:'/'}})
}
function heroSlide(article:HeroArticleSource|undefined):HeroSlide{
 return{id:article?.id||'production-public-empty-hero',status:article?'active':'inactive',order:1,eyebrow:article?.category||'',eyebrowVisible:Boolean(article?.category),category:article?.category||'',title:article?[{text:article.title,emphasis:false,visible:true}]:[],description:article?.summary||'',descriptionVisible:Boolean(article?.summary),mediaCaption:'',mediaCaptionVisible:false,image:article?.image||'',imageVisible:Boolean(article?.image),imageAlt:article?.imageAlt||'',imagePositionX:50,imagePositionY:50,imageScale:1,imageOffsetX:0,imageOffsetY:0,responsive:{},primaryCtaLabel:article?'Ler matéria':'',primaryCtaUrl:article?.url||'/',secondaryCtaLabel:'',secondaryCtaUrl:'',ctas:article?[{id:'primary',active:true,label:'Ler matéria',url:article.url,external:false,order:1,variant:'primary'}]:[],articleId:article?.id||'',publishedAt:'',scheduledAt:''}
}
function heroConfig(slide:HeroSlide):HeroCarouselConfig{
 return{autoplay:false,intervalMs:7000,navigation:'arrows-dots',loop:true,ticker:{active:false,label:'AGORA',items:[],separator:'•',direction:'rtl',speed:42,pauseOnHover:true,loop:true,gap:28,height:48,verticalAlign:'center',fontFamily:'inherit',fontSize:13,fontWeight:700,textTransform:'none',background:'#ef0011',textColor:'#ffffff',labelColor:'#ffffff',separatorColor:'#ffffff',hoverColor:'#111111',borderEnabled:false,borderWidth:0,borderColor:'#ef0011',hiddenDesktop:false,responsive:{}},slides:[slide]}
}

function unsupported<T>(domain:string):T{throw new Error(`O domínio administrativo ${domain} não usa o provider público de produção.`)}

export function createPublicApiDataProvider(snapshot:PublicEditorialSnapshot):ApplicationDataProvider{
 const contents=sortedContents(snapshot),pages=pageById(snapshot.pages),articles=heroArticles(snapshot),defaultSlide=heroSlide(articles[0])
 const stories=contents.map(content=>({category:pages.get(content.pageId)?.navigationLabel||pages.get(content.pageId)?.title||'',title:content.title,meta:storyMeta(content),views:'',image:content.coverImage||''}))
 return{
  kind:'api',getScenario:()=>clone(apiScenario),setScenario:()=>undefined,
  identity:{users:()=>unsupported('identity'),currentUser:()=>unsupported('identity')},notifications:{list:()=>[]},
  crm:{state:()=>unsupported('crm')},contracts:{state:()=>unsupported('contracts')},
  finance:{transactions:()=>[],invoices:()=>[],categories:()=>[],rules:()=>[]},
  editorial:{pages:()=>clone(snapshot.pages),contents:()=>clone(snapshot.contents),media:()=>[]},
  home:{stories:()=>clone(stories),mostRead:()=>[],agenda:()=>[],heroArticles:()=>clone(articles),defaultHeroSlide:()=>clone(defaultSlide),defaultHeroConfig:()=>clone(heroConfig(defaultSlide))},
  agenda:{items:()=>[],events:()=>[],participants:()=>[],locations:()=>[]},
  chat:{seed:()=>unsupported('chat')},rh:{seed:()=>unsupported('rh')},marketing:{seed:()=>clone(emptyMarketing)},reports:{seed:()=>unsupported('reports')},settings:{seed:()=>clone(emptySettings)},
  advertising:{campaigns:()=>[],formats:()=>[],defaultHomeAdConfig:()=>clone(disabledHomeAd),defaultNewsAdConfig:()=>clone(disabledNewsAd)},
  branding:{config:()=>({headerImage:portalLogo,headerImageAlt:'Portal Lander',footerImage:portalLogo,footerImageAlt:'Portal Lander'}),socialChannels:()=>[]},
  collaboration:{types:()=>[{value:'noticia',label:'Notícia',active:true},{value:'video',label:'Vídeo',active:true},{value:'foto',label:'Foto',active:true},{value:'pauta',label:'Pauta',active:true}],guidelines:()=>[]},
  dashboard:{operationalSnapshot:()=>unsupported('dashboard')},
 }
}
