import api from './api'

export const regioesService = {
  async list() {
    const { data } = await api.get('/regioes')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/regioes', payload)
    return data.data
  },
}
