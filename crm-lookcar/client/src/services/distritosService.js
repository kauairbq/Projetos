import api from './api'

export const distritosService = {
  async list() {
    const { data } = await api.get('/distritos')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/distritos', payload)
    return data.data
  },
}
