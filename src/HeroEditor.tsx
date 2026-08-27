import { Eye, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { HeroSection } from './HeroSection'
import { defaultHeroHighlight, readHeroHighlight, resetHeroHighlight, writeHeroHighlight, type HeroHighlight } from './heroModel'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="hero-editor-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function HeroEditor() {
  const [draft, setDraft] = useState<HeroHighlight>(() => readHeroHighlight())
  const [saved, setSaved] = useState(false)

  const update = <K extends keyof HeroHighlight>(key: K, value: HeroHighlight[K]) => {
    setSaved(false)
    setDraft(current => ({ ...current, [key]: value }))
  }

  const save = () => {
    const next = { ...draft, status: 'active' as const }
    setDraft(next)
    writeHeroHighlight(next)
    setSaved(true)
  }

  const reset = () => {
    resetHeroHighlight()
    setDraft(defaultHeroHighlight)
    setSaved(false)
  }

  return <div className="hero-editor">
    <div className="hero-editor-toolbar">
      <div><span>CONTEÚDO / HOME</span><h1>Hero / Destaque principal</h1><p>Somente textos e imagem principal são editáveis. Fundo, textura, composição, posicionamento e identidade visual do Hero estão travados.</p></div>
      <div className="hero-editor-toolbar-actions">
        <button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button>
        <button className="button outline" onClick={save}><Save size={16}/> Salvar</button>
        <button className="button dark" onClick={save}><Eye size={16}/> Publicar</button>
      </div>
    </div>

    {saved && <div className="hero-editor-success">Conteúdo do Hero salvo. A estrutura visual fixa não foi alterada.</div>}

    <div className="hero-editor-layout">
      <section className="panel hero-editor-form">
        <div className="hero-editor-section-head"><span>Texto editorial</span><h2>Headline</h2></div>
        <Field label="Eyebrow / selo superior"><input value={draft.eyebrow} onChange={e => update('eyebrow', e.target.value)} /></Field>
        <div className="hero-title-editor">
          {draft.title.map((segment, index) => <div className="hero-title-row" key={index}>
            <input value={segment.text} onChange={e => update('title', draft.title.map((item, i) => i === index ? { ...item, text: e.target.value } : item))} />
            <label className="hero-emphasis-toggle"><input type="checkbox" checked={segment.emphasis} onChange={e => update('title', draft.title.map((item, i) => i === index ? { ...item, emphasis: e.target.checked } : item))} /> Vermelho</label>
            <button className="icon-button" aria-label="Remover trecho" disabled={draft.title.length <= 1} onClick={() => update('title', draft.title.filter((_, i) => i !== index))}><Trash2 size={15}/></button>
          </div>)}
          <button className="text-button hero-add-title" onClick={() => update('title', [...draft.title, { text: 'NOVO TRECHO', emphasis: false }])}><Plus size={15}/> Adicionar trecho</button>
        </div>
        <Field label="Descrição"><textarea rows={4} value={draft.description} onChange={e => update('description', e.target.value)} /></Field>

        <div className="hero-editor-section-head"><span>Imagem principal</span><h2>Artista / notícia em destaque</h2></div>
        <Field label="URL da imagem principal" hint="Troca somente o personagem/artista em destaque. O fundo e a composição permanecem fixos."><input value={draft.image} onChange={e => update('image', e.target.value)} placeholder="/assets/dj-stay-hero.jpg ou URL do Media Manager" /></Field>
        <Field label="Texto alternativo"><input value={draft.imageAlt} onChange={e => update('imageAlt', e.target.value)} /></Field>

        <div className="hero-editor-section-head"><span>Textos dos botões</span><h2>CTAs</h2></div>
        <div className="hero-editor-grid two">
          <Field label="CTA primário"><input value={draft.primaryCtaLabel} onChange={e => update('primaryCtaLabel', e.target.value)} /></Field>
          <Field label="URL primária"><input value={draft.primaryCtaUrl} onChange={e => update('primaryCtaUrl', e.target.value)} /></Field>
          <Field label="CTA secundário"><input value={draft.secondaryCtaLabel} onChange={e => update('secondaryCtaLabel', e.target.value)} /></Field>
          <Field label="URL secundária"><input value={draft.secondaryCtaUrl} onChange={e => update('secondaryCtaUrl', e.target.value)} /></Field>
        </div>

        <div className="hero-editor-section-head"><span>Faixa inferior</span><h2>Ticker “Agora”</h2></div>
        <div className="hero-editor-grid two">
          <Field label="Label"><input value={draft.ticker.label} onChange={e => update('ticker', { ...draft.ticker, label: e.target.value })}/></Field>
          <Field label="Link"><input value={draft.ticker.url} onChange={e => update('ticker', { ...draft.ticker, url: e.target.value })}/></Field>
        </div>
        <Field label="Texto"><input value={draft.ticker.text} onChange={e => update('ticker', { ...draft.ticker, text: e.target.value })}/></Field>
      </section>

      <section className="hero-editor-preview-panel">
        <div className="hero-editor-preview-head"><span>PREVIEW</span><strong>Estrutura visual fixa</strong></div>
        <div className="hero-editor-preview-frame"><HeroSection hero={draft}/></div>
      </section>
    </div>
  </div>
}
