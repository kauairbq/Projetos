import React, { useEffect, useState } from 'react';
import TaskList from './components/TaskList';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks)
      .catch(console.error);

    socket.on('taskCreated', () => fetchTasks());
    socket.on('taskUpdated', () => fetchTasks());
    socket.on('taskDeleted', () => fetchTasks());

    function fetchTasks(){
      fetch('/api/tasks')
        .then(res => res.json())
        .then(setTasks)
        .catch(console.error);
    }

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Aplicativo de Tarefas</h1>
      <TaskList tasks={tasks} />
    </div>
  );
}
