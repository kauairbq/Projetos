<template>
  <aside class="w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen">
    <div class="px-6 py-4 border-b border-slate-200">
      <p class="text-xs uppercase text-slate-500 tracking-wide">CRM</p>
      <p class="text-lg font-semibold text-secondary">LookCar</p>
    </div>
    <nav class="p-4 space-y-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-secondary"
        :class="{'bg-slate-100 text-secondary font-medium': $route.path.startsWith(item.to)}"
      >
        <span class="text-sm">{{ item.icon }}</span>
        <span class="text-sm">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
const items = [
  { label: 'Dashboard', to: '/', icon: '📊' },
  { label: 'Clientes/Leads', to: '/clientes', icon: '👤' },
  { label: 'Negócios', to: '/negocios', icon: '💼' },
  { label: 'Agenda', to: '/agenda', icon: '🗓️' },
  { label: 'Importar Dados', to: '/importar', icon: '⬆️' },
  { label: 'Configurações', to: '/configuracoes', icon: '⚙️' },
]
</script>
