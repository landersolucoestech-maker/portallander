# Site Manager routing contract

Internal technical routes are English-only. Portuguese remains the UI language, not the route namespace.

Canonical routes:

- `/app/site/pages`
- `/app/site/pages/:pageId/sections/:sectionId`
- `/app/site/content`
- `/app/site/forms`
- `/app/site/media`
- `/app/site/media-kit`

The application must only generate canonical routes. The narrow historical route `/app/site/paginas/:pageId/secoes/:sectionId` is accepted only as an inbound compatibility redirect in `SiteManagerRoutes.tsx` and must resolve immediately to `/app/site/pages/:pageId/sections/:sectionId`.

Tests, navigation definitions and workflow browser proofs must target the canonical routes. Architecture gates should reject new producers of Portuguese technical URLs rather than requiring them for compatibility.
