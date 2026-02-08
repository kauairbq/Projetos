import api from './api'

export const negociosService = {
  async list() {
    const { data } = await api.get('/negocios')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/negocios', payload)
    return data.data
  },
}
