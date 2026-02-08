# Estrategia Git - SmartConnect Home

## Estrutura de branches

- `main`: versao estavel para releases e entregas.
- `develop`: integracao diaria do trabalho.
- `feature/*`: novas funcionalidades.
- `fix/*`: correcao de bugs.
- `chore/*`: manutencao, configs e deps.

## Fluxo recomendado

1. Criar branch a partir de `develop`.
2. Trabalhar com commits pequenos e mensagens objetivas.
3. Abrir PR para `develop`.
4. Fazer merge para `main` apenas quando estiver pronto para release.

## Convencoes de commit (sugestao)

- `feat:`
- `fix:`
- `docs:`
- `chore:`
- `refactor:`
- `test:`
