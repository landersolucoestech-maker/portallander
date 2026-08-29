import { ArrowRight, LockKeyhole, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portalLogo } from '../../shared/branding/assets/brandAsset'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'

export function LoginPage(){
  return <main className="access-page access-login-page">
    <section className="access-brand-panel" aria-label="Portal Lander · Área interna">
      <Link className="access-logo" to="/" aria-label="Voltar ao Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>
      <div className="access-brand-copy">
        <span className="access-kicker">PORTAL LANDER · OPERAÇÃO INTERNA</span>
        <h1>Conteúdo, relacionamento e operação em um único ambiente.</h1>
        <p>A área interna concentra o CRM e o Gerenciador do Site em workspaces independentes, com uma base visual e operacional compartilhada.</p>
      </div>
      <div className="access-brand-foot"><span>CRM</span><span>GERENCIADOR DO SITE</span><span>PORTAL LANDER</span></div>
    </section>

    <section className="access-form-panel">
      <div className="access-form-wrap">
        <div className="access-form-heading"><span>ACESSO ADMINISTRATIVO</span><h2>Entrar na área interna</h2><p>Use esta tela como ponto oficial de entrada do ambiente administrativo.</p></div>

        <div className="access-warning" role="status"><ShieldAlert size={18} aria-hidden="true"/><div><strong>Autenticação ainda não conectada</strong><p>{ADMIN_CAPABILITIES.adminAuth.description} Por isso, nenhuma credencial digitada aqui será aceita ou simulada.</p></div></div>

        <form className="access-login-form" onSubmit={event=>event.preventDefault()} aria-describedby="auth-disabled-note">
          <label><span>E-mail</span><input type="email" placeholder="seuemail@empresa.com" disabled autoComplete="email"/></label>
          <label><span>Senha</span><input type="password" placeholder="••••••••" disabled autoComplete="current-password"/></label>
          <div className="access-login-options"><label className="access-check"><input type="checkbox" disabled/><span>Manter sessão</span></label><span>Recuperação indisponível</span></div>
          <button type="submit" className="access-primary" disabled><LockKeyhole size={17} aria-hidden="true"/> Entrar</button>
        </form>

        <div className="access-demo-entry" id="auth-disabled-note"><span>AMBIENTE FRONTEND ATUAL</span><p>Enquanto a autenticação real não estiver integrada, a seleção de workspace permanece acessível de forma explícita para desenvolvimento e validação do produto.</p><Link to="/app/workspaces">Continuar para os workspaces <ArrowRight size={16} aria-hidden="true"/></Link></div>

        <Link className="access-back" to="/">← Voltar ao site público</Link>
      </div>
    </section>
  </main>
}
