<template>
  <section class="space-y-4" v-if="cliente">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-secondary">{{ cliente.nome }}</h1>
        <p class="text-slate-600 text-sm">{{ cliente.email }} · {{ cliente.telefone }}</p>
      </div>
      <div class="text-sm text-slate-600">Estado: <span class="font-medium text-secondary">{{ cliente.estado_funil }}</span></div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="bg-white shadow rounded-lg p-4 space-y-1">
        <h2 class="text-sm font-semibold text-secondary">Dados</h2>
        <p class="text-sm text-slate-600">Região: {{ cliente.regiao }}</p>
        <p class="text-sm text-slate-600">Origem: {{ origemLabel(cliente.origem_id) }}</p>
        <p class="text-sm text-slate-600">Modo pagamento: {{ cliente.modo_pagamento }}</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-1">
        <h2 class="text-sm font-semibold text-secondary">Financiamento/Retoma</h2>
        <p class="text-sm text-slate-600">Financiamento: {{ cliente.financiamento ? 'Sim' : 'Não' }}</p>
        <p class="text-sm text-slate-600">Tem retoma: {{ cliente.tem_retoma ? 'Sim' : 'Não' }}</p>
        <p class="text-sm text-slate-600">Valor retoma: € {{ cliente.valor_retoma }}</p>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-1">
        <h2 class="text-sm font-semibold text-secondary">Observações</h2>
        <p class="text-sm text-slate-600">{{ cliente.observacoes }}</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="bg-white shadow rounded-lg p-4 space-y-2">
        <h3 class="text-sm font-semibold text-secondary">Negócios</h3>
        <ul class="space-y-1 text-sm text-slate-600">
          <li v-for="neg in negociosDoCliente" :key="neg.id" class="flex justify-between">
            <span>{{ neg.estado }} · € {{ neg.valor_negocio_previsto }}</span>
            <span class="text-slate-500">{{ neg.modo_pagamento }}</span>
          </li>
        </ul>
      </div>
      <div class="bg-white shadow rounded-lg p-4 space-y-2">
        <h3 class="text-sm font-semibold text-secondary">Eventos</h3>
        <ul class="space-y-1 text-sm text-slate-600">
          <li v-for="ev in eventosDoCliente" :key="ev.id" class="flex justify-between">
            <span>{{ ev.titulo }}</span>
            <span class="text-slate-500">{{ ev.data_hora_inicio }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
  <section v-else class="p-6 bg-white shadow rounded-lg">
    <p class="text-secondary">Cliente não encontrado.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClientesStore } from '../stores/useClientesStore'
import { useNegociosStore } from '../stores/useNegociosStore'
import { useAgendaStore } from '../stores/useAgendaStore'
import { useConfigStore } from '../stores/useConfigStore'

const route = useRoute()
const clientesStore = useClientesStore()
const negociosStore = useNegociosStore()
const agendaStore = useAgendaStore()
const configStore = useConfigStore()

const cliente = computed(() => clientesStore.clientes.find((c) => c.id === route.params.id))
const negociosDoCliente = computed(() => negociosStore.negocios.filter((n) => n.cliente_id === route.params.id))
const eventosDoCliente = computed(() => agendaStore.eventos.filter((e) => e.cliente_id === route.params.id))

const origemLabel = (id) => {
  const found = configStore.origens.find((o) => o.id === id)
  return found ? found.nome : id
}
</script>
