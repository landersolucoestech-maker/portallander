# @portallander/mockup

Fonte canônica de dados demonstrativos reutilizáveis do Portal Lander.

## Finalidade

Este package existe exclusivamente para desenvolvimento visual, GitHub Pages de desenvolvimento, cenários E2E e testes que precisam de um dataset compartilhado e determinístico.

Fluxo obrigatório:

```text
UI
→ contrato/client/repository existente
→ adapter de desenvolvimento do web
→ @portallander/mockup
```

A UI não deve importar datasets deste package diretamente.

## Cenários

- `full`: cenário visual completo e determinístico.
- `empty`: estados vazios.
- `errors`: estados indisponíveis/erro.

A seleção é feita por `VITE_MOCKUP_SCENARIO`, mas o package só pode ser carregado em runtime quando `VITE_ENABLE_DEMO_DATA=true` (ou no servidor Vite em desenvolvimento).

## Produção

`@portallander/mockup` é proibido no caminho de runtime de produção. Falhas de API/provider em produção devem permanecer indisponíveis; nunca devem cair em fallback de mockup.

## Regras

**NEVER HARDCODE DEVELOPMENT DATA IN UI COMPONENTS.**

Dados reutilizáveis de runtime de desenvolvimento devem entrar aqui. Copy de interface, labels, menus, títulos e texto institucional fixo continuam junto da UI. Fixtures unitárias mínimas podem permanecer próximas de um teste quando representam apenas um edge case isolado.

IDs e datas do mockup devem ser determinísticos. Não usar `Math.random()`, `Date.now()` ou UUID aleatório para datasets usados em screenshots/visual tests.
