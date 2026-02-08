<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-secondary">Negocios</h1>
        <p class="text-slate-600 text-sm">Listagem, pagamento e estado de financiamento.</p>
      </div>
      <button
        class="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition"
        @click="openModal"
      >
        Novo negocio
      </button>
    </div>

    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-sm font-semibold text-secondary mb-2">Listagem</h2>
      <ul class="divide-y divide-slate-100 text-sm text-slate-600">
        <li v-for="n in negocios" :key="n.id" class="py-2 grid gap-2 md:grid-cols-5 items-center">
          <span class="font-medium text-secondary">{{ n.id }}</span>
          <span>Cliente: {{ n.cliente_id }}</span>
          <span>Pagamento: {{ n.modo_pagamento === 'financiamento' ? 'Financiamento' : 'Pronto pagamento' }}</span>
          <span v-if="n.modo_pagamento === 'financiamento'">
            Financiamento: {{ financiamentoLabel(n.financiamento_estado) }}
            <template v-if="n.financiamento_estado === 'recusado' && n.financiamento_motivo_recusa">
              <br />
              <span class="text-[11px] text-rose-600">Motivo: {{ n.financiamento_motivo_recusa }}</span>
            </template>
          </span>
          <span v-else>Estado: {{ n.estado }}</span>
          <span>EUR {{ n.valor_negocio_previsto?.toLocaleString('pt-PT') }}</span>
        </li>
      </ul>
    </div>

    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-sm font-semibold text-secondary mb-4">Pipeline (Kanban)</h2>
      <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-slate-600">
        <div
          v-for="(items, estado) in pipeline"
          :key="estado"
          class="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2"
        >
          <p class="font-semibold text-secondary">{{ estado }}</p>
          <div v-for="item in items" :key="item.id" class="bg-white border border-slate-200 rounded p-2 space-y-1">
            <p class="text-secondary font-medium">{{ item.id }}</p>
            <p>EUR {{ item.valor_negocio_previsto?.toLocaleString('pt-PT') }}</p>
            <p class="text-[11px] text-slate-500">Pagamento: {{ item.modo_pagamento }}</p>
            <p v-if="item.modo_pagamento === 'financiamento'" class="text-[11px] text-indigo-600">
              Financiamento: {{ financiamentoLabel(item.financiamento_estado) }}
            </p>
            <p
              v-if="item.financiamento_estado === 'recusado' && item.financiamento_motivo_recusa"
              class="text-[11px] text-rose-600"
            >
              Motivo: {{ item.financiamento_motivo_recusa }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Criar negocio</p>
            <h2 class="text-lg font-semibold text-secondary">Novo negocio</h2>
          </div>
          <button class="text-slate-500 hover:text-secondary" @click="closeModal">✕</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="text-xs text-slate-600 space-y-1">
            Cliente ID
            <input v-model="form.cliente_id" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </label>
          <label class="text-xs text-slate-600 space-y-1">
            Valor previsto (€)
            <input
              v-model.number="form.valor_negocio_previsto"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </label>
          <label class="text-xs text-slate-600 space-y-1">
            Pagamento
            <select v-model="form.modo_pagamento" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
              <option value="financiamento">Financiamento</option>
              <option value="pronto_pagamento">Pronto pagamento</option>
            </select>
          </label>
          <label v-if="form.modo_pagamento === 'financiamento'" class="text-xs text-slate-600 space-y-1">
            Estado do financiamento
            <select v-model="form.financiamento_estado" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
              <option value="em_analise">Em analise</option>
              <option value="aprovado">Aprovado</option>
              <option value="pedido_avalista">Pedido de avalista</option>
              <option value="recusado">Recusado</option>
            </select>
          </label>
          <label v-else class="text-xs text-slate-600 space-y-1">
            Estado do negocio
            <select v-model="form.estado" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
              <option value="novo">Novo</option>
              <option value="em_analise">Em analise</option>
              <option value="proposta">Proposta</option>
              <option value="financiamento">Financiamento</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
          </label>
          <label v-if="form.modo_pagamento === 'financiamento'" class="text-xs text-slate-600 space-y-1 sm:col-span-2">
            Motivo da recusa (quando recusado)
            <textarea
              v-model="form.financiamento_motivo_recusa"
              class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
              rows="2"
              placeholder="Ex: documentacao incompleta, score baixo, etc."
            ></textarea>
          </label>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button class="px-3 py-2 text-sm text-slate-600 hover:text-secondary" @click="closeModal">Cancelar</button>
          <button
            class="px-3 py-2 bg-secondary text-white rounded-md text-sm hover:bg-secondary/90 transition"
            @click="salvar"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useNegociosStore } from '../stores/useNegociosStore'

const negociosStore = useNegociosStore()
const negocios = computed(() => negociosStore.negocios)
const pipeline = computed(() => {
  const map = {}
  negociosStore.negocios.forEach((n) => {
    if (!map[n.estado]) map[n.estado] = []
    map[n.estado].push(n)
  })
  return map
})

const financiamentoLabel = (estado) => {
  const map = {
    em_analise: 'Em analise',
    aprovado: 'Aprovado',
    pedido_avalista: 'Pedido de avalista',
    recusado: 'Recusado',
  }
  return map[estado] || estado
}

const showModal = ref(false)
const form = reactive({
  cliente_id: '',
  valor_negocio_previsto: 0,
  modo_pagamento: 'financiamento',
  financiamento_estado: 'em_analise',
  financiamento_motivo_recusa: '',
  estado: 'novo',
})

const resetForm = () => {
  form.cliente_id = ''
  form.valor_negocio_previsto = 0
  form.modo_pagamento = 'financiamento'
  form.financiamento_estado = 'em_analise'
  form.financiamento_motivo_recusa = ''
  form.estado = 'novo'
}

const openModal = () => {
  resetForm()
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}
const salvar = () => {
  if (!form.cliente_id || !form.valor_negocio_previsto) {
    alert('Preencha cliente e valor.')
    return
  }
  negociosStore.addNegocio({
    ...form,
    data_criacao: new Date().toISOString().slice(0, 10),
    data_fecho_prevista: '',
    data_fecho_real: null,
    tem_retoma: false,
    valor_retoma: 0,
  })
  closeModal()
}
</script>
