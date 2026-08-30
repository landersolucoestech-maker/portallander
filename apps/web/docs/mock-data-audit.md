# Auditoria global de dados funcionais hardcoded — Etapa 1

Status: **inventário concluído para o frontend atual da branch `dev`**.

Objetivo deste documento: separar dados estruturais legítimos da interface de dados funcionais/demonstrativos que devem sair da camada visual ou de fontes paralelas e migrar para a arquitetura global de dados mockados nas próximas etapas.

## Classificações

- `KEEP_STATIC`: texto/layout/configuração técnica realmente estrutural; pode permanecer fixo.
- `MOVE_DOMAIN_OPTIONS`: opção de domínio reutilizável (status, tipos, categorias, filtros, moedas etc.); deve ter uma fonte única de domínio, não ser repetida na UI.
- `EXTERNALIZE_MOCK`: dado funcional, cadastral, estatístico, operacional ou de conteúdo demonstrativo que deve morar na camada de mocks.
- `USE_DATA_PROVIDER`: a UI acessa mock/localStorage/read-model diretamente; deve consumir repository/service/provider/hook estável.
- `DERIVE_FROM_DATA`: KPI, total, percentual ou dataset precisa ser calculado a partir dos registros estruturados.
- `SCENARIO_STATE`: estado simulado de loading/empty/error/degraded/permission/offline deve ser controlado por cenário/provider.

## 1. Shared / shell / acesso

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/shared/internal/AdminUi.tsx` | usuário exibido no Account Menu (iniciais, função e nome) escrito no componente | `EXTERNALIZE_MOCK` + `USE_DATA_PROVIDER` | `users/access` |
| `src/shared/internal/AdminUi.tsx` | mensagem fixa de zero notificações | `EXTERNALIZE_MOCK` + `SCENARIO_STATE` | `notifications` |
| `src/features/access/mocks/index.ts` | mock atual contém somente workspace/nome/função e não alimenta o shell | `EXTERNALIZE_MOCK` | ampliar domínio `access/users` |
| `src/features/access/WorkspacePage.tsx` | `workspaces` local define cards/rotas/descrições | `KEEP_STATIC` | mover apenas para config se necessário; não é massa de dados de negócio |
| `src/features/access/LoginPage.tsx` | textos de capability e formulário desabilitado | `KEEP_STATIC` | copy/estado técnico de autenticação |
| `src/features/access/AccountPages.tsx` | página de perfil sem dados reais | `SCENARIO_STATE` | futuro provider de usuário |

## 2. Dashboard

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/dashboard/DashboardPage.tsx` | `operationalAlerts=[]` definido na camada visual | `EXTERNALIZE_MOCK` | `dashboard/alerts` |
| `src/features/dashboard/DashboardPage.tsx` | Faturamento do Mês, A Receber, Contratos Ativos e Publicações Contratadas Pendentes exibidos como valores fixos indisponíveis | `DERIVE_FROM_DATA` + `SCENARIO_STATE` | finance/contracts/obligations providers |
| `src/features/dashboard/DashboardPage.tsx` | Próximos Compromissos fixado como indisponível | `EXTERNALIZE_MOCK` + `SCENARIO_STATE` | `agenda`/dashboard |
| `src/features/dashboard/DashboardPage.tsx` | Pipeline Comercial fixado como indisponível | `DERIVE_FROM_DATA` | CRM leads |
| `src/features/dashboard/DashboardPage.tsx` | Receita por Origem fixada como indisponível | `DERIVE_FROM_DATA` | Finance transactions/categories |
| `src/features/dashboard/api.ts` | métricas editoriais e atividade são derivadas do read model | `KEEP_STATIC` arquitetura / `DERIVE_FROM_DATA` já atendido | manter interface, trocar provider de origem |
| `src/features/dashboard/mocks/index.ts` | mock contém apenas período/notificações/pendingActions e não cobre a tela | `EXTERNALIZE_MOCK` | ampliar massa e/ou remover duplicidade em favor de dados derivados |

`DashboardSkeleton` e sua quantidade visual de placeholders são estrutura da interface, não dataset funcional.

## 3. CRM

### Dados existentes

`src/features/crm/mocks/index.ts` já possui `CrmState` tipado e repository de fallback. Entretanto existem somente 5 leads e 5 contatos, volume insuficiente para paginação/densidade real (page size atual 20), e os relacionamentos ainda não são a fonte canônica compartilhada com Finance/Contracts.

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/crm/mocks/index.ts` | 5 leads / 5 contatos; volume pequeno; entidades não canônicas para outros módulos | `EXTERNALIZE_MOCK` (ampliar/normalizar) | domínio CRM global |
| `src/features/crm/ContactFormModal.tsx` | opções inline de tipo de pessoa | `MOVE_DOMAIN_OPTIONS` | CRM domain options |
| `src/features/crm/ContactFormModal.tsx` | opções inline Ativo/Inativo | `MOVE_DOMAIN_OPTIONS` | CRM domain options |
| `src/features/crm/CrmPage.tsx` | filtros de entity type e status repetem opções do formulário | `MOVE_DOMAIN_OPTIONS` | mesma fonte única |
| `src/features/crm/domain.ts` | registries de status/tipo/serviço/origem/prioridade/temperatura/categoria/perfis | `KEEP_STATIC` como domínio; revisar organização na Etapa 3/12 | `crm/options` ou domain |
| `src/features/crm/domain.ts` | `emptyLead()` / `emptyContact()` | `KEEP_STATIC` como factory/default de criação; revisar na Etapa 3 | factory tipada |
| `src/features/crm/repository.ts` / `hooks.ts` | abstração já existente entre UI e seed | `KEEP_STATIC` arquitetura | será integrada ao provider global |

Os labels, títulos de formulário e mensagens de validação permanecem estruturais.

## 4. Contratos

### Estado atual dos mocks

- `contractsMockRecords=[]`
- `contractTemplatesMock=[]`
- categorias e variáveis existem.

Logo, o módulo não possui massa de contratos/templates para avaliação real e não consegue sustentar KPIs, filtros, paginação, assinaturas, anexos, timelines e edge cases com conteúdo realista.

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/contracts/mocks/index.ts` | contratos vazios | `EXTERNALIZE_MOCK` | criar contratos coerentes com CRM/Finance |
| `src/features/contracts/mocks/index.ts` | templates vazios | `EXTERNALIZE_MOCK` | criar templates realistas tipados |
| `src/features/contracts/mocks/index.ts` | categorias/variáveis já externas | `KEEP_STATIC`/dados de domínio | manter e normalizar |
| `src/features/contracts/ContractsPage.tsx` | KPIs calculados da coleção | `DERIVE_FROM_DATA` já atendido | manter cálculo sobre provider |
| `src/features/contracts/components/ContractWizardPortal.tsx` | `steps` | `KEEP_STATIC` | estrutura do wizard |
| `src/features/contracts/components/ContractWizardPortal.tsx` | `makeContract`/`emptyParty` com defaults de criação | `MOVE_DOMAIN_OPTIONS`/factory | mover para factory de domínio |
| `src/features/contracts/components/ContractWizardPortal.tsx` | opções inline de origem da parte, tipo de entidade, moeda e outros selects | `MOVE_DOMAIN_OPTIONS` | contract domain options |
| `src/features/contracts/domain.ts` | status, signature status e tipos de contrato centralizados | `KEEP_STATIC` como domínio | reorganizar na Etapa 3/12 |
| `src/features/contracts/repository.ts` / `hooks.ts` | já existe camada de acesso | `KEEP_STATIC` arquitetura | conectar ao provider global |

## 5. Financeiro

### Estado atual dos mocks

- 6 categorias
- 4 transações
- 3 notas fiscais
- 1 regra

O volume é insuficiente para testar paginação, filtros, seleção, atrasos, cancelamentos, anexos, parcelamento, diferentes períodos e grandes datasets. Além disso, os nomes/referências financeiros não correspondem de forma estável às entidades reais do CRM/Contratos mockados.

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/finance/mocks/index.ts` | massa pequena e referências genéricas/inconsistentes | `EXTERNALIZE_MOCK` (reconstruir) | Finance ligado a CRM/Contracts |
| `src/features/finance/FinanceMainPage.tsx` | importa `financeTransactionsMock` diretamente | `USE_DATA_PROVIDER` | finance repository/provider |
| `src/features/finance/FinanceMainPage.tsx` | lê/escreve `localStorage` na página | `USE_DATA_PROVIDER` | adapter/repository |
| `src/features/finance/FinanceMainPage.tsx` | objeto `blank` de transação dentro do modal | `MOVE_DOMAIN_OPTIONS`/factory | finance factory |
| `src/features/finance/FinanceMainPage.tsx` | options inline: tipo, pagamento, método, status | `MOVE_DOMAIN_OPTIONS` | finance domain options |
| `src/features/finance/FinanceMainPage.tsx` | KPIs receita/despesa/lucro/receber/pagar | `DERIVE_FROM_DATA` já atendido | manter derivação sobre provider |
| `src/features/finance/FinanceInvoicesPage.tsx` | importa raw invoice mock e controla localStorage na página | `USE_DATA_PROVIDER` | finance repository/provider |
| `src/features/finance/FinanceInvoicesPage.tsx` | objeto blank de nota e options de tipo/status inline | `MOVE_DOMAIN_OPTIONS`/factory | finance domain |
| `src/features/finance/FinanceInvoicesPage.tsx` | 6 KPIs derivados das notas | `DERIVE_FROM_DATA` já atendido | manter |
| `src/features/finance/FinanceAccountingPage.tsx` | lê `financeTransactionsMock` diretamente como fallback | `USE_DATA_PROVIDER` | mesmo finance provider |
| `src/features/finance/FinanceAccountingPage.tsx` | KPIs e resultados calculados da coleção | `DERIVE_FROM_DATA` já atendido | manter |
| `src/features/finance/FinancePage.tsx` | implementação combinada duplicada para categories/rules; seeds/storage/modais próprios | `USE_DATA_PROVIDER` + `MOVE_DOMAIN_OPTIONS` | consolidar sobre finance provider sem restaurar Automações |
| `src/features/finance/domain.ts` | domain importa mocks e reexporta `seed*` | `USE_DATA_PROVIDER` | desacoplar domain de mock |

Regra preservada: **Automações Financeiras não volta para o produto**. A nova arquitetura não pode reintroduzir a página removida.

## 6. Editorial / conteúdo público

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/editorial/data/legacySnapshot.ts` | páginas, notícias, imagens, autores, datas, categorias, summaries e bodies demonstrativos | `EXTERNALIZE_MOCK` | `mocks/editorial` |
| `src/features/editorial/mocks/index.ts` | placeholder vazio enquanto os dados reais continuam no legacy snapshot | `EXTERNALIZE_MOCK` | substituir pelo dataset editorial canônico |
| `src/features/editorial/repository.ts` | UI já consome read model/repository | `KEEP_STATIC` arquitetura | repository passa a ler provider global |
| `src/features/editorial/components/EditorialAdmin.tsx` | status de filtro definidos localmente | `MOVE_DOMAIN_OPTIONS` | editorial domain options |
| `src/features/editorial/components/EditorialListingPage.tsx` | conteúdo vem do repository | `KEEP_STATIC` arquitetura | preservar |
| `src/features/editorial/components/EditorialContentPage.tsx` | conteúdo vem do repository | `KEEP_STATIC` arquitetura | preservar |

## 7. Home pública

`src/pages/home/models/homeReadModel.ts` é hoje um grande dataset funcional bundled e deve deixar de ser a origem manual da Home.

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/pages/home/models/homeReadModel.ts` | URLs de imagens, stories, categorias, títulos, “Há X horas”, views | `EXTERNALIZE_MOCK` | dados editoriais/home derivados |
| `src/pages/home/models/homeReadModel.ts` | ranking `mostRead` | `EXTERNALIZE_MOCK`/dataset analytics mock | analytics/editorial |
| `src/pages/home/models/homeReadModel.ts` | releases | `EXTERNALIZE_MOCK` | editorial/releases |
| `src/pages/home/models/homeReadModel.ts` | agenda | `EXTERNALIZE_MOCK` | agenda/events |
| `src/pages/home/PublicHome.tsx` | tempos de ranking gerados por `index+3` | `EXTERNALIZE_MOCK`/`DERIVE_FROM_DATA` | metadata real do item |
| `src/pages/home/PublicHome.tsx` | Sidebar Ad com conteúdo publicitário completo escrito no componente | `EXTERNALIZE_MOCK` | advertising/home ad provider |
| `src/pages/home/models/heroModel.ts` | `heroArticles`, `defaultHeroSlide`, ticker e conteúdo demonstrativo | `EXTERNALIZE_MOCK` | `home/hero` |
| `src/pages/home/models/heroModel.ts` | normalização, storage keys, regras de renderização | `KEEP_STATIC` arquitetura | model/service |
| `src/pages/home/models/adModel.ts` | `defaultHomeAdConfig` com conteúdo publicitário e dimensões | conteúdo: `EXTERNALIZE_MOCK`; limites técnicos: `KEEP_STATIC` | advertising mock + config |

## 8. Publicidade de Notícias

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/pages/noticias/models/newsAdModel.ts` | `defaultNewsAdConfig` com título/subtitle/button/imageAlt e estado de campanha | `EXTERNALIZE_MOCK` | advertising/news |
| `src/pages/noticias/models/newsAdModel.ts` | limites de altura/largura, alinhamento e validação | `KEEP_STATIC` | model/config técnico |
| `src/pages/noticias/components/NewsAdEditor.tsx` | editor consome model/persistence | `USE_DATA_PROVIDER` futuramente | advertising provider |

## 9. Site Manager

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/features/site-manager/mocks/index.ts` | pages/media/categories vazios; placeholder não utilizado como base real | `EXTERNALIZE_MOCK` | alimentar a partir do dataset editorial compartilhado, sem universo paralelo |
| `src/features/site-manager/readModel.ts` | agrega dados editoriais | `KEEP_STATIC` arquitetura | provider global abaixo do read model |
| `src/features/site-manager/pages/HomeManagerPage.tsx` | array `sections` mistura definição estrutural com status/countLabel de runtime | config: `KEEP_STATIC`; estado/count: `DERIVE_FROM_DATA` | site config + selectors |
| `src/features/site-manager/pages/SiteManagerDashboardPage.tsx` | KPIs derivados do read model | `DERIVE_FROM_DATA` já atendido | manter |
| `src/features/site-manager/pages/SiteCategoriesPage.tsx` | dados vêm do read model | `KEEP_STATIC` arquitetura | manter |
| `src/features/site-manager/pages/SiteMediaPage.tsx` | `mediaTypes` local | `MOVE_DOMAIN_OPTIONS` | media domain options |
| `src/features/site-manager/pages/MediaKitPage.tsx` | contadores derivados do read model | `DERIVE_FROM_DATA` já atendido | manter |

## 10. Branding

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/shared/branding/models/headerBrandModel.ts` | default de marca (ativo, imagem, alt, tamanho, link, alinhamento) | dados de default: `EXTERNALIZE_MOCK`/config provider; restrições técnicas: `KEEP_STATIC` | shared branding provider |
| `src/shared/branding/models/footerBrandModel.ts` | default de rodapé | `EXTERNALIZE_MOCK`/config provider | shared branding provider |
| `src/shared/branding/assets/brandAsset.ts` | asset oficial do produto | `KEEP_STATIC` | asset técnico/branding |

## 11. Chrome público / navegação / newsletter

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/shared/public/PublicChrome.tsx` | menu principal derivado do editorial read model | `KEEP_STATIC` arquitetura | manter provider abaixo |
| `src/shared/public/PublicChrome.tsx` | arrays locais `institutional` e `help` | `KEEP_STATIC` se tratados como navegação institucional; preferir config única | public navigation config |
| `src/shared/public/PublicChrome.tsx` | social placeholders `IG/TK/YT/X/SP` sem entidade/link | `EXTERNALIZE_MOCK` | shared/social links |
| `src/shared/public/PublicChrome.tsx` | estado newsletter indisponível controlado localmente | `SCENARIO_STATE` + `USE_DATA_PROVIDER` | newsletter provider/scenario |
| `src/shared/public/PublicChrome.tsx` | copyright com ano literal | `KEEP_STATIC` com ano derivado/configurado | shared config |

## 12. Colabore

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/pages/colabore/ColaborePage.tsx` | `submissionLabels` local | `MOVE_DOMAIN_OPTIONS` | collaboration/submission options |
| `src/pages/colabore/ColaborePage.tsx` | estado de endpoint indisponível controlado no componente | `SCENARIO_STATE` + `USE_DATA_PROVIDER` | collaboration provider/scenario |
| `src/pages/colabore/ColaborePage.tsx` | campos vazios do formulário | `KEEP_STATIC` | estado de formulário, não massa fictícia |

## 13. Anuncie

| Arquivo | Ocorrência | Classificação | Destino previsto |
| --- | --- | --- | --- |
| `src/pages/anuncie/AnunciePage.tsx` | array `formats` de produtos/formatos publicitários | `EXTERNALIZE_MOCK` se representa catálogo comercial; ícones/layout `KEEP_STATIC` | advertising/products |
| `src/pages/anuncie/AnunciePage.tsx` | atendimento comercial indisponível fixado na UI | `SCENARIO_STATE` | advertising/contact provider |

## 14. Dados que podem permanecer fixos

A auditoria **não** considera hardcode indevido:

- rotas e paths;
- labels/títulos puramente estruturais;
- textos de botões;
- nomes de seções/tabs/steps que definem a arquitetura da UI;
- classes CSS;
- limites técnicos de tamanho/intervalo/paginação;
- storage keys;
- ícones;
- mensagens de validação;
- schemas e enums/tipos;
- assets oficiais do produto;
- factories vazias usadas para iniciar formulários, desde que os defaults de domínio sejam centralizados e tipados;
- configuração de navegação quando ela descreve a estrutura estática do produto, e não registros de negócio.

## 15. Lacunas globais confirmadas

1. Não existe hoje uma **camada global e canônica** de mocks; existem pastas locais desconectadas e snapshots paralelos.
2. `access`, `dashboard`, `editorial` e `site-manager` têm mocks placeholder/incompletos.
3. Contracts não possui contratos/templates mockados.
4. Finance tem somente 4 transações/3 notas/1 regra, insuficiente para teste real.
5. CRM tem apenas 5 leads/5 contatos, abaixo do page size e sem volume para paginação real.
6. Finance usa referências de contratos/clientes que não correspondem a entidades canônicas existentes.
7. Home possui dataset próprio independente do editorial, gerando duplicação de notícias e possibilidade de divergência.
8. UI financeira ainda importa mocks e `localStorage` diretamente.
9. Account/notifications ainda são apresentados por valores simulados no shell.
10. Não há provider global de cenários para loading/empty/error/partial/large/permission/offline.
11. Opções de domínio ainda são repetidas em alguns componentes.
12. Defaults de Hero/Ads/Branding vivem em models próprios e precisam convergir para uma única arquitetura de seed/config + provider.

## Gate da Etapa 1

**APROVADO para avançar apenas após este documento estar versionado e o CI confirmar que a branch continua íntegra.**

Próxima etapa autorizada após o gate: **Etapa 2 — definição da arquitetura global de mock data**. Nessa etapa será definida a estrutura modular e canônica, sem iniciar a migração completa dos componentes antes dos gates de tipos/contratos.