import pkg from 'pg'
const { Pool } = pkg
import { env } from './env.js'

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
})

export const query = (text, params) => pool.query(text, params)
