export const mockDomains=[
 'identity',
 'notifications',
 'crm',
 'contracts',
 'finance',
 'editorial',
 'home',
 'advertising',
 'agenda',
 'dashboard',
 'collaboration',
 'branding',
 'shared',
 'scenarios',
] as const

export type MockDomain=(typeof mockDomains)[number]

export const mockArchitecture={
 source:'src/mocks',
 uiMayImportRawMocks:false,
 crossDomainIds:true,
 metricsMustBeDerived:true,
 scenariosCentralized:true,
 providerBoundaryRequired:true,
} as const
