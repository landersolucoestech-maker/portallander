import {describe,expect,it} from 'vitest'
import {homeContentViewportLayout,withHomeContentSectionConfiguration} from './homeContentSectionConfiguration'
import type {SectionConfiguration} from './sectionConfiguration'

const base:SectionConfiguration={active:true,title:'LANÇAMENTOS',eyebrow:'',description:'',linkLabel:'VER TODOS OS LANÇAMENTOS',linkUrl:'/lancamentos',imageUrl:'',itemLimit:5,columns:4,textAlign:'left',background:'#fff',textColor:'#111',accentColor:'#e50914',heroHeightDesktop:420,heroHeightTablet:340,heroHeightMobile:280,heroKickerPaddingXDesktop:0,heroKickerPaddingYDesktop:0,heroKickerPaddingXTablet:0,heroKickerPaddingYTablet:0,heroKickerPaddingXMobile:0,heroKickerPaddingYMobile:0,heroTitlePaddingXDesktop:0,heroTitlePaddingYDesktop:0,heroTitlePaddingXTablet:0,heroTitlePaddingYTablet:0,heroTitlePaddingXMobile:0,heroTitlePaddingYMobile:0,heroDescriptionPaddingXDesktop:0,heroDescriptionPaddingYDesktop:0,heroDescriptionPaddingXTablet:0,heroDescriptionPaddingYTablet:0,heroDescriptionPaddingXMobile:0,heroDescriptionPaddingYMobile:0}

describe('Lançamentos Spotify',()=>{
  it('mantém 5 como valor de apresentação configurável sem torná-lo regra da integração',()=>{
    const config=withHomeContentSectionConfiguration(base,'lancamentos')
    expect(config.itemLimit).toBe(5)
    expect(withHomeContentSectionConfiguration({...base,itemLimit:12},'lancamentos').itemLimit).toBe(12)
  })

  it('elimina modos legados concorrentes e preserva sempre a ordem da playlist',()=>{
    const legacy={...base,homeSelectionMode:'manual',homeSortMode:'reverse',homeManualSelection:['fake']} as SectionConfiguration&Record<string,unknown>
    const config=withHomeContentSectionConfiguration(legacy,'lancamentos')
    expect(config.homeSelectionMode).toBe('automatic')
    expect(config.homeSortMode).toBe('provider')
    expect(config.homeManualSelection).toEqual([])
  })

  it('usa 4 colunas no desktop, 2 no tablet e 1 no mobile',()=>{
    const config=withHomeContentSectionConfiguration(base,'lancamentos')
    expect(homeContentViewportLayout(config,'desktop').columns).toBe(4)
    expect(homeContentViewportLayout(config,'tablet').columns).toBe(2)
    expect(homeContentViewportLayout(config,'mobile').columns).toBe(1)
  })
})
