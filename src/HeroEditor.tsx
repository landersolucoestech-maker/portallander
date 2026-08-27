import { Eye, RotateCcw, Save, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { HeroSection } from './HeroSection'
import { applyArticleToHero, defaultHeroHighlight, heroArticles, readHeroHighlight, resetHeroHighlight, writeHeroHighlight, type HeroHighlight } from './heroModel'

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

  const save = (publish = false) => {
    const next = publish ? { ...draft, status: 'active' as const } : draft
    setDraft(next)
    writeHeroHighlight(next)
    setSaved(true)
  }

  const reset = () => {
    resetHeroHighlight()
    setDraft(defaultHeroHighlight)
    setSaved(false)
  }

  const chooseArticle = (id: string) => {
    const article = heroArticles.find(item => item.id === id)
    if (article) setDraft(current => applyArticleToHero(current, article))
  }

  return <div className="hero-editor">
    <div className="hero-editor-toolbar">
      <div><span>CONTEÚDO / HOME</span><h1>Hero / Destaque principal</h1><p>Edite a principal chamada da Home sem alterar código. O preview abaixo usa o mesmo componente do site público.</p></div>
      <div className="hero-editor-toolbar-actions">
        <button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button>
        <button className="button outline" onClick={() => save(false)}><Save size={16}/> Salvar rascunho</button>
        <button className="button dark" onClick={() => save(true)}><Eye size={16}/> Publicar destaque</button>
      </div>
    </div>

    {saved && <div className="hero-editor-success">Configuração salva. A Home passa a consumir esta fonte editorial.</div>}

    <div className="hero-editor-layout">
      <section className="panel hero-editor-form">
        <div className="hero-editor-section-head"><span>Publicação</span><h2>Fonte e status</h2></div>
        <div className="hero-editor-grid two">
          <Field label="Status">
            <select value={draft.status} onChange={e => update('status', e.target.value as HeroHighlight['status'])}><option value="active">Ativo</option><option value="inactive">Inativo</option></select>
          </Field>
          <Field label="Agendamento">
            <input type="datetime-local" value={draft.publishedAt} onChange={e => update('publishedAt', e.target.value)} />
          </Field>
          <Field label="Notícia vinculada" hint="Preenche categoria, resumo, imagem e URL quando houver dados disponíveis na notícia.">
            <select value={draft.articleId} onChange={e => chooseArticle(e.target.value)}>
              {heroArticles.map(article => <option value={article.id} key={article.id}>{article.title}</option>)}
            </select>
          </Field>
          <Field label="Categoria"><input value={draft.category} onChange={e => update('category', e.target.value)} /></Field>
        </div>

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

        <div className="hero-editor-section-head"><span>Art direction</span><h2>Imagem principal</h2></div>
        <Field label="URL / data URL do asset real" hint="Use o arquivo real do artista. O componente não gera, deforma ou recria a imagem."><input value={draft.image} onChange={e => update('image', e.target.value)} placeholder="/assets/dj-stay.webp ou URL do Media Manager" /></Field>
        <Field label="Texto alternativo"><input value={draft.imageAlt} onChange={e => update('imageAlt', e.target.value)} /></Field>
        <div className="hero-editor-grid three">
          <Field label={`Posição X — ${draft.imagePositionX}%`}><input type="range" min="0" max="100" value={draft.imagePositionX} onChange={e => update('imagePositionX', Number(e.target.value))}/></Field>
          <Field label={`Posição Y — ${draft.imagePositionY}%`}><input type="range" min="0" max="100" value={draft.imagePositionY} onChange={e => update('imagePositionY', Number(e.target.value))}/></Field>
          <Field label={`Escala — ${draft.imageScale.toFixed(2)}x`}><input type="range" min="0.6" max="1.8" step="0.02" value={draft.imageScale} onChange={e => update('imageScale', Number(e.target.value))}/></Field>
          <Field label={`Offset X — ${draft.imageOffsetX}px`}><input type="range" min="-220" max="220" value={draft.imageOffsetX} onChange={e => update('imageOffsetX', Number(e.target.value))}/></Field>
          <Field label={`Offset Y — ${draft.imageOffsetY}px`}><input type="range" min="-180" max="220" value={draft.imageOffsetY} onChange={e => update('imageOffsetY', Number(e.target.value))}/></Field>
          <Field label={`Overlay — ${Math.round(draft.overlay * 100)}%`}><input type="range" min="0" max="0.85" step="0.01" value={draft.overlay} onChange={e => update('overlay', Number(e.target.value))}/></Field>
        </div>
        <Field label="Background do Hero (opcional)"><input value={draft.backgroundImage} onChange={e => update('backgroundImage', e.target.value)} placeholder="URL da imagem de show/evento" /></Field>

        <div className="hero-editor-section-head"><span>Navegação</span><h2>CTAs</h2></div>
        <div className="hero-editor-grid two">
          <Field label="CTA primário"><input value={draft.primaryCtaLabel} onChange={e => update('primaryCtaLabel', e.target.value)} /></Field>
          <Field label="URL primária"><input value={draft.primaryCtaUrl} onChange={e => update('primaryCtaUrl', e.target.value)} /></Field>
          <Field label="CTA secundário"><input value={draft.secondaryCtaLabel} onChange={e => update('secondaryCtaLabel', e.target.value)} /></Field>
          <Field label="URL secundária"><input value={draft.secondaryCtaUrl} onChange={e => update('secondaryCtaUrl', e.target.value)} /></Field>
        </div>

        <div className="hero-editor-section-head"><span>Faixa inferior</span><h2>Ticker “Agora”</h2></div>
        <label className="hero-check"><input type="checkbox" checked={draft.ticker.active} onChange={e => update('ticker', { ...draft.ticker, active: e.target.checked })}/> Ticker ativo</label>
        <div className="hero-editor-grid two">
          <Field label="Label"><input value={draft.ticker.label} onChange={e => update('ticker', { ...draft.ticker, label: e.target.value })}/></Field>
          <Field label="Link opcional"><input value={draft.ticker.url} onChange={e => update('ticker', { ...draft.ticker, url: e.target.value })}/></Field>
        </div>
        <Field label="Texto"><input value={draft.ticker.text} onChange={e => update('ticker', { ...draft.ticker, text: e.target.value })}/></Field>
      </section>

      <section className="hero-editor-preview-panel">
        <div className="hero-editor-preview-head"><span>PREVIEW</span><strong>Desktop</strong></div>
        <div className="hero-editor-preview-frame"><HeroSection hero={draft}/></div>
      </section>
    </div>
  </div>
}
