const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const rootEnv = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: fs.existsSync(rootEnv) ? rootEnv : undefined });

const connectionString = process.env.ECOMMERCE_DATABASE_URL || process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      user: process.env.ECOMMERCE_POSTGRES_USER || process.env.POSTGRES_USER || 'your_username',
      host: process.env.ECOMMERCE_POSTGRES_HOST || process.env.POSTGRES_HOST || 'localhost',
      database: process.env.ECOMMERCE_POSTGRES_DB || process.env.POSTGRES_DB || 'ecommerce_db',
      password: process.env.ECOMMERCE_POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD || 'your_password',
      port: Number(process.env.ECOMMERCE_POSTGRES_PORT || process.env.POSTGRES_PORT || 5432),
    });

module.exports = pool;
