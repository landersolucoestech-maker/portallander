# Portal Lander — arquitetura de entrega Hostinger

## Estado canônico

O branch de desenvolvimento canônico é `dev`. Push em `dev` executa validações, mas não publica GitHub Pages e não autoriza deploy de produção.

O projeto não usa Vercel como destino de hospedagem.

## Arquitetura do repositório

O Portal Lander é um monorepo com dois runtimes distintos:

1. **Frontend React/Vite** (`apps/web`)
   - build: `npm ci && npm run build`
   - artefato: `apps/web/dist`
   - o `base` público é configurável via `VITE_PUBLIC_BASE`;
   - para domínio/subdomínio servido na raiz, usar `VITE_PUBLIC_BASE=/`;
   - para um subdiretório, informar o prefixo com `/` inicial e final.

2. **API Node.js** (`apps/api`)
   - validação: `npm --workspace @portallander/api run build`
   - start persistente: `npm --workspace @portallander/api start`
   - porta: variável `PORT` (fallback de desenvolvimento: `8787`);
   - requer conectividade PostgreSQL e variáveis de ambiente do runtime.

O frontend administrativo aponta para a API através de `VITE_PORTAL_API_BASE_URL`. Credenciais e secrets não devem ser incorporados ao bundle do frontend.

## Requisitos mínimos do alvo Hostinger

Para hospedar o Portal completo em uma única solução Hostinger, o alvo precisa oferecer, diretamente ou por componentes compatíveis:

- publicação dos arquivos estáticos de `apps/web/dist`;
- processo Node.js persistente para `apps/api`;
- configuração segura de variáveis de ambiente;
- conectividade PostgreSQL;
- HTTPS e encaminhamento adequado para a API;
- persistência/serviço de arquivos compatível com a configuração de Storage usada pela API, quando esse recurso for ativado.

Se o produto Hostinger disponível suportar apenas arquivos estáticos, ele é suficiente apenas para o frontend. Isso **não** torna o Portal completo production-ready, porque a API administrativa, Analytics, Mídia Kit persistente, autenticação e demais serviços Node continuariam sem runtime.

## Variáveis conhecidas — nomes, não valores

Frontend build-time:

- `VITE_PUBLIC_BASE`
- `VITE_PORTAL_API_BASE_URL`
- `VITE_ENABLE_DEMO_DATA` — **não usar em produção**; reservado a desenvolvimento/testes/fixtures explícitas.

API/runtime, conforme módulos atuais:

- `PORT`
- `DATABASE_URL` e/ou parâmetros PostgreSQL aceitos pelo módulo de banco
- `PORTAL_ALLOWED_ORIGINS`
- `PORTAL_SESSION_COOKIE_NAME`
- `PORTAL_SESSION_SAME_SITE`
- `PORTAL_SESSION_COOKIE_SECURE`
- `PORTAL_ADMIN_TOKEN` — legado; não registrar valor no repositório
- credenciais de Storage/provider somente no ambiente autorizado
- credenciais GA4 somente no ambiente autorizado

O inventário exato de aliases GA4 é validado pelo workflow de Analytics; nenhum valor deve ser impresso em logs.

## GitHub Pages

GitHub Pages existia como publicação automática vinculada a push em `dev`. Esse acoplamento foi removido. O workflow `Frontend CI` agora mantém qualidade/build/browser checks e possui somente `contents: read`; não executa `configure-pages`, `upload-pages-artifact` nem `deploy-pages`.

O path histórico `/portallander/` continua como default de desenvolvimento/compatibilidade, mas não é mais uma decisão fixa de hospedagem: `VITE_PUBLIC_BASE` define o path do alvo Hostinger.

## Segurança operacional

- `dev` pode receber desenvolvimento sem significar deploy produtivo.
- Nenhum workflow do repositório deve fazer deploy Hostinger apenas por push em `dev` enquanto o alvo real não estiver identificado e autorizado.
- Não criar renderer de PDF com URL arbitrária. O Mídia Kit usa rota/template interno conhecido.
- Não transportar `VITE_ENABLE_DEMO_DATA=true` para produção.
- Não armazenar secrets no repositório ou em artefatos de CI.
- Migrations de produção exigem etapa/autorização explícita; os workflows de desenvolvimento usam banco efêmero de CI.

## Estado de prontidão

`HOSTINGER_DEPLOYMENT_ARCHITECTURE = DEFINED_IN_REPOSITORY`

Ainda depende de descoberta externa para classificar o produto real como Web Hosting, Cloud ou VPS e comprovar Node/runtime/filesystem/deploy no ambiente contratado.

Até essa descoberta e uma validação de staging autorizada ocorrerem:

`HOSTINGER_RUNTIME_DISCOVERY = EXTERNALLY_BLOCKED`

`HOSTINGER_STAGING_VALIDATION = EXTERNALLY_BLOCKED`

`HOSTINGER_PRODUCTION_READY = NO`
