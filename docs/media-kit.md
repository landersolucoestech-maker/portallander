# Mídia Kit — métricas automáticas e proveniência

## Regra canônica

Social metrics displayed by the Media Kit MUST be sourced automatically from canonical integration snapshots when available.
Users MUST NOT be required to manually enter provider identifiers or metric keys for integrated providers.

O fluxo canônico é:

`integration/sync → analytics_metrics / AnalyticsMetric → mediaKitReadModel → MediaKitDocument → Live Preview → PDF`.

O Mídia Kit não chama APIs de terceiros diretamente. Ele consome o último snapshot normalizado disponível no ledger de analytics mantido pela camada de integrações/sync.

## Ownership e proveniência

Provider, conta, metric key, timestamps, status, freshness e source reference pertencem ao snapshot produzido pelo sistema. Esses metadados são visíveis para transparência, porém são read-only no fluxo principal do Mídia Kit.

Para providers integrados, o usuário não precisa informar novamente provider, Account ID, Property ID, metric key ou scope. A integração é dona dessas identidades.

`UNKNOWN != 0`: ausência de snapshot permanece indisponível e nunca é convertida em zero.

## Precedência

A resolução segue esta ordem:

1. snapshot automático canônico mais recente da integração;
2. snapshot canônico já publicado no Mídia Kit quando a atualização não está disponível;
3. valor manual legado somente quando não existe fonte automática equivalente.

Dados manuais não sobrescrevem silenciosamente métricas automáticas.

## Compatibilidade legada

`audience.metrics` e os campos manuais de audiência existentes permanecem somente para migração/compatibilidade. A UI principal de métricas integradas é read-only. O bloco "Compatibilidade de dados manuais legados" preserva dados históricos sem transformá-los em arquitetura principal.

## Preview e PDF

O editor, o preview completo e o PDF usam o mesmo `MediaKitDocument` e os mesmos valores resolvidos no `mediaKitReadModel`. Nenhum fetch a provider externo é disparado ao abrir o PDF.

## Mockup de desenvolvimento

`@portallander/mockup` é a única fonte reutilizável de dados de desenvolvimento. No GitHub Pages de desenvolvimento, `VITE_ENABLE_DEMO_DATA=true` e `VITE_MOCKUP_SCENARIO=full` podem fornecer snapshots determinísticos de providers já representados pelos contratos do produto. O mesmo snapshot deve alimentar Marketing e Mídia Kit quando ambos exibem a mesma métrica.

Esses snapshots demonstram o comportamento do produto e não promovem providers planejados/parciais a integração produtiva.

## Produção

Produção permanece fail-closed. `@portallander/mockup` não pode aparecer no runtime/bundle de produção e não existe fallback de mock quando API, banco ou provider real está indisponível.
