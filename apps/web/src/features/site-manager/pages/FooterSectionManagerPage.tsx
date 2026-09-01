import { ExternalLink, RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { defaultFooterBrandConfig, readFooterBrandConfig, resetFooterBrandConfig, writeFooterBrandConfig, type FooterBrandConfig } from '../../../shared/branding/models/footerBrandModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

export function FooterSectionManagerPage(){
  const [config,setConfig]=useState<FooterBrandConfig>(()=>readFooterBrandConfig())
  const [saved,setSaved]=useState(false)
  const patch=(next:Partial<FooterBrandConfig>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const save=()=>{writeFooterBrandConfig(config);setSaved(true)}
  const reset=()=>{resetFooterBrandConfig();setConfig(defaultFooterBrandConfig);setSaved(false)}
  const openPublicSite=()=>{const publicUrl=`${window.location.origin}${window.location.pathname}#/`;window.open(publicUrl,'_blank','noopener,noreferrer')}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Rodapé',description:'Configuração do Rodapé utilizado nas páginas.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:openPublicSite}}>
    <div className="section-editor-layout grid-editor-layout">
      <section className="section-editor-card grid-editor-settings">
        <h2>Configurações do Rodapé</h2>
        <label>Exibir identidade visual<select value={config.active?'on':'off'} onChange={event=>patch({active:event.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></label>
        <label>Imagem / logo<input value={config.image} onChange={event=>patch({image:event.target.value})}/></label>
        <label>Texto alternativo<input value={config.imageAlt} onChange={event=>patch({imageAlt:event.target.value})}/></label>
        <div className="section-editor-slider"><span>Largura da logo</span><input type="range" min="48" max="360" value={config.width} onChange={event=>patch({width:Number(event.target.value)})}/><b>{config.width}px</b></div>
        <div className="grid-editor-actions" style={{marginTop:20,justifyContent:'flex-start'}}><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>
        {saved&&<div className="home-section-manager-success grid-save-success">Alterações salvas com sucesso.</div>}
      </section>
      <section className="section-editor-preview-column grid-editor-preview">
        <div className="section-editor-card section-preview-card">
          <div className="section-preview-toolbar"><div><h2>Prévia do Rodapé</h2><p>Rodapé compartilhado entre as páginas.</p></div></div>
          <div className="section-preview" style={{background:'#090909',color:'#fff',minHeight:220,padding:24}}>
            {config.active&&config.image&&<img src={config.image} alt={config.imageAlt||'Portal Lander'} style={{width:config.width,maxWidth:'100%',height:'auto'}}/>}
            <p style={{marginTop:20}}>O maior portal de notícias sobre funk, cultura urbana e entretenimento.</p>
            <div style={{marginTop:28,borderTop:'1px solid #333',paddingTop:14,fontSize:12}}>© 2026 Portal Lander. Todos os direitos reservados.</div>
          </div>
        </div>
      </section>
    </div>
  </AdminShell>
}
