<template>
  <div class="min-h-screen bg-background-light text-secondary flex">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header :title="currentTitle" subtitle="Protótipo" />
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const route = useRoute()
const titleMap = {
  '/': 'Dashboard',
  '/clientes': 'Clientes/Leads',
  '/negocios': 'Negócios',
  '/agenda': 'Agenda',
  '/importar': 'Importar Dados',
  '/configuracoes': 'Configurações',
}
const currentTitle = computed(() => titleMap[route.path] || 'CRM LookCar')
</script>
