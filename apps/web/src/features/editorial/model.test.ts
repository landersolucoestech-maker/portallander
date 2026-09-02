import {describe,expect,it} from 'vitest'
import {isPublicEditorialPage,isPublishedPage,type EditorialPage} from './model'

const page=(type:EditorialPage['type'],overrides:Partial<EditorialPage>={}):EditorialPage=>({
  id:`page-${type}`,
  title:'Página',
  navigationLabel:'Página',
  slug:`pagina-${type}`,
  description:'',
  type,
  status:'published',
  active:true,
  visibility:'public',
  showInMainMenu:true,
  menuOrder:1,
  order:1,
  parentId:null,
  seo:{},
  createdAt:'2026-01-01T00:00:00.000Z',
  updatedAt:'2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('editorial page publication semantics',()=>{
  it('reconhece página institucional publicada sem classificá-la como editorial',()=>{
    const institutional=page('institutional')
    expect(isPublishedPage(institutional)).toBe(true)
    expect(isPublicEditorialPage(institutional)).toBe(false)
  })

  it('reconhece página editorial publicada como renderizável pelo template de conteúdo',()=>{
    const editorial=page('editorial')
    expect(isPublishedPage(editorial)).toBe(true)
    expect(isPublicEditorialPage(editorial)).toBe(true)
  })

  it.each([
    {active:false},
    {status:'draft' as const},
    {status:'archived' as const},
    {visibility:'private' as const},
  ])('não expõe página fora das condições públicas: %o',override=>{
    const editorial=page('editorial',override)
    expect(isPublishedPage(editorial)).toBe(false)
    expect(isPublicEditorialPage(editorial)).toBe(false)
  })
})
