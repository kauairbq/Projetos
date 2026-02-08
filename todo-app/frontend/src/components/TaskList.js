import React, { useState } from 'react';

export default function TaskList({ tasks = [] }){
  const [title, setTitle] = useState('');

  const addTask = async (e)=>{
    e.preventDefault();
    if(!title) return;
    await fetch('/api/tasks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title }) });
    setTitle('');
  };

  const toggle = async (task)=>{
    await fetch('/api/tasks/' + task._id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ done: !task.done }) });
  };

  const remove = async (task)=>{
    await fetch('/api/tasks/' + task._id, { method: 'DELETE' });
  };

  return (
    <div>
      <form onSubmit={addTask} style={{marginBottom:12}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nova tarefa" />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {tasks.map(t=> (
          <li key={t._id} style={{display:'flex',gap:8,alignItems:'center'}}>
            <span onClick={()=>toggle(t)} style={{cursor:'pointer'}}>{t.title} {t.done? '✅':''}</span>
            <button onClick={()=>remove(t)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
