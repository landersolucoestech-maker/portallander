import {financeService} from './financeService.js'
import {HttpError} from './editorialService.js'
import {requireAdmin} from './http.js'

const MAX_JSON_BYTES=8*1024*1024
const decode=value=>decodeURIComponent(value)
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
async function readJson(req){let total=0,raw='';for await(const chunk of req){total+=chunk.length;if(total>MAX_JSON_BYTES)throw new HttpError(413,'Payload financeiro excede o limite permitido.','FINANCE_PAYLOAD_TOO_LARGE');raw+=chunk}if(!raw)return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON inválido.','INVALID_JSON')}}

const ROUTES={
  transactions:{list:'listTransactions',create:'createTransaction',update:'updateTransaction',remove:'removeTransaction',single:'transaction'},
  invoices:{list:'listInvoices',create:'createInvoice',update:'updateInvoice',remove:'removeInvoice',single:'invoice'},
  categories:{list:'listCategories',create:'createCategory',update:'updateCategory',remove:'removeCategory',single:'category'},
  rules:{list:'listRules',create:'createRule',update:'updateRule',remove:'removeRule',single:'rule'},
}

export async function handleFinanceRequest(req,res){
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)
  const path=url.pathname.replace(/\/+$/,'')||'/'
  if(!path.startsWith('/api/finance'))return false
  try{
    const admin=await requireAdmin(req)
    const userId=admin.user?.id||null
    const collection=path.match(/^\/api\/finance\/(transactions|invoices|categories|rules)$/)
    if(collection){
      const config=ROUTES[collection[1]]
      if(req.method==='GET'){send(res,200,{[collection[1]]:await financeService[config.list]()});return true}
      if(req.method==='POST'){send(res,201,{[config.single]:await financeService[config.create](await readJson(req),userId)});return true}
    }
    const item=path.match(/^\/api\/finance\/(transactions|invoices|categories|rules)\/([^/]+)$/)
    if(item){
      const config=ROUTES[item[1]],id=decode(item[2])
      if(req.method==='PATCH'||req.method==='PUT'){
        const body=await readJson(req)
        const args=(item[1]==='transactions'||item[1]==='invoices')?[id,body.patch??body,body.expectedUpdatedAt,userId]:[id,body.patch??body,userId]
        send(res,200,{[config.single]:await financeService[config.update](...args)});return true
      }
      if(req.method==='DELETE'){await financeService[config.remove](id);send(res,200,{deleted:true,id});return true}
    }
    throw new HttpError(404,'Rota financeira não encontrada.','FINANCE_ROUTE_NOT_FOUND')
  }catch(error){
    const status=error instanceof HttpError?error.status:500
    const code=error instanceof HttpError?error.code:'INTERNAL_ERROR'
    const message=error instanceof HttpError?error.message:'Erro interno da API financeira.'
    if(status>=500)console.error(error)
    send(res,status,{message,code,...(error instanceof HttpError&&error.details?{details:error.details}:{})})
    return true
  }
}
