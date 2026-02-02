import { Router } from 'express'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import reminderRoutes from './reminders'

export default function routes(services: Services): Router {
  const router = Router()
  reminderRoutes(router, services)
  return router
}
