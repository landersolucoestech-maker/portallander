export type ReportColumnMeta={name:string;label:string;type:string;nullable:boolean;primary?:boolean}
export type ReportEntity={entityName:string;tableName:string;label:string;category:string;reportable:boolean;columns:ReportColumnMeta[];risks:string[]}
export type ReportDefinition={entityName:string;tableName:string;category:string;exportableColumns:string[];importableColumns:string[];requiredImportColumns:string[];supportsExport:boolean;supportsImport:boolean}
export type ImportPreview={totalRows:number;validRows:number;invalidRows:number;errors:string[];warnings:string[]}
export type ReportsSeed={entities:ReportEntity[];definitions:ReportDefinition[];importPreview:Record<string,ImportPreview>}
