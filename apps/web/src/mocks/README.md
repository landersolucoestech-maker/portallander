# Camada global de Mock Data

Esta pasta é a fonte canônica de dados simulados do frontend do Portal Lander.

## Regra arquitetural

A camada visual **não importa datasets brutos desta pasta diretamente**. O fluxo alvo é:

```text
src/mocks/*
  ↓
data providers / repositories / services
  ↓
hooks / queries / selectors / state
  ↓
UI
```

## Domínios canônicos

- `identity`: usuário, workspace, sessão demonstrativa e níveis de acesso.
- `notifications`: notificações e eventos de atenção.
- `crm`: contatos, leads, interações e entidades comerciais.
- `contracts`: contratos, templates, categorias, variáveis, signatários, documentos e timelines.
- `finance`: transações, categorias financeiras, notas fiscais e regras.
- `editorial`: páginas, conteúdos, categorias/tags, mídia e metadados editoriais.
- `home`: projeções/datasets específicos da Home que não sejam simples selectors editoriais.
- `advertising`: inventário comercial e configurações de publicidade da Home/Notícias.
- `agenda`: compromissos/eventos operacionais compartilhados.
- `dashboard`: apenas cenários/fixtures específicas do dashboard; métricas devem ser derivadas de outros domínios sempre que possível.
- `collaboration`: tipos e cenários de envio de colaboração.
- `branding`: configurações simuladas de header/footer e identidade configurável.
- `shared`: IDs, datas de referência, factories e utilitários exclusivos da massa simulada.
- `scenarios`: configuração central de estados loading/empty/error/partial/large/permission/offline.

## Regras

1. Entidades compartilhadas possuem IDs estáveis e uma única definição canônica.
2. Finance não cria um “cliente” próprio: referencia CRM/Contracts.
3. Dashboard não mantém números arbitrários: deriva indicadores das coleções canônicas.
4. Home não duplica notícias do Editorial; usa projeções/selectors quando a entidade é a mesma.
5. Nenhum domain.ts deve importar mocks.
6. Nenhuma página/componente deve importar datasets brutos de `src/mocks`.
7. Opções verdadeiramente estáticas de domínio permanecem em contratos/options tipados, não viram registros fake.
8. Cenários de UI são controlados por `scenarios`, não por dezenas de flags locais.
9. A troca MockProvider → ApiProvider deve preservar a interface consumida pela UI.
10. Automações Financeiras continuam removidas e não fazem parte desta arquitetura.

Os arquivos `index.ts` de cada domínio são inicialmente barrels vazios. Eles serão preenchidos somente após a normalização de tipos da Etapa 3.