<template>
  <div
    class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 transition-all duration-200 hover:shadow-lg"
    :class="priorityClass"
  >
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-lg font-semibold text-gray-800" :class="{ 'line-through text-gray-500': task.completed }">
        {{ task.title }}
      </h3>
      <div class="flex space-x-2">
        <button
          @click="toggleComplete"
          class="text-green-500 hover:text-green-700 transition-colors"
          :title="task.completed ? 'Mark as incomplete' : 'Mark as complete'"
        >
          ✓
        </button>
        <button
          @click="editTask"
          class="text-blue-500 hover:text-blue-700 transition-colors"
          title="Edit task"
        >
          ✏️
        </button>
        <button
          @click="deleteTask"
          class="text-red-500 hover:text-red-700 transition-colors"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>

    <p v-if="task.description" class="text-gray-600 mb-2">{{ task.description }}</p>

    <div class="flex justify-between items-center text-sm text-gray-500">
      <span class="bg-gray-100 px-2 py-1 rounded">{{ task.category }}</span>
      <span v-if="task.dueDate" class="text-orange-600">
        Due: {{ formatDate(task.dueDate) }}
      </span>
    </div>
  </div>
</template>

<script>
import { useTaskStore } from '../stores/tasks'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  setup() {
    const taskStore = useTaskStore()
    return {
      taskStore
    }
  },
  computed: {
    priorityClass() {
      switch (this.task.priority) {
        case 'high':
          return 'border-red-500'
        case 'medium':
          return 'border-yellow-500'
        case 'low':
          return 'border-green-500'
        default:
          return 'border-gray-500'
      }
    }
  },
  methods: {
    async toggleComplete() {
      try {
        await this.$store.dispatch('updateTask', {
          id: this.task._id,
          completed: !this.task.completed
        })
      } catch (error) {
        console.error('Error toggling task completion:', error)
      }
    },

    editTask() {
      this.$emit('edit', this.task)
    },

    async deleteTask() {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await this.taskStore.deleteTask(this.task._id)
        } catch (error) {
          console.error('Error deleting task:', error)
        }
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>
