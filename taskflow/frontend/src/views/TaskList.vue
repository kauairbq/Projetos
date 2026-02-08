<template>
  <div class="task-list-view">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800">My Tasks</h2>
      <button
        @click="showAddForm = true"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Add New Task
      </button>
    </div>

    <!-- Filter and View Toggle -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex space-x-4">
        <select v-model="selectedCategory" @change="filterTasks" class="border rounded px-3 py-2">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <select v-model="selectedPriority" @change="filterTasks" class="border rounded px-3 py-2">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button
          @click="viewMode = 'list'"
          :class="viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
          class="px-3 py-2 rounded"
        >
          List
        </button>
        <button
          @click="viewMode = 'kanban'"
          :class="viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
          class="px-3 py-2 rounded"
        >
          Kanban
        </button>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="taskStore.loading" class="text-center py-8">Loading tasks...</div>
    <div v-else-if="taskStore.error" class="text-red-500 text-center py-8">{{ taskStore.error }}</div>

    <!-- Task Views -->
    <div v-else>
      <div v-if="viewMode === 'list'">
        <div v-if="filteredTasks.length === 0" class="text-center py-8 text-gray-500">
          No tasks found. Create your first task!
        </div>
        <TaskCard
          v-for="task in filteredTasks"
          :key="task._id"
          :task="task"
          @edit="editTask"
        />
      </div>

      <DragDropArea
        v-else
        :tasks="filteredTasks"
        @edit="editTask"
      />
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddForm || editingTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">{{ editingTask ? 'Edit Task' : 'Add New Task' }}</h3>
        <form @submit.prevent="saveTask">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Title</label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="taskForm.description"
              class="w-full border rounded px-3 py-2"
              rows="3"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Priority</label>
            <select v-model="taskForm.priority" class="w-full border rounded px-3 py-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Category</label>
            <input
              v-model="taskForm.category"
              type="text"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Due Date</label>
            <input
              v-model="taskForm.dueDate"
              type="date"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {{ editingTask ? 'Update' : 'Add' }} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useTaskStore } from '../stores/tasks'
import { useAuthStore } from '../stores/auth'
import TaskCard from '../components/TaskCard.vue'
import DragDropArea from '../components/DragDropArea.vue'

export default {
  name: 'TaskList',
  components: {
    TaskCard,
    DragDropArea
  },
  setup() {
    const taskStore = useTaskStore()
    const authStore = useAuthStore()

    return {
      taskStore,
      authStore
    }
  },
  data() {
    return {
      showAddForm: false,
      editingTask: null,
      viewMode: 'list',
      selectedCategory: '',
      selectedPriority: '',
      taskForm: {
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        dueDate: ''
      },
      filteredTasks: []
    }
  },
  computed: {
    categories() {
      return [...new Set(this.taskStore.tasks.map(task => task.category))]
    }
  },
  async mounted() {
    await this.taskStore.fetchTasks()
    this.filteredTasks = this.taskStore.tasks
    this.taskStore.connectSocket(this.authStore.user.id)
  },
  beforeUnmount() {
    this.taskStore.disconnectSocket()
  },
  methods: {
    filterTasks() {
      let tasks = this.taskStore.tasks

      if (this.selectedCategory) {
        tasks = tasks.filter(task => task.category === this.selectedCategory)
      }

      if (this.selectedPriority) {
        tasks = tasks.filter(task => task.priority === this.selectedPriority)
      }

      this.filteredTasks = tasks
    },

    editTask(task) {
      this.editingTask = task
      this.taskForm = { ...task }
    },

    async saveTask() {
      try {
        if (this.editingTask) {
          await this.taskStore.updateTask(this.editingTask._id, this.taskForm)
        } else {
          await this.taskStore.addTask(this.taskForm)
        }
        this.cancelEdit()
        this.filterTasks()
      } catch (error) {
        console.error('Error saving task:', error)
      }
    },

    cancelEdit() {
      this.showAddForm = false
      this.editingTask = null
      this.taskForm = {
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        dueDate: ''
      }
    }
  },
  watch: {
    'taskStore.tasks': {
      handler() {
        this.filterTasks()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.task-list-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
