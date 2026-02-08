import { createRouter, createWebHistory } from 'vue-router'
import TaskList from './views/TaskList.vue'
import ProjectsDashboard from './views/ProjectsDashboard.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Projects',
    component: ProjectsDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'TaskList',
    component: TaskList,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
