import promClient from 'prom-client'
import createApp from './app'
import { services } from './services'
import { createMetricsApp } from './monitoring/metricsApp'
import { buildAppInsightsClient } from './utils/azureAppInsights'
import applicationInfoSupplier from './applicationInfo'

const applicationInfo = applicationInfoSupplier()
buildAppInsightsClient(applicationInfo)

promClient.collectDefaultMetrics()
const app = createApp(services())
const metricsApp = createMetricsApp()

export { app, metricsApp }
