import api from './api'

export const agendaService = {
  async list() {
    const { data } = await api.get('/agenda')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/agenda', payload)
    return data.data
  },
}
