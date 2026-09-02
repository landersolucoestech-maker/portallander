import {FileText,Globe2,Images,Newspaper,Plus,Save,Trash2} from 'lucide-react'
import {useState} from 'react'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminKpi,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {defaultMediaKitDraft,type MediaKitAdFormat,type MediaKitDraft} from '../mediaKitDomain'
import {siteManagerReadModel} from '../readModel'
import './site-forms.css'

const uid=()=>`format-${crypto.randomUUID()}`

export function MediaKitPage(){
  const [draft,setDraft]=useState<MediaKitDraft>(()=>structuredClone(defaultMediaKitDraft))
  const pages=siteManagerReadModel.pages.filter(page=>page.active).length
  const published=siteManagerReadModel.publishedContents.length
  const assets=siteManagerReadModel.media.length
  const patchFormat=(id:string,patch:Partial<MediaKitAdFormat>)=>setDraft(current=>({...current,adFormats:current.adFormats.map(format=>format.id===id?{...format,...patch}:format)}))
  const addFormat=()=>setDraft(current=>({...current,adFormats:[...current.adFormats,{id:uid(),name:'Novo formato',placement:'',dimensions:'',description:''}]}))
  const removeFormat=(id:string)=>setDraft(current=>({...current,adFormats:current.adFormats.filter(format=>format.id!==id)}))

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Gerencie a apresentação comercial, audiência, formatos publicitários e canais de contato do Portal Lander.'}}>
    <AdminNotice title="Rascunho estrutural" description="A estrutura do Mídia Kit já pode ser configurada nesta tela. Salvar e publicar permanecem bloqueados até a persistência do Portal Lander estar conectada; nenhum dado comercial fictício é publicado."/>
    <div className="admin-kpi-grid"><AdminKpi label="Páginas ativas" value={String(pages)} detail="Estrutura atual do Site" icon={<Globe2 size={16}/>}/><AdminKpi label="Publicações" value={String(published)} detail="Conteúdos públicos" icon={<Newspaper size={16}/>}/><AdminKpi label="Mídias" value={String(assets)} detail="Referências utilizadas" icon={<Images size={16}/>}/><AdminKpi label="Versão do kit" value={`v${draft.version}`} detail="Rascunho administrativo" icon={<FileText size={16}/>}/></div>

    <div className="site-form-editor" style={{marginTop:16}}>
      <section className="site-form-card"><header><div><h2>Apresentação institucional</h2><p>Posicionamento e apresentação do Portal Lander para anunciantes e parceiros.</p></div></header><div className="site-form-grid"><label><span>Título</span><input value={draft.institutional.title} onChange={event=>setDraft({...draft,institutional:{...draft.institutional,title:event.target.value}})}/></label><label><span>Status</span><select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as MediaKitDraft['status']})}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="inactive">Inativo</option></select></label><label className="site-form-span-2"><span>Resumo institucional</span><textarea rows={4} value={draft.institutional.summary} onChange={event=>setDraft({...draft,institutional:{...draft.institutional,summary:event.target.value}})}/></label><label className="site-form-span-2"><span>Posicionamento comercial</span><textarea rows={4} value={draft.institutional.positioning} onChange={event=>setDraft({...draft,institutional:{...draft.institutional,positioning:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Audiência e métricas</h2><p>Campos preparados para receber dados reais de analytics; valores não são inventados automaticamente.</p></div></header><div className="site-form-grid"><label><span>Usuários mensais</span><input value={draft.audience.monthlyUsers} onChange={event=>setDraft({...draft,audience:{...draft.audience,monthlyUsers:event.target.value}})} placeholder="Ex.: fonte de analytics"/></label><label><span>Visualizações mensais</span><input value={draft.audience.monthlyViews} onChange={event=>setDraft({...draft,audience:{...draft.audience,monthlyViews:event.target.value}})}/></label><label><span>Alcance social</span><input value={draft.audience.socialReach} onChange={event=>setDraft({...draft,audience:{...draft.audience,socialReach:event.target.value}})}/></label><label className="site-form-span-2"><span>Observações / fonte dos dados</span><textarea rows={3} value={draft.audience.notes} onChange={event=>setDraft({...draft,audience:{...draft.audience,notes:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Formatos publicitários</h2><p>Cadastre os espaços e formatos comercializados pelo Portal Lander.</p></div><button type="button" className="button outline" onClick={addFormat}><Plus size={15}/>Adicionar formato</button></header><div className="site-form-fields">{draft.adFormats.length?draft.adFormats.map(format=><article className="site-form-field" key={format.id}><div className="site-form-field-grid"><label><span>Nome</span><input value={format.name} onChange={event=>patchFormat(format.id,{name:event.target.value})}/></label><label><span>Posição</span><input value={format.placement} onChange={event=>patchFormat(format.id,{placement:event.target.value})} placeholder="Ex.: Homepage / lateral"/></label><label><span>Dimensões</span><input value={format.dimensions} onChange={event=>patchFormat(format.id,{dimensions:event.target.value})} placeholder="Ex.: 300 × 350 px"/></label><label className="site-form-span-2"><span>Descrição</span><textarea rows={2} value={format.description} onChange={event=>patchFormat(format.id,{description:event.target.value})}/></label></div><div className="site-form-field-actions"><button type="button" title="Excluir formato" onClick={()=>removeFormat(format.id)}><Trash2 size={15}/></button></div></article>):<div style={{padding:20}}>Nenhum formato cadastrado no rascunho.</div>}</div></section>

      <section className="site-form-card"><header><div><h2>Contato comercial</h2><p>Informações exibidas para anunciantes e parceiros interessados.</p></div></header><div className="site-form-grid"><label><span>Responsável / equipe</span><input value={draft.commercial.name} onChange={event=>setDraft({...draft,commercial:{...draft.commercial,name:event.target.value}})}/></label><label><span>E-mail</span><input type="email" value={draft.commercial.email} onChange={event=>setDraft({...draft,commercial:{...draft.commercial,email:event.target.value}})}/></label><label><span>Telefone / WhatsApp</span><input value={draft.commercial.phone} onChange={event=>setDraft({...draft,commercial:{...draft.commercial,phone:event.target.value}})}/></label><label><span>CTA</span><input value={draft.commercial.cta} onChange={event=>setDraft({...draft,commercial:{...draft.commercial,cta:event.target.value}})}/></label></div></section>

      <div className="site-form-editor-top" style={{justifyContent:'flex-end'}}><button type="button" className="button" disabled title="A persistência do Portal Lander ainda não está conectada"><Save size={15}/>Salvar e publicar</button></div>
    </div>
  </AdminShell>
}
