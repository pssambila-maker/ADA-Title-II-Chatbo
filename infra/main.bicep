// ─────────────────────────────────────────────────────────────────────────────
// Bicep Template — ADA Title II Bot ($0 Prototype)
// Deploy: az deployment group create -g rg-title2bot-dev -f infra/main.bicep
// Destroy: az group delete --name rg-title2bot-dev --yes --no-wait
// ─────────────────────────────────────────────────────────────────────────────

targetScope = 'resourceGroup'

@description('Environment name (dev or prod)')
@allowed(['dev', 'prod'])
param environment string = 'dev'

@description('Azure region')
param location string = resourceGroup().location

@description('Azure OpenAI resource name (leave empty to skip)')
param openAIResourceName string = ''

// ── Variables ──
var suffix = uniqueString(resourceGroup().id)
var storageName = 'st${environment}${suffix}'
var funcAppName = 'func-title2bot-${environment}'
var appInsightsName = 'ai-title2bot-${environment}'
var hostingPlanName = 'plan-title2bot-${environment}'
var botServiceName = 'bot-title2bot-${environment}'

// ── Storage Account (FREE TIER: 5 GB for 12 months) ──
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// ── Application Insights (FREE: 5 GB/month) ──
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30 // Minimize retention to reduce storage
  }
}

// ── Consumption Hosting Plan (FREE: 1M executions/month) ──
resource hostingPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: hostingPlanName
  location: location
  kind: 'linux'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true // Required for Linux
  }
}

// ── Function App ──
resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: funcAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      appSettings: [
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~20' }
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value}' }
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY', value: appInsights.properties.InstrumentationKey }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
        { name: 'LLM_PROVIDER', value: 'azure' }
        { name: 'MAX_OUTPUT_TOKENS', value: '500' }
        { name: 'MAX_TURNS_BEFORE_SUMMARY', value: '8' }
        { name: 'RATE_LIMIT_PER_USER', value: '10' }
        { name: 'LOG_LEVEL', value: 'info' }
      ]
    }
  }
}

// ── Azure Bot Service (FREE TIER: Standard channels) ──
resource botService 'Microsoft.BotService/botServices@2022-09-15' = {
  name: botServiceName
  location: 'global'
  kind: 'azurebot'
  sku: { name: 'F0' } // Free tier
  properties: {
    displayName: 'ADA Title II Accessibility Bot'
    description: 'Provides WCAG 2.1 Level AA guidance with citations'
    endpoint: 'https://${functionApp.properties.defaultHostName}/api/messages'
    msaAppId: '' // Set after creating App Registration
  }
}

// ── Web Chat Channel (FREE) ──
resource webChatChannel 'Microsoft.BotService/botServices/channels@2022-09-15' = {
  parent: botService
  name: 'WebChatChannel'
  location: 'global'
  properties: {
    channelName: 'WebChatChannel'
  }
}

// ── Outputs ──
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output botEndpoint string = 'https://${functionApp.properties.defaultHostName}/api/messages'
output storageAccountName string = storage.name
output appInsightsKey string = appInsights.properties.InstrumentationKey
