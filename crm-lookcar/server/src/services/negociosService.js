import { query } from '../config/db.js'

export const negociosService = {
  async list() {
    const result = await query('SELECT * FROM negocios ORDER BY data_criacao DESC')
    return result.rows
  },
  async create(data) {
    const result = await query(
      `INSERT INTO negocios (cliente_id, valor_negocio_previsto, modo_pagamento, tem_retoma, valor_retoma, estado, data_fecho_prevista, data_fecho_real)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        data.cliente_id,
        data.valor_negocio_previsto ?? null,
        data.modo_pagamento || null,
        data.tem_retoma ?? null,
        data.valor_retoma ?? null,
        data.estado || null,
        data.data_fecho_prevista || null,
        data.data_fecho_real || null,
      ],
    )
    return result.rows[0]
  },
}
