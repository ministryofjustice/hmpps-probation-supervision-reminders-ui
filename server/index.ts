import promClient from 'prom-client'
import createApp from './app'
import { services } from './services'
import { createMetricsApp } from './monitoring/metricsApp'

promClient.collectDefaultMetrics()
const app = createApp(services())
const metricsApp = createMetricsApp()

export { app, metricsApp }
