import { query } from '../config/db.js'

export const clientesService = {
  async list() {
    const result = await query('SELECT * FROM clientes ORDER BY data_criacao DESC')
    return result.rows
  },
  async create(data) {
    const result = await query(
      `INSERT INTO clientes (nome, telefone, email, regiao, origem_id, estado_funil, financiamento, tem_retoma, valor_retoma, modo_pagamento, data_ultimo_contacto, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        data.nome,
        data.telefone || null,
        data.email || null,
        data.regiao || null,
        data.origem_id || null,
        data.estado_funil || null,
        data.financiamento ?? null,
        data.tem_retoma ?? null,
        data.valor_retoma ?? null,
        data.modo_pagamento || null,
        data.data_ultimo_contacto || null,
        data.observacoes || null,
      ],
    )
    return result.rows[0]
  },
  async update(id, data) {
    const result = await query(
      `UPDATE clientes SET nome=$1, telefone=$2, email=$3, regiao=$4, origem_id=$5, estado_funil=$6, financiamento=$7, tem_retoma=$8, valor_retoma=$9, modo_pagamento=$10, data_ultimo_contacto=$11, observacoes=$12
       WHERE id=$13 RETURNING *`,
      [
        data.nome,
        data.telefone || null,
        data.email || null,
        data.regiao || null,
        data.origem_id || null,
        data.estado_funil || null,
        data.financiamento ?? null,
        data.tem_retoma ?? null,
        data.valor_retoma ?? null,
        data.modo_pagamento || null,
        data.data_ultimo_contacto || null,
        data.observacoes || null,
        id,
      ],
    )
    return result.rows[0]
  },
  async remove(id) {
    await query('DELETE FROM clientes WHERE id=$1', [id])
    return { deleted: true }
  },
}
