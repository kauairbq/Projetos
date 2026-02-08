<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-secondary">Clientes/Leads</h1>
        <p class="text-slate-600 text-sm">Tabela com origem, interesse e funil.</p>
      </div>
      <button
        class="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition"
        @click="openModal"
      >
        Novo cliente
      </button>
    </div>

    <div class="grid gap-2 md:grid-cols-4">
      <input class="px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Filtrar por nome" />
      <select class="px-3 py-2 border border-slate-200 rounded-md text-sm">
        <option>Regiao</option>
        <option v-for="r in regioes" :key="r.id">{{ r.nome }}</option>
      </select>
      <select class="px-3 py-2 border border-slate-200 rounded-md text-sm">
        <option>Origem</option>
        <option v-for="o in origens" :key="o.id">{{ o.nome }}</option>
      </select>
      <select class="px-3 py-2 border border-slate-200 rounded-md text-sm">
        <option>Estado do funil</option>
        <option>novo</option>
        <option>em_contacto</option>
        <option>proposta</option>
        <option>financiamento</option>
        <option>ganho</option>
        <option>perdido</option>
      </select>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="text-left px-4 py-2">Nome</th>
            <th class="text-left px-4 py-2">Regiao</th>
            <th class="text-left px-4 py-2">Origem</th>
            <th class="text-left px-4 py-2">Interesse</th>
            <th class="text-left px-4 py-2">Estado</th>
            <th class="text-left px-4 py-2">Pagamento</th>
            <th class="text-left px-4 py-2">Ultimo contacto</th>
            <th class="text-left px-4 py-2">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id" class="border-t border-slate-100">
            <td class="px-4 py-2 font-medium text-secondary">{{ cliente.nome }}</td>
            <td class="px-4 py-2 text-slate-600">{{ cliente.regiao }}</td>
            <td class="px-4 py-2 text-slate-600">
              <div>{{ origemLabel(cliente.origem_id) }}</div>
              <div v-if="cliente.origem_detalhe" class="text-[11px] text-slate-500">
                {{ cliente.origem_detalhe }}
              </div>
            </td>
            <td class="px-4 py-2 text-slate-600">
              <div v-if="cliente.veiculo_interesse">
                {{ cliente.veiculo_interesse.modelo }} {{ cliente.veiculo_interesse.ano }} {{ cliente.veiculo_interesse.cor }}
              </div>
              <div v-else class="text-[11px] text-slate-400">Sem interesse definido</div>
              <div v-if="cliente.tem_retoma && cliente.veiculo_retoma" class="text-[11px] text-emerald-600">
                Retoma: {{ cliente.veiculo_retoma.modelo }} {{ cliente.veiculo_retoma.ano }}
                (EUR {{ cliente.veiculo_retoma.valor }})
              </div>
            </td>
            <td class="px-4 py-2 text-slate-600">
              <span class="inline-flex items-center gap-2">
                {{ cliente.estado_funil }}
                <button
                  class="text-xs text-primary border border-primary/30 px-2 py-1 rounded hover:bg-primary/10 transition"
                  @click="avancarEstado(cliente.id)"
                >
                  Avancar
                </button>
              </span>
            </td>
            <td class="px-4 py-2 text-slate-600">
              <div>{{ pagamentoLabel(cliente) }}</div>
              <div v-if="cliente.modo_pagamento === 'financiamento'" class="text-[11px] text-indigo-600">
                Financiamento: {{ financiamentoLabel(cliente.financiamento_estado) }}
              </div>
              <div
                v-if="cliente.financiamento_estado === 'recusado' && cliente.financiamento_motivo_recusa"
                class="text-[11px] text-rose-600"
              >
                Motivo: {{ cliente.financiamento_motivo_recusa }}
              </div>
            </td>
            <td class="px-4 py-2 text-slate-600">{{ cliente.data_ultimo_contacto }}</td>
            <td class="px-4 py-2 text-slate-600 space-x-2">
              <router-link :to="`/clientes/${cliente.id}`" class="text-primary">Ver</router-link>
              <button class="text-slate-500">Editar</button>
              <button class="text-slate-500">Criar negocio</button>
              <button class="text-slate-500">Criar evento</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Modal novo cliente -->
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-500">Criar lead/cliente</p>
          <h2 class="text-lg font-semibold text-secondary">Novo cliente</h2>
        </div>
        <button class="text-slate-500 hover:text-secondary" @click="closeModal">x</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="text-xs text-slate-600 space-y-1">
          Nome
          <input v-model="form.nome" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Telefone
          <input v-model="form.telefone" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Regiao
          <select v-model="form.regiao" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">Selecione</option>
            <option v-for="r in regioes" :key="r.id" :value="r.nome">{{ r.nome }}</option>
          </select>
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Origem
          <select v-model="form.origem_id" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">Selecione</option>
            <option v-for="o in origens" :key="o.id" :value="o.id">{{ o.nome }}</option>
          </select>
        </label>
        <label class="text-xs text-slate-600 space-y-1 sm:col-span-2">
          Origem detalhe (ex: publicacao IG, anuncio, indicacao)
          <input v-model="form.origem_detalhe" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Veiculo interesse (modelo)
          <input
            v-model="form.veiculo_interesse.modelo"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            placeholder="BMW 420"
          />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Ano
          <input
            v-model.number="form.veiculo_interesse.ano"
            type="number"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
          />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Cor
          <input v-model="form.veiculo_interesse.cor" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Estado do funil
          <select v-model="form.estado_funil" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="novo">Novo</option>
            <option value="em_contacto">Em contacto</option>
            <option value="proposta">Proposta</option>
            <option value="financiamento">Financiamento</option>
            <option value="ganho">Ganho</option>
            <option value="perdido">Perdido</option>
          </select>
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Pagamento
          <select v-model="form.modo_pagamento" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="financiamento">Financiamento</option>
            <option value="pronto_pagamento">Pronto pagamento</option>
            <option value="retoma">Retoma</option>
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
        <label
          v-if="form.modo_pagamento === 'financiamento'"
          class="text-xs text-slate-600 space-y-1 sm:col-span-2"
        >
          Motivo da recusa (quando recusado)
          <textarea
            v-model="form.financiamento_motivo_recusa"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
            rows="2"
            placeholder="Ex: documentacao incompleta, score baixo, etc."
          ></textarea>
        </label>
        <label class="text-xs text-slate-600 space-y-1">
          Tem retoma?
          <select v-model="form.tem_retoma" class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option :value="false">Nao</option>
            <option :value="true">Sim</option>
          </select>
        </label>
        <label v-if="form.tem_retoma" class="text-xs text-slate-600 space-y-1">
          Retoma - modelo
          <input
            v-model="form.veiculo_retoma.modelo"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            placeholder="Audi A3"
          />
        </label>
        <label v-if="form.tem_retoma" class="text-xs text-slate-600 space-y-1">
          Retoma - ano
          <input
            v-model.number="form.veiculo_retoma.ano"
            type="number"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
          />
        </label>
        <label v-if="form.tem_retoma" class="text-xs text-slate-600 space-y-1">
          Retoma - valor
          <input
            v-model.number="form.veiculo_retoma.valor"
            type="number"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
          />
        </label>
        <label class="text-xs text-slate-600 space-y-1 sm:col-span-2">
          Observacoes
          <textarea
            v-model="form.observacoes"
            class="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
            rows="2"
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
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useClientesStore } from '../stores/useClientesStore'
import { useConfigStore } from '../stores/useConfigStore'

const clientesStore = useClientesStore()
const configStore = useConfigStore()

const clientes = computed(() => clientesStore.clientes)
const regioes = computed(() => configStore.regioes)
const origens = computed(() => configStore.origens)

const origemLabel = (id) => {
  const found = configStore.origens.find((o) => o.id === id)
  return found ? found.nome : id
}

const pagamentoLabel = (cliente) => {
  if (cliente.modo_pagamento === 'financiamento') return 'Financiamento'
  if (cliente.modo_pagamento === 'pronto_pagamento') return 'Pronto pagamento'
  if (cliente.modo_pagamento === 'retoma') return 'Retoma'
  return cliente.modo_pagamento || 'N/D'
}

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
  nome: '',
  telefone: '',
  regiao: '',
  origem_id: '',
  origem_detalhe: '',
  veiculo_interesse: { modelo: '', ano: null, cor: '' },
  estado_funil: 'novo',
  modo_pagamento: 'financiamento',
  financiamento_estado: 'em_analise',
  financiamento_motivo_recusa: '',
  tem_retoma: false,
  veiculo_retoma: { modelo: '', ano: null, valor: null },
  observacoes: '',
})

const resetForm = () => {
  form.nome = ''
  form.telefone = ''
  form.regiao = ''
  form.origem_id = ''
  form.origem_detalhe = ''
  form.veiculo_interesse = { modelo: '', ano: null, cor: '' }
  form.estado_funil = 'novo'
  form.modo_pagamento = 'financiamento'
  form.financiamento_estado = 'em_analise'
  form.financiamento_motivo_recusa = ''
  form.tem_retoma = false
  form.veiculo_retoma = { modelo: '', ano: null, valor: null }
  form.observacoes = ''
}

const openModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const avancarEstado = (id) => {
  clientesStore.nextEstado(id)
}

const salvar = () => {
  if (!form.nome || !form.regiao || !form.origem_id) {
    alert('Preencha nome, regiao e origem.')
    return
  }
  clientesStore.addCliente({
    ...form,
    data_criacao: new Date().toISOString().slice(0, 10),
    data_ultimo_contacto: new Date().toISOString().slice(0, 10),
  })
  closeModal()
}
</script>
