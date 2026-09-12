import {Image as ImageIcon,Palette,RotateCcw,Save,Trash2,Upload} from 'lucide-react'
import {useRef,useState,type ReactNode} from 'react'
import {HeaderBrandEditor} from '../../shared/branding/components/HeaderBrandEditor'
import {defaultFooterBrandConfig,readFooterBrandConfig,resetFooterBrandConfig,writeFooterBrandConfig,type FooterBrandConfig} from '../../shared/branding/models/footerBrandModel'
import {defaultSiteAppearanceConfig,normalizeSiteBackgroundColor,readSiteAppearanceConfig,resetSiteAppearanceConfig,writeSiteAppearanceConfig} from '../../shared/branding/models/siteAppearanceModel'
import {FooterIdentityPreview} from './FooterIdentityPreview'
import './footer-preview.css'
import './site-identity-settings.css'

async function fileToDataUrl(file:File){
  return await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader()
    reader.onload=()=>resolve(String(reader.result||''))
    reader.onerror=()=>reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function IdentityCard({title,description,icon,children}:{title:string;description:string;icon:ReactNode;children:ReactNode}){
  return <section className="site-identity-card"><header className="site-identity-card-header"><span className="site-identity-card-icon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div></header><div className="site-identity-card-body">{children}</div></section>
}

function GlobalAppearanceEditor(){
  const initial=readSiteAppearanceConfig()
  const [draft,setDraft]=useState(initial.backgroundColor)
  const [saved,setSaved]=useState(false)
  const normalized=normalizeSiteBackgroundColor(draft)
  const invalid=!normalized
  const setColor=(value:string)=>{setDraft(value.toUpperCase());setSaved(false)}
  const save=()=>{if(!normalized)return;writeSiteAppearanceConfig({backgroundColor:normalized});setDraft(normalized);setSaved(true)}
  const reset=()=>{resetSiteAppearanceConfig();setDraft(defaultSiteAppearanceConfig.backgroundColor);setSaved(false)}
  const previewColor=normalized??initial.backgroundColor

  return <IdentityCard title="Aparência global" description="Defina a cor base do site. Ela é aplicada ao fundo de todas as páginas públicas sem substituir fundos específicos configurados nas seções." icon={<Palette size={16}/>}>
    {saved&&<div className="site-identity-success" role="status">Cor global salva e aplicada ao site público.</div>}
    <div className="site-identity-appearance-grid">
      <div className="site-identity-controls">
        <label className="site-identity-field"><span>Cor de fundo do site</span><div className={`site-identity-color-control ${invalid?'invalid':''}`}><input type="color" aria-label="Selecionar cor de fundo do site" value={previewColor} onChange={event=>setColor(event.target.value)}/><input data-testid="site-background-hex" value={draft} onChange={event=>setColor(event.target.value)} maxLength={7} spellCheck={false} aria-invalid={invalid}/></div>{invalid&&<small className="site-identity-error">Informe uma cor HEX válida no formato #000000.</small>}</label>
        <div className="site-identity-presets" aria-label="Cores rápidas"><button type="button" onClick={()=>setColor('#050505')}><i style={{background:'#050505'}}/>Preto Portal</button><button type="button" onClick={()=>setColor('#0B0B0B')}><i style={{background:'#0B0B0B'}}/>Grafite</button><button type="button" onClick={()=>setColor('#151515')}><i style={{background:'#151515'}}/>Carvão</button></div>
        <div className="site-identity-actions left"><button type="button" className="site-identity-button" onClick={reset}><RotateCcw size={14}/>Restaurar padrão</button><button type="button" className="site-identity-button primary" onClick={save} disabled={invalid}><Save size={14}/>Salvar aparência</button></div>
      </div>
      <div className="site-identity-preview-panel"><div className="site-identity-preview-heading"><strong>Preview da base global</strong><span>{previewColor}</span></div><div className="site-identity-background-preview" style={{backgroundColor:previewColor}}><div><span>PORTAL LANDER</span><strong>Fundo base de todas as páginas</strong><small>Seções que possuem cor própria continuam independentes.</small></div></div></div>
    </div>
  </IdentityCard>
}

function FooterIdentityEditor(){
  const [config,setConfig]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [saved,setSaved]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const patch=(next:Partial<FooterBrandConfig>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const save=()=>{writeFooterBrandConfig(config);setSaved(true)}
  const reset=()=>{resetFooterBrandConfig();setConfig(defaultFooterBrandConfig);setSaved(false)}
  const remove=()=>patch({image:'',active:false})
  const upload=async(file?:File)=>{
    if(!file||!file.type.startsWith('image/'))return
    patch({image:await fileToDataUrl(file),imageAlt:config.imageAlt||file.name.replace(/\.[^.]+$/,''),active:true})
    if(fileRef.current)fileRef.current.value=''
  }

  return <IdentityCard title="Rodapé global" description="Controle a marca exibida no rodapé de todas as páginas públicas sem expor dados internos da imagem no formulário." icon={<ImageIcon size={16}/>}>
    {saved&&<div className="site-identity-success" role="status">Rodapé salvo e aplicado às páginas públicas.</div>}
    <div className="site-identity-editor-grid footer">
      <div className="site-identity-controls">
        <label className="site-identity-field"><span>Exibir identidade visual</span><select value={config.active?'on':'off'} onChange={event=>patch({active:event.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></label>
        <label className="site-identity-field"><span>Texto alternativo</span><input value={config.imageAlt} onChange={event=>patch({imageAlt:event.target.value})} placeholder="Portal Lander"/></label>
        <label className="site-identity-range"><span>Largura da logo <b>{config.width}px</b></span><input type="range" min="48" max="360" value={config.width} onChange={event=>patch({width:Number(event.target.value)})}/></label>
        <div className="site-identity-logo-control"><div className="site-identity-logo-thumb">{config.image?<img src={config.image} alt="Preview da logo do rodapé"/>:<ImageIcon size={28}/>}</div><div><strong>Logo do rodapé</strong><small>A imagem é armazenada internamente; o conteúdo base64 não é exibido.</small><div className="site-identity-inline-actions"><input ref={fileRef} hidden type="file" accept="image/*" onChange={event=>void upload(event.target.files?.[0])}/><button type="button" className="site-identity-button" onClick={()=>fileRef.current?.click()}><Upload size={14}/>Alterar logo</button><button type="button" className="site-identity-button danger" onClick={remove}><Trash2 size={14}/>Remover</button></div></div></div>
        <div className="site-identity-actions left"><button type="button" className="site-identity-button" onClick={reset}><RotateCcw size={14}/>Restaurar padrão</button><button type="button" className="site-identity-button primary" onClick={save}><Save size={14}/>Salvar rodapé</button></div>
      </div>
      <div className="site-identity-footer-preview"><FooterIdentityPreview config={config}/></div>
    </div>
  </IdentityCard>
}

export function SiteIdentitySettings(){
  return <div className="site-identity-page">
    <div className="site-identity-intro"><div><span>IDENTIDADE DO SITE</span><h2>Marca e aparência global</h2><p>Centralize aqui as definições visuais compartilhadas pelo site público.</p></div><strong>Configuração global</strong></div>
    <GlobalAppearanceEditor/>
    <IdentityCard title="Cabeçalho global" description="Configure a logo principal, dimensões, alinhamento e destino usados no cabeçalho público." icon={<ImageIcon size={16}/>}><HeaderBrandEditor/></IdentityCard>
    <FooterIdentityEditor/>
  </div>
}
