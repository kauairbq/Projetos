import { defineStore } from 'pinia'
import axios from 'axios'
import { io } from 'socket.io-client'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    socket: null,
    loading: false,
    error: null
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter(task => task.completed),
    pendingTasks: (state) => state.tasks.filter(task => !task.completed),
    tasksByCategory: (state) => (category) => state.tasks.filter(task => task.category === category)
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        const response = await axios.get('http://localhost:3000/api/tasks')
        this.tasks = response.data
        this.error = null
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tasks'
      } finally {
        this.loading = false
      }
    },

    async addTask(taskData) {
      try {
        const response = await axios.post('http://localhost:3000/api/tasks', taskData)
        this.tasks.unshift(response.data)
        this.socket?.emit('taskUpdate', { type: 'add', task: response.data })
        return response.data
      } catch (error) {
        throw error.response?.data?.message || 'Failed to add task'
      }
    },

    async updateTask(taskId, updates) {
      try {
        const response = await axios.put(`http://localhost:3000/api/tasks/${taskId}`, updates)
        const index = this.tasks.findIndex(task => task._id === taskId)
        if (index !== -1) {
          this.tasks[index] = response.data
        }
        this.socket?.emit('taskUpdate', { type: 'update', task: response.data })
        return response.data
      } catch (error) {
        throw error.response?.data?.message || 'Failed to update task'
      }
    },

    async deleteTask(taskId) {
      try {
        await axios.delete(`http://localhost:3000/api/tasks/${taskId}`)
        this.tasks = this.tasks.filter(task => task._id !== taskId)
        this.socket?.emit('taskUpdate', { type: 'delete', taskId })
      } catch (error) {
        throw error.response?.data?.message || 'Failed to delete task'
      }
    },

    connectSocket(userId) {
      this.socket = io('http://localhost:3000')
      this.socket.emit('join', userId)

      this.socket.on('taskUpdated', (data) => {
        // Handle real-time updates from other users
        if (data.type === 'add') {
          this.tasks.unshift(data.task)
        } else if (data.type === 'update') {
          const index = this.tasks.findIndex(task => task._id === data.task._id)
          if (index !== -1) {
            this.tasks[index] = data.task
          }
        } else if (data.type === 'delete') {
          this.tasks = this.tasks.filter(task => task._id !== data.taskId)
        }
      })
    },

    disconnectSocket() {
      this.socket?.disconnect()
      this.socket = null
    }
  }
})
