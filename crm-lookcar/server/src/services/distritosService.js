import { query } from '../config/db.js'

export const distritosService = {
  async list() {
    const result = await query(
      `SELECT d.*, r.nome as regiao_nome
       FROM distritos d
       LEFT JOIN regioes r ON r.id = d.regiao_id
       ORDER BY r.nome, d.nome`
    )
    return result.rows
  },
  async create(data) {
    const result = await query(
      `INSERT INTO distritos (nome, regiao_id, ilha)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [data.nome, data.regiao_id, data.ilha || null],
    )
    return result.rows[0]
  },
}
