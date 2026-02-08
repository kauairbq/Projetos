<template>
  <section class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-secondary">Configurações</h1>
      <p class="text-slate-600 text-sm">Gerencie origens, regiões, distritos e preferências.</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="bg-white shadow rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-secondary">Origens</h2>
          <form class="flex gap-2" @submit.prevent="criarOrigem">
            <input v-model="novaOrigem" class="px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Nova origem" />
            <button class="px-3 py-2 bg-primary text-white rounded-md text-sm" type="submit">Adicionar</button>
          </form>
        </div>
        <ul class="text-sm text-slate-600 space-y-1">
          <li v-for="o in origens" :key="o.id" class="flex justify-between items-center">
            <span>{{ o.nome }}</span>
            <span class="text-slate-500">{{ o.ativo ? 'Ativo' : 'Inativo' }}</span>
          </li>
        </ul>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-secondary">Regiões</h2>
          <form class="flex gap-2" @submit.prevent="criarRegiao">
            <input v-model="novaRegiao" class="px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Nova região" />
            <button class="px-3 py-2 bg-primary text-white rounded-md text-sm" type="submit">Adicionar</button>
          </form>
        </div>
        <ul class="text-sm text-slate-600 space-y-1">
          <li v-for="r in regioes" :key="r.id" class="flex justify-between items-center">
            <span>{{ r.nome }}</span>
            <span class="text-slate-500">ID: {{ r.id }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-secondary">Distritos</h2>
        <form class="flex gap-2 flex-wrap" @submit.prevent="criarDistrito">
          <input v-model="novoDistrito" class="px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Novo distrito" />
          <select v-model="distritoRegiao" class="px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option disabled value="">Escolha a região</option>
            <option v-for="r in regioes" :key="r.id" :value="r.id">{{ r.nome }}</option>
          </select>
          <input v-model="distritoIlha" class="px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Ilha (opcional)" />
          <button class="px-3 py-2 bg-primary text-white rounded-md text-sm" type="submit">Adicionar</button>
        </form>
      </div>
      <div class="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
        <div v-for="r in regioes" :key="r.id" class="border border-slate-200 rounded-md p-3 space-y-1">
          <p class="font-semibold text-secondary">{{ r.nome }}</p>
          <ul class="space-y-1">
            <li v-for="d in (distritosPorRegiao[r.id] || [])" :key="d.id" class="flex justify-between">
              <span>{{ d.nome }}</span>
              <span class="text-slate-500" v-if="d.ilha">Ilha: {{ d.ilha }}</span>
            </li>
            <li v-if="!(distritosPorRegiao[r.id] || []).length" class="text-slate-400">Sem distritos.</li>
          </ul>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useConfigStore } from '../stores/useConfigStore'

const store = useConfigStore()
const novaOrigem = ref('')
const novaRegiao = ref('')
const novoDistrito = ref('')
const distritoRegiao = ref('')
const distritoIlha = ref('')

const error = computed(() => store.error)
const origens = computed(() => store.origens)
const regioes = computed(() => store.regioes)
const distritosPorRegiao = computed(() => store.distritosPorRegiao)

onMounted(() => {
  store.fetchConfig()
})

const criarOrigem = async () => {
  if (!novaOrigem.value.trim()) return
  try {
    await store.addOrigem(novaOrigem.value.trim())
    novaOrigem.value = ''
  } catch (err) {
    store.error = err?.message || 'Erro ao criar origem'
  }
}

const criarRegiao = async () => {
  if (!novaRegiao.value.trim()) return
  try {
    await store.addRegiao(novaRegiao.value.trim())
    novaRegiao.value = ''
  } catch (err) {
    store.error = err?.message || 'Erro ao criar região'
  }
}

const criarDistrito = async () => {
  if (!novoDistrito.value.trim() || !distritoRegiao.value) return
  try {
    await store.addDistrito({ nome: novoDistrito.value.trim(), regiao_id: distritoRegiao.value, ilha: distritoIlha.value || null })
    novoDistrito.value = ''
    distritoRegiao.value = ''
    distritoIlha.value = ''
  } catch (err) {
    store.error = err?.message || 'Erro ao criar distrito'
  }
}
</script>
