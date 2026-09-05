import assert from 'node:assert/strict'
import {closePool,getPool} from '../src/db.js'

const pool=getPool()
const contentId='e2e_public_production_content'
const title='E2E Public Production Headline'
try{
  const page=(await pool.query("select id,slug from editorial_pages where page_type='editorial' and status='published' and active=true and visibility='public' order by menu_order,created_at limit 1")).rows[0]
  assert.ok(page?.id,'a published public editorial page is required')
  await pool.query('delete from editorial_contents where id=$1',[contentId])
  await pool.query(`insert into editorial_contents(id,page_id,title,slug,summary,body,author,status,active,tags,media,seo,published_at)
    values($1,$2,$3,'e2e-public-production-headline','Persisted in PostgreSQL for the real production public-provider proof.','[{"type":"paragraph","text":"Persisted production fixture."}]'::jsonb,'Portal Lander E2E','published',true,array['e2e-production'],'[]'::jsonb,'{}'::jsonb,now())`,[contentId,page.id,title])
  const snapshot=(await pool.query('select title,status,active,published_at from editorial_contents where id=$1',[contentId])).rows[0]
  assert.equal(snapshot.title,title)
  assert.equal(snapshot.status,'published')
  assert.equal(snapshot.active,true)
  assert.ok(snapshot.published_at)
  console.log(JSON.stringify({PUBLIC_PRODUCTION_FIXTURE:'READY',contentId,title,pageId:page.id,pageSlug:page.slug}))
} finally {await closePool()}
