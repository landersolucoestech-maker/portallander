import {ArrowRight,LockKeyhole,ShieldAlert} from 'lucide-react'
import {useEffect,useState,type FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {portalLogo} from '../../shared/branding/assets/brandAsset'
import {readHeaderBrandConfig} from '../../shared/branding/models/headerBrandModel'
import {ADMIN_CAPABILITIES} from '../../shared/internal/adminCapabilities'
import {useAdminAuth} from './adminAuthState'
import {isAdminAuthConfigured} from './authClient'

function readPrimaryBrand(){
  const config=readHeaderBrandConfig()
  return {
    image:config.active&&!config.deleted&&config.image?config.image:portalLogo,
    alt:config.imageAlt||'Portal Lander',
  }
}

export function LoginPage(){
  const navigate=useNavigate()
  const {status,error:sessionError,login}=useAdminAuth()
  const [brand,setBrand]=useState(readPrimaryBrand)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [remember,setRemember]=useState(false)
  const [submitting,setSubmitting]=useState(false)
  const [error,setError]=useState('')
  const configured=isAdminAuthConfigured()
  const developmentMode=status==='development'

  useEffect(()=>{
    const sync=()=>setBrand(readPrimaryBrand())
    window.addEventListener('portal-lander:header-brand-updated',sync)
    return()=>window.removeEventListener('portal-lander:header-brand-updated',sync)
  },[])

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(!configured||submitting)return
    setSubmitting(true);setError('')
    try{await login({email,password,remember});navigate('/app/dashboard',{replace:true})}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível entrar na área administrativa.')}
    finally{setSubmitting(false)}
  }

  return <main className="access-page access-login-page">
    <section className="access-brand-panel" aria-label="Portal Lander · Área interna">
      <Link className="access-logo" to="/" aria-label="Voltar ao Portal Lander"><img src={brand.image} alt={brand.alt}/></Link>
      <div className="access-brand-copy">
        <span className="access-kicker">PORTAL LANDER · OPERAÇÃO INTERNA</span>
        <h1>Conteúdo, relacionamento e operação em um único ambiente.</h1>
        <p>A área interna reúne CRM, Site, Financeiro, Marketing e os demais módulos em uma única Administração, com navegação e identidade compartilhadas.</p>
      </div>
      <div className="access-brand-foot"><span>ADMINISTRAÇÃO UNIFICADA</span><span>PORTAL LANDER</span></div>
    </section>

    <section className="access-form-panel">
      <div className="access-form-wrap">
        <div className="access-form-heading"><span>ACESSO ADMINISTRATIVO</span><h2>Entrar na área interna</h2><p>Use sua conta administrativa para acessar a Administração unificada do Portal Lander.</p></div>

        {!configured&&<div className="access-warning" role="status"><ShieldAlert size={18} aria-hidden="true"/><div><strong>API administrativa não configurada</strong><p>Defina VITE_PORTAL_API_BASE_URL no frontend e execute a migração de autenticação na API. Em produção, o acesso interno permanece bloqueado enquanto essa configuração estiver ausente.</p></div></div>}
        {configured&&status==='unavailable'&&<div className="access-warning" role="alert"><ShieldAlert size={18} aria-hidden="true"/><div><strong>Autenticação indisponível</strong><p>{sessionError||'A API administrativa não pôde validar a sessão. Verifique a configuração e tente novamente.'}</p></div></div>}
        {error&&<div className="access-warning" role="alert"><ShieldAlert size={18} aria-hidden="true"/><div><strong>Não foi possível entrar</strong><p>{error}</p></div></div>}

        <form className="access-login-form" onSubmit={submit}>
          <label><span>E-mail</span><input type="email" placeholder="seuemail@empresa.com" value={email} onChange={event=>setEmail(event.target.value)} disabled={!configured||submitting} autoComplete="email" required/></label>
          <label><span>Senha</span><input type="password" placeholder="••••••••" value={password} onChange={event=>setPassword(event.target.value)} disabled={!configured||submitting} autoComplete="current-password" required/></label>
          <div className="access-login-options"><label className="access-check"><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)} disabled={!configured||submitting}/><span>Manter sessão</span></label><span>Sessões podem ser revogadas pelo backend</span></div>
          <button type="submit" className="access-primary" disabled={!configured||submitting}><LockKeyhole size={17} aria-hidden="true"/> {submitting?'Entrando…':'Entrar'}</button>
        </form>

        {developmentMode&&<div className="access-demo-entry"><span>DESENVOLVIMENTO LOCAL</span><p>A API não está configurada neste build de desenvolvimento. O bypass abaixo existe somente em modo DEV e não é liberado em produção.</p><Link to="/app/dashboard">Continuar para a Administração <ArrowRight size={16} aria-hidden="true"/></Link></div>}
        {configured&&<div className="access-demo-entry"><span>SESSÃO PROTEGIDA</span><p>{ADMIN_CAPABILITIES.adminAuth.description} A credencial persistente da API não é enviada ao navegador.</p></div>}

        <Link className="access-back" to="/">← Voltar ao site público</Link>
      </div>
    </section>
  </main>
}
