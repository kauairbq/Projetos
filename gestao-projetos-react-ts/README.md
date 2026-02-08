# Gestão de Projetos (React + TypeScript - demo estática)

- Pasta: `projects/gestao-projetos-react-ts/`
- Código-fonte (exercício TS): `dist/main.js` gerado manualmente a partir de TS equivalente (sem build).
- HTML de visualização: `dist/index.html` + `dist/style.css` (usa React via CDN).

Como abrir
1. Servir os ficheiros estáticos do repositório (já são servidos pelo `node server.js` na raiz).
2. Aceder a `http://localhost:8080/projects/gestao-projetos-react-ts/dist/index.html`.

Funcionalidades
- Dashboard: cria projetos, lista e calcula progresso pelas tarefas concluídas.
- Cada projeto permite adicionar/remover tarefas, alterar status (pendente, em progresso, concluída) e ver percentagem concluída.
- Validações mínimas (nome/descrição do projeto, título/data da tarefa) e persistência em `localStorage` (mock de API).

Notas
- Usa React 18 via CDN e foi escrito em TS “legível”, com types/classes no JS gerado manualmente.
- Se preferir trabalhar em TS, basta mover `dist/main.js` para `src/main.tsx` e usar Vite React TS para buildar. Este snapshot é para correcção rápida sem passo de build. 
