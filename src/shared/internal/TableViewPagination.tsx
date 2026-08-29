import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

export type TablePageSize=5|10|20|50

export function TableViewPagination({page,totalPages,totalRecords,pageSize,onPageChange,onPageSizeChange}:{page:number;totalPages:number;totalRecords:number;pageSize:TablePageSize;onPageChange:(page:number)=>void;onPageSizeChange:(size:TablePageSize)=>void}){
  const safeTotal=Math.max(totalPages,1)
  const safePage=Math.min(Math.max(page,1),safeTotal)
  const first=safePage<=1
  const last=safePage>=safeTotal
  const start=totalRecords===0?0:(safePage-1)*pageSize+1
  const end=Math.min(safePage*pageSize,totalRecords)
  return <footer className="tableview-pagination" aria-label="Paginação da tabela">
    <div className="tableview-pagination-summary"><strong>{totalRecords}</strong><span>registro{totalRecords===1?'':'s'}</span><span className="tableview-pagination-range">{start}–{end} exibidos</span></div>
    <div className="tableview-pagination-center"><button type="button" aria-label="Primeira página" disabled={first} onClick={()=>onPageChange(1)}><ChevronsLeft size={14}/></button><button type="button" aria-label="Página anterior" disabled={first} onClick={()=>onPageChange(safePage-1)}><ChevronLeft size={14}/></button><span>Página <strong>{safePage}</strong> de <strong>{safeTotal}</strong></span><button type="button" aria-label="Próxima página" disabled={last} onClick={()=>onPageChange(safePage+1)}><ChevronRight size={14}/></button><button type="button" aria-label="Última página" disabled={last} onClick={()=>onPageChange(safeTotal)}><ChevronsRight size={14}/></button></div>
    <label className="tableview-page-size"><span>Por página</span><select value={pageSize} onChange={event=>onPageSizeChange(Number(event.target.value) as TablePageSize)}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
  </footer>
}
