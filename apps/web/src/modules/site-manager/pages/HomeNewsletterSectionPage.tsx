import {RotateCcw} from 'lucide-react'
import {useEffect,useState} from 'react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {loadNewsletterStats,type NewsletterStats} from '../../../shared/data/newsletterClient'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HomePagePreviewFrame} from '../components/HomePagePreviewFrame'
import {SectionEditorField as Field,SectionEditorSaveBar,SectionEditorSummaryCard,SectionEditorTabButton as Tab,SectionViewportSwitch,type SectionEditorTabId as EditorTab} from '../components/SectionEditorUi'
import {loadAdminHomeSection,saveHomeSection} from '../homeSectionConfigRepository'
import {defaultSectionConfiguration,type SectionConfiguration,type SectionHeroViewport} from '../sectionConfiguration'
import '../../../styles/section-configuration-editor.css'
import '../../../styles/section-editor-workbench.css'

const viewportLabel=(value:SectionHeroViewport)=>value==='desktop'?'Desktop':value==='tablet'?'Tablet':'Mobile'

export function HomeNewsletterSectionPage(){
  const initial=()=>defaultSectionConfiguration('newsletter','Newsletter')
  const [config,setConfig]=useState<SectionConfiguration>(initial)
  const [persisted,setPersisted]=useState<SectionConfiguration>(initial)
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [tab,setTab]=useState<EditorTab>('content')
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [stats,setStats]=useState<NewsletterStats|null>(null)
  const [integrationError,setIntegrationError]=useState('')
  const dirty=JSON.stringify(config)!==JSON.stringify(persisted)

  useEffect(()=>{let active=true;void loadAdminHomeSection('newsletter','Newsletter').then(value=>{if(active){setConfig(value);setPersisted(value)}}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Falha ao carregar a configuração persistida da Newsletter.')}).finally(()=>{if(active)setLoading(false)});void loadNewsletterStats().then(value=>{if(active){setStats(value);setIntegrationError('')}}).catch(caught=>{if(active)setIntegrationError(caught instanceof Error?caught.message:'Integração indisponível.')});return()=>{active=false}},[])

  const patch=(next:Partial<SectionConfiguration>)=>{setConfig(current=>({...current,...next}));setMessage('');setError('')}
  const reset=()=>{setConfig(defaultSectionConfiguration('newsletter','Newsletter'));setMessage('');setError('')}
  const discard=()=>{setConfig(persisted);setMessage('');setError('')}
  const save=async()=>{if(saving)return;setSaving(true);setError('');setMessage('');try{const saved=await saveHomeSection('newsletter','Newsletter',config);setConfig(saved);setPersisted(saved);setMessage('Configuração da Newsletter persistida com sucesso.')}catch(caught){setConfig(persisted);setError(caught instanceof Error?`${caught.message} A configuração publicada anterior foi preservada.`:'Falha ao salvar. A configuração publicada anterior foi preservada.')}finally{setSaving(false)}}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Newsletter',description:'Configure o bloco de Newsletter acima do rodapé e acompanhe a Página Inicial completa no preview fixo à direita.',backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title="Sincronizando Newsletter" description="Carregando a configuração persistida antes de abrir o editor."/>}
    {error&&<AdminNotice title="Falha na configuração" description={error}/>} 
    {!loading&&<div className="section-editor-workbench"><div className="section-editor-rail" aria-label="Configurações da seção Newsletter"><SectionEditorSummaryCard eyebrow="NEWSLETTER" description="Captação de e-mails exibida acima do rodapé público." active={config.active} onActiveChange={active=>patch({active})}/><div className="section-editor-tabs"><Tab active={tab==='content'} label="Conteúdo" onClick={()=>setTab('content')}/><Tab active={tab==='appearance'} label="Aparência" onClick={()=>setTab('appearance')}/><Tab active={tab==='behavior'} label="Comportamento" onClick={()=>setTab('behavior')}/></div><section className="section-editor-card section-editor-detail">
      {tab==='content'&&<><div className="section-editor-card-head"><h3>Conteúdo</h3><p>Edite somente os textos usados pela Newsletter pública.</p></div><div className="section-config-fields"><Field label="Texto principal"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field><Field label="Linha complementar"><input value={config.description} onChange={event=>patch({description:event.target.value})}/></Field><Field label="Placeholder do e-mail"><input value={config.eyebrow} onChange={event=>patch({eyebrow:event.target.value})} placeholder="Seu melhor e-mail"/></Field><Field label="Texto do botão"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})} placeholder="INSCREVER-SE"/></Field></div></>}
      {tab==='appearance'&&<><div className="section-editor-card-head"><h3>Aparência</h3><p>Controle cores e alinhamento sem alterar a estrutura aprovada da seção.</p></div><div className="section-config-fields"><Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field><div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque / botão"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div></div></>}
      {tab==='behavior'&&<><div className="section-editor-card-head"><h3>Comportamento</h3><p>A Newsletter usa Supabase/Postgres como fonte de verdade e Resend como provedor de contatos e campanhas.</p></div><div className="section-config-fields"><div className="section-editor-rule"><strong>Persistência · Supabase</strong><p>{integrationError?`Indisponível: ${integrationError}`:`Conectada ao backend do Portal · ${stats?.active??0} inscrito${stats?.active===1?'':'s'} ativo${stats?.active===1?'':'s'}.`}</p></div><div className="section-editor-rule"><strong>Entrega · Resend</strong><p>{integrationError?'Aguardando configuração completa do backend.':stats?.sync_errors?`${stats.sync_errors} inscrição(ões) aguardando reconciliação com o Resend.`:'Sincronização de contatos sem pendências registradas.'}</p></div><div className="section-editor-rule"><strong>Comportamento responsivo</strong><p>O mesmo formulário público responde ao viewport real da Home e mantém Desktop, Tablet e Mobile na mesma implementação.</p><span className="section-editor-device-badge">{viewportLabel(viewport)}</span></div></div></>}
    </section><div className="section-editor-actions"><button type="button" className="button outline" disabled={saving} onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button></div>{message&&<div className="section-config-success" role="status">{message}</div>}</div><section className="section-editor-preview"><div className="section-editor-preview-head"><div><h2>Preview da página inteira</h2><p>{viewportLabel(viewport)} · edição em tempo real · alterações refletidas antes de salvar.</p></div><SectionViewportSwitch viewport={viewport} onChange={setViewport}/></div><div className="section-editor-preview-canvas"><HomePagePreviewFrame sectionId="newsletter" configuration={config} viewport={viewport}/></div></section></div>}
    {!loading&&<SectionEditorSaveBar dirty={dirty} saving={saving} onDiscard={discard} onSave={()=>void save()} dirtyText="O preview já mostra o rascunho; a Home pública só muda após salvar." cleanText="A Newsletter pública está sincronizada com o estado salvo."/>}
  </AdminShell>
}
