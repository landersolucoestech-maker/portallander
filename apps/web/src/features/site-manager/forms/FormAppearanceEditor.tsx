import type {FormAppearance,FormAppearancePreset} from './domain'
import {getFormAppearancePreset,normalizeFormAppearance} from './appearance'
import './form-appearance-editor.css'

const presets:readonly [FormAppearancePreset,string][]=[['portal','Portal Lander'],['minimal','Minimal'],['editorial','Editorial'],['compact','Compacto'],['highlight','Destaque']]
const n=(value:string)=>Number(value)

type Props={appearance:FormAppearance|undefined;onChange:(appearance:FormAppearance)=>void}

export function FormAppearanceEditor({appearance:input,onChange}:Props){
  const appearance=normalizeFormAppearance(input)
  const container=(patch:Partial<FormAppearance['container']>)=>onChange({...appearance,container:{...appearance.container,...patch}})
  const layout=(patch:Partial<FormAppearance['layout']>)=>onChange({...appearance,layout:{...appearance.layout,...patch}})
  const typography=(patch:Partial<FormAppearance['typography']>)=>onChange({...appearance,typography:{...appearance.typography,...patch}})
  const fields=(patch:Partial<FormAppearance['fields']>)=>onChange({...appearance,fields:{...appearance.fields,...patch}})
  const textarea=(patch:Partial<FormAppearance['textarea']>)=>onChange({...appearance,textarea:{...appearance.textarea,...patch}})
  const button=(patch:Partial<FormAppearance['button']>)=>onChange({...appearance,button:{...appearance.button,...patch}})
  const consents=(patch:Partial<FormAppearance['consents']>)=>onChange({...appearance,consents:{...appearance.consents,...patch}})
  const upload=(patch:Partial<FormAppearance['upload']>)=>onChange({...appearance,upload:{...appearance.upload,...patch}})
  const states=(patch:Partial<FormAppearance['states']>)=>onChange({...appearance,states:{...appearance.states,...patch}})
  const preset=(value:FormAppearancePreset)=>onChange(getFormAppearancePreset(value))

  return <section className="site-form-card site-form-appearance-editor" data-testid="form-appearance-editor">
    <header><div><h2>Aparência</h2><p>Personalização visual versionada. Os controles geram apenas tokens seguros; nenhum CSS arbitrário é armazenado.</p></div></header>
    <div className="site-form-appearance-presets" role="group" aria-label="Presets de aparência">{presets.map(([value,label])=><button type="button" key={value} className={appearance.preset===value?'active':''} onClick={()=>preset(value)}>{label}</button>)}</div>

    <details open><summary>Layout e container</summary><div className="site-form-grid site-form-appearance-grid">
      <label><span>Colunas</span><select value={appearance.layout.columns} onChange={event=>layout({columns:n(event.target.value)===1?1:2})}><option value="1">1 coluna</option><option value="2">2 colunas</option></select></label>
      <label><span>Quebrar para 1 coluna</span><select value={appearance.layout.responsiveCollapseAt} onChange={event=>layout({responsiveCollapseAt:event.target.value as 'mobile'|'tablet'})}><option value="mobile">Mobile</option><option value="tablet">Tablet e mobile</option></select></label>
      <label><span>Largura máxima (px)</span><input type="number" min="320" max="1440" value={appearance.container.maxWidth} onChange={event=>container({maxWidth:n(event.target.value)})}/></label>
      <label><span>Largura relativa (%)</span><input type="number" min="40" max="100" value={appearance.container.width} onChange={event=>container({width:n(event.target.value)})}/></label>
      <label><span>Alinhamento</span><select value={appearance.container.align} onChange={event=>container({align:event.target.value as FormAppearance['container']['align']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
      <label><span>Padding (px)</span><input type="number" min="0" max="64" value={appearance.container.padding} onChange={event=>container({padding:n(event.target.value)})}/></label>
      <label><span>Gap horizontal</span><input type="number" min="0" max="48" value={appearance.layout.columnGap} onChange={event=>layout({columnGap:n(event.target.value)})}/></label>
      <label><span>Gap vertical</span><input type="number" min="0" max="48" value={appearance.layout.rowGap} onChange={event=>layout({rowGap:n(event.target.value)})}/></label>
      <label><span>Fundo</span><input type="color" value={appearance.container.background} onChange={event=>container({background:event.target.value})}/></label>
      <label><span>Borda</span><select value={appearance.container.border} onChange={event=>container({border:event.target.value as 'none'|'solid'})}><option value="none">Sem borda</option><option value="solid">Sólida</option></select></label>
      <label><span>Cor da borda</span><input type="color" value={appearance.container.borderColor} onChange={event=>container({borderColor:event.target.value})}/></label>
      <label><span>Espessura da borda</span><input type="number" min="0" max="4" value={appearance.container.borderWidth} onChange={event=>container({borderWidth:n(event.target.value)})}/></label>
      <label><span>Raio</span><input type="number" min="0" max="40" value={appearance.container.borderRadius} onChange={event=>container({borderRadius:n(event.target.value)})}/></label>
      <label><span>Sombra</span><select value={appearance.container.shadow} onChange={event=>container({shadow:event.target.value as FormAppearance['container']['shadow']})}><option value="none">Nenhuma</option><option value="soft">Suave</option><option value="strong">Forte</option></select></label>
    </div></details>

    <details><summary>Tipografia e campos</summary><div className="site-form-grid site-form-appearance-grid">
      <label><span>Fonte</span><select value={appearance.typography.font} onChange={event=>typography({font:event.target.value as 'montserrat'|'system'})}><option value="montserrat">Montserrat</option><option value="system">Sistema</option></select></label>
      <label><span>Tamanho do label</span><input type="number" min="11" max="22" value={appearance.typography.labelSize} onChange={event=>typography({labelSize:n(event.target.value)})}/></label>
      <label><span>Peso do label</span><select value={appearance.typography.labelWeight} onChange={event=>typography({labelWeight:n(event.target.value) as 400|500|600|700})}><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option></select></label>
      <label><span>Cor do label</span><input type="color" value={appearance.typography.labelColor} onChange={event=>typography({labelColor:event.target.value})}/></label>
      <label><span>Texto auxiliar</span><input type="number" min="10" max="18" value={appearance.typography.helpSize} onChange={event=>typography({helpSize:n(event.target.value)})}/></label>
      <label><span>Cor auxiliar</span><input type="color" value={appearance.typography.helpColor} onChange={event=>typography({helpColor:event.target.value})}/></label>
      <label><span>Altura do campo</span><input type="number" min="36" max="72" value={appearance.fields.height} onChange={event=>fields({height:n(event.target.value)})}/></label>
      <label><span>Fundo do campo</span><input type="color" value={appearance.fields.background} onChange={event=>fields({background:event.target.value})}/></label>
      <label><span>Texto do campo</span><input type="color" value={appearance.fields.textColor} onChange={event=>fields({textColor:event.target.value})}/></label>
      <label><span>Placeholder</span><input type="color" value={appearance.fields.placeholderColor} onChange={event=>fields({placeholderColor:event.target.value})}/></label>
      <label><span>Cor da borda</span><input type="color" value={appearance.fields.borderColor} onChange={event=>fields({borderColor:event.target.value})}/></label>
      <label><span>Espessura</span><input type="number" min="0" max="4" value={appearance.fields.borderWidth} onChange={event=>fields({borderWidth:n(event.target.value)})}/></label>
      <label><span>Raio</span><input type="number" min="0" max="32" value={appearance.fields.borderRadius} onChange={event=>fields({borderRadius:n(event.target.value)})}/></label>
      <label><span>Padding horizontal</span><input type="number" min="8" max="28" value={appearance.fields.paddingX} onChange={event=>fields({paddingX:n(event.target.value)})}/></label>
      <label><span>Cor de foco</span><input type="color" value={appearance.fields.focusColor} onChange={event=>fields({focusColor:event.target.value})}/></label>
      <label><span>Focus ring</span><input type="number" min="1" max="6" value={appearance.fields.focusRing} onChange={event=>fields({focusRing:n(event.target.value)})}/></label>
      <label><span>Textarea mínimo</span><input type="number" min="80" max="420" value={appearance.textarea.minHeight} onChange={event=>textarea({minHeight:n(event.target.value)})}/></label>
      <label><span>Resize textarea</span><select value={appearance.textarea.resize} onChange={event=>textarea({resize:event.target.value as FormAppearance['textarea']['resize']})}><option value="none">Bloqueado</option><option value="vertical">Vertical</option><option value="both">Livre</option></select></label>
    </div></details>

    <details><summary>Botão</summary><div className="site-form-grid site-form-appearance-grid">
      <label className="site-form-span-2"><span>Texto do botão</span><input value={appearance.button.text} onChange={event=>button({text:event.target.value})} placeholder="Vazio usa o texto da página"/></label>
      <label><span>Alinhamento</span><select value={appearance.button.align} onChange={event=>button({align:event.target.value as FormAppearance['button']['align']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
      <label><span>Largura</span><select value={appearance.button.width} onChange={event=>button({width:event.target.value as 'auto'|'full'})}><option value="auto">Automática</option><option value="full">100%</option></select></label>
      <label><span>Altura</span><input type="number" min="36" max="72" value={appearance.button.height} onChange={event=>button({height:n(event.target.value)})}/></label>
      <label><span>Fundo</span><input type="color" value={appearance.button.background} onChange={event=>button({background:event.target.value})}/></label>
      <label><span>Texto</span><input type="color" value={appearance.button.foreground} onChange={event=>button({foreground:event.target.value})}/></label>
      <label><span>Hover</span><input type="color" value={appearance.button.hoverBackground} onChange={event=>button({hoverBackground:event.target.value})}/></label>
      <label><span>Borda</span><input type="color" value={appearance.button.borderColor} onChange={event=>button({borderColor:event.target.value})}/></label>
      <label><span>Espessura</span><input type="number" min="0" max="4" value={appearance.button.borderWidth} onChange={event=>button({borderWidth:n(event.target.value)})}/></label>
      <label><span>Raio</span><input type="number" min="0" max="32" value={appearance.button.borderRadius} onChange={event=>button({borderRadius:n(event.target.value)})}/></label>
      <label><span>Tamanho da fonte</span><input type="number" min="11" max="22" value={appearance.button.fontSize} onChange={event=>button({fontSize:n(event.target.value)})}/></label>
      <label><span>Peso</span><select value={appearance.button.fontWeight} onChange={event=>button({fontWeight:n(event.target.value) as 500|600|700})}><option value="500">500</option><option value="600">600</option><option value="700">700</option></select></label>
      <label><span>Foco do botão</span><input type="color" value={appearance.button.focusColor} onChange={event=>button({focusColor:event.target.value})}/></label>
    </div></details>

    <details><summary>Consentimentos, upload e estados</summary><div className="site-form-grid site-form-appearance-grid">
      <label><span>Cor dos consentimentos</span><input type="color" value={appearance.consents.color} onChange={event=>consents({color:event.target.value})}/></label>
      <label><span>Tamanho</span><input type="number" min="10" max="18" value={appearance.consents.fontSize} onChange={event=>consents({fontSize:n(event.target.value)})}/></label>
      <label><span>Espaçamento</span><input type="number" min="4" max="24" value={appearance.consents.gap} onChange={event=>consents({gap:n(event.target.value)})}/></label>
      <label><span>Upload fundo</span><input type="color" value={appearance.upload.background} onChange={event=>upload({background:event.target.value})}/></label>
      <label><span>Upload texto</span><input type="color" value={appearance.upload.foreground} onChange={event=>upload({foreground:event.target.value})}/></label>
      <label><span>Upload borda</span><input type="color" value={appearance.upload.borderColor} onChange={event=>upload({borderColor:event.target.value})}/></label>
      <label><span>Upload espessura</span><input type="number" min="0" max="4" value={appearance.upload.borderWidth} onChange={event=>upload({borderWidth:n(event.target.value)})}/></label>
      <label><span>Upload raio</span><input type="number" min="0" max="32" value={appearance.upload.borderRadius} onChange={event=>upload({borderRadius:n(event.target.value)})}/></label>
      <label><span>Sucesso fundo</span><input type="color" value={appearance.states.successBackground} onChange={event=>states({successBackground:event.target.value})}/></label>
      <label><span>Sucesso texto</span><input type="color" value={appearance.states.successForeground} onChange={event=>states({successForeground:event.target.value})}/></label>
      <label><span>Erro fundo</span><input type="color" value={appearance.states.errorBackground} onChange={event=>states({errorBackground:event.target.value})}/></label>
      <label><span>Erro texto</span><input type="color" value={appearance.states.errorForeground} onChange={event=>states({errorForeground:event.target.value})}/></label>
      <label><span>Estados borda</span><input type="color" value={appearance.states.borderColor} onChange={event=>states({borderColor:event.target.value})}/></label>
      <label><span>Estados raio</span><input type="number" min="0" max="32" value={appearance.states.borderRadius} onChange={event=>states({borderRadius:n(event.target.value)})}/></label>
    </div></details>
  </section>
}
