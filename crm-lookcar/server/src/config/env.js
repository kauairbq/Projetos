import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const rootEnv = path.resolve(__dirname, '../../../../../.env')
dotenv.config({ path: fs.existsSync(rootEnv) ? rootEnv : undefined })

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.CRM_DATABASE_URL || process.env.DATABASE_URL || '',
  jwtSecret: process.env.CRM_JWT_SECRET || process.env.JWT_SECRET || '',
}
