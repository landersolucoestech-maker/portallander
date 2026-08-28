import { Image as ImageIcon, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { defaultNewsAdConfig, isNewsAdValid, readNewsAdConfig, resetNewsAdConfig, writeNewsAdConfig, type NewsAdConfig } from './newsAdModel'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="home-ad-editor-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

async function optimizeImage(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler imagem'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida'))
      img.onload = () => {
        const maxWidth = 2200
        const ratio = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * ratio))
        canvas.height = Math.max(1, Math.round(img.height * ratio))
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas indisponível'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', 0.88))
      }
      img.src = String(reader.result || '')
    }
    reader.readAsDataURL(file)
  })
}

export function NewsAdEditor() {
  const [draft, setDraft] = useState<NewsAdConfig>(() => readNewsAdConfig())
  const [saved, setSaved] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const backgroundRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<NewsAdConfig>) => {
    setSaved(false)
    setDraft(current => ({ ...current, ...patch }))
  }

  const upload = async (file: File | undefined, field: 'image' | 'background') => {
    if (!file || !file.type.startsWith('image/')) return
    setProcessing(true)
    try {
      const data=await optimizeImage(file)
      update(field==='image' ? { image:data, imageAlt:file.name } : { background:data })
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
      if (backgroundRef.current) backgroundRef.current.value = ''
    }
  }

  const save = () => {
    writeNewsAdConfig(draft)
    setSaved(true)
  }

  const reset = () => {
    resetNewsAdConfig()
    setDraft(defaultNewsAdConfig)
    setSaved(false)
  }

  const remove = () => {
    const cleared = { ...draft, active: false, image: '', background: '', title: '', subtitle: '', buttonLabel: '', buttonUrl: '' }
    setDraft(cleared)
    writeNewsAdConfig(cleared)
    setSaved(true)
  }

  const valid=isNewsAdValid(draft)

  return <div className="home-ad-editor">
    <div className="hero-editor-toolbar">
      <div><span>CONTEÚDO / NOTÍCIAS</span><h1>Publicidade lateral</h1><p>Gerencie o único slot publicitário lateral das duas primeiras linhas de Notícias. Quando estiver inativo, vazio ou fora do período programado, a listagem retorna automaticamente ao grid normal de quatro colunas.</p></div>
      <div className="hero-editor-toolbar-actions"><button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button><button className="button dark" onClick={save}><Save size={16}/> Salvar</button></div>
    </div>

    {saved && <div className="hero-editor-success">Publicidade de Notícias atualizada no estado frontend atual.</div>}

    <div className="home-ad-editor-layout">
      <section className="panel home-ad-editor-form">
        <div className="hero-editor-section-head"><span>Publicação</span><h2>Estado e programação</h2></div>
        <Field label="Visibilidade"><select value={draft.active ? 'on' : 'off'} onChange={e => update({ active: e.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field>
        <div className="hero-editor-grid two"><Field label="Data inicial"><input type="date" value={draft.startDate} onChange={e=>update({startDate:e.target.value})}/></Field><Field label="Data final"><input type="date" value={draft.endDate} onChange={e=>update({endDate:e.target.value})}/></Field></div>
        <div className="hero-editor-grid two"><Field label="Anunciante"><input value={draft.advertiser} onChange={e=>update({advertiser:e.target.value})} placeholder="Opcional"/></Field><Field label="Campanha"><input value={draft.campaign} onChange={e=>update({campaign:e.target.value})} placeholder="Opcional"/></Field></div>

        <div className="hero-editor-section-head"><span>Arte</span><h2>Imagem e background</h2></div>
        <div className="home-ad-image-picker">
          <div className="home-ad-image-preview">{draft.image ? <img src={draft.image} alt="Preview do anúncio" /> : <ImageIcon size={34}/>}</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => upload(e.target.files?.[0],'image')}/>
          <div className="home-ad-image-actions"><button className="button outline" disabled={processing} onClick={() => fileRef.current?.click()}><Upload size={16}/>{processing ? ' Processando...' : ' Imagem/banner'}</button><button className="button outline" disabled={!draft.image} onClick={() => update({ image: '' })}><Trash2 size={16}/> Remover</button></div>
        </div>
        <Field label="Texto alternativo"><input value={draft.imageAlt} onChange={e => update({ imageAlt: e.target.value })}/></Field>
        <input ref={backgroundRef} type="file" accept="image/*" hidden onChange={e=>upload(e.target.files?.[0],'background')}/>
        <div className="home-ad-image-actions"><button className="button outline" disabled={processing} onClick={()=>backgroundRef.current?.click()}><Upload size={16}/> Background</button><button className="button outline" disabled={!draft.background} onClick={()=>update({background:''})}><Trash2 size={16}/> Remover background</button></div>

        <div className="hero-editor-section-head"><span>Conteúdo</span><h2>Textos e CTA</h2></div>
        <Field label="Label"><input value={draft.label} onChange={e=>update({label:e.target.value})}/></Field>
        <Field label="Título"><input value={draft.title} onChange={e => update({ title: e.target.value })}/></Field>
        <Field label="Subtítulo"><textarea rows={3} value={draft.subtitle} onChange={e => update({ subtitle: e.target.value })}/></Field>
        <div className="hero-editor-grid two"><Field label="CTA"><input value={draft.buttonLabel} onChange={e => update({ buttonLabel: e.target.value })}/></Field><Field label="URL do CTA"><input value={draft.buttonUrl} onChange={e => update({ buttonUrl: e.target.value })}/></Field></div>
        <Field label="Abertura do CTA"><select value={draft.openInNewTab?'new':'same'} onChange={e=>update({openInNewTab:e.target.value==='new'})}><option value="same">Mesma aba</option><option value="new">Nova aba</option></select></Field>
        <Field label="Alinhamento"><select value={draft.align} onChange={e => update({ align: e.target.value as NewsAdConfig['align'] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field>

        <div className="home-ad-danger"><button onClick={remove}><Trash2 size={16}/> Excluir publicidade de Notícias</button><small>O slot fica inativo e o grid volta automaticamente para quatro colunas.</small></div>
      </section>

      <section className="home-ad-preview-panel"><div className="hero-editor-preview-head"><span>PREVIEW</span><strong>{valid?'Publicidade válida':'Slot inativo / sem campanha válida'}</strong></div><div className="home-ad-preview-frame news-ad-editor-preview">{valid?<div className={`news-sidebar-ad-content align-${draft.align}`} style={draft.background?{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.72)),url(${draft.background})`}:undefined}>{draft.image&&<img className="news-sidebar-ad-image" src={draft.image} alt={draft.imageAlt}/>}<div className="news-sidebar-ad-copy">{draft.label&&<span className="news-sidebar-ad-label">{draft.label}</span>}{draft.title&&<strong>{draft.title}</strong>}{draft.subtitle&&<p>{draft.subtitle}</p>}{draft.buttonLabel&&<a href={draft.buttonUrl||'#'} onClick={e=>e.preventDefault()}>{draft.buttonLabel}</a>}</div></div>:<div className="home-ad-empty-state">Sem publicidade ativa: a página usa 4 cards por linha.</div>}</div></section>
    </div>
  </div>
}
