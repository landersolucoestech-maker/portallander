# @portallander/mockup

Fonte canônica de dados demonstrativos reutilizáveis do Portal Lander.

## Purpose

Este package existe exclusivamente para desenvolvimento visual, GitHub Pages de desenvolvimento, cenários E2E e testes que precisam de dados compartilhados e determinísticos. Ele contém **dados**, não UI, tradução ou copy de produto.

Fluxo obrigatório:

```text
UI
→ contrato/client/repository/read model existente
→ adapter de desenvolvimento do web
→ @portallander/mockup
```

A UI não deve importar datasets deste package diretamente.

## Scenario registry

O registry aceita somente:

- `full`: cenário completo, coerente e determinístico para desenvolvimento/Pages.
- `empty`: estados vazios honestos.
- `errors`: indisponibilidade/erro controlado para testes.

Um nome desconhecido, por exemplo `banana`, falha explicitamente. Não existe cenário arbitrário silencioso.

A seleção é feita por `VITE_MOCKUP_SCENARIO`. O runtime do package só pode ser ativado quando `VITE_ENABLE_DEMO_DATA=true` ou pelo servidor Vite em desenvolvimento.

## Adicionando um domínio

1. Reutilize o contrato real do produto; não invente um contrato específico de mockup.
2. Coloque no package apenas datasets, factories, relações cross-domain e valores determinísticos reutilizáveis.
3. Conecte o dataset por um adapter/client/repository/read model existente no web.
4. Não faça componente/página importar `@portallander/mockup` diretamente.
5. Derive contagens e relações quando a coleção canônica já permite calculá-las.
6. Adicione cobertura de determinismo e coerência referencial quando houver relações entre domínios.

## Development adapters

Podem permanecer em `apps/web`:

- `ApplicationDataProvider` implementation;
- bootstrap dinâmico de demo;
- browser/session state lifecycle;
- clients que escolhem API real vs scenario de desenvolvimento;
- repositories/read models específicos da aplicação;
- fixtures mínimas estritamente locais a testes.

**Reusable development runtime data MUST live in @portallander/mockup.**

**UI components MUST NOT own reusable demo datasets.**

## GitHub Pages

O artifact de desenvolvimento usa explicitamente:

```text
VITE_ENABLE_DEMO_DATA=true
VITE_MOCKUP_SCENARIO=full
```

Isso permite navegar pelas superfícies de desenvolvimento sem depender da API Node para dados que pertencem ao cenário global.

## Production prohibition

Build de produção usa:

```text
VITE_ENABLE_DEMO_DATA=''
VITE_MOCKUP_SCENARIO=''
```

`@portallander/mockup` é proibido no caminho de runtime de produção. Falhas de API/provider em produção permanecem indisponíveis; nunca caem em fallback de mockup. O workflow de Pages/production boundary inspeciona o bundle e exige zero marcadores de runtime do mockup.

## Determinism

IDs, datas, ordering e valores centrais do cenário devem ser estáveis. Não usar `Math.random()`, `Date.now()` ou UUID aleatório em datasets usados por screenshots, visual tests ou relações cross-domain.

## Hardcoded rule

Copy de interface, labels, menus, títulos e texto institucional fixo continuam junto da UI. Fixtures unitárias mínimas podem permanecer próximas de um teste quando representam somente um edge case isolado. Arrays, KPIs, leads, transações, candidatos, integrações, mídias e demais dados reutilizáveis de runtime de desenvolvimento não pertencem aos componentes e devem ser centralizados neste package.
