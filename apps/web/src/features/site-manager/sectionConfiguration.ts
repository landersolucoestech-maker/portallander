export type SectionTextAlign='left'|'center'|'right'
export type SectionKind='hero'|'featured'|'ranking'|'latest'|'ad'|'trending'|'cta'|'releases'|'agenda'|'editorial'|'standard-hero'|'body'|'channels'|'guidelines'|'form'|'custom'

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
}

export type SectionDefinition={id:string;name:string;summary:string;kind:SectionKind;locked?:boolean}

const STORAGE_KEY='portal-lander:cms:section-configurations:v1'
export const SECTION_CONFIGURATION_EVENT='portal-lander:section-configurations:changed'
export const HOME_HERO_BACKGROUND_URL=new URL('../../pages/home/styles/hero-approved-background-fixed.png',import.meta.url).href
const HOME_BACKGROUND_HERO_SECTION_IDS=new Set(['editorial-hero','sobre-hero','contato-hero','colabore-hero'])
const shouldUseHomeHeroBackground=(sectionId:string)=>HOME_BACKGROUND_HERO_SECTION_IDS.has(sectionId)

const defaults:Record<string,Partial<SectionConfiguration>>={
  hero:{title:'Hero Section',itemLimit:5,columns:1},
  'em-destaque':{title:'EM DESTAQUE',linkLabel:'EXPLORAR DESTAQUES',linkUrl:'/noticias',itemLimit:6,columns:3},
  'mais-lidas':{title:'MAIS LIDAS',linkLabel:'VER TODOS',linkUrl:'/noticias',itemLimit:5,columns:1},
  'ultimas-noticias':{title:'ÚLTIMAS NOTÍCIAS',linkLabel:'VER TODAS AS NOTÍCIAS',linkUrl:'/noticias',itemLimit:4,columns:2},
  'publicidade-lateral':{title:'PUBLICIDADE',eyebrow:'ANUNCIE AQUI',linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',itemLimit:1,columns:1,background:'#090909',textColor:'#ffffff',accentColor:'#e50914'},
  'em-alta':{title:'EM ALTA',linkLabel:'VER TODOS',linkUrl:'/noticias',itemLimit:4,columns:1},
  'anuncie-aqui':{title:'ANUNCIE AQUI',description:'Sua marca no ritmo certo.',linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',itemLimit:1,columns:1},
  lancamentos:{title:'LANÇAMENTOS',linkLabel:'VER TODOS',linkUrl:'/lancamentos',itemLimit:4,columns:4},
  agenda:{title:'AGENDA',linkLabel:'VER DESTAQUES',linkUrl:'/destaques',itemLimit:4,columns:1},
  'editorial-hero':{eyebrow:'AGORA NO PORTAL',columns:1,background:'#020202',textColor:'#ffffff',accentColor:'#e50914'},
  'editorial-template':{title:'Conteúdos / Grid Editorial',description:'Grid compartilhado pelas páginas editoriais.',itemLimit:12,columns:3},
  'sobre-hero':{eyebrow:'INSTITUCIONAL',title:'SOBRE O PORTAL',description:'Conheça o Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff'},
  'sobre-conteudo':{title:'PORTAL LANDER',description:'Conteúdo institucional do Portal Lander.',columns:1},
  'contato-hero':{eyebrow:'CONTATO',title:'FALE CONOSCO',description:'Entre em contato com o Portal Lander.',columns:1,background:'#020202',textColor:'#ffffff'},
  'contato-canais':{title:'CANAIS OFICIAIS',description:'Escolha um dos canais públicos configurados pelo Portal Lander.',columns:3,itemLimit:6},
  'colabore-hero':{eyebrow:'PARTICIPE DO PORTAL',title:'SUA HISTÓRIA PODE VIRAR NOTÍCIA.',description:'Envie pautas, vídeos, fotos, lançamentos e histórias relevantes.',columns:1,background:'#020202',textColor:'#ffffff'},
  'colabore-diretrizes':{eyebrow:'ANTES DE ENVIAR',title:'O QUE PROCURAMOS',description:'Critérios e orientações editoriais para colaboração.',columns:1,itemLimit:6},
  'colabore-formulario':{title:'FORMULÁRIO DE ENVIO',description:'Formulário público conectado ao fluxo editorial de colaborações.',columns:1},
}

export const BASE_SECTION_CONFIGURATION:SectionConfiguration={active:true,title:'Nova seção',eyebrow:'',description:'',linkLabel:'',linkUrl:'',imageUrl:'',itemLimit:6,columns:3,textAlign:'left',background:'#ffffff',textColor:'#111111',accentColor:'#e50914',heroHeightDesktop:420,heroHeightTablet:340,heroHeightMobile:280}
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

export const HOME_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'hero',name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',kind:'hero',locked:true},
  {id:'em-destaque',name:'Em Destaque',summary:'Grid principal de matérias em destaque da Homepage.',kind:'featured',locked:true},
  {id:'mais-lidas',name:'Mais Lidas',summary:'Ranking das matérias mais acessadas.',kind:'ranking',locked:true},
  {id:'ultimas-noticias',name:'Últimas Notícias',summary:'Grid com as publicações mais recentes.',kind:'latest',locked:true},
  {id:'publicidade-lateral',name:'Publicidade Lateral',summary:'Bloco publicitário lateral configurável.',kind:'ad',locked:true},
  {id:'em-alta',name:'Em Alta',summary:'Lista de assuntos e conteúdos em alta.',kind:'trending',locked:true},
  {id:'anuncie-aqui',name:'Anuncie Aqui',summary:'Chamada comercial para anunciantes.',kind:'cta',locked:true},
  {id:'lancamentos',name:'Lançamentos',summary:'Carrossel/grid de lançamentos musicais.',kind:'releases',locked:true},
  {id:'agenda',name:'Agenda',summary:'Agenda de eventos e destaques.',kind:'agenda',locked:true},
]

export const EDITORIAL_PAGE_SECTION_DEFINITIONS:SectionDefinition[]=[
  {id:'editorial-hero',name:'Hero Editorial',summary:'Hero individual desta página. Usa por padrão o mesmo artwork de fundo aprovado da Hero da Homepage; conteúdo, aparência e altura responsiva continuam configuráveis por página.',kind:'standard-hero',locked:true},
  {id:'editorial-template',name:'Conteúdos / Grid Editorial',summary:'Estrutura compartilhada de Notícias para listagem, grid e comportamento editorial.',kind:'editorial',locked:true},
]

export const SPECIAL_PAGE_SECTION_DEFINITIONS:Record<string,SectionDefinition[]>={
  sobre:[
    {id:'sobre-hero',name:'Hero Institucional',summary:'Cabeçalho visual da página Sobre usando por padrão o background aprovado da Homepage, com altura responsiva configurável.',kind:'standard-hero',locked:true},
    {id:'sobre-conteudo',name:'Conteúdo Institucional',summary:'Bloco principal de apresentação do Portal Lander.',kind:'body',locked:true},
  ],
  contato:[
    {id:'contato-hero',name:'Hero de Contato',summary:'Cabeçalho visual da página Contato usando por padrão o background aprovado da Homepage, com altura responsiva configurável.',kind:'standard-hero',locked:true},
    {id:'contato-canais',name:'Canais Oficiais',summary:'Grid de canais públicos e redes configuradas.',kind:'channels',locked:true},
  ],
  colabore:[
    {id:'colabore-hero',name:'Hero Colabore',summary:'Apresentação principal usando por padrão o background aprovado da Homepage, com altura responsiva configurável.',kind:'standard-hero',locked:true},
    {id:'colabore-diretrizes',name:'Diretrizes de Envio',summary:'Orientações editoriais exibidas antes do formulário.',kind:'guidelines',locked:true},
    {id:'colabore-formulario',name:'Formulário de Colaboração',summary:'Formulário público de envio de materiais.',kind:'form',locked:true},
  ],
}

export const EDITORIAL_SECTION_DEFINITION=EDITORIAL_PAGE_SECTION_DEFINITIONS[1]
