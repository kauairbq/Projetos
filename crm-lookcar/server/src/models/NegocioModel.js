module.exports = {
  table: 'negocios',
  fields: {
    id: 'uuid',
    cliente_id: 'uuid',
    valor_negocio_previsto: 'number',
    modo_pagamento: 'string', // financiamento | retoma | entrada_financiamento | pronto
    tem_retoma: 'boolean',
    valor_retoma: 'number',
    estado: 'string', // em_aberto | em_analise | aprovado | recusado | concluido
    data_criacao: 'date',
    data_fecho_prevista: 'date',
    data_fecho_real: 'date',
  },
}
