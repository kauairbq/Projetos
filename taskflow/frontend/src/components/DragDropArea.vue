<template>
  <div class="drag-drop-area">
    <div
      v-for="column in columns"
      :key="column.id"
      class="column"
      @drop="onDrop($event, column.id)"
      @dragover.prevent
      @dragenter.prevent
    >
      <h3 class="column-title">{{ column.title }}</h3>
      <div class="task-list">
        <div
          v-for="task in getTasksForColumn(column.id)"
          :key="task._id"
          class="task-item"
          draggable
          @dragstart="onDragStart($event, task)"
        >
          <TaskCard :task="task" @edit="editTask" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskCard from './TaskCard.vue'

export default {
  name: 'DragDropArea',
  components: {
    TaskCard
  },
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      columns: [
        { id: 'pending', title: 'Pending' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'completed', title: 'Completed' }
      ]
    }
  },
  methods: {
    getTasksForColumn(columnId) {
      switch (columnId) {
        case 'pending':
          return this.tasks.filter(task => !task.completed)
        case 'completed':
          return this.tasks.filter(task => task.completed)
        default:
          return []
      }
    },

    onDragStart(event, task) {
      event.dataTransfer.setData('text/plain', task._id)
    },

    async onDrop(event, columnId) {
      const taskId = event.dataTransfer.getData('text/plain')
      const task = this.tasks.find(t => t._id === taskId)

      if (!task) return

      let updates = {}

      if (columnId === 'completed' && !task.completed) {
        updates.completed = true
      } else if (columnId === 'pending' && task.completed) {
        updates.completed = false
      }

      if (Object.keys(updates).length > 0) {
        try {
          await this.taskStore.updateTask(taskId, updates)
        } catch (error) {
          console.error('Error updating task:', error)
        }
      }
    },

    editTask(task) {
      this.$emit('edit', task)
    }
  }
}
</script>

<style scoped>
.drag-drop-area {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px;
}

.column {
  flex: 1;
  min-width: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
}

.column-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.task-list {
  min-height: 300px;
}

.task-item {
  margin-bottom: 8px;
  cursor: move;
}

.task-item:hover {
  opacity: 0.8;
}
</style>
