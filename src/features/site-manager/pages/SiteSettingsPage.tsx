import { HeaderBrandEditor } from '../../../shared/branding/components/HeaderBrandEditor'
import { ADMIN_CAPABILITIES, capabilityStatusClass, capabilityStatusLabel } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminPageHeader, AdminShell } from '../../../shared/internal/AdminUi'
import { siteManagerReadModel } from '../readModel'

const readOnlyDescription='Sem backend ou banco conectado, esta área apresenta somente a estrutura prevista. Alterações persistentes de conteúdo permanecem desabilitadas para não simular backend; configurações visuais marcadas como locais continuam disponíveis neste navegador.'

export function SiteSettingsPage(){
  const capabilities=Object.values(ADMIN_CAPABILITIES)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Configurações" title="Configurações" description="Parâmetros editoriais, identidade padrão, navegação e diagnóstico das capacidades administrativas do portal." action="Salvar alterações" disabled disabledReason={ADMIN_CAPABILITIES.editorialPersistence.description}/>
    <AdminNotice title="Configuração do ambiente" description={readOnlyDescription}/>
    <div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><div><span>Editorial</span><h2>Publicação e navegação</h2></div></div><div className="settings-list"><div><b>Menu principal</b><small>{siteManagerReadModel.menuPages.length} páginas editoriais estão configuradas para aparecer no menu.</small><span className="status published">Estruturado</span></div><div><b>SEO por página/conteúdo</b><small>Meta title, description, canonical e Open Graph já fazem parte do modelo.</small><span className="status published">Estruturado</span></div><div><b>Referências de mídia</b><small>{siteManagerReadModel.media.length} referências são detectadas no snapshot editorial.</small><span className="status published">Leitura</span></div><div><b>Identidade padrão</b><small>A logo principal configurada abaixo é reutilizada pelo cabeçalho público e pela tela de autenticação.</small><span className="status published">Centralizada</span></div></div></section><section className="admin-card"><div className="admin-card-head"><div><span>Diagnóstico</span><h2>Capacidades do ambiente</h2></div></div><div className="settings-list">{capabilities.map(capability=><div key={capability.label}><b>{capability.label}</b><small>{capability.description}</small><span className={`status ${capabilityStatusClass(capability.state)}`}>{capabilityStatusLabel(capability.state)}</span></div>)}</div></section></div>
    <section className="settings-primary-brand" aria-label="Identidade visual padrão"><HeaderBrandEditor/></section>
  </AdminShell>
}
