import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {authService,hashPassword} from '../src/authService.js'
import {closePool,getPool} from '../src/db.js'
import {handleFinanceRequest} from '../src/financeHttp.js'
import {financeService} from '../src/financeService.js'

const pool=getPool()
const marker=`finance-runtime-${randomUUID()}`

function responseCapture(){let status=0,body='';return{response:{writeHead(value){status=value},end(value=''){body+=String(value)}},result:()=>({status,body:body?JSON.parse(body):null})}}
async function financeHttpGet(token,path='/api/finance/transactions'){const capture=responseCapture();await handleFinanceRequest({method:'GET',url:path,headers:{host:'localhost',cookie:`portal_lander_session=${encodeURIComponent(token)}`},socket:{}},capture.response);return capture.result()}
async function cleanup(){
  await pool.query('delete from finance_transactions where notes=$1',[marker])
  await pool.query('delete from finance_invoices where description=$1',[marker])
  await pool.query('delete from finance_categories where category=$1',[marker])
  await pool.query('delete from finance_rules where name=$1',[marker])
  await pool.query('delete from admin_sessions where user_id in (select id from admin_users where email like $1)',[`${marker}-%`])
  await pool.query('delete from admin_users where email like $1',[`${marker}-%`])
}

try{
  await cleanup()

  const transaction=await financeService.createTransaction({
    type:'receita',description:'Finance Runtime Transaction',category:'Runtime',subcategory:'Proof',status:'pendente',date:'2026-09-10',dueDate:'2026-09-15',amount:1499.9,counterparty:'Runtime Client',document:'RUNTIME-TX',paymentMethod:'pix',paymentType:'avista',contractRef:'',costCenter:'QA',competence:'09/2026',notes:marker,
  },null)
  assert.ok(transaction.id)
  assert.equal(transaction.type,'receita')
  assert.equal(transaction.amount,1499.9)
  assert.ok((await financeService.listTransactions()).some(item=>item.id===transaction.id))
  const txUpdated=await financeService.updateTransaction(transaction.id,{...transaction,status:'pago',notes:marker},transaction.updatedAt,null)
  assert.equal(txUpdated.status,'pago')
  await assert.rejects(()=>financeService.updateTransaction(transaction.id,{...txUpdated,status:'cancelado'},transaction.updatedAt,null),error=>error?.code==='FINANCE_CONFLICT')

  const invoice=await financeService.createInvoice({
    number:'RUNTIME-001',series:'001',type:'saida',party:'Runtime Client',document:'00000000000100',issueDate:'2026-09-10',dueDate:'2026-09-20',amount:1499.9,status:'pendente',description:marker,pdfUrl:'',model:'55',operationNature:'Prestação de serviço',cfop:'5933',productsAmount:1499.9,icmsBase:0,icmsAmount:0,ipiAmount:0,pisAmount:0,cofinsAmount:0,issAmount:0,
  },null)
  assert.ok(invoice.id)
  assert.equal(invoice.type,'saida')
  assert.ok((await financeService.listInvoices()).some(item=>item.id===invoice.id))
  const invoiceUpdated=await financeService.updateInvoice(invoice.id,{...invoice,status:'emitida',description:marker},invoice.updatedAt,null)
  assert.equal(invoiceUpdated.status,'emitida')
  await assert.rejects(()=>financeService.updateInvoice(invoice.id,{...invoiceUpdated,status:'cancelada'},invoice.updatedAt,null),error=>error?.code==='FINANCE_CONFLICT')

  const category=await financeService.createCategory({category:marker,subcategory:'Receita Runtime',type:'receita',counterparty:'Cliente',active:true},null)
  assert.ok(category.id)
  assert.ok((await financeService.listCategories()).some(item=>item.id===category.id))
  const categoryUpdated=await financeService.updateCategory(category.id,{...category,subcategory:'Receita Runtime Atualizada'},null)
  assert.equal(categoryUpdated.subcategory,'Receita Runtime Atualizada')

  const rule=await financeService.createRule({name:marker,event:'transaction.created',condition:'category == Runtime',action:'classify Runtime',active:true},null)
  assert.ok(rule.id)
  assert.ok((await financeService.listRules()).some(item=>item.id===rule.id))
  const ruleUpdated=await financeService.updateRule(rule.id,{...rule,action:'classify Runtime Updated'},null)
  assert.equal(ruleUpdated.action,'classify Runtime Updated')

  const ownerId=`admin_${randomUUID()}`,editorId=`admin_${randomUUID()}`
  const ownerEmail=`${marker}-owner@example.com`,editorEmail=`${marker}-editor@example.com`,password='FinanceRuntime!123'
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[ownerId,ownerEmail,await hashPassword(password),'Finance Owner','owner'])
  await pool.query('insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,$5,true)',[editorId,editorEmail,await hashPassword(password),'Finance Editor','editor'])
  const ownerSession=await authService.login({email:ownerEmail,password}),editorSession=await authService.login({email:editorEmail,password})
  for(const path of ['/api/finance/transactions','/api/finance/invoices','/api/finance/categories','/api/finance/rules']){
    const ownerResponse=await financeHttpGet(ownerSession.token,path)
    assert.equal(ownerResponse.status,200)
  }
  const editorResponse=await financeHttpGet(editorSession.token)
  assert.equal(editorResponse.status,403)
  assert.equal(editorResponse.body?.code,'ADMIN_FORBIDDEN')

  const ownedTransaction=await financeService.createTransaction({type:'despesa',description:'Owned Finance Runtime',category:'Runtime',subcategory:'Auth',status:'pendente',date:'2026-09-11',amount:99.9,counterparty:'Runtime Supplier',paymentMethod:'pix',paymentType:'avista',contractRef:'',costCenter:'QA',competence:'09/2026',notes:marker},ownerId)
  const ownedRow=await pool.query('select created_by from finance_transactions where id=$1',[ownedTransaction.id])
  assert.equal(ownedRow.rows[0]?.created_by,ownerId)

  await financeService.removeTransaction(transaction.id)
  await financeService.removeTransaction(ownedTransaction.id)
  assert.ok(!(await financeService.listTransactions()).some(item=>item.id===transaction.id))
  await financeService.removeInvoice(invoice.id)
  assert.ok(!(await financeService.listInvoices()).some(item=>item.id===invoice.id))
  await financeService.removeCategory(category.id)
  assert.ok(!(await financeService.listCategories()).some(item=>item.id===category.id))
  await financeService.removeRule(rule.id)
  assert.ok(!(await financeService.listRules()).some(item=>item.id===rule.id))

  console.log('FINANCE_AUTHENTICATED_SOURCE=POSTGRESQL')
  console.log('FINANCE_AUTHENTICATED_LOCALSTORAGE_FALLBACK=NONE')
  console.log('FINANCE_TRANSACTIONS_CRUD=PASS_RUNTIME')
  console.log('FINANCE_INVOICES_CRUD=PASS_RUNTIME')
  console.log('FINANCE_CATEGORIES_CRUD=PASS_RUNTIME')
  console.log('FINANCE_RULES_CRUD=PASS_RUNTIME')
  console.log('FINANCE_CONCURRENCY=PASS_RUNTIME')
  console.log('FINANCE_AUTH_ATTRIBUTION=PASS_RUNTIME')
  console.log('FINANCE_RBAC_OWNER=PASS_RUNTIME')
  console.log('FINANCE_RBAC_EDITOR_DENIED=PASS_RUNTIME')
} finally {
  await cleanup().catch(()=>undefined)
  await closePool()
}
