module.exports = {
  table: 'clientes',
  fields: {
    id: 'uuid',
    nome: 'string',
    telefone: 'string',
    email: 'string',
    regiao: 'string',
    origem_id: 'string',
    estado_funil: 'string', // novo | em_contacto | proposta | financiamento | ganho | perdido
    financiamento: 'boolean',
    tem_retoma: 'boolean',
    valor_retoma: 'number',
    modo_pagamento: 'string', // financiamento | retoma | entrada_financiamento | pronto
    data_criacao: 'date',
    data_ultimo_contacto: 'date',
    observacoes: 'text',
  },
}
