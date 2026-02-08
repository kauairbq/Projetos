# Portefólio Personal Trainer (Protótipo)

Site estático, focado em mostrar serviços, dicas rápidas, biblioteca de exercícios, calculadoras básicas (IMC e macros) e CTA para contacto. Pensado para evoluir para uma área autenticada de alunos.

## Estrutura
- `index.html` — landing page principal.
- `style.css` — estilos (tema escuro com destaques em azul/turquesa).
- `script.js` — dicas dinâmicas e calculadoras.
- `assets/img/` — espaço para logótipos, fotos e ícones.
- `data/` — reservado para futuros JSONs (planos, exercícios, dicas).
- `backend/` — reservado para futura API/login (Node/Express + DB).

## Próximos passos (futuros)
- Adicionar assets reais (logo, fotos de alunos/treinos, ícones).
- Separar dados de dicas/serviços em ficheiros JSON em `data/`.
- Implementar backend em `backend/` com login de alunos, avaliações físicas/nutricionais e planos de treino.
- Conectar formulários a um serviço (e-mail/WhatsApp ou API própria).

## Como usar localmente
Servir a pasta `projects/personal-trainer/` no `localhost` (ex.: via `wamp`/Node estático) e abrir `index.html`.
