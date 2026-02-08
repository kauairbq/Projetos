import api from './api'

export const importarService = {
  async importar(file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/importar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
}
