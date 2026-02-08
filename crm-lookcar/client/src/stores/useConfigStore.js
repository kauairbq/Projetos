import { defineStore } from 'pinia'
import { origensService } from '../services/origensService'
import { regioesService } from '../services/regioesService'
import { distritosService } from '../services/distritosService'

const defaultRegioes = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Norte' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Centro' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Lisboa' },
  { id: '44444444-4444-4444-4444-444444444444', nome: 'Alentejo' },
  { id: '55555555-5555-5555-5555-555555555555', nome: 'Algarve' },
  { id: '66666666-6666-6666-6666-666666666666', nome: 'Açores' },
  { id: '77777777-7777-7777-7777-777777777777', nome: 'Madeira' },
]

const defaultOrigens = [
  { id: 'instagram', nome: 'Instagram', ativo: true },
  { id: 'facebook', nome: 'Facebook', ativo: true },
  { id: 'tiktok', nome: 'TikTok', ativo: true },
  { id: 'email', nome: 'E-mail', ativo: true },
  { id: 'indicacao', nome: 'Indicação', ativo: true },
  { id: 'publicacao', nome: 'Publicação', ativo: true },
  { id: 'outros', nome: 'Outros', ativo: true },
]

const defaultDistritos = [
  { id: 'd1', nome: 'Viana do Castelo', regiao_id: defaultRegioes[0].id, ilha: null },
  { id: 'd2', nome: 'Porto', regiao_id: defaultRegioes[0].id, ilha: null },
  { id: 'd3', nome: 'Lisboa', regiao_id: defaultRegioes[2].id, ilha: null },
  { id: 'd4', nome: 'Faro', regiao_id: defaultRegioes[4].id, ilha: null },
]

export const useConfigStore = defineStore('config', {
  state: () => ({
    regioes: defaultRegioes,
    origens: defaultOrigens,
    distritos: defaultDistritos,
    loading: false,
    error: null,
  }),
  getters: {
    distritosPorRegiao: (state) => {
      const map = {}
      state.regioes.forEach((r) => (map[r.id] = []))
      state.distritos.forEach((d) => {
        if (!map[d.regiao_id]) map[d.regiao_id] = []
        map[d.regiao_id].push(d)
      })
      return map
    },
  },
  actions: {
    async fetchConfig() {
      try {
        this.loading = true
        const [origens, regioes, distritos] = await Promise.all([
          origensService.list().catch(() => defaultOrigens),
          regioesService.list().catch(() => defaultRegioes),
          distritosService.list().catch(() => defaultDistritos),
        ])
        this.origens = origens && origens.length ? origens : defaultOrigens
        this.regioes = regioes && regioes.length ? regioes : defaultRegioes
        this.distritos = distritos && distritos.length ? distritos : defaultDistritos
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar configurações'
      } finally {
        this.loading = false
      }
    },
    async addOrigem(nome) {
      const created = await origensService.create({ nome, ativo: true })
      this.origens.push(created)
      return created
    },
    async addRegiao(nome) {
      const created = await regioesService.create({ nome })
      this.regioes.push(created)
      return created
    },
    async addDistrito({ nome, regiao_id, ilha }) {
      const created = await distritosService.create({ nome, regiao_id, ilha })
      this.distritos.push(created)
      return created
    },
  },
})
