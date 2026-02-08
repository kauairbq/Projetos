import { defineStore } from 'pinia'

const sampleEventos = [
  {
    id: 'e1',
    cliente_id: 'c1',
    titulo: 'Chamada de follow-up',
    descricao: 'Confirmar documentos de financiamento.',
    data_hora_inicio: '2025-11-15T10:00:00Z',
    data_hora_fim: '2025-11-15T10:30:00Z',
    tipo: 'chamada',
    origem_agenda: 'crm',
    criado_por: 'joao',
  },
  {
    id: 'e2',
    cliente_id: 'c2',
    titulo: 'Visita ao stand',
    descricao: 'Apresentar SUV com retoma.',
    data_hora_inicio: '2025-11-18T14:00:00Z',
    data_hora_fim: '2025-11-18T15:00:00Z',
    tipo: 'visita',
    origem_agenda: 'agenda2',
    criado_por: 'maria',
  },
]

export const useAgendaStore = defineStore('agenda', {
  state: () => ({ eventos: sampleEventos }),
  getters: {
    porOrigemAgenda: (state) => {
      const map = {}
      state.eventos.forEach((e) => (map[e.origem_agenda] = (map[e.origem_agenda] || 0) + 1))
      return map
    },
  },
})
