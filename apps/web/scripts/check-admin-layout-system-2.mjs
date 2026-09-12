import {readFile} from 'node:fs/promises'
const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const layout=await read('src/styles/admin-layout-system.css')
const entry=await read('src/styles/admin-entry.css')
const required=['.marketing-kpi-icon','.marketing-platform-tabs-exact','.site-media-kit-editor','.tableview-pagination,.crm-pagination,.finance-pagination']
const failures=required.filter(token=>!layout.includes(token))
if(!entry.includes("@import './admin-layout-system.css';"))failures.push('layout import')
if(failures.length)throw new Error(`Admin layout invariants failed: ${failures.join(', ')}`)
console.log('Admin layout contract OK')
