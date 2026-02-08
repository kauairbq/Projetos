import api from './api'

export const origensService = {
  async list() {
    const { data } = await api.get('/origens')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/origens', payload)
    return data.data
  },
}
