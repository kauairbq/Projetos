<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-secondary">Importar Dados</h1>
        <p class="text-slate-600 text-sm">Upload de Excel/CSV, mapeamento de colunas e preview.</p>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm">Download Template Excel</button>
        <button class="px-3 py-2 bg-primary text-white rounded-md text-sm">Importar agora</button>
      </div>
    </div>
    <div class="bg-white shadow rounded-lg p-4 space-y-3 text-sm text-slate-600">
      <div class="border border-dashed border-slate-300 rounded p-4 text-center">Arraste ou selecione um ficheiro .xlsx ou .csv</div>
      <div class="bg-slate-50 border border-slate-200 rounded p-3">Pré-visualização das primeiras linhas (placeholder)</div>
      <div class="bg-slate-50 border border-slate-200 rounded p-3">Mapeamento de colunas (placeholder)</div>
    </div>
  </section>
</template>

<script setup>
</script>
