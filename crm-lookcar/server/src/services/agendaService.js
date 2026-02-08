import { query } from '../config/db.js'

export const agendaService = {
  async list() {
    const result = await query('SELECT * FROM agenda ORDER BY data_hora_inicio DESC')
    return result.rows
  },
  async create(data) {
    const result = await query(
      `INSERT INTO agenda (cliente_id, titulo, descricao, data_hora_inicio, data_hora_fim, tipo, origem_agenda, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        data.cliente_id,
        data.titulo,
        data.descricao || null,
        data.data_hora_inicio,
        data.data_hora_fim || null,
        data.tipo || null,
        data.origem_agenda || null,
        data.criado_por || null,
      ],
    )
    return result.rows[0]
  },
}
