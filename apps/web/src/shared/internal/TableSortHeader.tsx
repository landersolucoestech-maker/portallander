export type TableSortDirection='asc'|'desc'
export type TableSortState<K extends string>={key:K;direction:TableSortDirection}|null

export function TableSortHeader<K extends string>({label,column,sort,onSort}:{label:string;column:K;sort:TableSortState<K>;onSort:(state:NonNullable<TableSortState<K>>)=>void}){
  const direction=sort?.key===column?sort.direction:null
  return <div className="crm-sort-header"><span>{label}</span><div className="table-sort-buttons" role="group" aria-label={`Ordenar ${label}`}><button type="button" className={direction==='asc'?'active':''} aria-label={`${label}: ordem crescente`} aria-pressed={direction==='asc'} onClick={()=>onSort({key:column,direction:'asc'})}>↑</button><button type="button" className={direction==='desc'?'active':''} aria-label={`${label}: ordem decrescente`} aria-pressed={direction==='desc'} onClick={()=>onSort({key:column,direction:'desc'})}>↓</button></div></div>
}
