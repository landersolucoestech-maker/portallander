import {describe,expect,it} from 'vitest'
import {mockMarketingSeed as rawMockMarketingSeed} from '@portallander/mockup'

type MarketingSeed={
 campaigns:Array<{budget:number;spend:number;clicks:number;impressions:number;conversions:number}>
 owners:string[]
 contents:Array<{publishDate:string;publishTime:string;channels:string[];owner:string}>
 departments:string[]
 tasks:Array<{owner:string;department:string}>
 briefings:Array<{owners:string[]}>
 metrics:Array<{reach:number;impressions:number;clicks:number;conversions:number;spend:number;revenue:number}>
}
const mockMarketingSeed=rawMockMarketingSeed as MarketingSeed

describe('marketing mock contracts',()=>{
 it('keeps campaign financial values valid',()=>{expect(mockMarketingSeed.campaigns.every(x=>x.budget>=0&&x.spend>=0&&x.spend<=x.budget&&x.clicks>=0&&x.impressions>=0&&x.conversions>=0)).toBe(true)})
 it('keeps content dates, channels and owners valid',()=>{const owners=new Set(mockMarketingSeed.owners);expect(mockMarketingSeed.contents.every(x=>Boolean(x.publishDate)&&Boolean(x.publishTime)&&x.channels.length>0&&owners.has(x.owner))).toBe(true)})
 it('keeps task and briefing option relationships valid',()=>{const owners=new Set(mockMarketingSeed.owners),departments=new Set(mockMarketingSeed.departments);expect(mockMarketingSeed.tasks.every(x=>owners.has(x.owner)&&departments.has(x.department))).toBe(true);expect(mockMarketingSeed.briefings.every(x=>x.owners.every(owner=>owners.has(owner)))).toBe(true)})
 it('never exposes invalid metric ratios through zero/negative values',()=>{expect(mockMarketingSeed.metrics.every(x=>x.reach>=0&&x.impressions>=0&&x.clicks>=0&&x.conversions>=0&&x.spend>=0&&x.revenue>=0)).toBe(true)})
})
