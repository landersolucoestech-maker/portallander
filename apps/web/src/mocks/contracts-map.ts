export const mockContractSources={
 identity:'src/shared/data/contracts.ts#AppUser',
 notifications:'src/shared/data/contracts.ts#AppNotification',
 crm:'src/features/crm/domain.ts#Lead|Contact|CrmState',
 contracts:'src/features/contracts/domain.ts#Contract|ContractTemplate|ContractCategory|ContractVariable',
 finance:'src/features/finance/domain.ts#FinanceTransaction|FinanceInvoice|FinanceCategory|FinanceRule',
 editorial:'src/features/editorial/model.ts#EditorialPage|EditorialContent',
 home:'src/pages/home/models/homeReadModel.ts#HomeStory|HomeRelease|HomeAgendaItem',
 advertising:'src/shared/data/contracts.ts#AdvertisingCampaign',
 agenda:'src/shared/data/contracts.ts#AgendaItem',
 dashboard:'src/shared/data/contracts.ts#DashboardOperationalSnapshot',
 collaboration:'src/shared/data/contracts.ts#CollaborationTypeOption',
 branding:'src/shared/data/contracts.ts#BrandingConfig',
 shared:'src/shared/data/contracts.ts#EntityId|IsoDateTime',
 scenarios:'src/shared/data/contracts.ts#DataScenario',
} as const

export type MockContractDomain=keyof typeof mockContractSources
