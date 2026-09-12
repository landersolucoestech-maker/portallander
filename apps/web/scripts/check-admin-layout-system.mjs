import {readFile} from 'node:fs/promises'
const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const layout=await read('src/styles/admin-layout-system.css')
const entry=await read('src/styles/admin-entry.css')
const required=['.marketing-kpi-icon','.marketing-platform-tabs-exact','.site-media-kit-editor','.site-media-kit-live-sticky','.tableview-pagination,.crm-pagination,.finance-pagination']
const missing=required.filter(token=>!layout.includes(token))
if(!entry.includes("@import './admin-layout-system.css';"))missing.push('admin layout import')
if(missing.length){console.error('Admin layout invariants failed:',missing);process.exit(1)}
console.log('Admin layout contract OK')
