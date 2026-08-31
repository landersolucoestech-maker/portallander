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
  AUTO_HERO_IMAGE_VISUAL,
  clearSlideVisualOverrides,
  defaultHeroSlide,
  getAutomaticSlideVisual,
  hasSlideVisualOverride,
  heroArticles,
  readHeroConfig,
  resolveSlideVisual,
  resolveTitleSegmentVisual,
  setSlideVisualOverride,
  writeHeroConfig,
  type HeroCarouselConfig,
  type HeroCta,
  type HeroSlide,
  type HeroSlideResponsiveVisual,
  type HeroTitleSegment,
  type HeroTitleSegmentVisual,
} from '../models/heroModel'
import {
  clearHeroAppearanceOverride,
  defaultHeroAppearance,
  hasHeroAppearanceOverride,
  readHeroAppearance,
  resolveHeroAppearance,
  setHeroAppearanceOverride,
  writeHeroAppearance,
  type HeroAppearanceConfig,
  type HeroBreakpoint,
  type HeroResponsiveAppearance,
} from '../models/heroAppearanceModel'
import '../styles/hero-editor-cms.css'

type EditorTab = 'content' | 'appearance' | 'behavior'
type AccordionKey = 'content' | 'media' | 'ctas' | 'ticker' | 'linking' | 'publication'
type NumericVisualKey = keyof HeroSlideResponsiveVisual

type FieldProps = { label: ReactNode; children: ReactNode; hint?: string }

function Field({ label, children, hint }: FieldProps) {
  return <label className="hero-cms-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function DeviceBadge({ breakpoint, overridden }: { breakpoint: HeroBreakpoint; overridden?: boolean }) {
  if (breakpoint === 'desktop') return <em className="hero-cms-device-badge base">Base · Desktop</em>
  return <em className={`hero-cms-device-badge ${overridden ? 'override' : 'inherited'}`}>{overridden ? `Sobrescrito · ${breakpoint === 'tablet' ? 'Tablet' : 'Mobile'}` : 'Automático · herdado'}</em>
}

function ResponsiveLabel({ text, breakpoint, overridden }: { text: string; breakpoint: HeroBreakpoint; overridden?: boolean }) {
  return <span className="hero-cms-responsive-label"><b>{text}</b><DeviceBadge breakpoint={breakpoint} overridden={overridden} /></span>
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

function uniqueStamp() { return Date.now() }

function makeSlide(order: number): HeroSlide {
  const stamp = uniqueStamp()
  return {
    ...defaultHeroSlide,
    ...AUTO_HERO_IMAGE_VISUAL,
    id: `hero-slide-${stamp}`,
    order,
    responsive: { tablet: {}, mobile: {} },
    title: defaultHeroSlide.title.map(item => ({ ...item, visible: item.visible !== false, responsive: {} })),
    ctas: (defaultHeroSlide.ctas || []).map(item => ({ ...item, id: `${item.id}-${stamp}` })),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function signed(value: number, suffix = '') {
  const normalized = Math.abs(value) < .005 ? 0 : value
  return `${normalized > 0 ? '+' : ''}${normalized}${suffix}`
}

function getVisualBaseline(slide: HeroSlide, breakpoint: HeroBreakpoint): Required<HeroSlideResponsiveVisual> {
  if (breakpoint === 'desktop') return { ...AUTO_HERO_IMAGE_VISUAL }
  return getAutomaticSlideVisual(slide, breakpoint)
}

async function optimizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = objectUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada.'))
    })

    const render = (factor: number, quality: number) => {
      const widthLimit = Math.max(256, maxWidth) * factor
      const heightLimit = Math.max(256, maxHeight) * factor
      const ratio = Math.min(1, widthLimit / image.naturalWidth, heightLimit / image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas indisponível para otimização da imagem.')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/webp', quality)
    }

    let dataUrl = render(1, .9)
    if (dataUrl.length > 3_200_000) dataUrl = render(.82, .84)
    if (dataUrl.length > 3_200_000) dataUrl = render(.68, .78)
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
  const [viewport, setViewport] = useState<HeroBreakpoint>('desktop')
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
  const effectiveAppearance = resolveHeroAppearance(appearance, viewport)
  const effectiveVisual = resolveSlideVisual(slide, viewport)
  const visualBaseline = getVisualBaseline(slide, viewport)
  const positionXAdjustment = Math.round(effectiveVisual.imagePositionX - visualBaseline.imagePositionX)
  const positionYAdjustment = Math.round(effectiveVisual.imagePositionY - visualBaseline.imagePositionY)
  const offsetXAdjustment = Math.round(effectiveVisual.imageOffsetX - visualBaseline.imageOffsetX)
  const offsetYAdjustment = Math.round(effectiveVisual.imageOffsetY - visualBaseline.imageOffsetY)
  const zoomAdjustment = visualBaseline.imageScale > 0 ? Math.round(((effectiveVisual.imageScale / visualBaseline.imageScale) - 1) * 100) : 0

  const markDirty = () => { setDirty(true); setSaved(false) }
  const patchConfig = (patch: Partial<HeroCarouselConfig>) => { setDraft(current => ({ ...current, ...patch })); markDirty() }
  const patchAppearance = (patch: Partial<HeroAppearanceConfig>) => { setAppearance(current => ({ ...current, ...patch })); markDirty() }
  const updateSlide = (patch: Partial<HeroSlide>) => {
    setDraft(current => ({ ...current, slides: current.slides.map(item => item.id === slide.id ? { ...item, ...patch } : item) }))
    markDirty()
  }
  const toggleAccordion = (id: AccordionKey) => setOpenAccordion(id)

  const patchResponsiveAppearance = <K extends keyof HeroResponsiveAppearance>(key: K, value: HeroResponsiveAppearance[K]) => {
    setAppearance(current => setHeroAppearanceOverride(current, viewport, key, value))
    markDirty()
  }

  const patchSlideVisual = <K extends keyof HeroSlideResponsiveVisual>(key: K, value: HeroSlideResponsiveVisual[K]) => {
    updateSlide(setSlideVisualOverride(slide, viewport, key, value))
  }

  const patchVisualAdjustment = (key: Exclude<NumericVisualKey, 'imageScale'>, adjustment: number) => {
    const baseline = visualBaseline[key]
    const next = key === 'imagePositionX' || key === 'imagePositionY'
      ? clamp(baseline + adjustment, 0, 100)
      : baseline + adjustment
    patchSlideVisual(key, next)
  }

  const patchZoomAdjustment = (adjustmentPercent: number) => {
    const nextScale = Math.max(.1, visualBaseline.imageScale * (1 + adjustmentPercent / 100))
    patchSlideVisual('imageScale', Number(nextScale.toFixed(4)))
  }

  const resetImageAdjustments = () => {
    if (viewport === 'desktop') {
      updateSlide({ ...AUTO_HERO_IMAGE_VISUAL })
      return
    }
    updateSlide(clearSlideVisualOverrides(slide, viewport))
  }

  const resetAllImageBreakpoints = (image: string, imageAlt: string) => {
    updateSlide({
      image,
      imageAlt,
      imageVisible: true,
      ...AUTO_HERO_IMAGE_VISUAL,
      responsive: { tablet: {}, mobile: {} },
    })
  }

  const updateSegment = (index: number, patch: Partial<HeroTitleSegment>) => {
    updateSlide({ title: slide.title.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })
  }

  const updateSegmentVisual = (index: number, key: keyof HeroTitleSegmentVisual, value: number | undefined) => {
    const segment = slide.title[index]
    if (viewport === 'desktop') {
      updateSegment(index, { [key]: value })
      return
    }
    updateSegment(index, { responsive: { ...(segment.responsive || {}), [viewport]: { ...(segment.responsive?.[viewport] || {}), [key]: value } } })
  }

  const resetSegmentVisual = (index: number, key: keyof HeroTitleSegmentVisual) => {
    if (viewport === 'desktop') return
    const segment = slide.title[index]
    const current = { ...(segment.responsive?.[viewport] || {}) }
    delete current[key]
    updateSegment(index, { responsive: { ...(segment.responsive || {}), [viewport]: current } })
  }

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

  const resetCurrentDevice = () => {
    if (viewport === 'desktop') return
    setAppearance(current => clearHeroAppearanceOverride(current, viewport))
    updateSlide(clearSlideVisualOverrides(slide, viewport))
    const title = slide.title.map(segment => ({ ...segment, responsive: { ...(segment.responsive || {}), [viewport]: {} } }))
    updateSlide({ title })
    markDirty()
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
      responsive: { tablet: { ...(target.responsive?.tablet || {}) }, mobile: { ...(target.responsive?.mobile || {}) } },
      title: target.title.map(item => ({ ...item, responsive: { tablet: { ...(item.responsive?.tablet || {}) }, mobile: { ...(item.responsive?.mobile || {}) } } })),
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
    updateSlide({ ctas: next, primaryCtaLabel: primary?.label || slide.primaryCtaLabel, primaryCtaUrl: primary?.url || slide.primaryCtaUrl, secondaryCtaLabel: secondary?.label || slide.secondaryCtaLabel, secondaryCtaUrl: secondary?.url || slide.secondaryCtaUrl })
  }

  const addCta = () => updateSlide({ ctas: [...ctas, { id: `cta-${uniqueStamp()}`, active: true, label: 'NOVO CTA', url: '#', external: false, order: ctas.length + 1, variant: ctas.some(item => item.variant === 'primary') ? 'secondary' : 'primary' }] })
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
      const optimized = await optimizeImage(file, appearance.imageMaxWidth, appearance.imageMaxHeight)
      resetAllImageBreakpoints(optimized, slide.imageAlt || file.name.replace(/\.[^.]+$/, ''))
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewClass = `hero-cms-preview-stage ${viewport}`
  const selectedTitle = slide.title.filter(part => part.visible !== false).map(part => part.text).join(' ') || 'Sem headline'
  const deviceName = viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile'
  const deviceHasOverrides = viewport !== 'desktop' && (hasHeroAppearanceOverride(appearance, viewport) || hasSlideVisualOverride(slide, viewport) || slide.title.some(segment => Object.keys(segment.responsive?.[viewport] || {}).length > 0))

  return <div className="hero-cms-editor">
    <div className="hero-cms-topbar"><div className="hero-cms-breadcrumb"><Link to="/app/site/secoes">← Seções das Páginas</Link><span className={`hero-cms-status ${appearance.active ? 'active' : ''}`}>{appearance.active ? 'Ativo' : 'Inativo'}</span></div><Link className="button outline" to="/" target="_blank">Ver no site <ExternalLink size={15} /></Link></div>

    <div className="hero-cms-tabs" role="tablist" aria-label="Configuração do Hero"><button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Conteúdo</button><button className={tab === 'appearance' ? 'active' : ''} onClick={() => setTab('appearance')}>Aparência</button><button className={tab === 'behavior' ? 'active' : ''} onClick={() => setTab('behavior')}>Comportamento</button></div>

    <div className="hero-cms-layout">
      <main className="hero-cms-panel">
        <div className={`hero-cms-device-context ${viewport}`}>
          <div><strong>{deviceName}</strong><span>{viewport === 'desktop' ? 'Configuração base. Tablet e Mobile herdam estes valores.' : deviceHasOverrides ? 'Responsivo automático com sobrescritas específicas neste dispositivo.' : 'Responsivo automático. Nenhuma sobrescrita específica neste dispositivo.'}</span></div>
          {viewport !== 'desktop' && <button className="button outline" onClick={resetCurrentDevice} disabled={!deviceHasOverrides}><RotateCcw size={14} /> Restaurar automático</button>}
        </div>

        {tab === 'content' && <>
          <div className="hero-cms-section-title"><div><h2>Destaques do Hero</h2><p>Conteúdo editorial é único. Somente propriedades visuais podem variar por dispositivo.</p></div><button className="button dark" onClick={addSlide}><Plus size={16} /> Novo destaque</button></div>
          <div className="hero-cms-slide-list">{ordered.map((item, index) => {
            const title = item.title.filter(part => part.visible !== false).map(part => part.text).join(' ') || 'Sem headline'
            return <div className={`hero-cms-slide-card ${item.id === slide.id ? 'active' : ''}`} key={item.id}><button type="button" className="hero-cms-slide-select" onClick={() => { setSelectedId(item.id); setSlideMenu(null) }}><strong>{String(index + 1).padStart(2, '0')}</strong><span><b>{title}</b><small>Ordem {item.order} · <em>{item.status === 'active' ? 'Ativo' : 'Inativo'}</em></small></span></button><GripVertical size={17} className="hero-cms-grip" aria-hidden="true" /><button className="hero-cms-icon" onClick={() => duplicateSlide(item)} aria-label={`Duplicar ${title}`}><Copy size={16} /></button><div className="hero-cms-menu-wrap"><button className="hero-cms-icon" onClick={() => setSlideMenu(current => current === item.id ? null : item.id)} aria-label={`Ações de ${title}`}><MoreVertical size={17} /></button>{slideMenu === item.id && <div className="hero-cms-menu"><button onClick={() => moveSlide(item, -1)} disabled={index === 0}><ChevronUp size={14} /> Subir</button><button onClick={() => moveSlide(item, 1)} disabled={index === ordered.length - 1}><ChevronDown size={14} /> Descer</button><button onClick={() => removeSlide(item)} disabled={ordered.length <= 1}><Trash2 size={14} /> Remover</button></div>}</div></div>
          })}</div>

          <div className="hero-cms-editing-label">Editando destaque: {String(selectedIndex + 1).padStart(2, '0')} — {selectedTitle}</div>

          <Accordion id="content" title="Conteúdo" description="Conteúdo único + tipografia responsiva da headline" open={openAccordion === 'content'} onToggle={toggleAccordion}>
            <div className="hero-cms-grid two"><Field label="Eyebrow"><input value={slide.eyebrow} onChange={event => updateSlide({ eyebrow: event.target.value })} /></Field><Field label="Visibilidade"><select value={slide.eyebrowVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ eyebrowVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
            <div className="hero-cms-segments">{slide.title.map((segment, index) => {
              const segmentVisual = resolveTitleSegmentVisual(segment, viewport)
              const sizeOverride = viewport !== 'desktop' && segment.responsive?.[viewport]?.fontSize !== undefined
              const weightOverride = viewport !== 'desktop' && segment.responsive?.[viewport]?.fontWeight !== undefined
              return <div className="hero-cms-segment" key={`${index}-${segment.text}`}>
                <input value={segment.text} onChange={event => updateSegment(index, { text: event.target.value })} />
                <input type="color" aria-label={`Cor do trecho ${index + 1}`} value={segment.color || (segment.emphasis ? '#ff151f' : '#ffffff')} onChange={event => updateSegment(index, { color: event.target.value })} />
                <label><input type="checkbox" checked={segment.visible !== false} onChange={event => updateSegment(index, { visible: event.target.checked })} /> Visível</label>
                <div className="hero-cms-compact-responsive"><span><DeviceBadge breakpoint={viewport} overridden={sizeOverride} /></span><input aria-label={`Tamanho do trecho em ${deviceName}`} type="number" min="20" max="140" placeholder="Auto" value={segmentVisual.fontSize || ''} onChange={event => updateSegmentVisual(index, 'fontSize', event.target.value ? Number(event.target.value) : undefined)} />{viewport !== 'desktop' && sizeOverride && <button onClick={() => resetSegmentVisual(index, 'fontSize')} aria-label="Restaurar tamanho automático"><RotateCcw size={13} /></button>}</div>
                <div className="hero-cms-compact-responsive"><span><DeviceBadge breakpoint={viewport} overridden={weightOverride} /></span><select value={segmentVisual.fontWeight || ''} onChange={event => updateSegmentVisual(index, 'fontWeight', event.target.value ? Number(event.target.value) : undefined)}><option value="">Peso padrão</option><option value="400">400</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select>{viewport !== 'desktop' && weightOverride && <button onClick={() => resetSegmentVisual(index, 'fontWeight')} aria-label="Restaurar peso automático"><RotateCcw size={13} /></button>}</div>
                <div className="hero-cms-row-actions"><button onClick={() => moveSegment(index, -1)} disabled={index === 0}><ChevronUp size={14} /></button><button onClick={() => moveSegment(index, 1)} disabled={index === slide.title.length - 1}><ChevronDown size={14} /></button><button onClick={() => updateSlide({ title: slide.title.filter((_, itemIndex) => itemIndex !== index) })} disabled={slide.title.length <= 1}><Trash2 size={14} /></button></div>
              </div>
            })}</div>
            <button className="hero-cms-text-action" onClick={() => updateSlide({ title: [...slide.title, { text: 'NOVO TRECHO', emphasis: false, color: '#ffffff', visible: true, responsive: {} }] })}><Plus size={14} /> Adicionar trecho</button>
            <div className="hero-cms-grid two"><Field label="Descrição"><textarea rows={4} value={slide.description} onChange={event => updateSlide({ description: event.target.value })} /></Field><Field label="Exibir descrição"><select value={slide.descriptionVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ descriptionVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Assinatura editorial"><input value={slide.mediaCaption} onChange={event => updateSlide({ mediaCaption: event.target.value })} /></Field><Field label="Exibir assinatura"><select value={slide.mediaCaptionVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ mediaCaptionVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
          </Accordion>

          <Accordion id="media" title="Mídia principal" description={`Auto-fit por proporção + ajustes neutros em ${deviceName}`} open={openAccordion === 'media'} onToggle={toggleAccordion}>
            <div className="hero-cms-media-preview">{slide.image && slide.imageVisible !== false ? <img src={slide.image} alt={slide.imageAlt || 'Preview da imagem principal'} style={{ objectFit: 'contain', objectPosition: `${effectiveVisual.imagePositionX}% ${effectiveVisual.imagePositionY}%`, transform: `scale(${Math.min(effectiveVisual.imageScale, 1.8)})`, transformOrigin: 'center bottom' }} /> : <ImageIcon size={34} />}</div>
            <div className="hero-cms-inline-actions"><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => void upload(event.target.files?.[0])} /><button className="button outline" disabled={uploading} onClick={() => fileRef.current?.click()}><Upload size={15} /> {uploading ? 'Processando...' : 'Fazer upload'}</button><button className="button outline" onClick={() => setLibraryOpen(true)}><ImageIcon size={15} /> Biblioteca de mídia</button><button className="button outline" onClick={() => updateSlide({ image: '', imageVisible: false })}><Trash2 size={15} /> Remover imagem</button></div>
            <div className="hero-cms-grid two"><Field label="Exibir imagem"><select value={slide.imageVisible === false ? 'off' : 'on'} onChange={event => updateSlide({ imageVisible: event.target.value === 'on' })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Texto alternativo"><input value={slide.imageAlt} onChange={event => updateSlide({ imageAlt: event.target.value })} /></Field></div>
            <p className="hero-cms-group-note">Upload automático: preserva proporção, respeita o limite global de {appearance.imageMaxWidth} × {appearance.imageMaxHeight}px e reinicia o enquadramento para a composição automática em todos os breakpoints.</p>
            <div className="hero-cms-inline-actions"><button className="button outline" type="button" onClick={resetImageAdjustments}><RotateCcw size={14} /> Zerar ajustes da imagem</button><small>Zero mantém a composição automática do dispositivo. A base visual permanece ancorada no Hero.</small></div>
            <details className="hero-cms-details" open><summary>Ajustar enquadramento · {deviceName}</summary><div className="hero-cms-grid two">
              <Field label={<ResponsiveLabel text={`Posição X · ${signed(positionXAdjustment)}`} breakpoint={viewport} overridden={hasSlideVisualOverride(slide, viewport, 'imagePositionX')} />} hint={`0 = posição automática. Efetivo: ${Math.round(effectiveVisual.imagePositionX)}%.`}><input type="range" min="-50" max="50" value={positionXAdjustment} onChange={event => patchVisualAdjustment('imagePositionX', Number(event.target.value))} /></Field>
              <Field label={<ResponsiveLabel text={`Posição Y · ${signed(positionYAdjustment)}`} breakpoint={viewport} overridden={hasSlideVisualOverride(slide, viewport, 'imagePositionY')} />} hint={`0 = alinhamento inferior automático. Efetivo: ${Math.round(effectiveVisual.imagePositionY)}%.`}><input type="range" min="-100" max="0" value={positionYAdjustment} onChange={event => patchVisualAdjustment('imagePositionY', Number(event.target.value))} /></Field>
            </div></details>
            <details className="hero-cms-details"><summary>Ajustes avançados · {deviceName}</summary><div className="hero-cms-grid two">
              <Field label={<ResponsiveLabel text={`Zoom · ${signed(zoomAdjustment, '%')}`} breakpoint={viewport} overridden={hasSlideVisualOverride(slide, viewport, 'imageScale')} />} hint={`0% = escala automática (${visualBaseline.imageScale.toFixed(2)}x). Efetivo: ${effectiveVisual.imageScale.toFixed(2)}x.`}><input type="range" min="-80" max="150" step="1" value={zoomAdjustment} onChange={event => patchZoomAdjustment(Number(event.target.value))} /></Field>
              <Field label={<ResponsiveLabel text={`Offset X · ${signed(offsetXAdjustment, 'px')}`} breakpoint={viewport} overridden={hasSlideVisualOverride(slide, viewport, 'imageOffsetX')} />} hint={`0px = sem deslocamento horizontal adicional. Efetivo: ${Math.round(effectiveVisual.imageOffsetX)}px.`}><input type="range" min="-500" max="500" value={offsetXAdjustment} onChange={event => patchVisualAdjustment('imageOffsetX', Number(event.target.value))} /></Field>
              <Field label={<ResponsiveLabel text={`Offset Y · ${signed(offsetYAdjustment, 'px')}`} breakpoint={viewport} overridden={hasSlideVisualOverride(slide, viewport, 'imageOffsetY')} />} hint={`0px = base rente ao Hero. Valores positivos descem/cortam; negativos sobem a imagem.`}><input type="range" min="-500" max="500" value={offsetYAdjustment} onChange={event => patchVisualAdjustment('imageOffsetY', Number(event.target.value))} /></Field>
            </div></details>
          </Accordion>

          <Accordion id="ctas" title="Ações (CTAs)" description="Conteúdo único; dimensões responsivas ficam em Aparência" open={openAccordion === 'ctas'} onToggle={toggleAccordion}>
            <div className="hero-cms-cta-list">{ctas.map((cta, index) => <div className="hero-cms-cta-card" key={cta.id}><div className="hero-cms-cta-summary"><strong>{cta.label || `CTA ${index + 1}`}</strong><small>{cta.url || 'Sem destino'} · {cta.active ? 'Ativo' : 'Oculto'} · {cta.variant === 'primary' ? 'Primário' : 'Secundário'}</small></div><div className="hero-cms-grid two"><Field label="Texto"><input value={cta.label} onChange={event => updateCta(cta.id, { label: event.target.value })} /></Field><Field label="URL / destino"><input value={cta.url} onChange={event => updateCta(cta.id, { url: event.target.value })} /></Field><Field label="Status"><select value={cta.active ? 'on' : 'off'} onChange={event => updateCta(cta.id, { active: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Oculto</option></select></Field><Field label="Abertura"><select value={cta.external ? 'external' : 'internal'} onChange={event => updateCta(cta.id, { external: event.target.value === 'external' })}><option value="internal">Interna</option><option value="external">Externa</option></select></Field><Field label="Estilo"><select value={cta.variant} onChange={event => updateCta(cta.id, { variant: event.target.value as HeroCta['variant'] })}><option value="primary">Primário</option><option value="secondary">Secundário</option></select></Field></div><div className="hero-cms-row-actions"><button onClick={() => moveCta(cta.id, -1)} disabled={index === 0}><ChevronUp size={14} /> Subir</button><button onClick={() => moveCta(cta.id, 1)} disabled={index === ctas.length - 1}><ChevronDown size={14} /> Descer</button><button onClick={() => removeCta(cta.id)}><Trash2 size={14} /> Excluir</button></div></div>)}</div><button className="hero-cms-text-action" onClick={addCta}><Plus size={14} /> Adicionar CTA</button>
          </Accordion>

          <Accordion id="ticker" title="Barra “AGORA”" description="Conteúdo único da composição contínua Hero + AGORA" open={openAccordion === 'ticker'} onToggle={toggleAccordion}>
            <div className="hero-cms-grid two"><Field label="Status"><select value={draft.ticker.active ? 'on' : 'off'} onChange={event => patchConfig({ ticker: { ...draft.ticker, active: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Label principal"><input value={draft.ticker.label} onChange={event => patchConfig({ ticker: { ...draft.ticker, label: event.target.value } })} /></Field><Field label="Selo / tag"><input value={draft.ticker.tag || ''} onChange={event => patchConfig({ ticker: { ...draft.ticker, tag: event.target.value } })} /></Field><Field label="Exibir selo"><select value={draft.ticker.tagVisible === false ? 'off' : 'on'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagVisible: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field><Field label="Texto"><input value={draft.ticker.text} onChange={event => patchConfig({ ticker: { ...draft.ticker, text: event.target.value } })} /></Field><Field label="Destino / link"><input value={draft.ticker.url} onChange={event => patchConfig({ ticker: { ...draft.ticker, url: event.target.value } })} /></Field><Field label="Abertura"><select value={draft.ticker.external ? 'external' : 'internal'} onChange={event => patchConfig({ ticker: { ...draft.ticker, external: event.target.value === 'external' } })}><option value="internal">Interna</option><option value="external">Externa</option></select></Field><Field label="Seta"><select value={draft.ticker.showArrow === false ? 'off' : 'on'} onChange={event => patchConfig({ ticker: { ...draft.ticker, showArrow: event.target.value === 'on' } })}><option value="on">Exibir</option><option value="off">Ocultar</option></select></Field></div>
            <div className="hero-cms-grid colors"><Field label="Cor de fundo"><input type="color" value={draft.ticker.background || '#ef0011'} onChange={event => patchConfig({ ticker: { ...draft.ticker, background: event.target.value } })} /></Field><Field label="Cor do texto"><input type="color" value={draft.ticker.textColor || '#ffffff'} onChange={event => patchConfig({ ticker: { ...draft.ticker, textColor: event.target.value } })} /></Field><Field label="Cor do selo"><input type="color" value={draft.ticker.tagBackground || '#111111'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagBackground: event.target.value } })} /></Field><Field label="Texto do selo"><input type="color" value={draft.ticker.tagTextColor || '#ffffff'} onChange={event => patchConfig({ ticker: { ...draft.ticker, tagTextColor: event.target.value } })} /></Field></div>
          </Accordion>

          <Accordion id="linking" title="Vinculação de conteúdo" description="Vincule a uma notícia ou conteúdo existente" open={openAccordion === 'linking'} onToggle={toggleAccordion}><Field label="Conteúdo vinculado"><select value={slide.articleId} onChange={event => { const article = heroArticles.find(item => item.id === event.target.value); if (article) updateSlide(applyArticleToSlide(slide, article)); else updateSlide({ articleId: '' }) }}><option value="">Sem vínculo</option>{heroArticles.map(article => <option value={article.id} key={article.id}>{article.title}</option>)}</select></Field></Accordion>
          <Accordion id="publication" title="Publicação" description="Status e agendamento de publicação" open={openAccordion === 'publication'} onToggle={toggleAccordion}><div className="hero-cms-grid two"><Field label="Status"><select value={slide.status} onChange={event => updateSlide({ status: event.target.value as HeroSlide['status'] })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field><Field label="Agendar para"><input type="datetime-local" value={slide.scheduledAt} onChange={event => updateSlide({ scheduledAt: event.target.value })} /></Field></div></Accordion>
        </>}

        {tab === 'appearance' && <div className="hero-cms-tab-content">
          <div className="hero-cms-section-title"><div><h2>Aparência · {deviceName}</h2><p>{viewport === 'desktop' ? 'Valores base usados pelo Hero.' : 'Valores automáticos herdados do Desktop; alterar um controle cria sobrescrita apenas neste breakpoint.'}</p></div>{viewport === 'desktop' ? <button className="button outline" onClick={() => { setAppearance({ ...defaultHeroAppearance }); markDirty() }}><RotateCcw size={15} /> Restaurar aparência</button> : <button className="button outline" onClick={() => { setAppearance(current => clearHeroAppearanceOverride(current, viewport)); markDirty() }} disabled={!hasHeroAppearanceOverride(appearance, viewport)}><RotateCcw size={15} /> Herdar automático</button>}</div>

          {viewport === 'desktop' && <section className="hero-cms-group"><h3>Política global de imagem</h3><p className="hero-cms-group-note">Limite aplicado no upload sem deformar a imagem. Imagens menores não são ampliadas.</p><div className="hero-cms-grid two"><Field label={`Largura máxima · ${appearance.imageMaxWidth}px`}><input type="number" min="256" max="6000" step="100" value={appearance.imageMaxWidth} onChange={event => patchAppearance({ imageMaxWidth: clamp(Number(event.target.value), 256, 6000) })} /></Field><Field label={`Altura máxima · ${appearance.imageMaxHeight}px`}><input type="number" min="256" max="6000" step="100" value={appearance.imageMaxHeight} onChange={event => patchAppearance({ imageMaxHeight: clamp(Number(event.target.value), 256, 6000) })} /></Field></div></section>}

          <section className="hero-cms-group"><h3>Dimensões e composição</h3><div className="hero-cms-grid two">
            {viewport === 'desktop' && <Field label={`Largura · ${appearance.width <= 100 ? 'Auto' : `${appearance.width}px`}`}><input type="range" min="100" max="1600" value={appearance.width <= 100 ? 100 : appearance.width} onChange={event => patchAppearance({ width: Number(event.target.value) })} /></Field>}
            <Field label={<ResponsiveLabel text={`Altura · ${effectiveAppearance.height}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'height')} />}><input type="range" min="300" max="1000" value={effectiveAppearance.height} onChange={event => patchResponsiveAppearance('height', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Largura máx. headline · ${effectiveAppearance.titleMaxWidth}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'titleMaxWidth')} />}><input type="range" min="240" max="900" value={effectiveAppearance.titleMaxWidth} onChange={event => patchResponsiveAppearance('titleMaxWidth', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Largura máx. descrição · ${effectiveAppearance.descriptionMaxWidth}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'descriptionMaxWidth')} />}><input type="range" min="220" max="760" value={effectiveAppearance.descriptionMaxWidth} onChange={event => patchResponsiveAppearance('descriptionMaxWidth', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Largura da imagem · ${effectiveAppearance.mediaWidthPercent}%`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'mediaWidthPercent')} />}><input type="range" min="40" max="100" value={effectiveAppearance.mediaWidthPercent} onChange={event => patchResponsiveAppearance('mediaWidthPercent', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Altura da área de imagem · ${effectiveAppearance.mediaMinHeight}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'mediaMinHeight')} />}><input type="range" min="240" max="900" value={effectiveAppearance.mediaMinHeight} onChange={event => patchResponsiveAppearance('mediaMinHeight', Number(event.target.value))} /></Field>
          </div></section>

          <section className="hero-cms-group"><h3>Alinhamento</h3><div className="hero-cms-grid two"><Field label={<ResponsiveLabel text="Horizontal" breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'contentAlign')} />}><select value={effectiveAppearance.contentAlign} onChange={event => patchResponsiveAppearance('contentAlign', event.target.value as HeroResponsiveAppearance['contentAlign'])}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><Field label={<ResponsiveLabel text="Vertical" breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'verticalAlign')} />}><select value={effectiveAppearance.verticalAlign} onChange={event => patchResponsiveAppearance('verticalAlign', event.target.value as HeroResponsiveAppearance['verticalAlign'])}><option value="start">Topo</option><option value="center">Centro</option><option value="end">Base</option></select></Field></div></section>

          <section className="hero-cms-group"><h3>Espaçamento</h3><div className="hero-cms-grid two">
            {([['paddingX', 'Padding horizontal', 0, 120], ['paddingY', 'Padding vertical', 0, 120], ['contentPaddingTop', 'Padding conteúdo superior', 0, 140], ['contentPaddingBottom', 'Padding conteúdo inferior', 0, 140], ['contentGap', 'Espaço entre textos', 0, 60], ['contentMediaGap', 'Distância texto ↔ imagem', 0, 120], ['ctaGap', 'Espaço entre CTAs', 0, 50], ['ctaHeight', 'Altura dos CTAs', 34, 80], ['ctaPaddingX', 'Padding horizontal CTA', 8, 50], ['radius', 'Arredondamento', 0, 48]] as const).map(([key, label, min, max]) => <Field key={key} label={<ResponsiveLabel text={`${label} · ${effectiveAppearance[key]}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, key)} />}><input type="range" min={min} max={max} value={effectiveAppearance[key]} onChange={event => patchResponsiveAppearance(key, Number(event.target.value))} /></Field>)}
          </div></section>

          <section className="hero-cms-group"><h3>Cores globais</h3><p className="hero-cms-group-note">Cores são conteúdo visual global do mesmo Hero e não variam por dispositivo.</p><div className="hero-cms-grid colors">{([['background', 'Background'], ['textColor', 'Texto'], ['titleColor', 'Headline'], ['accentColor', 'Destaque / CTA'], ['borderColor', 'Borda'], ['eyebrowColor', 'Eyebrow']] as const).map(([field, label]) => <Field label={label} key={field}><span className="hero-cms-color"><input type="color" value={appearance[field]} onChange={event => patchAppearance({ [field]: event.target.value } as Partial<HeroAppearanceConfig>)} /><input value={appearance[field]} onChange={event => patchAppearance({ [field]: event.target.value } as Partial<HeroAppearanceConfig>)} /></span></Field>)}</div></section>

          <section className="hero-cms-group"><h3>Tipografia responsiva</h3><div className="hero-cms-grid two">
            <Field label={<ResponsiveLabel text={`Eyebrow · ${effectiveAppearance.eyebrowSize}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'eyebrowSize')} />}><input type="range" min="9" max="28" value={effectiveAppearance.eyebrowSize} onChange={event => patchResponsiveAppearance('eyebrowSize', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Descrição · ${effectiveAppearance.descriptionSize}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'descriptionSize')} />}><input type="range" min="11" max="32" value={effectiveAppearance.descriptionSize} onChange={event => patchResponsiveAppearance('descriptionSize', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`CTAs · ${effectiveAppearance.ctaSize}px`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'ctaSize')} />}><input type="range" min="10" max="24" value={effectiveAppearance.ctaSize} onChange={event => patchResponsiveAppearance('ctaSize', Number(event.target.value))} /></Field>
            <Field label={<ResponsiveLabel text={`Line-height headline · ${effectiveAppearance.titleLineHeight.toFixed(2)}`} breakpoint={viewport} overridden={hasHeroAppearanceOverride(appearance, viewport, 'titleLineHeight')} />}><input type="range" min="0.65" max="1.25" step="0.01" value={effectiveAppearance.titleLineHeight} onChange={event => patchResponsiveAppearance('titleLineHeight', Number(event.target.value))} /></Field>
          </div></section>
        </div>}

        {tab === 'behavior' && <div className="hero-cms-tab-content"><div className="hero-cms-section-title"><div><h2>Comportamento</h2><p>Configurações globais do carrossel. Não variam por breakpoint.</p></div></div><section className="hero-cms-group"><div className="hero-cms-grid two"><Field label="Autoplay"><select value={draft.autoplay ? 'on' : 'off'} onChange={event => patchConfig({ autoplay: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field><Field label="Intervalo (segundos)"><input type="number" min="3" max="60" value={Math.max(3, Math.round(draft.intervalMs / 1000))} onChange={event => patchConfig({ intervalMs: Math.max(3000, Number(event.target.value) * 1000) })} /></Field><Field label="Navegação"><select value={draft.navigation || 'arrows-dots'} onChange={event => patchConfig({ navigation: event.target.value as HeroCarouselConfig['navigation'] })}><option value="arrows-dots">Setas + pontos</option><option value="arrows">Somente setas</option><option value="dots">Somente pontos</option><option value="none">Sem navegação</option></select></Field><Field label="Loop"><select value={draft.loop === false ? 'off' : 'on'} onChange={event => patchConfig({ loop: event.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field></div></section></div>}
      </main>

      <aside className="hero-cms-preview-column"><div className="hero-cms-preview-head"><div><h2>Preview em tempo real</h2><p>{deviceName}: breakpoint real + valores herdados/sobrescritos.</p></div><div className="hero-cms-viewports"><button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')} aria-label="Desktop"><Monitor size={17} /></button><button className={viewport === 'tablet' ? 'active' : ''} onClick={() => setViewport('tablet')} aria-label="Tablet"><Tablet size={17} /></button><button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')} aria-label="Mobile"><Smartphone size={17} /></button></div></div><div className={previewClass}><HeroSection config={draft} appearance={appearance} previewIndex={selectedIndex} previewViewport={viewport} disableAutoplay /></div></aside>
    </div>

    <div className="hero-cms-savebar"><div><span className={`hero-cms-unsaved-dot ${dirty ? 'dirty' : ''}`} /><strong>{dirty ? 'Alterações não salvas' : saved ? 'Alterações salvas' : 'Sem alterações pendentes'}</strong><small>{dirty ? 'Revise Desktop, Tablet e Mobile antes de publicar.' : 'O estado salvo continua sendo usado pela Home.'}</small></div><div><button className="button outline" onClick={discard} disabled={!dirty}>Descartar alterações</button><button className="button dark hero-cms-save" onClick={save} disabled={!dirty}><Save size={16} /> Salvar alterações</button></div></div>

    {libraryOpen && <div className="hero-cms-modal-backdrop" role="presentation" onMouseDown={() => setLibraryOpen(false)}><div className="hero-cms-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia" onMouseDown={event => event.stopPropagation()}><div className="hero-cms-section-title"><div><h2>Biblioteca de mídia</h2><p>Imagens já disponíveis nos conteúdos do portal.</p></div><button className="hero-cms-icon" onClick={() => setLibraryOpen(false)}>×</button></div><div className="hero-cms-library">{heroArticles.filter(article => article.image).map(article => <button key={article.id} onClick={() => { resetAllImageBreakpoints(article.image, article.imageAlt || article.title); setLibraryOpen(false) }}><img src={article.image} alt="" /><span>{article.title}</span></button>)}</div></div></div>}
  </div>
}
