import {RotateCcw,Save} from 'lucide-react'
import {useState} from 'react'
import {HeaderBrandEditor} from '../../shared/branding/components/HeaderBrandEditor'
import {defaultFooterBrandConfig,readFooterBrandConfig,resetFooterBrandConfig,writeFooterBrandConfig,type FooterBrandConfig} from '../../shared/branding/models/footerBrandModel'
import {FooterIdentityPreview} from './FooterIdentityPreview'
import '../../styles/home-section-manager.css'
import './footer-preview.css'

function FooterIdentityEditor(){
 const [config,setConfig]=useState<FooterBrandConfig>(()=>readFooterBrandConfig()),[saved,setSaved]=useState(false)
 const patch=(next:Partial<FooterBrandConfig>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
 const save=()=>{writeFooterBrandConfig(config);setSaved(true)}
 const reset=()=>{resetFooterBrandConfig();setConfig(defaultFooterBrandConfig);setSaved(false)}
 return <section className="section-editor-card" aria-labelledby="settings-site-footer-title"><h2 id="settings-site-footer-title">Rodapé global</h2><p>Configuração única aplicada ao final de todas as páginas públicas. O preview abaixo usa a mesma estrutura visual do rodapé público e reage às alterações antes de salvar.</p><label>Exibir identidade visual<select value={config.active?'on':'off'} onChange={event=>patch({active:event.target.value==='on'})}><option value="on">Exibir</option><option value="off">Ocultar</option></select></label><label>Imagem / logo<input value={config.image} onChange={event=>patch({image:event.target.value})}/></label><label>Texto alternativo<input value={config.imageAlt} onChange={event=>patch({imageAlt:event.target.value})}/></label><div className="section-editor-slider"><span>Largura da logo</span><input type="range" min="48" max="360" value={config.width} onChange={event=>patch({width:Number(event.target.value)})}/><b>{config.width}px</b></div><div className="grid-editor-actions" style={{marginTop:20,justifyContent:'flex-start'}}><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/>Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/>Salvar alterações</button></div>{saved&&<div className="home-section-manager-success grid-save-success">Alterações salvas com sucesso.</div>}<FooterIdentityPreview config={config}/></section>
}

export function SiteIdentitySettings(){return <div style={{display:'grid',gap:24}}><section className="section-editor-card" aria-labelledby="settings-site-header-title"><h2 id="settings-site-header-title">Cabeçalho global</h2><p>Configuração única aplicada antes do conteúdo de todas as páginas públicas.</p><HeaderBrandEditor/></section><FooterIdentityEditor/></div>}
