import {describe,expect,it} from 'vitest'
import {mockMarketingSeed} from '../../mocks/marketing'

describe('marketing mock contracts',()=>{
 it('keeps campaign financial values valid',()=>{expect(mockMarketingSeed.campaigns.every(x=>x.budget>=0&&x.spend>=0&&x.spend<=x.budget&&x.clicks>=0&&x.impressions>=0&&x.conversions>=0)).toBe(true)})
 it('keeps content dates, channels and owners valid',()=>{const owners=new Set(mockMarketingSeed.owners);expect(mockMarketingSeed.contents.every(x=>Boolean(x.publishDate)&&Boolean(x.publishTime)&&x.channels.length>0&&owners.has(x.owner))).toBe(true)})
 it('keeps task and briefing option relationships valid',()=>{const owners=new Set(mockMarketingSeed.owners),departments=new Set(mockMarketingSeed.departments);expect(mockMarketingSeed.tasks.every(x=>owners.has(x.owner)&&departments.has(x.department))).toBe(true);expect(mockMarketingSeed.briefings.every(x=>x.owners.every(owner=>owners.has(owner)))).toBe(true)})
 it('never exposes invalid metric ratios through zero/negative values',()=>{expect(mockMarketingSeed.metrics.every(x=>x.reach>=0&&x.impressions>=0&&x.clicks>=0&&x.conversions>=0&&x.spend>=0&&x.revenue>=0)).toBe(true)})
})
