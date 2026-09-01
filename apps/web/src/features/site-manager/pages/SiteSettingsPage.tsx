import { RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { HeaderBrandEditor } from '../../../shared/branding/components/HeaderBrandEditor'
import { defaultFooterBrandConfig, readFooterBrandConfig, resetFooterBrandConfig, writeFooterBrandConfig, type FooterBrandConfig } from '../../../shared/branding/models/footerBrandModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

function FooterIdentityEditor(){
  const [config,setConfig]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [saved,setSaved]=useState(false)
  const patch=(next:Partial<FooterBrandConfig>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const save=()=>{writeFooterBrandConfig(config);setSaved(true)}
  const reset=()=>{resetFooterBrandConfig();setConfig(defaultFooterBrandConfig);setSaved(false)}

  return <section className="section-editor-card" aria-labelledby="site-identity-footer-title">
    <h2 id="site-identity-footer-title">Rodapé global</h2>
    <p>Esta configuração é única e utilizada no final de todas as páginas do site.</p>
    <label>Exibir identidade visual<select value={config.active?'on':'off'} onChange={event=>patch({active:event.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></label>
    <label>Imagem / logo<input value={config.image} onChange={event=>patch({image:event.target.value})}/></label>
    <label>Texto alternativo<input value={config.imageAlt} onChange={event=>patch({imageAlt:event.target.value})}/></label>
    <div className="section-editor-slider"><span>Largura da logo</span><input type="range" min="48" max="360" value={config.width} onChange={event=>patch({width:Number(event.target.value)})}/><b>{config.width}px</b></div>
    <div className="grid-editor-actions" style={{marginTop:20,justifyContent:'flex-start'}}><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>
    {saved&&<div className="home-section-manager-success grid-save-success">Alterações salvas com sucesso.</div>}
  </section>
}

export function SiteSettingsPage(){
  const [tab]=useState<'identity'>('identity')
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurações',description:'Configurações globais do site, compartilhadas por todas as páginas.'}}>
    <div className="hero-editor-tabs" role="tablist" aria-label="Configurações do site">
      <button type="button" role="tab" aria-selected={tab==='identity'} className={tab==='identity'?'active':''}>Identidade do Site</button>
    </div>
    <div style={{display:'grid',gap:24,marginTop:20}}>
      <section className="section-editor-card" aria-labelledby="site-identity-header-title">
        <h2 id="site-identity-header-title">Cabeçalho global</h2>
        <p>Esta configuração é única e utilizada antes do conteúdo de todas as páginas do site.</p>
        <HeaderBrandEditor/>
      </section>
      <FooterIdentityEditor/>
    </div>
  </AdminShell>
}
