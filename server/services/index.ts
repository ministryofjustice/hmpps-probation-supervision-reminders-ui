import { dataAccess } from '../data'
import AuditService from './auditService'
import ProbationComponentsService from './ProbationComponentsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, probationFrontendComponentsApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
  }
}

export type Services = ReturnType<typeof services>
