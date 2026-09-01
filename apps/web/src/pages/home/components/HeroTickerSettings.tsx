import { ChevronDown, ChevronUp, Copy, Plus, RotateCcw, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HeroBreakpoint } from '../models/heroAppearanceModel'
import type { HeroTicker, HeroTickerItem, HeroTickerViewportConfig } from '../models/heroModel'
import { resolveTickerViewport } from '../models/heroModel'

type Props = {
  ticker: HeroTicker
  viewport: HeroBreakpoint
  onChange: (ticker: HeroTicker) => void
}

function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: string }) {
  return <label className="hero-cms-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function stamp() { return Date.now() }

export function HeroTickerSettings({ ticker, viewport, onChange }: Props) {
  const items = [...(ticker.items || [])].sort((a, b) => a.order - b.order)
  const effective = resolveTickerViewport(ticker, viewport)
  const viewportOverride = viewport === 'desktop' ? undefined : ticker.responsive?.[viewport]

  const patch = (value: Partial<HeroTicker>) => onChange({ ...ticker, ...value })

  const patchViewport = <K extends keyof HeroTickerViewportConfig>(key: K, value: HeroTickerViewportConfig[K]) => {
    if (viewport === 'desktop') {
      if (key === 'hidden') patch({ hiddenDesktop: Boolean(value) })
      else patch({ [key]: value } as Partial<HeroTicker>)
      return
    }
    patch({
      responsive: {
        ...(ticker.responsive || {}),
        [viewport]: {
          ...(ticker.responsive?.[viewport] || {}),
          [key]: value,
        },
      },
    })
  }

  const resetViewport = () => {
    if (viewport === 'desktop') return
    patch({ responsive: { ...(ticker.responsive || {}), [viewport]: {} } })
  }

  const updateItem = (id: string, value: Partial<HeroTickerItem>) => {
    patch({ items: items.map(item => item.id === id ? { ...item, ...value } : item) })
  }

  const addItem = () => {
    patch({
      items: [...items, {
        id: `ticker-item-${stamp()}`,
        active: true,
        text: 'Nova chamada do ticker',
        url: '/',
        external: false,
        order: items.length + 1,
      }],
    })
  }

  const duplicateItem = (item: HeroTickerItem) => {
    patch({
      items: [...items, { ...item, id: `ticker-item-${stamp()}`, order: items.length + 1 }],
    })
  }

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    patch({ items: items.filter(item => item.id !== id).map((item, index) => ({ ...item, order: index + 1 })) })
  }

  const moveItem = (id: string, delta: number) => {
    const next = [...items]
    const index = next.findIndex(item => item.id === id)
    const destination = index + delta
    if (destination < 0 || destination >= next.length) return
    ;[next[index], next[destination]] = [next[destination], next[index]]
    patch({ items: next.map((item, order) => ({ ...item, order: order + 1 })) })
  }

  const isOverridden = (key: keyof HeroTickerViewportConfig) => viewport !== 'desktop' && viewportOverride?.[key] !== undefined
  const deviceName = viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile'

  return <div className="hero-cms-ticker-editor">
    <div className="hero-cms-grid two">
      <Field label="Status"><select value={ticker.active ? 'on' : 'off'} onChange={event => patch({ active: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field>
      <Field label="Rótulo fixo"><input value={ticker.label} onChange={event => patch({ label: event.target.value })} /></Field>
      <Field label="Separador entre itens"><input value={ticker.separator} onChange={event => patch({ separator: event.target.value })} placeholder="•" /></Field>
      <Field label="Direção"><select value={ticker.direction} onChange={event => patch({ direction: event.target.value as HeroTicker['direction'] })}><option value="rtl">Direita → esquerda</option><option value="ltr">Esquerda → direita</option></select></Field>
      <Field label="Pausa ao passar o mouse"><select value={ticker.pauseOnHover ? 'on' : 'off'} onChange={event => patch({ pauseOnHover: event.target.value === 'on' })}><option value="on">Ativa</option><option value="off">Desativada</option></select></Field>
      <Field label="Loop contínuo"><select value={ticker.loop ? 'on' : 'off'} onChange={event => patch({ loop: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Desativado</option></select></Field>
      <Field label="Alinhamento vertical"><select value={ticker.verticalAlign} onChange={event => patch({ verticalAlign: event.target.value as HeroTicker['verticalAlign'] })}><option value="start">Topo</option><option value="center">Centro</option><option value="end">Base</option></select></Field>
    </div>

    <div className="hero-cms-section-title"><div><h3>Itens do ticker</h3><p>Chamadas independentes com link, status e ordem próprios.</p></div><button className="button dark" type="button" onClick={addItem}><Plus size={15} /> Adicionar item</button></div>
    <div className="hero-cms-cta-list">
      {items.map((item, index) => <div className="hero-cms-cta-card" key={item.id}>
        <div className="hero-cms-cta-summary"><strong>{String(index + 1).padStart(2, '0')} · {item.text || 'Sem texto'}</strong><small>{item.active ? 'Ativo' : 'Oculto'} · {item.url || 'Sem destino'}</small></div>
        <div className="hero-cms-grid two">
          <Field label="Texto"><input value={item.text} onChange={event => updateItem(item.id, { text: event.target.value })} /></Field>
          <Field label="Link / destino"><input value={item.url} onChange={event => updateItem(item.id, { url: event.target.value })} /></Field>
          <Field label="Status"><select value={item.active ? 'on' : 'off'} onChange={event => updateItem(item.id, { active: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Oculto</option></select></Field>
          <Field label="Abrir link"><select value={item.external ? 'external' : 'internal'} onChange={event => updateItem(item.id, { external: event.target.value === 'external' })}><option value="internal">Mesma aba</option><option value="external">Nova aba</option></select></Field>
        </div>
        <div className="hero-cms-row-actions">
          <button type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0}><ChevronUp size={14} /> Subir</button>
          <button type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1}><ChevronDown size={14} /> Descer</button>
          <button type="button" onClick={() => duplicateItem(item)}><Copy size={14} /> Duplicar</button>
          <button type="button" onClick={() => removeItem(item.id)} disabled={items.length <= 1}><Trash2 size={14} /> Excluir</button>
        </div>
      </div>)}
    </div>

    <div className="hero-cms-section-title"><div><h3>Responsividade · {deviceName}</h3><p>{viewport === 'desktop' ? 'Configuração base do ticker.' : 'Valores herdados do Desktop podem ser sobrescritos somente neste breakpoint.'}</p></div>{viewport !== 'desktop' && <button className="button outline" type="button" onClick={resetViewport} disabled={!viewportOverride || Object.keys(viewportOverride).length === 0}><RotateCcw size={14} /> Restaurar automático</button>}</div>
    <div className="hero-cms-grid two">
      <Field label={`Velocidade · ${effective.speed}`} hint={isOverridden('speed') ? `Sobrescrito no ${deviceName}` : viewport === 'desktop' ? 'Base Desktop' : 'Herdado do Desktop'}><input type="range" min="1" max="100" value={effective.speed} onChange={event => patchViewport('speed', Number(event.target.value))} /></Field>
      <Field label={`Espaçamento entre chamadas · ${effective.gap}px`} hint={isOverridden('gap') ? `Sobrescrito no ${deviceName}` : viewport === 'desktop' ? 'Base Desktop' : 'Herdado do Desktop'}><input type="range" min="0" max="120" value={effective.gap} onChange={event => patchViewport('gap', Number(event.target.value))} /></Field>
      <Field label={`Altura da barra · ${effective.height}px`} hint={isOverridden('height') ? `Sobrescrito no ${deviceName}` : viewport === 'desktop' ? 'Base Desktop' : 'Herdado do Desktop'}><input type="range" min="28" max="120" value={effective.height} onChange={event => patchViewport('height', Number(event.target.value))} /></Field>
      <Field label={`Tamanho do texto · ${effective.fontSize}px`} hint={isOverridden('fontSize') ? `Sobrescrito no ${deviceName}` : viewport === 'desktop' ? 'Base Desktop' : 'Herdado do Desktop'}><input type="range" min="8" max="32" value={effective.fontSize} onChange={event => patchViewport('fontSize', Number(event.target.value))} /></Field>
      <Field label={`Exibição em ${deviceName}`}><select value={effective.hidden ? 'off' : 'on'} onChange={event => patchViewport('hidden', event.target.value === 'off')}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field>
    </div>

    <div className="hero-cms-section-title"><div><h3>Tipografia</h3><p>Configuração editorial global; o tamanho pode variar por breakpoint acima.</p></div></div>
    <div className="hero-cms-grid two">
      <Field label="Família da fonte"><input value={ticker.fontFamily} onChange={event => patch({ fontFamily: event.target.value })} placeholder="inherit" /></Field>
      <Field label="Peso"><select value={ticker.fontWeight} onChange={event => patch({ fontWeight: Number(event.target.value) })}><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></Field>
      <Field label="Transformação"><select value={ticker.textTransform} onChange={event => patch({ textTransform: event.target.value as HeroTicker['textTransform'] })}><option value="none">Normal</option><option value="uppercase">MAIÚSCULAS</option><option value="lowercase">minúsculas</option><option value="capitalize">Capitalizado</option></select></Field>
    </div>

    <div className="hero-cms-section-title"><div><h3>Cores</h3><p>Aplicadas imediatamente ao preview do ticker.</p></div></div>
    <div className="hero-cms-grid colors">
      <Field label="Fundo"><input type="color" value={ticker.background} onChange={event => patch({ background: event.target.value })} /></Field>
      <Field label="Texto"><input type="color" value={ticker.textColor} onChange={event => patch({ textColor: event.target.value })} /></Field>
      <Field label="Rótulo AGORA"><input type="color" value={ticker.labelColor} onChange={event => patch({ labelColor: event.target.value })} /></Field>
      <Field label="Separador"><input type="color" value={ticker.separatorColor} onChange={event => patch({ separatorColor: event.target.value })} /></Field>
      <Field label="Hover"><input type="color" value={ticker.hoverColor} onChange={event => patch({ hoverColor: event.target.value })} /></Field>
    </div>

    <div className="hero-cms-section-title"><div><h3>Bordas</h3><p>A borda pertence ao ticker e não cria espaçamento em relação ao Hero.</p></div></div>
    <div className="hero-cms-grid two">
      <Field label="Borda"><select value={ticker.borderEnabled ? 'on' : 'off'} onChange={event => patch({ borderEnabled: event.target.value === 'on' })}><option value="off">Desativada</option><option value="on">Ativada</option></select></Field>
      <Field label={`Espessura · ${ticker.borderWidth}px`}><input type="range" min="0" max="8" value={ticker.borderWidth} onChange={event => patch({ borderWidth: Number(event.target.value) })} /></Field>
      <Field label="Cor da borda"><input type="color" value={ticker.borderColor} onChange={event => patch({ borderColor: event.target.value })} /></Field>
    </div>
  </div>
}
