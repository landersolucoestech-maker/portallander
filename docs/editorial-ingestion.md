# Editorial ingestion and external discovery

This layer discovers external references for human editorial curation. It does **not** publish third-party content automatically and does not replace the existing CMS or Media module.

## Flow

```text
external source
→ provider normalization
→ relevance/classification
→ global deduplication
→ content_import_candidates
→ human review
→ approved
→ conversion
→ editorial_contents (draft, active=false)
→ normal editorial editing/publishing flow
```

## Providers

- `rss`: configurable RSS 2.0 / Atom feeds.
- `official_source`: same safe feed infrastructure for verified institutional sources. ECAD, Pro-Música Brasil, UBC, ABRAMUS and IFPI are seeded disabled until a legitimate RSS/Atom feed is configured.
- `gdelt`: public GDELT DOC 2 discovery signal, focused on music/industry/Brazil.
- `youtube`: official YouTube Data API using backend-only `YOUTUBE_API_KEY` and a bounded result set.
- `spotify`: existing `spotifyReleaseService`; it is not reimplemented here.

## Database

Migration `028_editorial_content_ingestion.sql` adds:

- `integration_sources`: non-secret source configuration and source-level sync state.
- `integration_source_sync_runs`: per-sync operational evidence.
- `content_import_candidates`: external editorial references awaiting curation.

`integration_events` remains the existing webhook/provider event ledger. It is intentionally not reused as the source/candidate store because its contract models durable external events rather than editorial discovery sources.

## Security

Configurable feed URLs are treated as untrusted input. The backend:

- allows only HTTP/HTTPS;
- rejects credentials embedded in URLs;
- rejects localhost, private, loopback, link-local and internal destinations;
- resolves DNS and rejects private resolved addresses;
- revalidates every redirect;
- limits redirects, response size and timeout;
- never executes remote content;
- does not download article bodies or arbitrary attachments;
- keeps provider credentials in backend environment variables only.

New source/curation endpoints require an attributable owner/admin session. The legacy `PORTAL_ADMIN_TOKEN` is deliberately rejected for this feature.

## Copyright / media boundary

Feed/provider data is stored as discovery metadata: title, canonical URL, source, author when supplied, publication date, snippet and external image reference. The system does not fetch full articles and does not import remote images into the Media library automatically.

## Deduplication

Priority:

1. provider + source + external ID/GUID;
2. normalized canonical URL;
3. normalized title hash in a ±72h window;
4. conservative title-token similarity in the same temporal window.

Cross-provider matches merge provenance rather than producing another candidate. Independent stories with merely related vocabulary remain separate.

## Relevance

Scoring is deterministic (0–100), not dependent on a paid AI API. Current signals include:

- music-industry terms;
- Brazil relevance;
- Portuguese language;
- official-source provenance;
- GDELT discovery signal;
- freshness;
- bounded YouTube relative-view signal.

Scores are administrative prioritization only and are not exposed to the public site.

## Scheduling

The service exposes protected manual/due-sync endpoints and records `next_sync_at`. It does not add Redis, BullMQ, Kafka or an application scheduler. Production can call the protected `sync-due` endpoint from an infrastructure scheduler/cron when desired.

## Environment variables

New optional variable:

- `YOUTUBE_API_KEY`

Existing relevant variables continue to apply:

- `DATABASE_URL`
- `PORTAL_ALLOWED_ORIGINS`
- `PORTAL_SESSION_COOKIE_NAME`
- `PORTAL_SESSION_SAME_SITE`
- `PORTAL_SESSION_COOKIE_SECURE`

No secret value belongs in `integration_sources.configuration` or the frontend.

## Operational endpoints

All endpoints below require an attributable owner/admin session:

- `GET /api/integrations/editorial/provider-status`
- `GET /api/integrations/editorial/sources`
- `POST /api/integrations/editorial/sources`
- `PATCH /api/integrations/editorial/sources/:id`
- `POST /api/integrations/editorial/sources/:id/sync`
- `POST /api/integrations/editorial/sync-due`
- `GET /api/integrations/editorial/sync-runs`
- `GET /api/editorial/import-candidates`
- `GET /api/editorial/import-candidates/:id`
- `POST /api/editorial/import-candidates/:id/review`
- `POST /api/editorial/import-candidates/:id/approve`
- `POST /api/editorial/import-candidates/:id/reject`
- `POST /api/editorial/import-candidates/:id/ignore`
- `POST /api/editorial/import-candidates/:id/convert`

Conversion is accepted only from `approved` and always calls the existing editorial service with `status='draft'` and `active=false`.
