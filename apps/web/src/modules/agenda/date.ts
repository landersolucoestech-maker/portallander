export const pad=(value:number)=>String(value).padStart(2,'0')
export const dateISO=(date:Date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`
export const timeHHMM=(date:Date)=>`${pad(date.getHours())}:${pad(date.getMinutes())}`
export const fromDateAndTime=(date:string,time:string)=>{if(!date)return'';const value=new Date(`${date}T${time||'00:00'}:00`);return Number.isNaN(value.getTime())?'':value.toISOString()}
export const startOfDay=(date:Date)=>new Date(date.getFullYear(),date.getMonth(),date.getDate())
export const startOfWeek=(date:Date)=>{const d=startOfDay(date);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d}
export const addDays=(date:Date,days:number)=>{const d=new Date(date);d.setDate(d.getDate()+days);return d}
export const addMonths=(date:Date,months:number)=>{const d=new Date(date);d.setMonth(d.getMonth()+months);return d}
export const addYears=(date:Date,years:number)=>{const d=new Date(date);d.setFullYear(d.getFullYear()+years);return d}
export const sameDay=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()
export const monthName=(date:Date)=>date.toLocaleDateString('pt-BR',{month:'long'})
export const periodLabel=(mode:'dia'|'semana'|'mes'|'ano',date:Date)=>{
 if(mode==='semana'){const start=startOfWeek(date),end=addDays(start,6);return `${start.getDate()} — ${end.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}`}
 if(mode==='mes')return date.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
 if(mode==='ano')return String(date.getFullYear())
 return date.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})
}
