import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Clientes from '../pages/Clientes.vue'
import ClienteDetalhes from '../pages/ClienteDetalhes.vue'
import Negocios from '../pages/Negocios.vue'
import Agenda from '../pages/Agenda.vue'
import Importar from '../pages/Importar.vue'
import Configuracoes from '../pages/Configuracoes.vue'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/clientes', name: 'clientes', component: Clientes },
  { path: '/clientes/:id', name: 'cliente-detalhes', component: ClienteDetalhes },
  { path: '/negocios', name: 'negocios', component: Negocios },
  { path: '/agenda', name: 'agenda', component: Agenda },
  { path: '/importar', name: 'importar', component: Importar },
  { path: '/configuracoes', name: 'configuracoes', component: Configuracoes },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
