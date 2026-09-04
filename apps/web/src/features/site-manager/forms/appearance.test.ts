import {describe,expect,it} from 'vitest'
import {DEFAULT_FORM_APPEARANCE,getFormAppearancePreset,normalizeFormAppearance} from './appearance'

describe('form appearance contract',()=>{
  it('fornece defaults retrocompatíveis para formulários sem aparência',()=>{
    expect(normalizeFormAppearance(undefined)).toEqual(DEFAULT_FORM_APPEARANCE)
  })

  it('preserva um preset como ponto de partida sem impedir edição granular',()=>{
    const editorial=getFormAppearancePreset('editorial')
    const customized=normalizeFormAppearance({...editorial,container:{...editorial.container,background:'#121212',borderRadius:17},button:{...editorial.button,background:'#e50914'}})
    expect(customized.preset).toBe('editorial')
    expect(customized.container.background).toBe('#121212')
    expect(customized.container.borderRadius).toBe(17)
    expect(customized.button.background).toBe('#e50914')
  })

  it('descarta propriedades arbitrárias e restringe valores fora do contrato',()=>{
    const normalized=normalizeFormAppearance({
      preset:'portal',
      css:'body{display:none}',
      container:{maxWidth:99999,background:'url(javascript:alert(1))',position:'fixed'},
      fields:{focusRing:99,textColor:'#ABCDEF',background:'expression(alert(1))'},
      button:{text:'Comprar agora',width:'viewport',background:'#ff0000'},
    })
    expect(normalized.container.maxWidth).toBe(1440)
    expect(normalized.container.background).toBe(DEFAULT_FORM_APPEARANCE.container.background)
    expect(normalized.fields.focusRing).toBe(6)
    expect(normalized.fields.textColor).toBe('#abcdef')
    expect(normalized.fields.background).toBe(DEFAULT_FORM_APPEARANCE.fields.background)
    expect(normalized.button.width).toBe('auto')
    expect(normalized.button.text).toBe('Comprar agora')
    expect('css' in normalized).toBe(false)
    expect('position' in normalized.container).toBe(false)
  })
})
