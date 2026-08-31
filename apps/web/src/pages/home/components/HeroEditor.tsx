import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  Monitor,
  MoreVertical,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeroSection } from './HeroSection'
import {
  applyArticleToSlide,
  defaultHeroSlide,
  heroArticles,
  readHeroConfig,
  writeHeroConfig,
  type HeroCarouselConfig,
  type HeroCta,
  type HeroSlide,
} from '../models/heroModel'
import {
  defaultHeroAppearance,
  readHeroAppearance,
  writeHeroAppearance,
  type HeroAppearanceConfig,
} from '../models/heroAppearanceModel'
import '../styles/hero-editor-cms.css'

type EditorTab = 'content' | 'appearance' | 'behavior'
type AccordionKey = 'content' | 'media' | 'ctas' | 'ticker' | 'linking' | 'publication'
type Viewport = 'desktop' | 'tablet' | 'mobile'
type _ColorField = 'background' | 'textColor' | 'titleColor' | 'accentColor' | 'borderColor' | 'eyebrowColor'

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="hero-cms-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function Accordion({ id, title, description, open, onToggle, children }: { id: AccordionKey; title: string; description: string; open: boolean; onToggle: (id: AccordionKey) => void; children: ReactNode }) {
  return <section className={`hero-cms-accordion ${open ? 'open' : ''}`}>
    <button type="button" className="hero-cms-accordion-head" onClick={() => onToggle(id)} aria-expanded={open}>
      <span><strong>{title}</strong><small>{description}</small></span>
      {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
    </button>
    {open && <div className="hero-cms-accordion-body">{children}</div>}
  </section>
}

function uniqueStamp() {
  return Date.now()
}

function makeSlide(order: number): HeroSlide {
  const stamp = uniqueStamp()
  return {
    ...defaultHeroSlide,
    id: `hero-slide-${stamp}`,
    order,
    title: defaultHeroSlide.title.map(item => ({ ...item, visible: item.visible !== false })),
    ctas: (defaultHeroSlide.ctas || []).map(item => ({ ...item, id: `${item.id}-${stamp}` })),
  }
}

async function optimizeImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = objectUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada.'))
    })
    const render = (maxDimension: number, quality: number) => {
      const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas indisponível para otimização da imagem.')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/webp', quality)
    }
    let dataUrl = render(2000, .9)
    if (dataUrl.length > 3_200_000) dataUrl = render(1600, .84)
    if (dataUrl.length > 3_200_000) dataUrl = render(1280, .78)
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function HeroEditor() {
  const initialConfig = useMemo(() => readHeroConfig(), [])
  const [draft, setDraft] = useState<HeroCarouselConfig>(initialConfig)
  const [appearance, setAppearance] = useState<HeroAppearanceConfig>(() => readHeroAppearance())
  const [selectedId, setSelectedId] = useState(initialConfig.slides[0]?.id || defaultHeroSlide.id)
  const [tab, setTab] = useState<EditorTab>('content')
  const [openAccordion, setOpenAccordion] = useState<AccordionKey>('content')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slideMenu, setSlideMenu] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ordered = useMemo(() => [...draft.slides].sort((a, b) => a.order - b.order), [draft.slides])
  const selectedIndex = Math.max(0, ordered.findIndex(item => item.id === selectedId))
  const slide = ordered[selectedIndex] || ordered[0] || defaultHeroSlide
  const ctas = useMemo(() => [...(slide.ctas || [])].sort((a, b) => a.order - b.order), [slide.ctas])

  const markDirty = () => { setDirty(true); setSaved(false) }
  const patchConfig = (patch: Partial<HeroCarouselConfig>) => { setDraft(current => ({ ...current, ...patch })); markDirty() }
  const patchAppearance = (patch: Partial<HeroAppearanceConfig>) => { setAppearance(current => ({ ...current, ...patch })); markDirty() }
  const updateSlide = (patch: Partial<HeroSlide>) => {
    setDraft(current => ({ ...current, slides: current.slides.map(item => item.id === slide.id ? { ...item, ...patch } : item) }))
    markDirty()
  }
  const toggleAccordion = (id: AccordionKey) => setOpenAccordion(id)

  const save = () => {
    writeHeroConfig(draft)
    writeHeroAppearance(appearance)
    setDirty(false)
    setSaved(true)
  }

  const discard = () => {
    const current = readHeroConfig()
    setDraft(current)
    setAppearance(readHeroAppearance())
    setSelectedId(current.slides[0]?.id || defaultHeroSlide.id)
    setDirty(false)
    setSaved(false)
  }

  const addSlide = () => {
    const next = makeSlide(draft.slides.length + 1)
    setDraft(current => ({ ...current, slides: [...current.slides, next] }))
    setSelectedId(next.id)
    setOpenAccordion('content')
    markDirty()
  }

  const duplicateSlide = (target = slide) => {
    const stamp = uniqueStamp()
    const next: HeroSlide = {
      ...target,
      id: `hero-slide-${stamp}`,
      order: draft.slides.length + 1,
      title: target.title.map(item => ({ ...item })),
      ctas: (target.ctas || []).map(item => ({ ...item, id: `${item.id}-${stamp}` })),
    }
    setDraft(current => ({ ...current, slides: [...current.slides, next] }))
    setSelectedId(next.id)
    setSlideMenu(null)
    markDirty()
  }

  const removeSlide = (target = slide) => {
    if (draft.slides.length <= 1) return
    const remaining = ordered.filter(item => item.id !== target.id).map((item, index) => ({ ...item, order: index + 1 }))
    setDraft(current => ({ ...current, slides: current.slides.map(item => remaining.find(next => next.id === item.id)).filter((item): item is HeroSlide => Boolean(item)) }))
    setSelectedId(remaining[0]?.id || defaultHeroSlide.id)
    setSlideMenu(null)
    markDirty()
  }

  const moveSlide = (target: HeroSlide, delta: number) => {
    const next = [...ordered]
    const index = next.findIndex(item => item.id === target.id)
    const destination = index + delta
    if (destination < 0 || destination >= next.length) return
    ;[next[index], next[destination]] = [next[destination], next[index]]
    const normalized = next.map((item, order) => ({ ...item, order: order + 1 }))
    setDraft(current => ({ ...current, slides: current.slides.map(item => normalized.find(nextItem => nextItem.id === item.id) || item) }))
    setSlideMenu(null)
    markDirty()
  }

  const moveSegment = (index: number, delta: number) => {
    const next = [...slide.title]
    const destination = index + delta
    if (destination < 0 || destination >= next.length) return
    ;[next[index], next[destination]] = [next[destination], next[index]]
    updateSlide({ title: next })
  }

  const updateCta = (id: string, patch: Partial<HeroCta>) => {
    const next = ctas.map(item => item.id === id ? { ...item, ...patch } : item)
    const primary = next.find(item => item.variant === 'primary')
    const secondary = next.find(item => item.variant === 'secondary')
    updateSlide({
      ctas: next,
      primaryCtaLabel: primary?.label || slide.primaryCtaLabel,
      primaryCtaUrl: primary?.url || slide.primaryCtaUrl,
      secondaryCtaLabel: secondary?.label || slide.secondaryCtaLabel,
      secondaryCtaUrl: secondary?.url || slide.secondaryCtaUrl,
    })
  }

  const addCta = () => {
    const next: HeroCta = {
      id: `cta-${uniqueStamp()}`,
      active: true,
      label: 'NOVO CTA',
      url: '#',
      external: false,
      order: ctas.length + 1,
      variant: ctas.some(item => item.variant === 'primary') ? 'secondary' : 'primary',
    }
    updateSlide({ ctas: [...ctas, next] })
  }

  const removeCta = (id: string) => updateSlide({ ctas: ctas.filter(item => item.id !== id).map((item, index) => ({ ...item, order: index + 1 })) })
  const moveCta = (id: string, delta: number) => {
    const next = [...ctas]
    const index = next.findIndex(item => item.id === id)
    const destination = index + delta
    if (destination < 0 || destination >= next.length) return
    ;[next[index], next[destination]] = [next[destination], next[index]]
    updateSlide({ ctas: next.map((item, order) => ({ ...item, order: order + 1 })) })
  }

  const upload = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const optimized = await optimizeImage(file)
      updateSlide({ image: optimized, imageVisible: true, imageAlt: slide.imageAlt || file.name.replace(/\.[^.]+$/, '') })
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewClass = `hero-cms-preview-stage ${viewport}`
  const selectedTitle = slide.title.filter(part => part.visible !== false).map(part => part.text).join(' ') || 'Sem headline'

  return <div className="hero-cms-editor">
    <div className="hero-cms-topbar">
      <div className="hero-cms-breadcrumb"><Link to="/app/site/secoes">← Seções das Páginas</Link><span className={`hero-cms-status ${appearance.active ? 'active' : ''}`}>{appearance.active ? 'Ativo' : 'Inativo'}</span></div>
      <Link className="button outline" to="/" target="_blank">Ver no site <ExternalLink size={15} /></Link>
    </div>

    <div className="hero-cms-tabs" role="tablist" aria-label="Configuração do Hero">
      <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Conteúdo</button>
      <button className={tab === 'appearance' ? 'active' : ''} onClick={() => setTab('appearance')}>Aparência</button>
      <button className={tab === 'behavior' ? 'active' : ''} onClick={() => setTab('behavior')}>Comportamento</button>
    </div>

    <div className="hero-cms-layout">
      <main className="hero-cms-panel">
        {tab === 'content' && <>
          <div className="hero-cms-section-title"><div><h2>Destaques do Hero</h2><p>Gerencie os destaques exibidos no Hero sem alterar a estrutura pública.</p></div><button className="button dark" onClick={addSlide}><Plus size={16} /> Novo destaque</button></div>

          <div className="hero-cms-slide-list">{ordered.map((item, index) => {
            const title = item.title.filter(part => part.visible !== false).map(part => part.text).join(' ') || 'Sem headline'
            return <div className={`hero-cms-slide-card ${item.id === slide.id ? 'active' : ''}`} key={item.id}>
              <button type="button" className="hero-cms-slide-select" onClick={() => { setSelectedId(item.id); setSlideMenu(null) }}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span><b>{title}</b><small>Ordem {item.order} · <em>{item.status === 'active' ? 'Ativo' : 'Inativo'}</em></small></span>
              </button>
              <GripVertical size={17} className="hero-cms-grip" aria-hidden="true" />
              <button className="hero-cms-icon" onClick={() => duplicateSlide(item)} aria-label={`Duplicar ${title}`}><Copy size={16} /></button>
              <div className="hero-cms-menu-wrap"><button className="hero-cms-icon" onClick={() => setSlideMenu(current => current === item.id ? null : item.id)} aria-label={`Ações de ${title}`}><MoreVertical size={17} /></button>{slideMenu === item.id && <div className="hero-cms-menu"><button onClick={() => moveSlide(item, -1)} disabled={index === 0}><ChevronUp size={14} /> Subir</button><button onClick={() => moveSlide(item, 1)} disabled={index === ordered.length - 1}><ChevronDown size={14} /> Descer</button><button onClick={() => removeSlide(item)} disabled={ordered.length <= 1}><Trash2 size={14} /> Remover</button></div>}</div>
            </div>
          })}</div>

          <div className="hero-cms-editing-label">Editando destaque: {String(selectedIndex + 1).padStart(2, '0')} — {selectedTitle}</div>

          <Accordion id="content" title="Conteúdo" description="Headline, eyebrow, descrição e assinatura editorial" open={openAccordion === 'content'} onToggle={toggleAccordion}>
            <div className="hero-cms-grid two"><Field label="Eyebrow"><input value={slide.eyebrow} onChange={event => updateSlide({ eyebrow: event.target.value })} /></Field><Field label="Visibilidade"><select value={slide.eyebrowVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ eyebrowVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
            <div className="hero-cms-segments">{slide.title.map((segment, index) => <div className="hero-cms-segment" key={`${index}-${segment.text}`}>
              <input value={segment.text} onChange={event => updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item) })} />
              <input type="color" aria-label={`Cor do trecho ${index + 1}`} value={segment.color || (segment.emphasis ? '#ff151f' : '#ffffff')} onChange={event => updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, color: event.target.value } : item) })} />
              <label><input type="checkbox" checked={segment.visible !== false} onChange={event => updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, visible: event.target.checked } : item) })} /> Visível</label>
              <input type="number" min="20" max="140" placeholder="Tamanho" value={segment.fontSize || ''} onChange={event => updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, fontSize: event.target.value ? Number(event.target.value) : undefined } : item) })} />
              <select value={segment.fontWeight || ''} onChange={event => updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, fontWeight: event.target.value ? Number(event.target.value) : undefined } : item) })}><option value="">Peso padrão</option><option value="400">400</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select>
              <div className="hero-cms-row-actions"><button onClick={() => moveSegment(index, -1)} disabled={index === 0}><ChevronUp size={14} /></button><button onClick={() => moveSegment(index, 1)} disabled={index === slide.title.length - 1}><ChevronDown size={14} /></button><button onClick={() => updateSlide({ title: slide.title.filter((_, itemIndex) => itemIndex !== index) })} disabled={slide.title.length <= 1}><Trash2 size={14} /></button></div>
            </div>)}</div>
            <button className="hero-cms-text-action" onClick={() => updateSlide({ title: [...slide.title, { text: 'NOVO TRECHO', emphasis: false, color: '#ffffff', visible: true }] })}><Plus size={14} /> Adicionar trecho</button>
            <div className="hero-cms-grid two"><Field label="Descrição"><textarea rows={4} value={slide.description} onChange={event => updateSlide({ description: event.target.value })} /></Field><Field label="Exibir descrição"><select value={slide.descriptionVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ descriptionVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Assinatura editorial"><input value={slide.mediaCaption} onChange={event => updateSlide({ mediaCaption: event.target.value })} /></Field><Field label="Exibir assinatura"><select value={slide.mediaCaptionVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ mediaCaptionVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
          </Accordion>

          <Accordion id="media" title="Mídia principal" description="Imagem, biblioteca, upload, texto alternativo e enquadramento" open={openAccordion === 'media'} onToggle={toggleAccordion}>
            <div className="hero-cms-media-preview">{slide.image && slide.imageVisible !== false ? <img src={slide.image} alt={slide.imageAlt || 'Preview da imagem principal'} style={{ objectPosition: `${slide.imagePositionX}% ${slide.imagePositionY}%` }} /> : <ImageIcon size={34} />}</div>
            <div className="hero-cms-inline-actions"><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => void upload(event.target.files?.[0])} /><button className="button outline" disabled={uploading} onClick={() => fileRef.current?.click()}><Upload size={15} /> {uploading ? 'Processando...' : 'Fazer upload'}</button><button className="button outline" onClick={() => setLibraryOpen(true)}><ImageIcon size={15} /> Biblioteca de mídia</button><button className="button outline" onClick={() => updateSlide({ image: '', imageVisible: false })}><Trash2 size={15} /> Remover imagem</button></div>
            <div className="hero-cms-grid two"><Field label="Exibir imagem"><select value={slide.imageVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ imageVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Texto alternativo"><input value={slide.imageAlt} onChange={event => updateSlide({ imageAlt: event.target.value })} /></Field></div>
            <details className="hero-cms-details" open><summary>Ajustar enquadramento</summary><div className="hero-cms-grid two"><Field label={`Posição X · ${slide.imagePositionX}%`}><input type="range" min="0" max="100" value={slide.imagePositionX} onChange={event => updateSlide({ imagePositionX: Number(event.target.value) })} /></Field><Field label={`Posição Y · ${slide.imagePositionY}%`}><input type="range" min="0" max="100" value={slide.imagePositionY} onChange={event => updateSlide({ imagePositionY: Number(event.target.value) })} /></Field></div></details>
            <details className="hero-cms-details"><summary>Ajustes avançados</summary><div className="hero-cms-grid two"><Field label={`Escala · ${slide.imageScale.toFixed(2)}x`}><input type="range" min="0.4" max="2.4" step="0.01" value={slide.imageScale} onChange={event => updateSlide({ imageScale: Number(event.target.value) })} /></Field><Field label={`Offset X · ${slide.imageOffsetX}px`}><input type="range" min="-400" max="400" value={slide.imageOffsetX} onChange={event => updateSlide({ imageOffsetX: Number(event.target.value) })} /></Field><Field label={`Offset Y · ${slide.imageOffsetY}px`}><input type="range" min="-300" max="300" value={slide.imageOffsetY} onChange={event => updateSlide({ imageOffsetY: Number(event.target.value) })} /></Field></div></details>
          </Accordion>

          <Accordion id="ctas" title="Ações (CTAs)" description="Botões de chamada para ação" open={openAccordion === 'ctas'} onToggle={toggleAccordion}>
            <div className="hero-cms-cta-list">{ctas.map((cta, index) => <div className="hero-cms-cta-card" key={cta.id}><div className="hero-cms-cta-summary"><strong>{cta.label || `CTA ${index + 1}`}</strong><small>{cta.url || 'Sem destino'} · {cta.active ? 'Ativo' : 'Oculto'} · {cta.variant === 'primary' ? 'Primário' : 'Secundário'}</small></div><div className="hero-cms-grid two"><Field label="Texto"><input value={cta.label} onChange={event => updateCta(cta.id, { label: event.target.value })} /></Field><Field label="URL / destino"><input value={cta.url} onChange={event => updateCta(cta.id, { url: event.target.value })} /></Field><Field label="Status"><select value={cta.active ? 'on' : 'off'} onChange={event => updateCta(cta.id, { active: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Oculto</option></select></Field><Field label="Abertura"><select value={cta.external ? 'external' : 'internal'} onChange={event => updateCta(cta.id, { external: event.target.value === 'external' })}><option value="internal">Interna</option><option value="external">Externa</option></select></Field><Field label="Estilo"><select value={cta.variant} onChange={event => updateCta(cta.id, { variant: event.target.value as HeroCta['variant'] })}><option value="primary">Primário</option><option value="secondary">Secundário</option></select></Field></div><div className="hero-cms-row-actions"><button onClick={() => moveCta(cta.id, -1)} disabled={index === 0}><ChevronUp size={14} /> Subir</button><button onClick={() => moveCta(cta.id, 1)} disabled={index === ctas.length - 1}><ChevronDown size={14} /> Descer</button><button onClick={() => removeCta(cta.id)}><Trash2 size={14} /> Excluir</button></div></div>)}</div>
            <button className="hero-cms-text-action" onClick={addCta}><Plus size={14} /> Adicionar CTA</button>
          </Accordion>

          <Accordion id="ticker" title="Barra “AGORA”" description="Composição contínua abaixo do Hero, sem espaçamento" open={openAccordion === 'ticker'} onToggle={toggleAccordion}>
            <div className="hero-cms-grid two"><Field label="Status"><select value={draft.ticker.active ? 'on' : 'off'} onChange={event => patchConfig({ ticker: { ...draft.ticker, active: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Label principal"><input value={draft.ticker.label} onChange={event => patchConfig({ ticker: { ...draft.ticker, label: event.target.value } })} /></Field><Field label="Selo / tag"><input value={draft.ticker.tag || ''} onChange={event => patchConfig({ ticker: { ...draft.ticker, tag: event.target.value } })} /></Field><Field label="Exibir selo"><select value={draft.ticker.tagVisible === false ? 'off' : 'on'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagVisible: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Texto"><input value={draft.ticker.text} onChange={event => patchConfig({ ticker: { ...draft.ticker, text: event.target.value } })} /></Field><Field label="Destino / link"><input value={draft.ticker.url} onChange={event => patchConfig({ ticker: { ...draft.ticker, url: event.target.value } })} /></Field><Field label="Abertura"><select value={draft.ticker.external ? 'external' : 'internal'} onChange={event => patchConfig({ ticker: { ...draft.ticker, external: event.target.value === 'external' } })}><option value="internal">Interna</option><option value="external">Externa</option></select></Field><Field label="Seta"><select value={draft.ticker.showArrow === false ? 'off' : 'on'} onChange={event => patchConfig({ ticker: { ...draft.ticker, showArrow: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
            <div className="hero-cms-grid colors"><Field label="Cor de fundo"><input type="color" value={draft.ticker.background || '#ef0011'} onChange={event => patchConfig({ ticker: { ...draft.ticker, background: event.target.value } })} /></Field><Field label="Cor do texto"><input type="color" value={draft.ticker.textColor || '#ffffff'} onChange={event => patchConfig({ ticker: { ...draft.ticker, textColor: event.target.value } })} /></Field><Field label="Cor do selo"><input type="color" value={draft.ticker.tagBackground || '#111111'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagBackground: event.target.value } })} /></Field><Field label="Texto do selo"><input type="color" value={draft.ticker.tagTextColor || '#ffffff'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagTextColor: event.target.value } })} /></Field></div>
          </Accordion>

          <Accordion id="linking" title="Vinculação de conteúdo" description="Vincule a uma notícia ou conteúdo existente" open={openAccordion === 'linking'} onToggle={toggleAccordion}>
            <Field label="Conteúdo vinculado"><select value={slide.articleId} onChange={event => { const article = heroArticles.find(item => item.id === event.target.value); if (article) updateSlide(applyArticleToSlide(slide, article)); else updateSlide({ articleId: '' }) }}><option value="">Sem vínculo</option>{heroArticles.map(article => <option value={article.id} key={article.id}>{article.title}</option>)}</select></Field>
          </Accordion>

          <Accordion id="publication" title="Publicação" description="Status e agendamento de publicação" open={openAccordion === 'publication'} onToggle={toggleAccordion}>
            <div className="hero-cms-grid two"><Field label="Status"><select value={slide.status} onChange={event => updateSlide({ status: event.target.value as HeroSlide['status'] })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field><Field label="Agendar para"><input type="datetime-local" value={slide.scheduledAt} onChange={event => updateSlide({ scheduledAt: event.target.value })} /></Field></div>
          </Accordion>
        </>}

        {tab === 'appearance' && <div className="hero-cms-tab-content">
          <div className="hero-cms-section-title"><div><h2>Aparência</h2><p>As mesmas propriedades visuais já existentes, reorganizadas por responsabilidade.</p></div><button className="button outline" onClick={() => { setAppearance({ ...defaultHeroAppearance }); markDirty() }}><RotateCcw size={15} /> Restaurar aparência</button></div>
          <section className="hero-cms-group"><h3>Dimensões</h3><div className="hero-cms-grid two"><Field label={`Largura · ${appearance.width <= 100 ? 'Auto' : `${appearance.width}px`}`}><input type="range" min="100" max="1600" value={appearance.width <= 100 ? 100 : appearance.width} onChange={event => patchAppearance({ width: Number(event.target.value) })} /></Field><Field label={`Altura · ${appearance.height}px`}><input type="range" min="300" max="1000" value={appearance.height} onChange={event => patchAppearance({ height: Number(event.target.value) })} /></Field></div></section>
          <section className="hero-cms-group"><h3>Alinhamento</h3><div className="hero-cms-grid two"><Field label="Horizontal"><select value={appearance.contentAlign} onChange={event => patchAppearance({ contentAlign: event.target.value as HeroAppearanceConfig['contentAlign'] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><Field label="Vertical"><select value={appearance.verticalAlign} onChange={event => patchAppearance({ verticalAlign: event.target.value as HeroAppearanceConfig['verticalAlign'] })}><option value="start">Topo</option><option value="center">Centro</option><option value="end">Base</option></select></Field></div></section>
          <section className="hero-cms-group"><h3>Espaçamento</h3><div className="hero-cms-grid two"><Field label={`Padding horizontal · ${appearance.paddingX}px`}><input type="range" min="0" max="120" value={appearance.paddingX} onChange={event => patchAppearance({ paddingX: Number(event.target.value) })} /></Field><Field label={`Padding vertical · ${appearance.paddingY}px`}><input type="range" min="0" max="120" value={appearance.paddingY} onChange={event => patchAppearance({ paddingY: Number(event.target.value) })} /></Field><Field label={`Arredondamento · ${appearance.radius}px`}><input type="range" min="0" max="48" value={appearance.radius} onChange={event => patchAppearance({ radius: Number(event.target.value) })} /></Field></div></section>
          <section className="hero-cms-group"><h3>Cores</h3><div className="hero-cms-grid colors">{([['background', 'Background'], ['textColor', 'Texto'], ['titleColor', 'Headline'], ['accentColor', 'Destaque / CTA'], ['borderColor', 'Borda'], ['eyebrowColor', 'Eyebrow']] as const).map(([field, label]) => <Field label={label} key={field}><span className="hero-cms-color"><input type="color" value={appearance[field]} onChange={event => patchAppearance({ [field]: event.target.value } as Partial<HeroAppearanceConfig>)} /><input value={appearance[field]} onChange={event => patchAppearance({ [field]: event.target.value } as Partial<HeroAppearanceConfig>)} /></span></Field>)}</div></section>
          <section className="hero-cms-group"><h3>Tipografia</h3><div className="hero-cms-grid two"><Field label={`Eyebrow · ${appearance.eyebrowSize}px`}><input type="range" min="9" max="28" value={appearance.eyebrowSize} onChange={event => patchAppearance({ eyebrowSize: Number(event.target.value) })} /></Field><Field label={`Descrição · ${appearance.descriptionSize}px`}><input type="range" min="11" max="32" value={appearance.descriptionSize} onChange={event => patchAppearance({ descriptionSize: Number(event.target.value) })} /></Field><Field label={`CTAs · ${appearance.ctaSize}px`}><input type="range" min="10" max="24" value={appearance.ctaSize} onChange={event => patchAppearance({ ctaSize: Number(event.target.value) })} /></Field><Field label="Peso eyebrow"><select value={appearance.eyebrowWeight} onChange={event => patchAppearance({ eyebrowWeight: Number(event.target.value) })}><option value="400">400</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></Field><Field label="Peso descrição"><select value={appearance.descriptionWeight} onChange={event => patchAppearance({ descriptionWeight: Number(event.target.value) })}><option value="300">300</option><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option></select></Field><Field label="Peso CTAs"><select value={appearance.ctaWeight} onChange={event => patchAppearance({ ctaWeight: Number(event.target.value) })}><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></Field></div></section>
        </div>}

        {tab === 'behavior' && <div className="hero-cms-tab-content"><div className="hero-cms-section-title"><div><h2>Comportamento</h2><p>Configurações globais do carrossel, sem misturar com um destaque individual.</p></div></div><section className="hero-cms-group"><div className="hero-cms-grid two"><Field label="Autoplay"><select value={draft.autoplay ? 'on' : 'off'} onChange={event => patchConfig({ autoplay: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field><Field label="Intervalo (segundos)"><input type="number" min="3" max="60" value={Math.max(3, Math.round(draft.intervalMs / 1000))} onChange={event => patchConfig({ intervalMs: Math.max(3000, Number(event.target.value) * 1000) })} /></Field><Field label="Navegação"><select value={draft.navigation || 'arrows-dots'} onChange={event => patchConfig({ navigation: event.target.value as HeroCarouselConfig['navigation'] })}><option value="arrows-dots">Setas + pontos</option><option value="arrows">Somente setas</option><option value="dots">Somente pontos</option><option value="none">Sem navegação</option></select></Field><Field label="Loop"><select value={draft.loop === false ? 'off' : 'on'} onChange={event => patchConfig({ loop: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field></div></section></div>}
      </main>

      <aside className="hero-cms-preview-column">
        <div className="hero-cms-preview-head"><div><h2>Preview em tempo real</h2><p>Mesmo componente utilizado pela Home.</p></div><div className="hero-cms-viewports"><button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')} aria-label="Desktop"><Monitor size={17} /></button><button className={viewport === 'tablet' ? 'active' : ''} onClick={() => setViewport('tablet')} aria-label="Tablet"><Tablet size={17} /></button><button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')} aria-label="Mobile"><Smartphone size={17} /></button></div></div>
        <div className={previewClass}><HeroSection config={draft} appearance={appearance} previewIndex={selectedIndex} disableAutoplay /></div>
      </aside>
    </div>

    <div className="hero-cms-savebar"><div><span className={`hero-cms-unsaved-dot ${dirty ? 'dirty' : ''}`} /><strong>{dirty ? 'Alterações não salvas' : saved ? 'Alterações salvas' : 'Sem alterações pendentes'}</strong><small>{dirty ? 'Revise o preview antes de publicar.' : 'O estado salvo continua sendo usado pela Home.'}</small></div><div><button className="button outline" onClick={discard} disabled={!dirty}>Descartar alterações</button><button className="button dark hero-cms-save" onClick={save} disabled={!dirty}><Save size={16} /> Salvar alterações</button></div></div>

    {libraryOpen && <div className="hero-cms-modal-backdrop" role="presentation" onMouseDown={() => setLibraryOpen(false)}><div className="hero-cms-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia" onMouseDown={event => event.stopPropagation()}><div className="hero-cms-section-title"><div><h2>Biblioteca de mídia</h2><p>Imagens já disponíveis nos conteúdos do portal.</p></div><button className="hero-cms-icon" onClick={() => setLibraryOpen(false)}>×</button></div><div className="hero-cms-library">{heroArticles.filter(article => article.image).map(article => <button key={article.id} onClick={() => { updateSlide({ image: article.image, imageAlt: article.imageAlt || article.title, imageVisible: true }); setLibraryOpen(false) }}><img src={article.image} alt="" /><span>{article.title}</span></button>)}</div></div></div>}
  </div>
}
