import { AlertTriangle } from 'lucide-react'
import type { AdminCapability } from './adminCapabilities'

export function AdminCapabilityNotice({capability,title,detail}:{capability:AdminCapability;title?:string;detail?:string}){
  return <div className="admin-notice"><AlertTriangle size={18} aria-hidden="true"/><div><strong>{title||capability.label}</strong><p>{detail||capability.description}</p></div></div>
}
