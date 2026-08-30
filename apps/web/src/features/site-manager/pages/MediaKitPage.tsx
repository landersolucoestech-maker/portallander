import { FileText, Globe2, Images, Newspaper } from 'lucide-react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { siteManagerReadModel } from '../readModel'

const readOnlyDescription='Sem backend ou banco conectado, esta área apresenta somente a estrutura prevista. Alterações permanecem desabilitadas para não simular persistência.'

export function MediaKitPage(){
  const pages=siteManagerReadModel.pages.filter(page=>page.active).length
  const published=siteManagerReadModel.publishedContents.length
  const assets=siteManagerReadModel.media.length

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Estrutura administrativa para materiais comerciais, audiência e apresentação institucional.'}} headerAction={{label:'Editar mídia kit',disabled:true,disabledReason:ADMIN_CAPABILITIES.editorialPersistence.description}}>
    <AdminNotice title="Configuração em modo leitura" description={readOnlyDescription}/>
    <div className="admin-kpi-grid"><AdminKpi label="Páginas ativas" value={String(pages)} detail="Estrutura editorial atual" icon={<Globe2 size={16}/>}/><AdminKpi label="Publicados" value={String(published)} detail="Conteúdos públicos" icon={<Newspaper size={16}/>}/><AdminKpi label="Referências de mídia" value={String(assets)} detail="Derivadas do snapshot editorial" icon={<Images size={16}/>}/><AdminKpi label="Versão" value="Rascunho" detail="Sem persistência habilitada" icon={<FileText size={16}/>}/></div>
    <div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><div><span>Comercial</span><h2>Estrutura prevista</h2></div></div><div className="settings-list"><div><b>Apresentação institucional</b><small>Resumo do Portal Lander, posicionamento e proposta comercial.</small></div><div><b>Formatos publicitários</b><small>Inventário de espaços, formatos e especificações.</small></div><div><b>Audiência e métricas</b><small>Indicadores reais deverão vir da camada de analytics quando conectada.</small></div><div><b>Contato comercial</b><small>Responsáveis, canais e informações de atendimento.</small></div></div></section><section className="admin-card"><div className="admin-card-head"><div><span>Estado atual</span><h2>Sem publicação automática</h2></div></div><p>O mídia kit ainda não possui uma fonte persistente própria. Esta tela define a arquitetura visual e os blocos necessários sem criar conteúdo comercial fictício.</p></section></div>
  </AdminShell>
}
