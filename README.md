# Portal Lander

Frontend do Portal Lander.

## Política operacional de desenvolvimento

O Portal Lander está em desenvolvimento ativo e usa uma única branch operacional:

- `dev` é a branch canônica e única branch operacional.
- Não criar branches `feat/*`, `fix/*`, `chore/*`, `refactor/*`, `hotfix/*`, `release/*`, `test/*`, `ci/*`, temporárias ou equivalentes.
- Todo desenvolvimento, correção, teste, alteração de workflow, mockup e deploy de desenvolvimento é commitado diretamente em `dev`.
- Falhas de CI devem ser corrigidas diretamente em `dev`; não abrir branch de correção.
- O GitHub Pages de desenvolvimento é publicado exclusivamente a partir de `dev`.
- Antes de qualquer mutação Git, confirmar que o alvo operacional é `dev`.

Fluxo canônico: `dev → editar → testar → commit → push dev → GitHub Actions → corrigir em dev se necessário → GitHub Pages`.
