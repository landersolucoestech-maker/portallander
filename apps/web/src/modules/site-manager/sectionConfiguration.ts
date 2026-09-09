export type SectionTextAlign='left'|'center'|'right'
export type SectionKind='hero'|'featured'|'ranking'|'latest'|'ad'|'trending'|'cta'|'releases'|'agenda'|'editorial'|'standard-hero'|'body'|'channels'|'guidelines'|'form'|'custom'
export type SectionHeroViewport='desktop'|'tablet'|'mobile'

export type SectionConfiguration={
  active:boolean
  title:string
  eyebrow:string
  description:string
  linkLabel:string
  linkUrl:string
  imageUrl:string
  itemLimit:number
  columns:number
  textAlign:SectionTextAlign
  background:string
  textColor:string
  accentColor:string
  heroHeightDesktop:number
  heroHeightTablet:number
  heroHeightMobile:number
  heroKickerPaddingXDesktop:number
  heroKickerPaddingYDesktop:number
  heroKickerPaddingXTablet:number
  heroKickerPaddingYTablet:number
  heroKickerPaddingXMobile:number
  heroKickerPaddingYMobile:number
  heroTitlePaddingXDesktop:number
  heroTitlePaddingYDesktop:number
  heroTitlePaddingXTablet:number
  heroTitlePaddingYTablet:number
  heroTitlePaddingXMobile:number
  heroTitlePaddingYMobile:number
  heroDescriptionPaddingXDesktop:number
  heroDescriptionPaddingYDesktop:number
  heroDescriptionPaddingXTablet:number
  heroDescriptionPaddingYTablet:number
  heroDescriptionPaddingXMobile:number
  heroDescriptionPaddingYMobile:number
}

export type SectionDefinition={id:string;name:string;summary:string;kind:SectionKind;locked?:boolean}

const STORAGE_KEY='portal-lander:cms:section-configurations:v1'
export const SECTION_CONFIGURATION_EVENT='portal-lander:section-configurations:changed'
export const HOME_HERO_BACKGROUND_URL=new URL('../../pages/home/styles/hero-approved-background-hq.jpg',import.meta.url).href
const HOME_BACKGROUND_HERO_SECTION_IDS=new Set(['editorial-hero','sobre-hero','contato-hero','colabore-hero','institutional-hero','legal-hero'])
const shouldUseHomeHeroBackground=(sectionId:string)=>HOME_BACKGROUND_HERO_SECTION_IDS.has(sectionId)

const defaults:Record<string,Partial<SectionConfiguration>>={
  hero:{title:'Hero Section',itemLimit:5,columns:1},
  'em-destaque':{title:'EM DESTAQUE',linkLabel:'EXPLORAR DESTAQUES',linkUrl:'/noticias',itemLimit:3,columns:3},
  'mais-lidas':{title:'MAIS LIDAS',linkLabel:'VER TODOS',linkUrl:'/noticias',itemLimit:5,columns:1},
  'ultimas-noticias':{title:'ÚLTIMAS NOTÍCIAS',linkLabel:'VER TODAS AS NOTÍCIAS',linkUrl:'/noticias',itemLimit:4,columns:2},
  'publicidade-lateral':{title:'PUBLICIDADE',eyebrow:'ANUNCIE AQUI',linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',itemLimit:1,columns:1,background:'#090909',textColor:'#ffffff',accentColor:'#e50914'},
  'em-alta':{title:'EM ALTA',linkLabel:'VER TODOS',linkUrl:'/noticias',itemLimit:4,columns:1},
  'anuncie-aqui':{title:'ANUNCIE AQUI',description:'Sua marca no ritmo certo.',linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',itemLimit:1,columns:1},
  lancamentos:{title:'LANÇAMENTOS',linkLabel:'VER TODOS OS LANÇAMENTOS',linkUrl:'/lancamentos',itemLimit:5,columns:4},
  agenda:{title:'AGENDA',linkLabel:'VER DESTAQUES',linkUrl:'/destaques',itemLimit:4,columns:1},
  newsletter:{title:'RECEBA AS PRINCIPAIS NOTÍCIAS',description:'DIRETO NO SEU E-MAIL!',eyebrow:'Seu melhor e-mail',linkLabel:'INSCREVER-SE',itemLimit:1,columns:1,background:'#111111',textColor:'#ffffff',accentColor:'#e50914'},
  'editorial-hero':{eyebrow:'AGORA NO PORTAL',columns:1,background:'#020202',textColor:'#ffffff',accentColor:'#e50914'},
  'editorial-summary':{title:'RESUMO DA LISTAGEM',description:'Exibe a quantidade de conteúdos encontrados antes do grid.',itemLimit:1,columns:1,background:'#ffffff',textColor:'#111111',accentColor:'#e50914'},
  'editorial-ad':{title:'PUBLICIDADE EDITORIAL',eyebrow:'PUBLICIDADE',description:'Espaço publicitário integrado à listagem editorial.',itemLimit:1,columns:1,background:'#090909',textColor:'#ffffff',accentColor:'#e50914'},
  'editorial-template':{title:'Conteúdos / Grid Editorial',description:'Grid compartilhado pelas páginas editoriais.',itemLimit:12,columns:3},
  'article-hero':{eyebrow:'CONTEÚDO EDITORIAL',title:'HERO DA MATÉRIA',description:'Cabeçalho da slug page com categoria, título, subtítulo, autor e data.',columns:1,background:'#ffffff',textColor:'#111111',accentColor:'#e50914'},
  'article-content':{title:'CORPO DA MATÉRIA',description:'Imagem de capa e blocos editoriais da publicação.',itemLimit:1,columns:1,background:'#ffffff',textColor:'#111111',accentColor:'#e50914'},
  'article-tags':{title:'TAGS DA MATÉRIA',description:'Tags exibidas ao final do conteúdo editorial.',itemLimit:8,columns:1,background:'#ffffff',textColor:'#111111',accentColor:'#e50914'},
  'institutional-hero':{eyebrow:'INSTITUCIONAL',title:'PÁGINA INSTITUCIONAL',description:'Informações oficiais do Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff',accentColor:'#e50914'},
  'institutional-body':{title:'CONTEÚDO',description:'Conteúdo institucional da página.',columns:1,itemLimit:20},
  'legal-hero':{eyebrow:'DOCUMENTO',title:'INFORMAÇÕES LEGAIS',description:'Documento oficial do Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff',accentColor:'#e50914'},
  'legal-document':{title:'DOCUMENTO',description:'Conteúdo legal com largura de leitura e índice quando houver títulos.',columns:1,itemLimit:50},
  'sobre-hero':{eyebrow:'INSTITUCIONAL',title:'SOBRE O PORTAL',description:'Conheça o Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff'},
  'sobre-conteudo':{title:'PORTAL LANDER',description:'Conteúdo institucional do Portal Lander.',columns:1},
  'contato-hero':{eyebrow:'CONTATO',title:'FALE CONOSCO',description:'Entre em contato com o Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff'},
  'contato-canais':{title:'CANAIS OFICIAIS',description:'Escolha um dos canais públicos configurados pelo Portal Lander.',columns:3,itemLimit:6},
  'colabore-hero':{eyebrow:'PARTICIPE DO PORTAL',title:'SUA HISTÓRIA PODE VIRAR NOTÍCIA.',description:'Envie pautas, vídeos, fotos, lançamentos e histórias relevantes.',columns:1,background:'#020202',textColor:'#ffffff'},
  'colabore-diretrizes':{eyebrow:'ANTES DE ENVIAR',title:'O QUE PROCURAMOS',description:'Critérios e orientações editoriais para colaboração.',columns:1,itemLimit:6},
  'colabore-formulario':{title:'FORMULÁRIO DE ENVIO',description:'Formulário público conectado ao fluxo editorial de colaborações.',columns:1},
}

export const BASE_SECTION_CONFIGURATION:SectionConfiguration={
  active:true,title:'Nova seção',eyebrow:'',description:'',linkLabel:'',linkUrl:'',imageUrl:'',itemLimit:6,columns:3,textAlign:'left',background:'#ffffff',textColor:'#111111',accentColor:'#e50914',
  heroHeightDesktop:420,heroHeightTablet:340,heroHeightMobile:280,
  heroKickerPaddingXDesktop:0,heroKickerPaddingYDesktop:0,heroKickerPaddingXTablet:0,heroKickerPaddingYTablet:0,heroKickerPaddingXMobile:0,heroKickerPaddingYMobile:0,
  heroTitlePaddingXDesktop:0,heroTitlePaddingYDesktop:0,heroTitlePaddingXTablet:0,heroTitlePaddingYTablet:0,heroTitlePaddingXMobile:0,heroTitlePaddingYMobile:0,
  heroDescriptionPaddingXDesktop:0,heroDescriptionPaddingYDesktop:0,heroDescriptionPaddingXTablet:0,heroDescriptionPaddingYTablet:0,heroDescriptionPaddingXMobile:0,heroDescriptionPaddingYMobile:0,
}
const storageId=(pageId:string,sectionId:string)=>`${pageId}:${sectionId}`
const readAll=():Record<string,SectionConfiguration>=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') as Record<string,SectionConfiguration>}catch{return {}}}

export function defaultSectionConfiguration(sectionId:string,name?:string,fallback?:Partial<SectionConfiguration>):SectionConfiguration{
  const sectionDefaults=defaults[sectionId]||{}
  const config={...BASE_SECTION_CONFIGURATION,...sectionDefaults,...fallback,...(name&&!sectionDefaults.title&&!fallback?.title?{title:name}:{})}
  if(shouldUseHomeHeroBackground(sectionId)&&!config.imageUrl.trim())config.imageUrl=HOME_HERO_BACKGROUND_URL
  return config
}
export function readSectionConfiguration(pageId:string,sectionId:string,name?:string,fallback?:Partial<SectionConfiguration>):SectionConfiguration{
  const stored=readAll()[storageId(pageId,sectionId)]
  const config={...defaultSectionConfiguration(sectionId,name,fallback),...(stored||{})}
  if(shouldUseHomeHeroBackground(sectionId)&&!config.imageUrl.trim())config.imageUrl=HOME_HERO_BACKGROUND_URL
  return config
}
export function writeSectionConfiguration(pageId:string,sectionId:string,config:SectionConfiguration){const all=readAll();all[storageId(pageId,sectionId)]={...config};localStorage.setItem(STORAGE_KEY,JSON.stringify(all));window.dispatchEvent(new CustomEvent(SECTION_CONFIGURATION_EVENT,{detail:{pageId,sectionId}}))}
export function resetSectionConfiguration(pageId:string,sectionId:string){const all=readAll();delete all[storageId(pageId,sectionId)];localStorage.setItem(STORAGE_KEY,JSON.stringify(all));window.dispatchEvent(new CustomEvent(SECTION_CONFIGURATION_EVENT,{detail:{pageId,sectionId}}))}

const viewportSuffix=(viewport:SectionHeroViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
export function heroTextPadding(config:SectionConfiguration,viewport:SectionHeroViewport){
  const suffix=viewportSuffix(viewport)
  return {
    kicker:{x:config[`heroKickerPaddingX${suffix}` as keyof SectionConfiguration] as number,y:config[`heroKickerPaddingY${suffix}` as keyof SectionConfiguration] as number},
    title:{x:config[`heroTitlePaddingX${suffix}` as keyof SectionConfiguration] as number,y:config[`heroTitlePaddingY${suffix}` as keyof SectionConfiguration] as number},
    description:{x:config[`heroDescriptionPaddingX${suffix}` as keyof SectionConfiguration] as number,y:config[`heroDescriptionPaddingY${suffix}` as keyof SectionConfiguration] as number},
  }
}
export function heroResponsiveCssVariables(config:SectionConfiguration){
  return {
    '--pl-hero-height-desktop':`${config.heroHeightDesktop}px`,'--pl-hero-height-tablet':`${config.heroHeightTablet}px`,'--pl-hero-height-mobile':`${config.heroHeightMobile}px`,
    '--pl-hero-kicker-px-desktop':`${config.heroKickerPaddingXDesktop}px`,'--pl-hero-kicker-py-desktop':`${config.heroKickerPaddingYDesktop}px`,'--pl-hero-kicker-px-tablet':`${config.heroKickerPaddingXTablet}px`,'--pl-hero-kicker-py-tablet':`${config.heroKickerPaddingYTablet}px`,'--pl-hero-kicker-px-mobile':`${config.heroKickerPaddingXMobile}px`,'--pl-hero-kicker-py-mobile':`${config.heroKickerPaddingYMobile}px`,
    '--pl-hero-title-px-desktop':`${config.heroTitlePaddingXDesktop}px`,'--pl-hero-title-py-desktop':`${config.heroTitlePaddingYDesktop}px`,'--pl-hero-title-px-tablet':`${config.heroTitlePaddingXTablet}px`,'--pl-hero-title-py-tablet':`${config.heroTitlePaddingYTablet}px`,'--pl-hero-title-px-mobile':`${config.heroTitlePaddingXMobile}px`,'--pl-hero-title-py-mobile':`${config.heroTitlePaddingYMobile}px`,
    '--pl-hero-description-px-desktop':`${config.heroDescriptionPaddingXDesktop}px`,'--pl-hero-description-py-desktop':`${config.heroDescriptionPaddingYDesktop}px`,'--pl-hero-description-px-tablet':`${config.heroDescriptionPaddingXTablet}px`,'--pl-hero-description-py-tablet':`${config.heroDescriptionPaddingYTablet}px`,'--pl-hero-description-px-mobile':`${config.heroDescriptionPaddingXMobile}px`,'--pl-hero-description-py-mobile':`${config.heroDescriptionPaddingYMobile}px`,
  }
}

export const HOME_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'hero',name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',kind:'hero',locked:true},
  {id:'em-destaque',name:'Em Destaque',summary:'Grid principal de matérias em destaque da Homepage.',kind:'featured',locked:true},
  {id:'mais-lidas',name:'Mais Lidas',summary:'Ranking das matérias mais acessadas.',kind:'ranking',locked:true},
  {id:'ultimas-noticias',name:'Últimas Notícias',summary:'Grid com as publicações mais recentes.',kind:'latest',locked:true},
  {id:'publicidade-lateral',name:'Publicidade Lateral',summary:'Bloco publicitário lateral configurável.',kind:'ad',locked:true},
  {id:'em-alta',name:'Em Alta',summary:'Lista de assuntos e conteúdos em alta.',kind:'trending',locked:true},
  {id:'anuncie-aqui',name:'Anuncie Aqui',summary:'Chamada comercial para anunciantes.',kind:'cta',locked:true},
  {id:'lancamentos',name:'Lançamentos',summary:'Playlist Spotify sincronizada e apresentada na ordem configurada.',kind:'releases',locked:true},
  {id:'agenda',name:'Agenda',summary:'Agenda de eventos e destaques.',kind:'agenda',locked:true},
  {id:'newsletter',name:'Newsletter',summary:'Captação de e-mails exibida acima do rodapé público.',kind:'custom',locked:true},
]

export const EDITORIAL_PAGE_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'editorial-hero',name:'Hero Editorial',summary:'Hero individual da página de listagem. Usa o artwork aprovado da Homepage por padrão e permite configuração própria por página.',kind:'standard-hero',locked:true},
  {id:'editorial-summary',name:'Resumo da Listagem',summary:'Contador e contexto exibidos antes da grade de conteúdos da página editorial.',kind:'body',locked:true},
  {id:'editorial-ad',name:'Publicidade Editorial',summary:'Posição publicitária integrada à listagem editorial.',kind:'ad',locked:true},
  {id:'editorial-template',name:'Conteúdos / Grid Editorial',summary:'Grade canônica herdada de Notícias por Cultura, Música, Lançamentos e futuras páginas editoriais.',kind:'editorial',locked:true},
  {id:'article-hero',name:'Slug Page · Hero da Matéria',summary:'Cabeçalho das páginas individuais de conteúdo com breadcrumb, categoria, título, subtítulo, autor e data.',kind:'standard-hero',locked:true},
  {id:'article-content',name:'Slug Page · Corpo da Matéria',summary:'Imagem de capa e corpo editorial compartilhados por todas as páginas individuais de conteúdo.',kind:'body',locked:true},
  {id:'article-tags',name:'Slug Page · Tags',summary:'Bloco final de tags das páginas individuais de conteúdo.',kind:'body',locked:true},
]

export const INSTITUTIONAL_PAGE_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'institutional-hero',name:'Hero Institucional',summary:'Hero global da família institucional, configurável por página.',kind:'standard-hero',locked:true},
  {id:'institutional-body',name:'Conteúdo Institucional',summary:'Região principal de conteúdo institucional, sem Sidebar artificial.',kind:'body',locked:true},
]

export const LEGAL_PAGE_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'legal-hero',name:'Hero Legal',summary:'Hero global da família jurídica/documental, configurável por página.',kind:'standard-hero',locked:true},
  {id:'legal-document',name:'Documento Legal',summary:'Documento com largura de leitura confortável e índice automático quando aplicável.',kind:'body',locked:true},
]

export const SHARED_EDITORIAL_SECTION_IDS=new Set(['editorial-summary','editorial-ad','editorial-template','article-hero','article-content','article-tags'])
export const LEGAL_PAGE_SLUGS=new Set(['politica','politica-de-privacidade','termos','termos-de-uso','dmca'])

export const SPECIAL_PAGE_SECTION_DEFINITIONS:Record<string,SectionDefinition[]>={
  sobre:[
    {id:'sobre-hero',name:'Hero Institucional',summary:'Cabeçalho visual da página Sobre usando por padrão o background aprovado da Homepage, com altura e espaçamento responsivos configuráveis.',kind:'standard-hero',locked:true},
    {id:'sobre-conteudo',name:'Conteúdo Institucional',summary:'Bloco principal de apresentação do Portal Lander.',kind:'body',locked:true},
  ],
  contato:[
    {id:'contato-hero',name:'Hero de Contato',summary:'Cabeçalho visual da página Contato usando por padrão o background aprovado da Homepage, com altura e espaçamento responsivos configuráveis.',kind:'standard-hero',locked:true},
    {id:'contato-canais',name:'Canais Oficiais',summary:'Grid de canais públicos e redes configuradas.',kind:'channels',locked:true},
  ],
  colabore:[
    {id:'colabore-hero',name:'Hero Colabore',summary:'Apresentação principal usando por padrão o background aprovado da Homepage, com altura e espaçamento responsivos configuráveis.',kind:'standard-hero',locked:true},
    {id:'colabore-diretrizes',name:'Diretrizes de Envio',summary:'Orientações editoriais exibidas antes do formulário.',kind:'guidelines',locked:true},
    {id:'colabore-formulario',name:'Formulário de Colaboração',summary:'Formulário público de envio de materiais.',kind:'form',locked:true},
  ],
}

export const EDITORIAL_SECTION_DEFINITION=EDITORIAL_PAGE_SECTION_DEFINITIONS[3]
