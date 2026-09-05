import {defineConfig} from '@playwright/test'

const productionDataRuntime=Boolean(process.env.E2E_API_BASE_URL?.trim())
const productionDataAudits=[
  '**/content-ingestion.fullstack.audit.ts',
  '**/public-production-data.fullstack.audit.ts',
]

export default defineConfig({
  testDir:'./e2e',
  testMatch:'**/*.audit.ts',
  testIgnore:productionDataRuntime?[]:productionDataAudits,
  fullyParallel:false,
  workers:2,
  timeout:45_000,
  expect:{timeout:8_000},
  use:{browserName:'chromium',trace:'retain-on-failure'},
})
