import api from './api'

export const clientesService = {
  async list() {
    const { data } = await api.get('/clientes')
    return data.data
  },
  async create(payload) {
    const { data } = await api.post('/clientes', payload)
    return data.data
  },
  async update(id, payload) {
    const { data } = await api.put(`/clientes/${id}`, payload)
    return data.data
  },
  async remove(id) {
    const { data } = await api.delete(`/clientes/${id}`)
    return data.data
  },
}
