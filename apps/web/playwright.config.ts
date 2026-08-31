import {defineConfig} from '@playwright/test'

export default defineConfig({
  testDir:'./e2e',
  testMatch:'**/*.audit.ts',
  fullyParallel:false,
  workers:2,
  timeout:45_000,
  expect:{timeout:8_000},
  use:{browserName:'chromium',trace:'retain-on-failure'},
})
