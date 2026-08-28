import { AlertTriangle } from 'lucide-react'
import { editorialReadModel } from '../repository'

function PersistenceNotice(){return <div className="panel" style={{marginBottom:20,borderLeft:'4px solid currentColor'}}><div className="panel-head"><div><span>Infraestrutura obrigatória ausente</span><h2>CRUD persistente bloqueado com segurança</h2></div><AlertTriangle/></div><p>Este frontend não possui backend, banco de dados ou API editorial. As ações de criação, edição, publicação e exclusão não gravam em localStorage nem simulam sucesso. O contrato de repositório está pronto para receber a implementação persistente.</p></div>}

export function EditorialPagesAdmin(){
  const pages=editorialReadModel.pages
  return <><PersistenceNotice/><div className="page-header"><div><span>Gerenciador do Site / Páginas</span><h1>Páginas</h1></div><button className="button dark" disabled title="Requer backend editorial">Nova página</button></div><section className="table-card"><table><thead><tr><th>Título</th><th>Tipo</th><th>Slug</th><th>Status</th><th>Menu</th><th>Posição</th><th>Parent</th><th>Conteúdos</th><th>Atualização</th></tr></thead><tbody>{pages.map(page=><tr key={page.id}><td><b>{page.title}</b></td><td>{page.type}</td><td>/{page.slug}</td><td><span className="status">{page.status}</span></td><td>{page.showInMainMenu?'Sim':'Não'}</td><td>{page.menuOrder}</td><td>{page.parentId?editorialReadModel.getPageById(page.parentId)?.title||page.parentId:'—'}</td><td>{editorialReadModel.countContents(page.id)}</td><td>{new Date(page.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section></>
}

export function EditorialContentsAdmin(){
  const contents=editorialReadModel.contents
  return <><PersistenceNotice/><div className="page-header"><div><span>Gerenciador do Site / Conteúdos</span><h1>Conteúdos editoriais</h1></div><button className="button dark" disabled title="Requer backend editorial">Novo conteúdo</button></div><section className="table-card"><table><thead><tr><th>Título</th><th>Página</th><th>Slug</th><th>Status</th><th>Autor</th><th>Atualização</th></tr></thead><tbody>{contents.map(content=><tr key={content.id}><td><b>{content.title}</b></td><td>{editorialReadModel.getPageById(content.pageId)?.title||content.pageId}</td><td>{content.slug}</td><td><span className="status">{content.status}</span></td><td>{content.author}</td><td>{new Date(content.updatedAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></section></>
}
