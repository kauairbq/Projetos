import { defineStore } from 'pinia'

const sampleNegocios = [
  {
    id: 'n1',
    cliente_id: 'c1',
    valor_negocio_previsto: 18000,
    modo_pagamento: 'financiamento',
    financiamento_estado: 'em_analise',
    financiamento_motivo_recusa: '',
    tem_retoma: false,
    valor_retoma: 0,
    estado: 'financiamento',
    data_criacao: '2025-11-05',
    data_fecho_prevista: '2025-12-01',
    data_fecho_real: null,
  },
  {
    id: 'n2',
    cliente_id: 'c2',
    valor_negocio_previsto: 22000,
    modo_pagamento: 'retoma',
    financiamento_estado: null,
    financiamento_motivo_recusa: '',
    tem_retoma: true,
    valor_retoma: 7000,
    estado: 'proposta',
    data_criacao: '2025-10-25',
    data_fecho_prevista: '2025-11-20',
    data_fecho_real: null,
  },
]

export const useNegociosStore = defineStore('negocios', {
  state: () => ({ negocios: sampleNegocios }),
  getters: {
    total: (state) => state.negocios.length,
    porEstado: (state) => {
      const map = {}
      state.negocios.forEach((n) => (map[n.estado] = (map[n.estado] || 0) + 1))
      return map
    },
    valorTotalPrevisto: (state) => state.negocios.reduce((sum, n) => sum + (n.valor_negocio_previsto || 0), 0),
  },
  actions: {
    addNegocio(payload) {
      const id = `n${this.negocios.length + 1}`
      const isFinanciamento = payload.modo_pagamento === 'financiamento'
      const negocio = {
        id,
        cliente_id: payload.cliente_id,
        valor_negocio_previsto: Number(payload.valor_negocio_previsto) || 0,
        modo_pagamento: payload.modo_pagamento || 'pronto_pagamento',
        financiamento_estado: isFinanciamento ? payload.financiamento_estado || 'em_analise' : null,
        financiamento_motivo_recusa: isFinanciamento ? payload.financiamento_motivo_recusa || '' : '',
        tem_retoma: payload.tem_retoma ?? false,
        valor_retoma: payload.valor_retoma ?? 0,
        estado: isFinanciamento ? 'financiamento' : payload.estado || 'novo',
        data_criacao: payload.data_criacao || '',
        data_fecho_prevista: payload.data_fecho_prevista || '',
        data_fecho_real: payload.data_fecho_real || null,
      }
      this.negocios.push(negocio)
    },
  },
})
