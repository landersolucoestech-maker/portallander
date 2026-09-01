import { Image as ImageIcon, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { AdvertiseHereSection } from './AdvertiseHereSection'
import { defaultHomeAdConfig, readHomeAdConfig, resetHomeAdConfig, writeHomeAdConfig, type HomeAdConfig } from '../models/adModel'

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

export function HomeAdEditor() {
  const [draft, setDraft] = useState<HomeAdConfig>(() => readHomeAdConfig())
  const [saved, setSaved] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<HomeAdConfig>) => {
    setSaved(false)
    setDraft(current => ({ ...current, ...patch }))
  }

  const upload = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setProcessing(true)
    try {
      update({ image: await optimizeImage(file), imageAlt: file.name })
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = () => {
    writeHomeAdConfig(draft)
    setSaved(true)
  }

  const reset = () => {
    resetHomeAdConfig()
    setDraft(defaultHomeAdConfig)
    setSaved(false)
  }

  const remove = () => {
    const cleared = { ...draft, active: false, image: '', title: '', subtitle: '', buttonLabel: '', buttonUrl: '' }
    setDraft(cleared)
    writeHomeAdConfig(cleared)
    setSaved(true)
  }

  return <div className="home-ad-editor">
    <div className="hero-editor-toolbar">
      <div><span>CONTEÚDO / HOME</span><h1>Seção Anuncie Aqui</h1><p>Gerencie a Seção Anuncie Aqui da Home. As alterações atuais permanecem somente neste navegador até existir uma fonte persistente compartilhada.</p></div>
      <div className="hero-editor-toolbar-actions"><button className="button outline" onClick={reset}><RotateCcw size={16}/> Restaurar</button><button className="button dark" onClick={save}><Save size={16}/> Salvar localmente</button></div>
    </div>

    {saved && <div className="hero-editor-success">Seção Anuncie Aqui salva somente neste navegador. Nenhuma publicação compartilhada foi realizada.</div>}

    <div className="home-ad-editor-layout">
      <section className="panel home-ad-editor-form">
        <div className="hero-editor-section-head"><span>Publicação</span><h2>Estado da Seção Anuncie Aqui</h2></div>
        <Field label="Visibilidade"><select value={draft.active ? 'on' : 'off'} onChange={e => update({ active: e.target.value === 'on' })}><option value="on">Ativo</option><option value="off">Inativo</option></select></Field>

        <div className="hero-editor-section-head"><span>Imagem</span><h2>Arte da Seção Anuncie Aqui</h2></div>
        <div className="home-ad-image-picker">
          <div className="home-ad-image-preview">{draft.image ? <img src={draft.image} alt="Preview da Seção Anuncie Aqui" /> : <ImageIcon size={34}/>}</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => upload(e.target.files?.[0])}/>
          <div className="home-ad-image-actions"><button className="button outline" disabled={processing} onClick={() => fileRef.current?.click()}><Upload size={16}/>{processing ? ' Processando...' : ' Fazer upload'}</button><button className="button outline" disabled={!draft.image} onClick={() => update({ image: '' })}><Trash2 size={16}/> Remover imagem</button></div>
        </div>
        <Field label="Texto alternativo"><input value={draft.imageAlt} onChange={e => update({ imageAlt: e.target.value })}/></Field>

        <div className="hero-editor-section-head"><span>Conteúdo</span><h2>Textos e botão</h2></div>
        <Field label="Título"><input value={draft.title} onChange={e => update({ title: e.target.value })}/></Field>
        <Field label="Texto"><textarea rows={3} value={draft.subtitle} onChange={e => update({ subtitle: e.target.value })}/></Field>
        <div className="hero-editor-grid two"><Field label="Texto do botão"><input value={draft.buttonLabel} onChange={e => update({ buttonLabel: e.target.value })}/></Field><Field label="Link do botão"><input value={draft.buttonUrl} onChange={e => update({ buttonUrl: e.target.value })}/></Field></div>

        <div className="hero-editor-section-head"><span>Dimensões</span><h2>Tamanho e alinhamento</h2></div>
        <Field label={`Altura · ${draft.height}px`}><input type="range" min="120" max="900" step="10" value={draft.height} onChange={e => update({ height: Number(e.target.value) })}/></Field>
        <Field label={`Largura útil · ${draft.contentWidth}px`}><input type="range" min="320" max="1600" step="20" value={draft.contentWidth} onChange={e => update({ contentWidth: Number(e.target.value) })}/></Field>
        <Field label="Alinhamento"><select value={draft.align} onChange={e => update({ align: e.target.value as HomeAdConfig['align'] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field>

        <div className="home-ad-danger"><button onClick={remove}><Trash2 size={16}/> Desativar e limpar Seção Anuncie Aqui local</button><small>Esta ação afeta somente o estado salvo neste navegador. Você pode restaurar os valores padrão depois.</small></div>
      </section>

      <section className="home-ad-preview-panel"><div className="hero-editor-preview-head"><span>PREVIEW</span><strong>Mesma Seção Anuncie Aqui da Home</strong></div><div className="home-ad-preview-frame"><AdvertiseHereSection config={draft}/></div></section>
    </div>
  </div>
}
