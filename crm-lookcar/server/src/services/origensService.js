import { query } from '../config/db.js'

export const origensService = {
  async list() {
    const result = await query('SELECT * FROM origens ORDER BY nome ASC')
    return result.rows
  },
  async create(nome, ativo = true) {
    const result = await query('INSERT INTO origens (nome, ativo) VALUES ($1,$2) RETURNING *', [nome, ativo])
    return result.rows[0]
  },
}
