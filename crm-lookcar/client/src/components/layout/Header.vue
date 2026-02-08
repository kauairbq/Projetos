<template>
  <header class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
    <div>
      <p class="text-sm text-slate-500">CRM LookCar</p>
      <h1 class="text-lg font-semibold text-secondary">{{ title }}</h1>
    </div>
    <div class="text-sm text-slate-500">{{ subtitle }}</div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  subtitle: { type: String, default: 'v0.1' },
})
</script>
