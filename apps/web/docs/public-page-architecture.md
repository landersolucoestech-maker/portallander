# Arquitetura Canônica de Páginas Públicas — Portal Lander

## Objetivo

Este documento define a arquitetura obrigatória das páginas públicas internas do Portal Lander. Novas páginas não devem criar shells, heroes, containers, sidebars, módulos editoriais ou regras responsivas próprios quando a necessidade já estiver coberta por estes contratos.

A ordem de decisão é: **reutilizar → configurar → refatorar → consolidar → criar**.

## Primitivas canônicas

A composição estrutural vive em `src/shared/public/PublicPageArchitecture.tsx`:

- `PageShell`: chrome público global; integra Header, Newsletter configurável e Footer.
- `PageContainer`: largura e gutters canônicos.
- `PageHero`: Hero compartilhada e configurável pelo CMS.
- `Breadcrumbs`: navegação contextual compartilhada.
- `ContentSidebarLayout`: composição Main + Sidebar, inclusive a variante de detalhe.
- `PageSection`: ritmo vertical e superfícies de seção.
- `SectionHeading`: hierarquia compartilhada de títulos de seção.
- `PromotionalRegion`: região promocional fora do encerramento Main + Sidebar.

`PublicHeader` e `PublicFooter` continuam pertencendo a `src/shared/public/PublicChrome.tsx`; páginas não devem duplicá-los.

## Famílias de layout

### Editorial

Usada por listagens como Notícias, Cultura, Lançamentos, Bastidores e futuras páginas editoriais.

Contrato:

`PageShell → PageHero(editorial) → PageSection → PageContainer → ContentSidebarLayout(editorial)`

No desktop, o grid editorial usa três cards por linha. Em tablet, dois. Em mobile, um. Busca, categoria, ordenação e paginação pertencem ao Main e mantêm estado na URL.

A Sidebar editorial segue, quando disponíveis, a ordem:

1. Publicidade
2. Mais Lidas
3. Lançamentos

A região `Anuncie Aqui` deve vir depois do encerramento de Main + Sidebar. Newsletter e Footer permanecem globais no `PageShell`.

### Detail

Usada por páginas individuais de conteúdo editorial.

Contrato:

`PageShell → PageHero(detail) → PageSection → PageContainer → ContentSidebarLayout(detail)`

O Main possui largura confortável de leitura e comporta metadados, imagem principal, corpo, tags, compartilhamento e navegação editorial. A Sidebar reutiliza módulos públicos compartilhados; relacionados e regiões promocionais não devem criar implementações paralelas.

### Institutional

Usada por páginas institucionais, incluindo Sobre e páginas informativas equivalentes.

A Sidebar é opcional e só deve existir quando houver conteúdo secundário real. Não deve ser adicionada apenas para preencher espaço visual.

### Legal

Usada por Política de Privacidade, Termos, DMCA e documentos equivalentes quando existirem no domínio/CMS.

A variante utiliza largura de leitura apropriada e pode apresentar índice derivado dos headings reais do documento. Conteúdo jurídico não deve ser inventado nem hardcodado no renderer.

### Special

Páginas com comportamento de produto realmente específico, como Colabore, podem manter componentes funcionais próprios, porém continuam consumindo `PageShell`, `PageHero`, `PageContainer`, `PageSection`, tipografia, tokens e chrome globais.

## Hero e CMS

A Hero pública é configurada por `useSectionConfiguration` e pelo contrato `SectionConfiguration`. Alturas e paddings responsivos são derivados por `heroResponsiveCssVariables`.

As configurações editoriais, institucionais, legais e especiais são expostas no Gerenciador do Site. A estrutura visual não deve voltar a depender de classes específicas de Notícias ou Artigo.

O artwork padrão utilizado pelas Heroes configuráveis deve vir da fonte canônica definida em `sectionConfiguration.ts`; não criar cópias por página.

## Dados e fonte única

Páginas públicas consomem os domínios existentes em vez de criar mocks locais.

- Editorial: `editorialReadModel` / runtime data provider.
- Configurações públicas da Home: `usePublicHomeSections`.
- Configurações de seção: `useSectionConfiguration`.
- Lançamentos: `spotifyReleaseClient` e `SpotifyReleasesSection`; não existe fallback mock concorrente para releases.
- Branding e canais públicos: `publicSiteReadModel` e contratos compartilhados.
- Formulários: `SiteFormRenderer` + clients do domínio de formulários.
- Publicidade editorial: contrato compartilhado `EditorialAdConfig`; páginas não são proprietárias do tipo de dados.

## Módulos compartilhados

`src/shared/public/PublicEditorialModules.tsx` é a fonte de módulos editoriais reutilizáveis, incluindo Publicidade e Mais Lidas. A Home e páginas internas não devem possuir implementações concorrentes do mesmo módulo.

`SpotifyReleasesSection` pode variar a apresentação (`sidebar`, por exemplo), mas continua sendo o mesmo componente e a mesma fonte de dados.

## Tokens e CSS

`src/styles/public-page-architecture.css` concentra os tokens estruturais públicos, incluindo:

- `--pl-page-container`
- `--pl-page-gutter`
- `--pl-page-sidebar`
- `--pl-page-grid-gap`
- `--pl-page-section-gap`
- `--pl-page-block-gap`
- `--pl-page-reading-width`
- `--pl-page-radius`
- tokens de Hero desktop/tablet/mobile

`src/styles/public-layout-system.css` é a última camada de layout público e deve conter apenas invariantes globais, não correções específicas de uma rota.

`src/styles/public-typography-system.css` governa a hierarquia tipográfica pública. Não criar uma escala independente por página.

## Responsividade

O comportamento deve ser derivado do layout, não do nome da rota:

- editorial: 3 → 2 → 1 cards;
- Main + Sidebar colapsa para uma coluna quando o viewport não comporta a composição;
- grids secundários devem reduzir colunas sem overflow horizontal;
- textos longos e conteúdo gerenciável devem quebrar linha sem expandir o viewport;
- foco por teclado e `prefers-reduced-motion` são invariantes globais.

## Regras de não regressão

É proibido reintroduzir:

- `src/pages/noticias` como subsistema visual independente;
- `src/pages/article` como subsistema visual independente;
- Hero específica de Notícias ou Artigo;
- publicidade específica de Notícias quando o módulo compartilhado resolve o caso;
- tipos de dados globais importados de uma pasta de página;
- CSS de correção por rota para substituir o contrato global;
- mocks locais concorrendo com fontes reais existentes;
- conteúdo institucional ou jurídico inventado para preencher uma página.

## Certificação

`npm run check:architecture` deve validar os contratos estruturais. O pipeline completo também exige lint, typecheck, testes, build, auditoria visual e deploy.

Uma alteração pública só deve ser considerada concluída quando os gates aplicáveis estiverem verdes e não houver legado concorrente conhecido preservado sem justificativa.
