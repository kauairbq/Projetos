# API REST para Gest?o

API exemplo com Express, JWT e Swagger (mock em mem?ria).

## Endpoints
- `POST /auth/login` - gera token JWT (informar email de um utilizador v?lido)
- `GET /users` - lista utilizadores (Bearer token)
- `POST /users` - cria utilizador (Bearer token)
- `GET /health` - healthcheck

## Como correr
```
npm install
node server.js
```
Documenta??o: http://localhost:4002/docs/swagger.html
