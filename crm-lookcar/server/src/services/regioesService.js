import { query } from '../config/db.js'

export const regioesService = {
  async list() {
    const result = await query('SELECT * FROM regioes ORDER BY nome ASC')
    return result.rows
  },
  async create(nome) {
    const result = await query('INSERT INTO regioes (nome) VALUES ($1) RETURNING *', [nome])
    return result.rows[0]
  },
}
