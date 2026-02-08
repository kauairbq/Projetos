# Aplicativo de Tarefas (Todo App)

Este é um scaffold mínimo de um aplicativo de tarefas com frontend simples (pasta `frontend/public`) e backend em Node.js/Express com MongoDB e Socket.io para atualizações em tempo real.

Requisitos:
- Node.js (v16+)
- Docker (para MongoDB) ou MongoDB local

Iniciar MongoDB com Docker Compose:

```powershell
cd todo-app
docker compose up -d
```

Iniciar backend:

```powershell
cd todo-app/backend
npm install
npm run dev
```

O backend espera `MONGODB_URI` em `.env` ou usará `mongodb://localhost:27017/todoapp` por padrão. Para usar o container Docker, defina `MONGODB_URI=mongodb://mongo:27017/todoapp` em `.env` ou use o `.env.example`.

Iniciar frontend (versão estática simples):

```powershell
cd todo-app/frontend
# instale 'serve' globalmente se ainda não tiver: npm i -g serve
npm install
npm start
```

O frontend está em `todo-app/frontend/public` e faz chamadas para `http://localhost:5000/api/tasks` e usa socket.io em `http://localhost:5000`.

Observações:
- Este scaffold usa um frontend mínimo sem build (apenas arquivos estáticos) para facilitar execução local sem create-react-app.
- Para integrar um frontend React completo, substitua o conteúdo da pasta `frontend` por um projeto React e aponte o fetch/socket para `http://localhost:5000`.
