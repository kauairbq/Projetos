import { defineStore } from 'pinia'
import { useConfigStore } from './useConfigStore'

const sampleClientes = [
  {
    id: 'c1',
    nome: 'Ana Martins',
    telefone: '+351 910 000 001',
    email: 'ana@cliente.pt',
    regiao: 'Lisboa',
    origem_id: 'instagram',
    origem_detalhe: 'Publicacao IG - BMW 420 2022 branca',
    veiculo_interesse: { modelo: 'BMW 420', ano: 2022, cor: 'Branca' },
    estado_funil: 'em_contacto',
    modo_pagamento: 'financiamento',
    financiamento_estado: 'em_analise',
    financiamento_motivo_recusa: '',
    tem_retoma: true,
    veiculo_retoma: { modelo: 'Audi A3', ano: 2018, valor: 7500 },
    data_criacao: '2025-11-01',
    data_ultimo_contacto: '2025-11-10',
    observacoes: 'Prefere contacto ao fim da tarde.',
  },
  {
    id: 'c2',
    nome: 'Bruno Silva',
    telefone: '+351 912 222 222',
    email: 'bruno@exemplo.pt',
    regiao: 'Porto',
    origem_id: 'indicacao',
    origem_detalhe: 'Indicacao - amigo (Carlos)',
    veiculo_interesse: { modelo: 'Volvo XC60', ano: 2021, cor: 'Cinza' },
    estado_funil: 'proposta',
    modo_pagamento: 'pronto_pagamento',
    financiamento_estado: null,
    financiamento_motivo_recusa: '',
    tem_retoma: false,
    veiculo_retoma: null,
    data_criacao: '2025-10-20',
    data_ultimo_contacto: '2025-11-08',
    observacoes: 'Interessado em SUV.',
  },
]

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    clientes: sampleClientes,
  }),
  getters: {
    total: (state) => state.clientes.length,
    porOrigem: (state) => {
      const config = useConfigStore()
      const map = Object.fromEntries(config.origens.map((o) => [o.id, 0]))
      state.clientes.forEach((c) => (map[c.origem_id] = (map[c.origem_id] || 0) + 1))
      return map
    },
    porRegiao: (state) => {
      const config = useConfigStore()
      const map = Object.fromEntries(config.regioes.map((r) => [r.nome, 0]))
      state.clientes.forEach((c) => (map[c.regiao] = (map[c.regiao] || 0) + 1))
      return map
    },
  },
  actions: {
    addCliente(payload) {
      const id = `c${this.clientes.length + 1}`
      this.clientes.push({
        id,
        nome: payload.nome,
        telefone: payload.telefone || '',
        email: payload.email || '',
        regiao: payload.regiao || '',
        origem_id: payload.origem_id || 'outros',
        origem_detalhe: payload.origem_detalhe || '',
        veiculo_interesse: payload.veiculo_interesse || null,
        estado_funil: payload.estado_funil || 'novo',
        modo_pagamento: payload.modo_pagamento || 'financiamento',
        financiamento_estado: payload.financiamento_estado || null,
        financiamento_motivo_recusa: payload.financiamento_motivo_recusa || '',
        tem_retoma: payload.tem_retoma ?? false,
        veiculo_retoma: payload.veiculo_retoma || null,
        data_criacao: payload.data_criacao || '',
        data_ultimo_contacto: payload.data_ultimo_contacto || '',
        observacoes: payload.observacoes || '',
      })
    },
    nextEstado(id) {
      const ordem = ['novo', 'em_contacto', 'proposta', 'financiamento', 'ganho', 'perdido']
      const cliente = this.clientes.find((c) => c.id === id)
      if (!cliente) return
      const idx = ordem.indexOf(cliente.estado_funil)
      const proximo = idx >= 0 && idx < ordem.length - 1 ? ordem[idx + 1] : 'ganho'
      cliente.estado_funil = proximo
      cliente.data_ultimo_contacto = new Date().toISOString().slice(0, 10)
    },
  },
})
