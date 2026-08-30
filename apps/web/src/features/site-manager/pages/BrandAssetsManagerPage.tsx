import { FileImage, Newspaper, RotateCcw, Save, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultFooterBrandConfig, readFooterBrandConfig, resetFooterBrandConfig, writeFooterBrandConfig, type FooterBrandConfig } from '../../../shared/branding/models/footerBrandModel'
import { readHeaderBrandConfig } from '../../../shared/branding/models/headerBrandModel'
import { defaultHomeAdConfig, readHomeAdConfig, resetHomeAdConfig, writeHomeAdConfig, type HomeAdConfig } from '../../../pages/home/models/adModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'

async function fileToDataUrl(file:File){return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}

export function BrandAssetsManagerPage(){
  const header=readHeaderBrandConfig()
  const [footer,setFooter]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [ad,setAd]=useState<HomeAdConfig>(()=>readHomeAdConfig())
  const [saved,setSaved]=useState(false)
  const footerRef=useRef<HTMLInputElement>(null)
  const adRef=useRef<HTMLInputElement>(null)

  const upload=async(file:File|undefined,target:'footer'|'ad')=>{
    if(!file||!file.type.startsWith('image/'))return
    const data=await fileToDataUrl(file);setSaved(false)
    if(target==='footer')setFooter(value=>({...value,image:data,imageAlt:value.imageAlt||file.name,active:true}))
    else setAd(value=>({...value,logo:data,logoAlt:value.logoAlt||file.name}))
  }
  const save=()=>{writeFooterBrandConfig(footer);writeHomeAdConfig(ad);setSaved(true)}
  const reset=()=>{resetFooterBrandConfig();resetHomeAdConfig();setFooter(defaultFooterBrandConfig);setAd(defaultHomeAdConfig);setSaved(false)}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Marca & Logos',description:'Central de ativos visuais do cabeçalho, rodapé e anúncio principal.'}} headerActions={[{label:'Restaurar locais',variant:'secondary',icon:RotateCcw,onClick:reset},{label:'Salvar localmente',icon:Save,onClick:save}]}>
    <AdminNotice title="Identidade visual local" description="Cabeçalho, rodapé e logo publicitária ainda usam configuração local do navegador. Nenhuma alteração é compartilhada com outros dispositivos."/>
    <div className="brand-assets-main">
      {saved&&<div className="brand-assets-success">Alterações salvas somente neste navegador.</div>}
      <div className="brand-assets-grid">
        <section className="brand-asset-card"><div className="brand-asset-title"><FileImage size={19}/><div><h2>Logo do cabeçalho</h2><p>Gerenciada separadamente para evitar duas telas editando a mesma configuração.</p></div></div><div className="brand-asset-preview header-preview">{header.active&&!header.deleted&&header.image?<img src={header.image} alt={header.imageAlt}/>:<span>Logo desativada</span>}</div><div className="brand-asset-controls"><Link className="button outline" to="/app/site/cabecalho">Abrir editor do cabeçalho</Link></div></section>
        <section className="brand-asset-card"><div className="brand-asset-title"><FileImage size={19}/><div><h2>Logo do rodapé</h2><p>Marca exibida na área institucional no final do portal.</p></div></div><div className="brand-asset-preview footer-preview">{footer.active&&footer.image?<img src={footer.image} alt={footer.imageAlt}/>:<span>Logo desativada</span>}</div><div className="brand-asset-controls"><input ref={footerRef} hidden type="file" accept="image/*" onChange={event=>void upload(event.target.files?.[0],'footer')}/><button type="button" onClick={()=>footerRef.current?.click()}><Upload size={15}/> Substituir logo</button><label>Texto alternativo<input value={footer.imageAlt} onChange={event=>{setSaved(false);setFooter(value=>({...value,imageAlt:event.target.value}))}}/></label><label>Largura · {footer.width}px<input type="range" min="70" max="260" value={footer.width} onChange={event=>{setSaved(false);setFooter(value=>({...value,width:Number(event.target.value)}))}}/></label><label>Status<select value={footer.active?'active':'inactive'} onChange={event=>{setSaved(false);setFooter(value=>({...value,active:event.target.value==='active'}))}}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label></div></section>
        <section className="brand-asset-card"><div className="brand-asset-title"><Newspaper size={19}/><div><h2>Logo do anúncio principal</h2><p>Logo opcional renderizada dentro do anúncio configurável da Home.</p></div></div><div className="brand-asset-preview ad-preview">{ad.logo?<img src={ad.logo} alt={ad.logoAlt}/>:<span>Nenhuma logo configurada</span>}</div><div className="brand-asset-controls"><input ref={adRef} hidden type="file" accept="image/*" onChange={event=>void upload(event.target.files?.[0],'ad')}/><button type="button" onClick={()=>adRef.current?.click()}><Upload size={15}/> Substituir logo</button><label>Texto alternativo<input value={ad.logoAlt} onChange={event=>{setSaved(false);setAd(value=>({...value,logoAlt:event.target.value}))}}/></label><label>Largura · {ad.logoWidth}px<input type="range" min="60" max="320" value={ad.logoWidth} onChange={event=>{setSaved(false);setAd(value=>({...value,logoWidth:Number(event.target.value)}))}}/></label><button type="button" className="danger" onClick={()=>{setSaved(false);setAd(value=>({...value,logo:''}))}}>Remover logo local</button></div></section>
      </div>
    </div>
  </AdminShell>
}
