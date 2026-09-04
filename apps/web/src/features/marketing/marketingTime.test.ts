import {describe,expect,it} from 'vitest'
import type {MarketingContent} from './domain'
import {currentMonthKey,isUpcomingDeliveryDate,upcomingDeliveries} from './marketingTime'

const content=(publishDate:string,status:MarketingContent['status']='agendado'):MarketingContent=>({id:`${publishDate}-${status}`,title:'Conteúdo',context:'Editorial',subject:'Pauta',channels:['Site'],type:'Post',publishDate,publishTime:'12:00',copy:'Texto',campaign:'',hashtags:'',location:'',status,approval:'aprovado',owner:'Marketing',createdAt:'',updatedAt:''})

describe('marketing temporal semantics',()=>{
  it('derives the visible calendar month from the current clock',()=>{
    expect(currentMonthKey(new Date(2026,8,4,12))).toBe('2026-09')
    expect(currentMonthKey(new Date(2026,11,31,12))).toBe('2026-12')
    expect(currentMonthKey(new Date(2027,0,1,12))).toBe('2027-01')
  })

  it('defines próximos 7 dias as today through six days ahead',()=>{
    const now=new Date(2026,8,4,12)
    expect(isUpcomingDeliveryDate('2026-09-04',now)).toBe(true)
    expect(isUpcomingDeliveryDate('2026-09-10',now)).toBe(true)
    expect(isUpcomingDeliveryDate('2026-09-11',now)).toBe(false)
    expect(isUpcomingDeliveryDate('2026-09-03',now)).toBe(false)
  })

  it('crosses month and year boundaries without source changes',()=>{
    expect(isUpcomingDeliveryDate('2027-01-01',new Date(2026,11,29,12))).toBe(true)
    expect(isUpcomingDeliveryDate('2027-01-05',new Date(2026,11,29,12))).toBe(false)
  })

  it('counts only active upcoming delivery states',()=>{
    const now=new Date(2026,8,4,12)
    const values=[content('2026-09-04','agendado'),content('2026-09-05','producao'),content('2026-09-06','revisao'),content('2026-09-07','publicado'),content('2026-09-08','falhou'),content('2026-09-20','agendado')]
    expect(upcomingDeliveries(values,now).map(item=>item.status)).toEqual(['agendado','producao','revisao'])
  })
})
