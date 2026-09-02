export type SectionTextAlign='left'|'center'|'right'

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
}

export type SectionDefinition={
  id:string
  name:string
  summary:string
  kind:'hero'|'featured'|'ranking'|'latest'|'ad'|'trending'|'cta'|'releases'|'agenda'|'editorial'|'custom'
  locked?:boolean
}

const STORAGE_KEY='portal-lander:cms:section-configurations:v1'
export const SECTION_CONFIGURATION_EVENT='portal-lander:section-configurations:changed'

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
  'editorial-template':{title:'Template editorial de Notícias',description:'Layout compartilhado pelas páginas editoriais.',itemLimit:12,columns:3},
}

export const BASE_SECTION_CONFIGURATION:SectionConfiguration={
  active:true,
  title:'Nova seção',
  eyebrow:'',
  description:'',
  linkLabel:'',
  linkUrl:'',
  imageUrl:'',
  itemLimit:6,
  columns:3,
  textAlign:'left',
  background:'#ffffff',
  textColor:'#111111',
  accentColor:'#e50914',
}

const storageId=(pageId:string,sectionId:string)=>`${pageId}:${sectionId}`
const readAll=():Record<string,SectionConfiguration>=>{
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') as Record<string,SectionConfiguration>}
  catch{return {}}
}

export function defaultSectionConfiguration(sectionId:string,name?:string):SectionConfiguration{
  return {...BASE_SECTION_CONFIGURATION,...defaults[sectionId],...(name&&!defaults[sectionId]?{title:name}:null)}
}

export function readSectionConfiguration(pageId:string,sectionId:string,name?:string):SectionConfiguration{
  const stored=readAll()[storageId(pageId,sectionId)]
  return {...defaultSectionConfiguration(sectionId,name),...(stored||{})}
}

export function writeSectionConfiguration(pageId:string,sectionId:string,config:SectionConfiguration){
  const all=readAll()
  all[storageId(pageId,sectionId)]={...config}
  localStorage.setItem(STORAGE_KEY,JSON.stringify(all))
  window.dispatchEvent(new CustomEvent(SECTION_CONFIGURATION_EVENT,{detail:{pageId,sectionId}}))
}

export function resetSectionConfiguration(pageId:string,sectionId:string){
  const all=readAll()
  delete all[storageId(pageId,sectionId)]
  localStorage.setItem(STORAGE_KEY,JSON.stringify(all))
  window.dispatchEvent(new CustomEvent(SECTION_CONFIGURATION_EVENT,{detail:{pageId,sectionId}}))
}

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

export const EDITORIAL_SECTION_DEFINITION:SectionDefinition={
  id:'editorial-template',
  name:'Template editorial de Notícias',
  summary:'Layout compartilhado pela listagem e pelas páginas de conteúdo.',
  kind:'editorial',
  locked:true,
}
