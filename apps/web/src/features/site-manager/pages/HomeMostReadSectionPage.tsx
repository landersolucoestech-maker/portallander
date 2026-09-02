import {ExternalLink,RotateCcw,Save} from 'lucide-react'
import {useState,type CSSProperties,type ReactNode} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {homeReadModel} from '../../../pages/home/models/homeReadModel'
import {defaultSectionConfiguration,readSectionConfiguration,resetSectionConfiguration,writeSectionConfiguration,type SectionConfiguration} from '../sectionConfiguration'
import '../../../pages/home/styles/home-official-sections.css'
import '../../../styles/section-configuration-editor.css'

function clamp(value:number,min:number,max:number){return Math.min(max,Math.max(min,value))}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

function MostReadPreview({config}:{config:SectionConfiguration}){
  if(!config.active)return <div className="section-preview-disabled">Esta seção está oculta. Ative-a no painel à esquerda para visualizar o resultado.</div>
  const limit=clamp(config.itemLimit||1,1,5)
  const style={background:config.background,color:config.textColor,textAlign:config.textAlign} as CSSProperties
  return <section className="pl-most official-mais-lidas section-preview-real" style={style}>
    <div className="pl-section-head"><h2>{config.title}</h2></div>
    {homeReadModel.mostRead.slice(0,limit).map((title,index)=><div className="pl-ranked" key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></div>)}
    {config.linkLabel&&<span className="pl-outline-button">{config.linkLabel}</span>}
  </section>
}

export function HomeMostReadSectionPage(){
  const initial=()=>readSectionConfiguration('home','mais-lidas','Mais Lidas')
  const [config,setConfig]=useState<SectionConfiguration>(initial)
  const [saved,setSaved]=useState(false)
  const patch=(next:Partial<SectionConfiguration>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const save=()=>{writeSectionConfiguration('home','mais-lidas',{...config,itemLimit:clamp(config.itemLimit||1,1,5)});setSaved(true)}
  const reset=()=>{resetSectionConfiguration('home','mais-lidas');setConfig(defaultSectionConfiguration('mais-lidas','Mais Lidas'));setSaved(false)}
  const publicUrl=`${window.location.origin}${window.location.pathname}#/`

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Mais Lidas',description:'Defina a quantidade máxima de conteúdos e controle a exibição da seção.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    <AdminNotice title="Quantidade configurável" description="Escolha de 1 a 5 conteúdos. O frontend exibe no máximo o valor configurado e nunca cria itens artificiais quando houver menos conteúdos disponíveis."/>
    <div className="section-config-workbench">
      <aside className="section-config-panel">
        <div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>Mais Lidas</h2><p>Ranking das matérias mais acessadas da Página Inicial.</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div>
        <div className="section-config-fields">
          <Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field>
          <Field label="Quantidade máxima de conteúdos"><select aria-label="Quantidade máxima de conteúdos" value={clamp(config.itemLimit||1,1,5)} onChange={event=>patch({itemLimit:Number(event.target.value)})}><option value="1">1 conteúdo</option><option value="2">2 conteúdos</option><option value="3">3 conteúdos</option><option value="4">4 conteúdos</option><option value="5">5 conteúdos</option></select></Field>
          <div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})} placeholder="/noticias"/></Field></div>
          <Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field>
          <div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div>
        </div>
        <div className="section-config-actions"><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>
        {saved&&<div className="section-config-success">Configuração salva com sucesso.</div>}
      </aside>
      <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW AO VIVO</small><strong>Mais Lidas</strong></div></div><div className="section-config-preview-frame"><MostReadPreview config={config}/></div></section>
    </div>
  </AdminShell>
}
