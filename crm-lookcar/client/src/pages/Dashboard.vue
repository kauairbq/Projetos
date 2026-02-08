<template>
  <section class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="bg-white shadow rounded-lg p-4">
        <p class="text-xs text-slate-500">Leads no mês</p>
        <p class="text-3xl font-semibold text-primary">{{ clientes.total }}</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <p class="text-xs text-slate-500">Negócios</p>
        <p class="text-3xl font-semibold text-secondary">{{ negocios.total }}</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <p class="text-xs text-slate-500">Valor previsto</p>
        <p class="text-3xl font-semibold text-secondary">€ {{ negocios.valorTotalPrevisto.toLocaleString('pt-PT') }}</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <p class="text-xs text-slate-500">Eventos agenda</p>
        <p class="text-3xl font-semibold text-secondary">{{ agenda.totalEventos }}</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="bg-white shadow rounded-lg p-4 space-y-2">
        <h2 class="text-sm font-semibold text-secondary">Leads por origem</h2>
        <div class="space-y-1 text-sm text-slate-600">
          <div v-for="(valor, origem) in clientes.porOrigem" :key="origem" class="flex justify-between">
            <span>{{ origemLabel(origem) }}</span>
            <span class="font-semibold">{{ valor }}</span>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-2">
        <h2 class="text-sm font-semibold text-secondary">Leads por região</h2>
        <div class="space-y-1 text-sm text-slate-600">
          <div v-for="(valor, regiao) in clientes.porRegiao" :key="regiao" class="flex justify-between">
            <span>{{ regiao }}</span>
            <span class="font-semibold">{{ valor }}</span>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-2">
        <h2 class="text-sm font-semibold text-secondary">Negócios por estado</h2>
        <div class="space-y-1 text-sm text-slate-600">
          <div v-for="(valor, estado) in negocios.porEstado" :key="estado" class="flex justify-between">
            <span>{{ estado }}</span>
            <span class="font-semibold">{{ valor }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-secondary">Visão gráfica de leads</h2>
        <span class="text-xs text-slate-500">Origem e região</span>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-3">
          <p class="text-xs text-slate-500">Por origem</p>
          <div class="flex items-center gap-4" v-if="chartOrigem.length">
            <div
              class="relative w-32 h-32 rounded-full shadow-inner border border-slate-100 flex items-center justify-center"
              :style="{ backgroundImage: origemGradient }"
              aria-hidden="true"
            >
              <div class="absolute inset-4 rounded-full bg-white/85 backdrop-blur-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span class="text-[10px] uppercase tracking-wide text-slate-500">Total</span>
                <span class="text-lg font-bold text-secondary">{{ totalOrigem }}</span>
              </div>
            </div>
            <ul class="space-y-2 text-xs text-slate-700">
              <li v-for="item in chartOrigem" :key="item.id" class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-sm" :style="{ background: item.color }"></span>
                <span class="flex-1">{{ item.label }}</span>
                <span class="font-semibold text-secondary">{{ item.percent }}%</span>
              </li>
            </ul>
          </div>
          <div v-if="topOrigem" class="text-[11px] text-slate-600 flex items-center gap-2">
            <span class="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Destaque</span>
            <span class="font-semibold text-secondary">{{ topOrigem.label }}</span>
            <span class="text-xs text-slate-500">({{ topOrigem.percent }}% - {{ topOrigem.valor }} leads)</span>
          </div>
          <div v-else class="text-sm text-slate-400">Sem dados</div>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-slate-500">Por região</p>
          <div class="flex items-center gap-4" v-if="chartRegiao.length">
            <div
              class="relative w-32 h-32 rounded-full shadow-inner border border-slate-100 flex items-center justify-center"
              :style="{ backgroundImage: regiaoGradient }"
              aria-hidden="true"
            >
              <div class="absolute inset-4 rounded-full bg-white/85 backdrop-blur-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span class="text-[10px] uppercase tracking-wide text-slate-500">Total</span>
                <span class="text-lg font-bold text-secondary">{{ totalRegiao }}</span>
              </div>
            </div>
            <ul class="space-y-2 text-xs text-slate-700">
              <li v-for="item in chartRegiao" :key="item.id" class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-sm" :style="{ background: item.color }"></span>
                <span class="flex-1">{{ item.label }}</span>
                <span class="font-semibold text-secondary">{{ item.percent }}%</span>
              </li>
            </ul>
          </div>
          <div v-if="topRegiao" class="text-[11px] text-slate-600 flex items-center gap-2">
            <span class="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Destaque</span>
            <span class="font-semibold text-secondary">{{ topRegiao.label }}</span>
            <span class="text-xs text-slate-500">({{ topRegiao.percent }}% - {{ topRegiao.valor }} leads)</span>
          </div>
          <div v-else class="text-sm text-slate-400">Sem dados</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useClientesStore } from '../stores/useClientesStore'
import { useNegociosStore } from '../stores/useNegociosStore'
import { useAgendaStore } from '../stores/useAgendaStore'
import { useConfigStore } from '../stores/useConfigStore'

const clientesStore = useClientesStore()
const negociosStore = useNegociosStore()
const agendaStore = useAgendaStore()
const configStore = useConfigStore()

const clientes = computed(() => ({
  total: clientesStore.total,
  porOrigem: clientesStore.porOrigem,
  porRegiao: clientesStore.porRegiao,
}))

const negocios = computed(() => ({
  total: negociosStore.total,
  valorTotalPrevisto: negociosStore.valorTotalPrevisto,
  porEstado: negociosStore.porEstado,
}))

const agenda = computed(() => ({
  totalEventos: agendaStore.eventos.length,
}))

const origemLabel = (id) => {
  const found = configStore.origens.find((o) => o.id === id)
  return found ? found.nome : id
}

const originColor = (id) => {
  const map = {
    instagram: 'linear-gradient(90deg, #ec4899, #f472b6)',
    facebook: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
    tiktok: 'linear-gradient(90deg, #111827, #0ea5e9)',
    email: 'linear-gradient(90deg, #10b981, #34d399)',
    indicacao: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    publicacao: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
    outros: 'linear-gradient(90deg, #6b7280, #9ca3af)',
  }
  return map[id] || 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
}

const chartOrigem = computed(() => {
  const entries = Object.entries(clientesStore.porOrigem || {})
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1
  return entries.map(([id, valor]) => ({
    id,
    label: origemLabel(id),
    valor,
    percent: Math.round((valor / total) * 100),
    color: originColor(id),
  }))
})

const regiaoPalette = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#0ea5e9']
const chartRegiao = computed(() => {
  const entries = Object.entries(clientesStore.porRegiao || {})
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1
  return entries.map(([id, valor], index) => ({
    id,
    label: id,
    valor,
    percent: Math.round((valor / total) * 100),
    color: regiaoPalette[index % regiaoPalette.length],
  }))
})

const origemGradient = computed(() => buildConicGradient(chartOrigem.value))
const regiaoGradient = computed(() => buildConicGradient(chartRegiao.value))

const totalOrigem = computed(() => chartOrigem.value.reduce((sum, item) => sum + item.valor, 0))
const totalRegiao = computed(() => chartRegiao.value.reduce((sum, item) => sum + item.valor, 0))
const topOrigem = computed(() => chartOrigem.value.reduce((a, b) => (a && a.valor > b.valor ? a : b), null))
const topRegiao = computed(() => chartRegiao.value.reduce((a, b) => (a && a.valor > b.valor ? a : b), null))

function buildConicGradient(items) {
  if (!items.length) return 'conic-gradient(#e5e7eb 0deg 360deg)'
  let acc = 0
  const parts = items.map((item) => {
    const start = acc
    acc += (item.percent / 100) * 360
    return `${item.color} ${start}deg ${acc}deg`
  })
  // preencher resto, se nÇœo fechar 360
  if (acc < 360) parts.push(`#e5e7eb ${acc}deg 360deg`)
  return `conic-gradient(${parts.join(', ')})`
}
</script>
