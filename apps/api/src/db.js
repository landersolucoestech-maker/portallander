import pg from 'pg'

const {Pool}=pg
let pool

export function getDatabaseUrl(env=process.env){
  return env.DATABASE_URL||env.POSTGRES_URL||''
}

export function getPool(){
  if(pool)return pool
  const connectionString=getDatabaseUrl()
  if(!connectionString)throw new Error('DATABASE_URL (ou POSTGRES_URL) não configurada.')
  const local=/localhost|127\.0\.0\.1/.test(connectionString)
  pool=new Pool({connectionString,ssl:local?false:{rejectUnauthorized:false},max:Number(process.env.DB_POOL_MAX||5)})
  return pool
}

export async function withTransaction(work){
  const client=await getPool().connect()
  try{
    await client.query('begin')
    const value=await work(client)
    await client.query('commit')
    return value
  }catch(error){
    await client.query('rollback').catch(()=>undefined)
    throw error
  }finally{client.release()}
}

export async function closePool(){
  if(!pool)return
  const current=pool
  pool=undefined
  await current.end()
}
