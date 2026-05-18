import express from 'express'
import promBundle from 'express-prom-bundle'

const metricsMiddleware = promBundle({
  autoregister: false,
  buckets: [0.5, 0.75, 0.95, 0.99, 1],
  httpDurationMetricName: 'http_server_requests_seconds',
  includeMethod: true,
  includePath: true,
  normalizePath: [
    ['^/assets/.+$', '/assets/#assetPath'],
    ['/[0-9]+(?=/|$)', '/#id'],
    ['/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}(?=/|$)', '/#uuid'],
    ['/[0-9a-fA-F]{24}(?=/|$)', '/#objectId'],
  ],
})

function metricsPort(): number {
  let port = 3000
  if (process.env.PORT != null) {
    port = Number(process.env.PORT)
  }
  return port + 1
}

function createMetricsApp(): express.Application {
  const metricsApp = express()
  metricsApp.use(metricsMiddleware.metricsMiddleware)
  metricsApp.set('port', metricsPort())
  return metricsApp
}

export { metricsMiddleware, createMetricsApp }
