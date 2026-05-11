import createApp from './app'
import { createMetricsApp } from './monitoring/metricsApp'
import { services } from './services'

const app = createApp(services())
const metricsApp = createMetricsApp()

export { app, metricsApp }
