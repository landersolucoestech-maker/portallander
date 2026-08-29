import { ArrowRight, Globe2, LockKeyhole, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portalLogo } from '../../shared/branding/assets/brandAsset'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'

const workspaces=[
  {
    title:'Gerenciador do Site',
    eyebrow:'CONTEÚDO E PUBLICAÇÃO',
    description:'Páginas, conteúdos, categorias, mídia, identidade visual, Home e publicidade do Portal Lander.',
    to:'/app/site',
    icon:Globe2,
    meta:['Conteúdo editorial','Home e publicidade','Marca e estrutura do portal'],
  },
] as const

export function WorkspacePage(){
  return <main className="access-page workspace-selection-page">
    <header className="workspace-selection-topbar">
      <Link to="/" className="workspace-selection-logo" aria-label="Voltar ao Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
      <div className="workspace-selection-session"><div><span>SESSÃO LOCAL</span><strong>Ambiente de desenvolvimento</strong></div><LockKeyhole size={18} aria-hidden="true"/></div>
    </header>

    <section className="workspace-selection-main">
      <div className="workspace-selection-heading">
        <span className="access-kicker">ÁREA INTERNA · WORKSPACES</span>
        <h1>Escolha onde você quer trabalhar.</h1>
        <p>O ambiente administrativo disponível atualmente é o Gerenciador do Site.</p>
      </div>

      <div className="workspace-selection-grid">
        {workspaces.map(({title,eyebrow,description,to,icon:Icon,meta})=><Link to={to} className="workspace-selection-card" key={to}>
          <div className="workspace-selection-card-head"><div className="workspace-selection-icon"><Icon size={21} aria-hidden="true"/></div><ArrowRight size={20} aria-hidden="true"/></div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          <ul>{meta.map(item=><li key={item}>{item}</li>)}</ul>
          <strong>Acessar workspace <ArrowRight size={15} aria-hidden="true"/></strong>
        </Link>)}
      </div>

      <aside className="workspace-selection-footnote"><Settings2 size={18} aria-hidden="true"/><div><strong>Estado atual do acesso</strong><p>{ADMIN_CAPABILITIES.adminAuth.description} Esta tela não representa uma sessão autenticada.</p></div><Link to="/app/login">Voltar ao login</Link></aside>
    </section>
  </main>
}
