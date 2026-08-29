import { FileText, Image, Search, Sparkles, Variable, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ContractA4Preview } from './ContractA4Preview'

type TemplateDraft={name:string;category:string;content:string;active:boolean}
const VARIABLES=[
  {group:'EMPRESA',label:'Razão Social',placeholder:'{{EMPRESA.RAZAO_SOCIAL}}'},
  {group:'EMPRESA',label:'CNPJ',placeholder:'{{EMPRESA.CNPJ}}'},
  {group:'CLIENTE',label:'Nome',placeholder:'{{CLIENTE.NOME}}'},
  {group:'CLIENTE',label:'CPF/CNPJ',placeholder:'{{CLIENTE.DOCUMENTO}}'},
  {group:'CONTRATO',label:'Número',placeholder:'{{CONTRATO.NUMERO}}'},
  {group:'CONTRATO',label:'Valor',placeholder:'{{CONTRATO.VALOR}}'},
  {group:'CONTRATO',label:'Data de início',placeholder:'{{CONTRATO.DATA_INICIO}}'},
  {group:'CONTRATO',label:'Data de término',placeholder:'{{CONTRATO.DATA_FIM}}'},
]

export function ContractImportWorkspace({open,initial,onClose,onSave}:{open:boolean;initial?:TemplateDraft|null;onClose:()=>void;onSave:(draft:TemplateDraft)=>void}){
  const [tab,setTab]=useState<'template'|'variaveis'|'categorias'|'preview'>('template')
  const [name,setName]=useState(initial?.name??'')
  const [category,setCategory]=useState(initial?.category??'Semântico IA')
  const [content,setContent]=useState(initial?.content??'')
  const [search,setSearch]=useState('')
  const filtered=useMemo(()=>VARIABLES.filter(item=>`${item.group} ${item.label} ${item.placeholder}`.toLowerCase().includes(search.toLowerCase())),[search])
  if(!open)return null
  const insert=(placeholder:string)=>setContent(value=>`${value}${value&&'\n'}${placeholder}`)
  return <div className="reference-modal-backdrop"><section className="reference-modal contracts-template-workspace"><header className="reference-modal-head"><div><span>TEMPLATES DE CONTRATO</span><h2>{initial?'Editar Template':'Novo Template'}</h2></div><button className="reference-modal-close" type="button" onClick={onClose}><X size={17}/></button></header><div className="zip-tabs"><button className={tab==='template'?'active':''} onClick={()=>setTab('template')}><FileText size={14}/> Template</button><button className={tab==='variaveis'?'active':''} onClick={()=>setTab('variaveis')}><Variable size={14}/> Variáveis</button><button className={tab==='categorias'?'active':''} onClick={()=>setTab('categorias')}>Categorias</button><button className={tab==='preview'?'active':''} onClick={()=>setTab('preview')}>Preview</button></div>
    {tab==='template'&&<div className="contracts-template-editor"><div className="contracts-template-main"><div className="contracts-template-meta"><div><span>Informações Básicas</span><label><small>Nome do Template</small><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Contrato de Agenciamento"/></label><label><small>Categoria do Template</small><select value={category} onChange={e=>setCategory(e.target.value)}><option>Semântico IA</option><option>Padrão</option><option>Agenciamento</option><option>Distribuição</option><option>Licenciamento</option><option>Edição</option></select></label></div><div><span>Identidade Visual do Documento</span><label><small>Imagem de Cabeçalho</small><input type="file" accept="image/*"/></label><label><small>Imagem de Rodapé</small><input type="file" accept="image/*"/></label></div></div><div className="contracts-template-content"><div><span>Conteúdo do Contrato</span><button className="zip-button secondary" type="button"><Sparkles size={14}/> Analisar com IA</button></div><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Cole ou escreva o contrato. Use variáveis como {{GRUPO.CAMPO}}..."/></div></div><aside className="contracts-template-vars"><div><strong>Variáveis do Registro</strong><label className="zip-search"><Search size={13}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar variável..."/></label></div>{filtered.map(item=><button key={item.placeholder} type="button" onClick={()=>insert(item.placeholder)}><span><strong>{item.group}</strong><br/><small>{item.label}</small></span><code>{item.placeholder}</code></button>)}</aside></div>}
    {tab==='variaveis'&&<div className="reference-modal-body"><section className="reference-form-section"><h3>Variáveis do Registro</h3><p>Use placeholders reutilizáveis no conteúdo do contrato.</p><div className="contracts-variable-cards">{VARIABLES.map(item=><button key={item.placeholder} type="button" onClick={()=>insert(item.placeholder)}><Variable size={14}/><div><strong>{item.label}</strong><code>{item.placeholder}</code></div></button>)}</div></section></div>}
    {tab==='categorias'&&<div className="reference-modal-body"><section className="reference-form-section"><h3>Categorias de Template</h3><div className="contracts-category-choice">{['Semântico IA','Padrão','Agenciamento','Distribuição','Licenciamento','Edição'].map(item=><button className={category===item?'active':''} type="button" key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div></section></div>}
    {tab==='preview'&&<div className="reference-modal-body"><ContractA4Preview title={name||'TEMPLATE DE CONTRATO'}><p>{content||'O conteúdo do template aparecerá aqui.'}</p></ContractA4Preview></div>}
    <footer className="reference-modal-footer"><span className="contracts-autosave-note">Alterações salvas automaticamente</span><button className="zip-button secondary" type="button" onClick={onClose}>Cancelar</button><button className="zip-button" type="button" onClick={()=>onSave({name:name||'Template sem nome',category,content,active:true})}>Salvar Template</button></footer></section></div>
}
