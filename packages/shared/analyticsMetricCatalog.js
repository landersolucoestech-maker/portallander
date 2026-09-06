const definitions=[
 {metricKey:'impressions',label:'Impressões',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'clicks',label:'Cliques',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'engagement',label:'Interações',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'conversions',label:'Conversões',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'spend',label:'Investimento',unit:'currency',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'sessions',label:'Sessões',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'pageviews',label:'Visualizações de página',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'engaged_sessions',label:'Sessões engajadas',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'active_users',label:'Usuários ativos',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'new_users',label:'Novos usuários',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'engagement_rate',label:'Taxa de engajamento',unit:'ratio',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'reach',label:'Alcance',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'followers',label:'Seguidores',unit:'count',aggregation:'LATEST',crossProviderAggregation:false},
]

export const METRIC_DEFINITIONS=Object.freeze(definitions.map(definition=>Object.freeze({...definition})))
export const METRIC_CATALOG=Object.freeze(Object.fromEntries(METRIC_DEFINITIONS.map(definition=>[definition.metricKey,definition])))
export const metricDefinition=metricKey=>METRIC_CATALOG[metricKey]??{metricKey,label:metricKey,unit:'unknown',aggregation:'NON_ADDITIVE',crossProviderAggregation:false}

// Only canonical Analytics keys that are meaningful in the Media Kit audience section.
// Provider-specific names are normalized upstream before they reach this list.
export const MEDIA_KIT_AUTOMATIC_METRIC_KEYS=Object.freeze([
 'reach',
 'impressions',
 'followers',
 'engagement',
 'clicks',
 'active_users',
 'new_users',
 'sessions',
 'pageviews',
 'engagement_rate',
])
