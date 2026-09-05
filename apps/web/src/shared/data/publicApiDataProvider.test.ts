import {describe,expect,it} from 'vitest'
import {createPublicApiDataProvider} from './publicApiDataProvider'
import type {PublicEditorialSnapshot} from '../../features/editorial/apiClient'

const snapshot:PublicEditorialSnapshot={
 pages:[{id:'page-news',title:'Notícias',navigationLabel:'Notícias',slug:'noticias',description:'',type:'editorial',status:'published',active:true,visibility:'public',showInMainMenu:true,menuOrder:1,order:1,parentId:null,seo:{},createdAt:'2026-09-01T00:00:00Z',updatedAt:'2026-09-01T00:00:00Z',publishedAt:'2026-09-01T00:00:00Z'}],
 contents:[{id:'content-real',pageId:'page-news',title:'Conteúdo persistido real',slug:'conteudo-real',summary:'Resumo vindo da API.',body:[{type:'paragraph',text:'Corpo.'}],author:'Portal Lander',status:'published',active:true,tags:['mercado'],media:[],seo:{},createdAt:'2026-09-02T00:00:00Z',updatedAt:'2026-09-02T00:00:00Z',publishedAt:'2026-09-02T00:00:00Z'}],
}

describe('production public API provider',()=>{
 it('derives public home and hero from the real editorial snapshot',()=>{
  const provider=createPublicApiDataProvider(snapshot)
  expect(provider.kind).toBe('api')
  expect(provider.editorial.contents()[0]?.title).toBe('Conteúdo persistido real')
  expect(provider.home.stories()[0]).toMatchObject({category:'Notícias',title:'Conteúdo persistido real'})
  expect(provider.home.heroArticles()[0]).toMatchObject({title:'Conteúdo persistido real',url:'/noticias/conteudo-real'})
  expect(provider.home.defaultHeroSlide().title[0]?.text).toBe('Conteúdo persistido real')
 })

 it('does not synthesize audience ranking, agenda, advertising or marketing metrics',()=>{
  const provider=createPublicApiDataProvider(snapshot)
  expect(provider.home.mostRead()).toEqual([])
  expect(provider.home.agenda()).toEqual([])
  expect(provider.advertising.campaigns()).toEqual([])
  expect(provider.advertising.defaultHomeAdConfig().active).toBe(false)
  expect(provider.marketing.seed().metrics).toEqual([])
 })

 it('returns clones so consumers cannot mutate the public snapshot',()=>{
  const provider=createPublicApiDataProvider(snapshot)
  const first=provider.editorial.contents()
  first[0]!.title='mutated'
  expect(provider.editorial.contents()[0]?.title).toBe('Conteúdo persistido real')
 })
})
