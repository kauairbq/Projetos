<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-secondary">Agenda</h1>
        <p class="text-slate-600 text-sm">Calendário mensal/semanal com filtros de origem.</p>
      </div>
      <div class="flex gap-2">
        <select class="px-3 py-2 border border-slate-200 rounded-md text-sm">
          <option>Mostrar: todas</option>
          <option>agenda1</option>
          <option>agenda2</option>
          <option>agenda3</option>
          <option>agenda4</option>
          <option>crm</option>
        </select>
        <button class="px-3 py-2 bg-primary text-white rounded-md text-sm">Novo evento</button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-secondary">Eventos</h2>
      <ul class="divide-y divide-slate-100 text-sm text-slate-600">
        <li v-for="ev in eventos" :key="ev.id" class="py-2 flex justify-between">
          <span class="font-medium text-secondary">{{ ev.titulo }}</span>
          <span>{{ ev.data_hora_inicio }}</span>
          <span class="text-slate-500">{{ ev.tipo }} · {{ ev.origem_agenda }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAgendaStore } from '../stores/useAgendaStore'

const agendaStore = useAgendaStore()
const eventos = computed(() => agendaStore.eventos)
</script>
