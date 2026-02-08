<template>
  <header class="bg-blue-600 text-white shadow-lg">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">TaskFlow</h1>
      <nav v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
        <span>Welcome, {{ authStore.user?.username }}</span>
        <button
          @click="logout"
          class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Header',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      authStore,
      logout
    }
  }
}
</script>
