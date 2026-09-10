# Naming conventions

Portal Lander uses English for every technical artifact and Brazilian Portuguese only for user-facing frontend copy.

## Technical layer
- Directories, filenames, modules, symbols, types, functions, variables, services, tests, scripts, workflows, API paths, canonical application routes and persisted technical identifiers use English.
- New database tables, columns, constraints, indexes and internal enum values use English.
- `apps/web/src/modules` is the single canonical frontend domain tree. Legacy domain trees are forbidden.
- Published migrations are immutable historical records. Legacy Portuguese values may be referenced only inside forward compatibility migrations that translate persisted data into the canonical English contract.
- Brazilian legal abbreviations and provider trademarks such as CNPJ, CPF, CLT, Pix and Autentique may remain canonical domain terms.

## Presentation layer
- Portuguese is allowed only in frontend strings that are actually presented to the user.
- Visible copy uses pt-BR with correct accents and product terminology.
- Canonical route slugs and section identifiers remain technical contracts and therefore use English even when their menu labels are localized.
- Technical enum values must be mapped to localized labels before rendering.
- Backend messages, identifiers and error codes are English; frontend code owns localization of user-visible errors.
