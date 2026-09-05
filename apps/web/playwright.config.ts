import {defineConfig} from '@playwright/test'

const productionDataRuntime=Boolean(process.env.E2E_API_BASE_URL?.trim())

export default defineConfig({
  testDir:'./e2e',
  testMatch:'**/*.audit.ts',
  testIgnore:productionDataRuntime?[]:'**/content-ingestion.fullstack.audit.ts',
  fullyParallel:false,
  workers:2,
  timeout:45_000,
  expect:{timeout:8_000},
  use:{browserName:'chromium',trace:'retain-on-failure'},
})
