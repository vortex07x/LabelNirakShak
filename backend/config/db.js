// backend/config/db.js
import pg from 'pg'
import dns from 'dns'
import dotenv from 'dotenv'

dotenv.config() // ensure env vars are loaded before Pool is created, regardless of import order

dns.setDefaultResultOrder('ipv4first')

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function connectDB() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('PostgreSQL (Supabase) connected at', result.rows[0].now)
    client.release()
  } catch (err) {
    console.error('PostgreSQL connection failed:')
    console.error(err)
    process.exit(1)
  }
}