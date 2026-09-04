export type PeriodComparison={status:'AVAILABLE';current:number;previous:number;absoluteDelta:number;percentageDelta:number|null;trend:'up'|'down'|'flat'}|{status:'INSUFFICIENT_DATA';current:number|null;previous:number|null}

export function comparePeriods(current:number|null,previous:number|null):PeriodComparison{
 if(current===null||previous===null)return {status:'INSUFFICIENT_DATA',current,previous}
 const absoluteDelta=current-previous
 const percentageDelta=previous===0?(current===0?0:null):(absoluteDelta/Math.abs(previous))*100
 return {status:'AVAILABLE',current,previous,absoluteDelta,percentageDelta,trend:absoluteDelta>0?'up':absoluteDelta<0?'down':'flat'}
}

export function comparisonLabel(comparison:PeriodComparison){
 if(comparison.status==='INSUFFICIENT_DATA')return 'Comparação indisponível'
 if(comparison.percentageDelta===null)return comparison.absoluteDelta===0?'Sem variação':'Variação percentual indisponível'
 const sign=comparison.percentageDelta>0?'+':''
 return `${sign}${comparison.percentageDelta.toFixed(1)}% vs período anterior`
}
